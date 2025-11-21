# Backend API Changes Required for Focal Worker Management

## Issue
Focal users need to view ALL workers (not just workers in a specific CDC) because they manage workers across multiple CDCs. The current `GET /api/workers` endpoint requires CDC association, which Focal users don't have.

## Required Backend Changes

### 1. New Endpoint: Get All Workers (for Focal users)

#### Endpoint
```
GET /api/workers/all
```

#### Description
Returns a list of ALL workers in the system, regardless of CDC association. This endpoint should be accessible to Focal users (and optionally other admin-level users).

#### Authentication
- Requires authentication (Bearer token)
- Should check if user type is 'focal' (or other authorized types)

#### Query Parameters
- `search` (optional): Search term to filter workers by username

#### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "worker1",
      "type": "worker",
      "cdc_id": null,
      "profile_pic": "path/to/image.jpg"
    },
    {
      "id": 2,
      "username": "worker2",
      "type": "worker",
      "cdc_id": 5,
      "profile_pic": "path/to/image.jpg"
    }
  ]
}
```

#### SQL Query Example
```sql
SELECT 
  u.id,
  u.username,
  u.type,
  u.cdc_id,
  ui.profile_pic
FROM users u
LEFT JOIN user_info ui ON u.id = ui.user_id
WHERE u.type = 'worker'
  AND (? IS NULL OR u.username LIKE CONCAT('%', ?, '%'))
ORDER BY u.username;
```

#### Backend Implementation Example
```javascript
// GET /api/workers/all - Get all workers (for Focal users)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is authorized (Focal or admin)
    if (req.user.type !== 'focal' && req.user.type !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Only Focal users and admins can view all workers.' 
      });
    }

    const { search } = req.query;
    let query = `
      SELECT 
        u.id,
        u.username,
        u.type,
        u.cdc_id,
        ui.profile_pic
      FROM users u
      LEFT JOIN user_info ui ON u.id = ui.user_id
      WHERE u.type = 'worker'
    `;
    
    const params = [];
    if (search) {
      query += ' AND u.username LIKE ?';
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY u.username';
    
    const [workers] = await db.promisePool.query(query, params);
    
    res.json({ 
      success: true, 
      data: workers 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});
```

---

### 2. Update Existing GET /api/workers Endpoint

The existing `GET /api/workers` endpoint should continue to work for President/CDC users who need to see workers in their specific CDC. This endpoint should:

- Still require CDC association (hasCdcAssociation middleware)
- Return only workers associated with the user's CDC
- Continue to work as before for President/CDC users

---

## Summary

1. ✅ **POST /api/workers** - Already fixed (no CDC association required)
2. ⚠️ **GET /api/workers/all** - Needs to be implemented (for Focal users)
3. ✅ **GET /api/workers** - Should remain as-is (for CDC-specific users)
4. ✅ **PUT /api/workers/:id** - Should work (may need CDC association check)
5. ✅ **DELETE /api/workers/:id** - Should work (may need CDC association check)

---

## Frontend Implementation

The frontend (`Focal_WorkerList.jsx`) has been updated to:
1. Try `/api/workers/all` first (for Focal users)
2. Fall back to `/api/workers` if the all endpoint doesn't exist
3. Show a helpful error message if both fail

Once the backend implements `/api/workers/all`, Focal users will be able to view and manage all workers in the system.

