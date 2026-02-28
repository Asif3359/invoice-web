## API Documentation

Base URL: `http://localhost:3000`

All JSON responses follow the general shape:

- **success**: `boolean`
- **message**: `string` (optional)
- **data**: `object` (optional)

Authentication for protected routes is done via:

- **Header**: `Authorization: Bearer <accessToken>`

---

### 1. Basic

- **GET** `/`
  - Health check. Returns basic status message.

- **GET** `/test`
  - Simple test endpoint.

---

### 2. Auth (`/auth`)

- **POST** `/auth/register`
  - Register main (business owner) user.

- **POST** `/auth/login`
  - Login main or sub-user.
  - Body: `{ email, password, userType?: "main" | "sub" }`

- **POST** `/auth/refresh-token`
  - Refresh access token using `refreshToken`.

- **POST** `/auth/logout`
  - Logout and invalidate refresh token.

- **GET** `/auth/profile`
  - Get current authenticated user profile.
  - Requires `Authorization` header.

- **POST** `/auth/password-reset/request`
  - Request password reset link.

- **POST** `/auth/password-reset`
  - Reset password using reset token.

- **GET** `/auth/verify-email/:token`
  - Verify email using token from URL.

- **POST** `/auth/verify-email`
  - Verify email using token in body.

---

### 3. Sub-Users (`/sub-users`)

- **GET** `/sub-users/meta/permissions`
  - Get available permission metadata for building UI.

- **POST** `/sub-users`
  - Create a sub-user for a business owner.

- **GET** `/sub-users`
  - List sub-users for current authenticated owner.

- **GET** `/sub-users/:id`
  - Get single sub-user by ID.

- **PUT** `/sub-users/:id`
  - Update sub-user details and permissions.

- **PATCH** `/sub-users/:id/password`
  - Update sub-user password.

- **DELETE** `/sub-users/:id`
  - Soft delete / deactivate sub-user.

---

### 4. Admin (`/api/admin`)

- **POST** `/api/admin/auth/login`
  - System admin / manager login (reuses main login logic).
  - Body: `{ email, password, userType?: "main" | "sub" }`

- **GET** `/api/admin/me`
  - Get current admin user (for admin dashboard).
  - Requires `Authorization` header.
  - Returns fields like: `{ id, email, fullName, role, permissions }`.

- **GET** `/api/admin/metrics/overview`
  - High-level system metrics for dashboard.
  - Requires `Authorization` header.
  - Returns counts: `totalUsers`, `totalSubUsers`, `totalInvoices`, `totalPayments`, `totalExpenses`.

---

### 5. Associates (`/associates`)

- **POST** `/associates`
  - Create associate.

- **GET** `/associates/:userEmail`
  - Get associates for a user.

- **PUT** `/associates/:id`
  - Update associate by UUID `id`.

- **DELETE** `/associates/:id`
  - Soft delete associate.

- **POST** `/associates/sync`
  - Sync associates from client to server.

---

### 6. Products (`/products`)

- **POST** `/products`
  - Create product.

- **PUT** `/products/:id`
  - Update product by UUID `id`.

- **GET** `/products/:userEmail`
  - Get products for a user.

- **DELETE** `/products/:id`
  - Soft delete product.

- **POST** `/products/sync`
  - Sync products.

---

### 7. Payments (`/payments`)

- **POST** `/payments`
  - Create payment.

- **PUT** `/payments/:id`
  - Update payment by UUID `id`.

- **GET** `/payments/:userEmail`
  - Get payments for a user.

- **DELETE** `/payments/:id`
  - Soft delete payment.

- **POST** `/payments/sync`
  - Sync payments.

---

### 8. Invoices (`/invoices`)

- **POST** `/invoices/sync`
  - Sync invoices and invoice items.

---

### 9. Purchases (`/purchases`)

- **POST** `/purchases/sync`
  - Sync purchases and related data.

---

### 10. Purchase Orders (`/purchase-orders`)

- **POST** `/purchase-orders/sync`
  - Sync purchase orders and related data.

---

### 11. Commission Agents (`/commission-agents`)

- **POST** `/commission-agents`
  - Create commission agent.

- **GET** `/commission-agents/:userEmail`
  - Get commission agents for a user.

- **GET** `/commission-agents/:userEmail/:id`
  - Get commission agent by ID.

- **GET** `/commission-agents/:userEmail/search/:name`
  - Search agents by name.

- **GET** `/commission-agents/:userEmail/:id/total-commission`
  - Get total commission for agent.

- **GET** `/commission-agents/:userEmail/unsynced`
  - Get unsynced agents.

- **PUT** `/commission-agents/:id`
  - Update commission agent.

- **PUT** `/commission-agents/:id/commission-amount`
  - Update commission amount only.

- **DELETE** `/commission-agents/:id`
  - Soft delete commission agent.

- **POST** `/commission-agents/sync`
  - Sync commission agents.

- **POST** `/commission-agents/mark-synced`
  - Mark commission agents as synced.

---

### 12. Commission History (`/commission-history`)

- **POST** `/commission-history`
  - Create commission history record.

- **GET** `/commission-history/:userEmail`
  - Get commission history for user.

- **GET** `/commission-history/:userEmail/:id`
  - Get commission history record by ID.

- **GET** `/commission-history/:userEmail/agent/:agentId`
  - Get history by agent.

- **GET** `/commission-history/:userEmail/invoice/:invoiceId`
  - Get history by invoice.

- **GET** `/commission-history/:userEmail/status/:status`
  - Get history by status.

- **GET** `/commission-history/:userEmail/agent/:agentId/total`
  - Total commission for agent.

- **GET** `/commission-history/:userEmail/agent/:agentId/paid`
  - Total paid commission for agent.

- **GET** `/commission-history/:userEmail/agent/:agentId/unpaid`
  - Total unpaid commission for agent.

- **GET** `/commission-history/:userEmail/agent/:agentId/summary`
  - Summary for agent.

- **GET** `/commission-history/:userEmail/date-range`
  - History by date range.

- **GET** `/commission-history/:userEmail/payment-date-range`
  - History by payment date range.

- **GET** `/commission-history/:userEmail/unsynced`
  - Unsynced records.

- **PUT** `/commission-history/:id`
  - Update record.

- **PUT** `/commission-history/:id/mark-paid`
  - Mark as paid.

- **PUT** `/commission-history/:id/mark-unpaid`
  - Mark as unpaid.

- **DELETE** `/commission-history/:id`
  - Soft delete record.

- **POST** `/commission-history/sync`
  - Sync history records.

- **POST** `/commission-history/mark-synced`
  - Mark history as synced.

---

### 13. Expenses (`/expenses`)

- **POST** `/expenses`
  - Create expense.

- **PUT** `/expenses/:id`
  - Update expense.

- **GET** `/expenses/:userEmail`
  - Get expenses for a user.

- **GET** `/expenses/:userEmail/:id`
  - Get expense by ID.

- **DELETE** `/expenses/:id`
  - Soft delete expense.

- **GET** `/expenses/:userEmail/date-range`
  - Expenses by date range.

- **GET** `/expenses/:userEmail/category/:category`
  - Expenses by category.

- **GET** `/expenses/:userEmail/type/:type`
  - Expenses by type.

- **GET** `/expenses/:userEmail/search`
  - Search expenses by query.

- **POST** `/expenses/:userEmail/filter`
  - Filtered expenses (complex filters).

- **GET** `/expenses/:userEmail/summary`
  - Summary in date range.

- **GET** `/expenses/:userEmail/categories`
  - Unique categories.

- **GET** `/expenses/:userEmail/types`
  - Unique expense types.

- **GET** `/expenses/:userEmail/month/:year/:month`
  - Expenses for a specific month.

- **GET** `/expenses/:userEmail/year/:year`
  - Expenses for a specific year.

- **GET** `/expenses/:userEmail/recent`
  - Recent expenses (e.g., last N days).

- **POST** `/expenses/sync`
  - Sync expenses.

---

### 14. Credit Notes (`/credit-notes`)

- **POST** `/credit-notes`
  - Create credit note.

- **GET** `/credit-notes/:userEmail`
  - Get credit notes for user.

- **GET** `/credit-notes/:userEmail/:id`
  - Get credit note by ID.

- **GET** `/credit-notes/client/:userEmail/:clientId`
  - Credit notes by client.

- **GET** `/credit-notes/invoice/:userEmail/:invoiceId`
  - Credit notes by invoice.

- **GET** `/credit-notes/status/:userEmail/:status`
  - Credit notes by status.

- **GET** `/credit-notes/number/:userEmail/:creditNo`
  - Credit note by credit number.

- **GET** `/credit-notes/total/:userEmail/:clientId`
  - Total credit amount by client.

- **GET** `/credit-notes/unsynced/:userEmail`
  - Unsynced credit notes.

- **GET** `/credit-notes/date-range`
  - Credit notes by date range.

- **GET** `/credit-notes/search`
  - Search credit notes.

- **PUT** `/credit-notes/:id`
  - Update credit note.

- **DELETE** `/credit-notes/:id`
  - Soft delete credit note.

- **POST** `/credit-notes/sync`
  - Sync credit notes.

- **POST** `/credit-notes/mark-synced`
  - Mark credit notes as synced.

---

### 15. Delivery Notes (`/delivery-notes`)

- **POST** `/delivery-notes`
  - Create delivery note.

- **GET** `/delivery-notes/:userEmail`
  - Get delivery notes for user.

- **GET** `/delivery-notes/:userEmail/:id`
  - Get delivery note by ID.

- **GET** `/delivery-notes/client/:userEmail/:clientId`
  - Delivery notes by client.

- **GET** `/delivery-notes/status/:userEmail/:status`
  - Delivery notes by status.

- **PUT** `/delivery-notes/:id`
  - Update delivery note.

- **DELETE** `/delivery-notes/:id`
  - Soft delete delivery note.

- **POST** `/delivery-notes/sync`
  - Sync delivery notes.

---

### 16. Warehouses (`/warehouses`)

- **POST** `/warehouses/sync`
  - Sync warehouses and related data.

---

### 17. Inventory (`/inventory`)

- **POST** `/inventory/sync`
  - Sync inventory data.

---

### 18. Physical Stock Take (`/physical-stock-take`)

- **POST** `/physical-stock-take/sync`
  - Sync physical stock take records.

---

### 19. Stock Transfers (`/stock-transfers`)

- **POST** `/stock-transfers/sync`
  - Sync stock transfers.

---

### 20. Cash Registers (`/cash-registers`)

- **POST** `/cash-registers/sync`
  - Sync cash registers.

