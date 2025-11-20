# Backend API Changes Required for Focal Create CDC

## 1. New API Endpoint: Get Unassigned CD Workers

### Endpoint
```
GET /api/cdc/workers/unassigned
```

### Description
Returns a list of CD workers (users with type 'worker') that are not currently assigned to any CDC (i.e., their `cdc_id` is NULL).

### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "worker1",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "type": "worker",
      "cdc_id": null
    },
    {
      "id": 2,
      "username": "worker2",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "type": "worker",
      "cdc_id": null
    }
  ]
}
```

### SQL Query Example
```sql
SELECT 
  u.id,
  u.username,
  u.email,
  u.type,
  u.cdc_id,
  ui.first_name,
  ui.last_name
FROM users u
LEFT JOIN user_info ui ON u.id = ui.user_id
WHERE u.type = 'worker' 
  AND (u.cdc_id IS NULL OR u.cdc_id = 0)
ORDER BY u.username;
```

---

## 2. Update CDC Creation Endpoint

### Endpoint
```
POST /api/cdc
```

### Current Request Body
```json
{
  "name": "CDC Name",
  "region": "Region IV-A",
  "province": "Batangas",
  "municipality": "Lian",
  "barangay": "Barangay Name",
  "president_id": 123
}
```

### Updated Request Body
```json
{
  "name": "CDC Name",
  "region": "Region IV-A",
  "province": "Batangas",
  "municipality": "Lian",
  "barangay": "Barangay Name",
  "cd_worker_id": 123  // Changed from president_id
}
```

### Backend Changes Required

1. **Accept `cd_worker_id` instead of `president_id`** in the request body
2. **Validate that the CD worker exists and is not assigned to any CDC**:
   ```sql
   SELECT * FROM users 
   WHERE id = :cd_worker_id 
     AND type = 'worker' 
     AND (cdc_id IS NULL OR cdc_id = 0);
   ```
3. **When creating the CDC, assign the CD worker**:
   ```sql
   -- Create CDC
   INSERT INTO cdc (name, region, province, municipality, barangay, created_at)
   VALUES (:name, :region, :province, :municipality, :barangay, NOW());
   
   -- Get the created CDC ID
   SET @cdc_id = LAST_INSERT_ID();
   
   -- Assign CD worker to CDC if provided
   IF :cd_worker_id IS NOT NULL THEN
     UPDATE users 
     SET cdc_id = @cdc_id 
     WHERE id = :cd_worker_id AND type = 'worker';
   END IF;
   ```

---

## 3. Update CDC Update Endpoint (Optional)

### Endpoint
```
PUT /api/cdc/:cdcId
```

### Request Body
Should also accept `cd_worker_id` instead of `president_id` if you want to allow changing the assigned worker.

### Backend Logic
1. If `cd_worker_id` is provided and different from current assignment:
   - Unassign current worker (set their `cdc_id` to NULL)
   - Assign new worker (set their `cdc_id` to the CDC ID)
2. Validate that the new worker is not already assigned to another CDC

---

## 4. Database Schema Considerations

### Users Table
Ensure the `users` table has:
- `cdc_id` column (INTEGER, nullable, foreign key to `cdc` table)
- `type` column (ENUM or VARCHAR) to identify user types ('worker', 'president', 'focal', etc.)

### CDC Table
Ensure the `cdc` table has:
- `id` (primary key)
- `name`
- `region`
- `province`
- `municipality`
- `barangay`
- `created_at`
- `updated_at`

---

## 5. Validation Rules

1. **CD Worker Validation**:
   - Must exist in the database
   - Must have type = 'worker'
   - Must not be assigned to any CDC (cdc_id IS NULL)

2. **Location Validation**:
   - Region, Province, Municipality should match the logged-in focal user's location
   - This can be enforced on the backend by checking the focal user's profile

3. **CDC Name Validation**:
   - Must be unique within the same municipality (or as per your business rules)

---

## 6. Error Responses

### When CD Worker is Already Assigned
```json
{
  "success": false,
  "message": "CD worker is already assigned to another CDC",
  "error": "WORKER_ALREADY_ASSIGNED"
}
```

### When CD Worker Not Found
```json
{
  "success": false,
  "message": "CD worker not found or invalid",
  "error": "WORKER_NOT_FOUND"
}
```

### When Location Mismatch
```json
{
  "success": false,
  "message": "CDC location must match your assigned region, province, and municipality",
  "error": "LOCATION_MISMATCH"
}
```

---

## Summary of Changes

1. ✅ Create new endpoint: `GET /api/cdc/workers/unassigned`
2. ✅ Update `POST /api/cdc` to accept `cd_worker_id` instead of `president_id`
3. ✅ Update CDC creation logic to assign CD worker instead of president
4. ✅ Add validation to ensure CD worker is not already assigned
5. ✅ (Optional) Update `PUT /api/cdc/:cdcId` to handle `cd_worker_id`
6. ✅ Enforce location matching with focal user's profile (region, province, municipality)

