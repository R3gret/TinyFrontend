# Backend Profile Validation Fix

## Issue
The backend validation for optional fields (email, phone, website, social_media) is failing when empty strings are sent. The `.optional()` validator in express-validator only skips validation when the field is `undefined` or `null`, not when it's an empty string.

## Solution
Update the validation in `/api/user_session/update-profile` endpoint to skip validation for empty strings.

## Backend Code Fix

In the `PUT /api/user_session/update-profile` route, change the validation to skip validation when fields are empty strings:

```javascript
router.put('/update-profile', [
  body('full_name').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email')
    .optional()
    .custom((value) => {
      // Skip validation if value is empty string, null, or undefined
      if (!value || value.trim() === '') {
        return true;
      }
      // Only validate if value is provided
      return validator.isEmail(value);
    })
    .withMessage('Invalid email format'),
  body('phone')
    .optional()
    .custom((value) => {
      // Skip validation if value is empty string, null, or undefined
      if (!value || value.trim() === '') {
        return true;
      }
      // Only validate if value is provided
      return validator.isMobilePhone(value);
    })
    .withMessage('Invalid phone number'),
  body('website')
    .optional()
    .custom((value) => {
      // Skip validation if value is empty string, null, or undefined
      if (!value || value.trim() === '') {
        return true;
      }
      // Only validate if value is provided
      return validator.isURL(value);
    })
    .withMessage('Invalid website URL'),
  body('social_media')
    .optional()
    .custom((value) => {
      // Skip validation if value is empty string, null, or undefined
      if (!value || value.trim() === '') {
        return true;
      }
      // Only validate if value is provided
      return validator.isURL(value);
    })
    .withMessage('Invalid social media URL')
], async (req, res) => {
```

**Note:** You'll need to import `validator` at the top of the file:
```javascript
const validator = require('validator');
```

Or if using express-validator's built-in validators:
```javascript
const { body, validationResult } = require('express-validator');
```

## Alternative: Using checkFalsy (Simpler)

If you prefer a simpler approach, you can use `checkFalsy: true`:

```javascript
router.put('/update-profile', [
  body('full_name').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Invalid email format'),
  body('phone').optional({ checkFalsy: true }).trim().isMobilePhone().withMessage('Invalid phone number'),
  body('website').optional({ checkFalsy: true }).trim().isURL().withMessage('Invalid website URL'),
  body('social_media').optional({ checkFalsy: true }).trim().isURL().withMessage('Invalid social media URL')
], async (req, res) => {
```

## Frontend Behavior
The frontend now sends all fields including empty strings. The backend should accept empty strings without validation errors.

