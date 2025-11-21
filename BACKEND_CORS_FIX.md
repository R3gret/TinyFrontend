# Backend CORS Configuration Fix

## Issue
The frontend at `https://tinytrack.docmap.cloud` is being blocked by CORS policy when trying to access the backend at `https://tinybackend.onrender.com`.

## Error Message
```
Access to fetch at 'https://tinybackend.onrender.com/api/workers/all?search=' 
from origin 'https://tinytrack.docmap.cloud' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

The backend needs to update its CORS configuration to allow requests from the frontend origin.

### Express.js CORS Configuration Example

```javascript
const cors = require('cors');

// Option 1: Allow specific origin
app.use(cors({
  origin: 'https://tinytrack.docmap.cloud',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Option 2: Allow multiple origins (recommended for development/production)
const allowedOrigins = [
  'https://tinytrack.docmap.cloud',
  'http://localhost:5173', // For local development
  'http://localhost:3000'  // Alternative local port
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Option 3: Allow all origins (NOT recommended for production)
// Only use this for development
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Manual CORS Headers (if not using cors middleware)

```javascript
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://tinytrack.docmap.cloud',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
```

## Important Notes

1. **Preflight Requests**: The browser sends an OPTIONS request before the actual request. Make sure your backend handles OPTIONS requests properly.

2. **Credentials**: If you're sending cookies or authorization headers, you need `credentials: true` in CORS config and `Access-Control-Allow-Credentials: true` header.

3. **Headers**: Make sure `Authorization` is in the `allowedHeaders` list since the frontend sends Bearer tokens.

4. **Methods**: Include all HTTP methods your API uses (GET, POST, PUT, DELETE, OPTIONS).

## Testing

After updating the CORS configuration:

1. Restart the backend server
2. Try accessing the frontend again
3. Check the browser console - CORS errors should be gone
4. Verify that API requests work correctly

## Current Status

- ✅ Backend routes are correctly structured
- ✅ `GET /api/workers/all` endpoint exists
- ⚠️ CORS configuration needs to allow `https://tinytrack.docmap.cloud`

Once CORS is configured, the frontend should work correctly for Focal users.

