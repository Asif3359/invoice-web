## System Admin API Documentation

Base URL: `http://localhost:3000/api/admin`

All protected endpoints require:

```
Authorization: Bearer <accessToken>
```

### Role Access Matrix

| Role       | Overview | System Users | Business Users | Permissions | Monitoring | Settings |
| ---------- | -------- | ------------ | -------------- | ----------- | ---------- | -------- |
| superadmin | ✅ full  | ✅ full      | ✅ full        | ✅ full     | ✅ full    | ✅ full  |
| admin      | ✅ full  | ❌ none      | ✅ full        | ✅ full     | ✅ full    | 👁 read  |
| manager    | 👁 read  | ❌ none      | 👁 read        | 👁 read     | 👁 read    | 👁 read  |

---

## 1. Authentication

### POST `/auth/login`

Login as system admin.

**Auth:** Public

**Body:**

```json
{
  "email": "superadmin@yourapp.com",
  "password": "Admin@123456"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "superadmin@yourapp.com",
      "fullName": "SaaS Owner",
      "role": "superadmin",
      "isActive": true,
      "lastLoginAt": "2026-02-26T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

---

### POST `/auth/refresh-token`

Get a new access token.

**Auth:** Public

**Body:**

```json
{ "refreshToken": "eyJ..." }
```

**Response 200:**

```json
{
  "success": true,
  "data": { "accessToken": "eyJ..." }
}
```

---

### POST `/auth/logout`

Invalidate session.

**Auth:** Public

**Body:**

```json
{ "refreshToken": "eyJ..." }
```

**Response 200:**

```json
{ "success": true, "message": "Logged out successfully" }
```

---

## 2. Current User

### GET `/me`

Get the currently authenticated system admin.

**Auth:** superadmin, admin, manager

**Response 200:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "superadmin@yourapp.com",
      "fullName": "SaaS Owner",
      "role": "superadmin",
      "lastLoginAt": "2026-02-26T10:00:00.000Z",
      "permissions": {
        "systemAdmins": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true
        },
        "businessUsers": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true
        },
        "monitoring": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true
        },
        "settings": {
          "create": true,
          "read": true,
          "update": true,
          "delete": true
        }
      }
    }
  }
}
```

---

## 3. Overview

### GET `/metrics/overview`

Platform-wide stats for dashboard cards.

**Auth:** superadmin, admin, manager

**Response 200:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalBusinessUsers": 120,
      "totalSubUsers": 450,
      "totalSystemAdmins": 3,
      "totalInvoices": 3200,
      "totalPayments": 2800,
      "totalExpenses": 1500
    }
  }
}
```

---

### GET `/metrics/growth?months=6`

Monthly growth data for charts.

**Auth:** superadmin, admin, manager

**Query Params:**
| Param | Type | Default | Description |
|--------|--------|---------|----------------------|
| months | number | 6 | How many months back |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "months": 6,
    "userGrowth": [
      { "_id": { "year": 2025, "month": 9 }, "count": 10 },
      { "_id": { "year": 2025, "month": 10 }, "count": 18 }
    ],
    "invoiceGrowth": [{ "_id": { "year": 2025, "month": 9 }, "count": 120 }]
  }
}
```

---

## 4. System Users

> All endpoints in this section require **superadmin** role.

### GET `/system-admins`

List all system admins.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "_id": "...",
        "email": "superadmin@yourapp.com",
        "fullName": "SaaS Owner",
        "role": "superadmin",
        "isActive": true,
        "lastLoginAt": "2026-02-26T10:00:00.000Z",
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### GET `/system-admins/:id`

Get a single system admin by ID.

**Response 200:**

```json
{
  "success": true,
  "data": { "admin": { ... } }
}
```

---

### POST `/system-admins`

Create a new system admin.

**Body:**

```json
{
  "email": "manager@yourapp.com",
  "password": "Manager@123",
  "fullName": "John Manager",
  "role": "manager"
}
```

| Field    | Required | Values                         |
| -------- | -------- | ------------------------------ |
| email    | ✅       | valid email                    |
| password | ✅       | min 8 chars, upper+lower+digit |
| fullName | ✅       | min 2 chars                    |
| role     | optional | superadmin \| admin \| manager |

**Response 201:**

```json
{
  "success": true,
  "message": "System admin created successfully",
  "data": { "admin": { ... } }
}
```

---

### PATCH `/system-admins/:id`

Update role or active status.

**Body (all optional):**

```json
{
  "role": "admin",
  "isActive": false
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "System admin updated",
  "data": { "admin": { ... } }
}
```

---

### DELETE `/system-admins/:id`

Deactivate a system admin. Cannot deactivate your own account. Also revokes all their sessions.

**Response 200:**

```json
{
  "success": true,
  "message": "System admin deactivated successfully"
}
```

**Error 400** (trying to deactivate self):

```json
{
  "success": false,
  "message": "You cannot deactivate your own account."
}
```

---

## 5. Business Users

### GET `/business-users`

List all Tier-2 business owners with pagination.

**Auth:** superadmin, admin, manager

**Query Params:**
| Param | Type | Default | Description |
|--------|--------|---------|--------------------|
| page | number | 1 | Page number |
| limit | number | 20 | Results per page |
| search | string | — | Filter by email or name |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "email": "business@example.com",
        "fullName": "Business Owner",
        "phone": "+1234567890",
        "emailVerified": true,
        "isActive": true,
        "createdAt": "2026-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 20,
      "pages": 6
    }
  }
}
```

---

### GET `/business-users/:id`

Get a single business user with sub-user count.

**Auth:** superadmin, admin, manager

**Response 200:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "business@example.com",
      "fullName": "Business Owner",
      "isActive": true,
      "subUsersCount": 4,
      "createdAt": "2026-01-15T00:00:00.000Z"
    }
  }
}
```

---

### GET `/business-users/:id/sub-users`

Get all sub-users belonging to a business.

**Auth:** superadmin, admin, manager

**Response 200:**

```json
{
  "success": true,
  "data": {
    "total": 3,
    "subUsers": [
      {
        "_id": "...",
        "email": "staff@example.com",
        "fullName": "Staff Member",
        "role": "manager",
        "isActive": true,
        "permissions": { ... }
      }
    ]
  }
}
```

---

### PATCH `/business-users/:id/status`

Activate or deactivate a business owner account.

**Auth:** superadmin, admin

**Body:**

```json
{ "isActive": false }
```

**Response 200:**

```json
{
  "success": true,
  "message": "Business user deactivated"
}
```

---

### DELETE `/business-users/:id`

Deactivate business owner **and all their sub-users**. Also revokes all sessions.

**Auth:** superadmin, admin

**Response 200:**

```json
{
  "success": true,
  "message": "Business user and all associated sub-users deactivated"
}
```

---

## 6. Permissions

### GET `/permissions`

List all sub-users across all businesses with their permissions.

**Auth:** superadmin, admin, manager

**Query Params:**
| Param | Type | Default | Description |
|--------|--------|---------|------------------------------|
| page | number | 1 | Page number |
| limit | number | 20 | Results per page |
| search | string | — | Filter by email or name |
| role | string | — | Filter by role (admin, manager, viewer, ...) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "subUsers": [
      {
        "_id": "...",
        "email": "staff@example.com",
        "fullName": "Staff Member",
        "role": "manager",
        "isActive": true,
        "permissions": {
          "invoices": {
            "create": true,
            "read": true,
            "update": true,
            "delete": false
          }
        },
        "parentUserId": {
          "_id": "...",
          "email": "owner@example.com",
          "fullName": "Business Owner"
        }
      }
    ],
    "pagination": { "total": 450, "page": 1, "limit": 20, "pages": 23 }
  }
}
```

---

### GET `/permissions/:subUserId`

Get a single sub-user's permissions.

**Auth:** superadmin, admin, manager

**Response 200:**

```json
{
  "success": true,
  "data": {
    "subUser": { ... },
    "effectivePermissions": {
      "invoices": { "create": true, "read": true, "update": true, "delete": true, "export": true },
      "products": { "create": false, "read": true, "update": false, "delete": false }
    }
  }
}
```

---

### PATCH `/permissions/:subUserId`

Update sub-user role, permissions, or active status.

**Auth:** superadmin, admin

**Body (all optional):**

```json
{
  "role": "viewer",
  "isActive": true,
  "permissions": {
    "invoices": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false
    },
    "products": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false
    }
  }
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Sub-user permissions updated",
  "data": { "subUser": { ... } }
}
```

---

## 7. Monitoring

### GET `/monitoring/activity?limit=50`

Recent login sessions enriched with user info.

**Auth:** superadmin, admin, manager

**Query Params:**
| Param | Type | Default | Description |
|-------|--------|---------|---------------------------|
| limit | number | 50 | Max sessions to return |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "total": 50,
    "sessions": [
      {
        "_id": "...",
        "userId": "...",
        "userType": "main",
        "ipAddress": "192.168.1.1",
        "expiresAt": "2026-03-05T10:00:00.000Z",
        "createdAt": "2026-02-26T10:00:00.000Z",
        "userInfo": {
          "email": "business@example.com",
          "fullName": "Business Owner"
        }
      }
    ]
  }
}
```

---

### GET `/monitoring/sessions`

Count of active (non-expired) sessions by user type.

**Auth:** superadmin, admin, manager

**Response 200:**

```json
{
  "success": true,
  "data": {
    "activeSessions": {
      "system": 2,
      "businessUsers": 48,
      "subUsers": 115,
      "total": 165
    }
  }
}
```

---

## 8. Settings

### GET `/settings`

Read current system settings.

**Auth:** superadmin, admin, manager

**Response 200:**

```json
{
  "success": true,
  "data": {
    "settings": {
      "appName": "Invoice SaaS",
      "allowNewRegistrations": true,
      "maintenanceMode": false,
      "maxSubUsersPerBusiness": 10,
      "supportEmail": "support@yourapp.com"
    }
  }
}
```

---

### PATCH `/settings`

Update system settings.

**Auth:** superadmin only

**Body (all optional):**

```json
{
  "allowNewRegistrations": false,
  "maintenanceMode": true,
  "maxSubUsersPerBusiness": 20,
  "supportEmail": "support@yourapp.com"
}
```

| Field                  | Type    | Description                             |
| ---------------------- | ------- | --------------------------------------- |
| allowNewRegistrations  | boolean | Whether new business owners can sign up |
| maintenanceMode        | boolean | Puts the app in maintenance mode        |
| maxSubUsersPerBusiness | number  | Max staff accounts per business (1–100) |
| supportEmail           | string  | Support contact email                   |

**Response 200:**

```json
{
  "success": true,
  "message": "Settings updated (in-memory). Persist to .env or DB to survive restarts.",
  "data": { "settings": { ... } }
}
```

---

## Error Responses

All endpoints return consistent errors:

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| 400    | Validation failed (check `errors` array) |
| 401    | Missing or invalid/expired token         |
| 403    | Authenticated but insufficient role      |
| 404    | Resource not found                       |
| 409    | Conflict (duplicate email, etc.)         |
| 500    | Internal server error                    |

**Example 403:**

```json
{
  "success": false,
  "message": "Only the superadmin can perform this action."
}
```

**Example 401:**

```json
{
  "success": false,
  "message": "No token provided. Please login to the admin dashboard."
}
```
