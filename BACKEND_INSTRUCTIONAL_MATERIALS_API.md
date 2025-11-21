# Backend API Changes for Instructional Materials Folder Structure

## Overview
The instructional materials system now uses a hierarchical folder structure:
- **7 Domain folders** (with Self-Help having 4 subcategories)
- **4 Quarter folders** inside each domain (1st-4th Quarter)
- **3 Material Type folders** inside each quarter (English, Filipino, Supplemental Materials)

## Folder Structure

```
Cognitive_Pangkaisipan/
  ├── 1st_Quarter/
  │   ├── English/
  │   ├── Filipino/
  │   └── Supplemental_Materials/
  ├── 2nd_Quarter/
  │   ├── English/
  │   ├── Filipino/
  │   └── Supplemental_Materials/
  ├── 3rd_Quarter/
  │   ├── English/
  │   ├── Filipino/
  │   └── Supplemental_Materials/
  └── 4th_Quarter/
      ├── English/
      ├── Filipino/
      └── Supplemental_Materials/

Expressive_Language_Pang-wika/
  └── [same structure as above]

Fine_Motor_Pangkamay/
  └── [same structure as above]

Gross_Motor_Panlahat_na_Kakayahan/
  └── [same structure as above]

Receptive_Language_Pang-unawa/
  └── [same structure as above]

Self-Help_Pansarili_Pagdadamit/
  └── [same structure as above]

Self-Help_Pansarili_Pagkain/
  └── [same structure as above]

Self-Help_Pansarili_Pagligo/
  └── [same structure as above]

Self-Help_Pansarili_Toileting/
  └── [same structure as above]

Social-Emotional_Panlipunan/
  └── [same structure as above]
```

## API Changes Required

### 1. Update Category Creation Endpoint

#### Endpoint
```
POST /api/files/categories
```

#### Request Body (Updated)
```json
{
  "category_name": "Cognitive / Pangkaisipan > 1st Quarter > English",
  "file_path": "Cognitive_Pangkaisipan/1st_Quarter/English"
}
```

#### Backend Changes
1. **Add `file_path` column to categories table** (if not exists):
   ```sql
   ALTER TABLE file_categories 
   ADD COLUMN file_path VARCHAR(500) NULL;
   ```

2. **Accept and store `file_path`** when creating categories:
   ```sql
   INSERT INTO file_categories (category_name, file_path, created_at)
   VALUES (:category_name, :file_path, NOW());
   ```

3. **Create physical folder structure** on the server when category is created:
   ```javascript
   // Example Node.js/Express
   const fs = require('fs').promises;
   const path = require('path');
   
   async function createCategoryFolder(filePath) {
     const fullPath = path.join(process.env.UPLOAD_DIR || './uploads', filePath);
     await fs.mkdir(fullPath, { recursive: true });
   }
   ```

---

### 2. Update File Upload Endpoint

#### Endpoint
```
POST /api/files
```

#### Request Body (Updated)
```json
FormData:
  - category_id: "123"
  - file_name: "lesson_plan.pdf"
  - file_data: [File]
  - file_path: "Cognitive_Pangkaisipan/1st_Quarter/English" (optional, can be derived from category)
```

#### Backend Changes
1. **Get file_path from category** if not provided:
   ```sql
   SELECT file_path FROM file_categories WHERE category_id = :category_id;
   ```

2. **Store file_path with file record**:
   ```sql
   ALTER TABLE files 
   ADD COLUMN file_path VARCHAR(500) NULL;
   
   INSERT INTO files (category_id, file_name, file_data, file_path, upload_date)
   VALUES (:category_id, :file_name, :file_data, :file_path, NOW());
   ```

3. **Save file to correct folder path**:
   ```javascript
   // Example Node.js/Express
   const multer = require('multer');
   const path = require('path');
   const fs = require('fs').promises;
   
   const storage = multer.diskStorage({
     destination: async (req, file, cb) => {
       const filePath = req.body.file_path || await getCategoryPath(req.body.category_id);
       const uploadPath = path.join(process.env.UPLOAD_DIR, filePath);
       await fs.mkdir(uploadPath, { recursive: true });
       cb(null, uploadPath);
     },
     filename: (req, file, cb) => {
       cb(null, req.body.file_name || file.originalname);
     }
   });
   ```

---

### 3. Update File Download Endpoint

#### Endpoint
```
GET /api/files/download/:fileId
```

#### Backend Changes
1. **Use file_path to locate file**:
   ```sql
   SELECT file_path, file_name FROM files WHERE file_id = :fileId;
   ```

2. **Serve file from correct path**:
   ```javascript
   // Example Node.js/Express
   const filePath = path.join(process.env.UPLOAD_DIR, file.file_path, file.file_name);
   res.sendFile(filePath);
   ```

---

### 4. Initialize Folder Structure Endpoint (Optional)

#### Endpoint
```
POST /api/files/initialize-structure
```

#### Description
Creates all required category folders automatically. This can be called once to set up the entire structure.

#### Backend Implementation
```javascript
// Example Node.js/Express
const { getAllCategoryPaths } = require('./utils/instructionalMaterialsStructure');

app.post('/api/files/initialize-structure', async (req, res) => {
  const allPaths = getAllCategoryPaths();
  const results = { created: [], skipped: [] };
  
  for (const pathInfo of allPaths) {
    try {
      // Check if category exists
      const existing = await db.query(
        'SELECT category_id FROM file_categories WHERE category_name = ?',
        [pathInfo.categoryName]
      );
      
      if (existing.length === 0) {
        // Create category
        await db.query(
          'INSERT INTO file_categories (category_name, file_path) VALUES (?, ?)',
          [pathInfo.categoryName, pathInfo.path]
        );
        
        // Create physical folder
        const fullPath = path.join(process.env.UPLOAD_DIR, pathInfo.path);
        await fs.mkdir(fullPath, { recursive: true });
        
        results.created.push(pathInfo.categoryName);
      } else {
        results.skipped.push(pathInfo.categoryName);
      }
    } catch (err) {
      console.error(`Error creating ${pathInfo.categoryName}:`, err);
    }
  }
  
  res.json({ success: true, results });
});
```

---

## Database Schema Updates

### Categories Table
```sql
CREATE TABLE IF NOT EXISTS file_categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NULL,  -- NEW COLUMN
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_file_path (file_path)
);
```

### Files Table
```sql
ALTER TABLE files 
ADD COLUMN file_path VARCHAR(500) NULL;  -- NEW COLUMN

-- Add index for faster lookups
CREATE INDEX idx_file_path ON files(file_path);
```

---

## File Path Examples

| Domain | Quarter | Material Type | Full Path |
|--------|---------|---------------|-----------|
| Cognitive / Pangkaisipan | 1st Quarter | English | `Cognitive_Pangkaisipan/1st_Quarter/English` |
| Cognitive / Pangkaisipan | 1st Quarter | Filipino | `Cognitive_Pangkaisipan/1st_Quarter/Filipino` |
| Self-Help / Pansarili - Pagkain | 2nd Quarter | Supplemental Materials | `Self-Help_Pansarili_Pagkain/2nd_Quarter/Supplemental_Materials` |
| Social-Emotional / Panlipunan | 4th Quarter | English | `Social-Emotional_Panlipunan/4th_Quarter/English` |

---

## Summary of Required Changes

1. ✅ Add `file_path` column to `file_categories` table
2. ✅ Add `file_path` column to `files` table
3. ✅ Update `POST /api/files/categories` to accept and store `file_path`
4. ✅ Update `POST /api/files` to use `file_path` when saving files
5. ✅ Update `GET /api/files/download/:fileId` to use `file_path` when serving files
6. ✅ Create physical folder structure on server when categories are created
7. ✅ (Optional) Add endpoint to initialize all folder structures at once

---

## Notes

- The `file_path` should use forward slashes (`/`) as path separators for consistency across platforms
- The backend should handle creating nested directories recursively
- File paths should be sanitized to prevent directory traversal attacks
- Consider adding validation to ensure file_path matches the expected pattern

