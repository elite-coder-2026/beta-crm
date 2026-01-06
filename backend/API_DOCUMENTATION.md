# Beta CRM API Documentation

## Base URL
```
http://localhost:3000/api
```

## Contact Management Endpoints

### 1. Contacts

#### Get All Contacts
```http
GET /api/contacts
```

Query Parameters:
- `status` (string): Filter by status (active, inactive)
- `lead_status` (string): Filter by lead status
- `company_id` (integer): Filter by company
- `owner_id` (integer): Filter by owner
- `limit` (integer): Number of results (default: 50)
- `offset` (integer): Skip results (default: 0)

Response:
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "data": [...]
}
```

#### Get Contact by ID
```http
GET /api/contacts/:id
```

#### Create Contact
```http
POST /api/contacts
```

Request Body:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "mobile": "+0987654321",
  "job_title": "Manager",
  "department": "Sales",
  "company_id": 1,
  "owner_id": 1,
  "address_line1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "description": "Important client",
  "lead_status": "new",
  "status": "active",
  "check_duplicates": true
}
```

#### Update Contact
```http
PUT /api/contacts/:id
```

#### Delete Contact
```http
DELETE /api/contacts/:id
```

#### Search Contacts
```http
GET /api/contacts/search?q=john&limit=10
```

Query Parameters:
- `q` (string): Search query (minimum 2 characters)
- `limit` (integer): Maximum results (default: 10)

#### Get Contact Statistics
```http
GET /api/contacts/stats
```

Query Parameters:
- `owner_id` (integer): Filter by owner
- `company_id` (integer): Filter by company

#### Check for Duplicate Contacts
```http
POST /api/contacts/check-duplicates
```

Request Body:
```json
{
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "exclude_id": 5
}
```

#### Find Similar Contacts
```http
GET /api/contacts/find-similar
```

Query Parameters:
- `email` (string): Email to match
- `first_name` (string): First name to match
- `last_name` (string): Last name to match
- `phone` (string): Phone to match
- `exclude_id` (integer): Contact ID to exclude

#### Merge Contacts
```http
POST /api/contacts/merge
```

Request Body:
```json
{
  "primary_id": 1,
  "secondary_id": 2
}
```

#### Export Contacts
```http
GET /api/contacts/export
```

Query Parameters:
- `format` (string): Export format (csv, json) - default: csv
- `status` (string): Filter by status
- `lead_status` (string): Filter by lead status
- `company_id` (integer): Filter by company
- `owner_id` (integer): Filter by owner

#### Import Contacts
```http
POST /api/contacts/import
```

Request Body:
```json
{
  "contacts": [
    {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company_id": 1
    }
  ],
  "skip_duplicates": true
}
```

### 2. Companies

#### Get All Companies
```http
GET /api/companies
```

Query Parameters:
- `industry` (string): Filter by industry
- `company_size` (string): Filter by size
- `status` (string): Filter by status
- `owner_id` (integer): Filter by owner
- `limit` (integer): Number of results (default: 50)
- `offset` (integer): Skip results (default: 0)

#### Get Company by ID
```http
GET /api/companies/:id
```

#### Create Company
```http
POST /api/companies
```

Request Body:
```json
{
  "name": "Acme Corp",
  "website": "https://acme.com",
  "industry": "Technology",
  "company_size": "50-100",
  "email": "info@acme.com",
  "phone": "+1234567890",
  "address_line1": "456 Business Ave",
  "city": "San Francisco",
  "state": "CA",
  "postal_code": "94105",
  "country": "USA",
  "description": "Leading tech company",
  "annual_revenue": 1000000,
  "number_of_employees": 75,
  "founded_year": 2010,
  "owner_id": 1,
  "status": "active"
}
```

#### Update Company
```http
PUT /api/companies/:id
```

#### Delete Company
```http
DELETE /api/companies/:id
```

Note: Cannot delete companies with associated contacts or deals.

### 3. Custom Fields

#### Get Custom Field Definitions
```http
GET /api/custom-fields/definitions/:entityType
```

Path Parameters:
- `entityType` (string): Entity type (contact, company, deal, task)

#### Create Custom Field Definition
```http
POST /api/custom-fields/definitions
```

Request Body:
```json
{
  "entity_type": "contact",
  "field_name": "customer_since",
  "field_label": "Customer Since",
  "field_type": "date",
  "field_options": null,
  "is_required": false,
  "display_order": 1,
  "created_by": 1
}
```

Field Types:
- `text`: Single line text
- `textarea`: Multi-line text
- `number`: Numeric value
- `date`: Date picker
- `datetime`: Date and time picker
- `select`: Single select dropdown
- `multiselect`: Multiple select dropdown
- `boolean`: Yes/No checkbox
- `email`: Email field
- `url`: URL field

#### Get Contact Custom Fields
```http
GET /api/contacts/:id/custom-fields
```

#### Set Contact Custom Fields
```http
PUT /api/contacts/:id/custom-fields
```

Request Body:
```json
{
  "fields": [
    {
      "field_id": 1,
      "value": "2023-01-15"
    },
    {
      "field_id": 2,
      "value": "Premium"
    }
  ]
}
```

#### Get Company Custom Fields
```http
GET /api/companies/:id/custom-fields
```

#### Set Company Custom Fields
```http
PUT /api/companies/:id/custom-fields
```

### 4. Tasks

#### Get All Tasks
```http
GET /api/tasks
```

Query Parameters:
- `status` (string): Filter by status (pending, in_progress, completed)
- `priority` (string): Filter by priority (low, medium, high)
- `assigned_to` (integer): Filter by assignee
- `created_by` (integer): Filter by creator
- `company_id` (integer): Filter by company
- `contact_id` (integer): Filter by contact
- `deal_id` (integer): Filter by deal
- `limit` (integer): Number of results (default: 50)
- `offset` (integer): Skip results (default: 0)

#### Get Task by ID
```http
GET /api/tasks/:id
```

#### Create Task
```http
POST /api/tasks
```

Request Body:
```json
{
  "title": "Follow up with client",
  "description": "Discuss new proposal",
  "status": "pending",
  "priority": "high",
  "due_date": "2024-02-01T10:00:00Z",
  "assigned_to": 2,
  "created_by": 1,
  "company_id": 1,
  "contact_id": 5,
  "deal_id": 3
}
```

#### Update Task
```http
PUT /api/tasks/:id
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

#### Get Tasks by Assigned User
```http
GET /api/tasks/assigned/:userId
```

Query Parameters:
- `status` (string): Filter by status
- `priority` (string): Filter by priority

#### Get Overdue Tasks
```http
GET /api/tasks/overdue
```

Query Parameters:
- `assigned_to` (integer): Filter by assignee

#### Complete Task
```http
PATCH /api/tasks/:id/complete
```

#### Get Task Statistics
```http
GET /api/tasks/stats
```

Query Parameters:
- `assigned_to` (integer): Filter by assignee
- `created_by` (integer): Filter by creator

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {...}
}
```

## Status Codes

- `200 OK`: Successful GET, PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource
- `500 Internal Server Error`: Server error

## Authentication

Currently, authentication is not implemented. When implemented, all endpoints will require an authentication token:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

## Rate Limiting

No rate limiting is currently implemented.

## Pagination

Most list endpoints support pagination using:
- `limit`: Number of items per page (default: 50, max: 100)
- `offset`: Number of items to skip

The response includes:
- `count`: Number of items in current page
- `total`: Total number of items available

## Filtering

Most list endpoints support filtering through query parameters. Multiple filters are combined with AND logic.

## Sorting

Default sorting is by `created_at DESC` for most endpoints. Custom sorting may be available on specific endpoints.

## Data Validation

- Email addresses must be valid format
- Phone numbers are stored as provided
- Required fields are enforced
- Unique constraints prevent duplicates
- Foreign key constraints maintain referential integrity

## Bulk Operations

### Bulk Import
- Contacts support bulk import via `/api/contacts/import`
- Maximum 1000 records per request
- Duplicate checking available

### Bulk Export
- Contacts support bulk export via `/api/contacts/export`
- CSV and JSON formats available
- Filters can be applied

## Webhooks

Not currently implemented.

## Testing

Use tools like Postman or curl to test the API:

```bash
# Get all contacts
curl http://localhost:3000/api/contacts

# Create a contact
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@example.com"}'

# Update a contact
curl -X PUT http://localhost:3000/api/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{"job_title":"Senior Manager"}'

# Delete a contact
curl -X DELETE http://localhost:3000/api/contacts/1
```

## Common Use Cases

### 1. Import contacts from CSV
1. Parse CSV file on client side
2. Format data as JSON array
3. POST to `/api/contacts/import` with `skip_duplicates: true`
4. Handle response with imported/skipped counts

### 2. Find and merge duplicate contacts
1. GET `/api/contacts/find-similar` with contact details
2. Review matches with similarity scores
3. POST `/api/contacts/merge` with primary and secondary IDs
4. System automatically transfers related records

### 3. Add custom fields to contacts
1. POST `/api/custom-fields/definitions` to create field
2. PUT `/api/contacts/:id/custom-fields` to set values
3. GET `/api/contacts/:id/custom-fields` to retrieve values

### 4. Export contacts for email campaign
1. GET `/api/contacts/export?format=csv&lead_status=qualified`
2. Receive CSV file with filtered contacts
3. Import into email marketing tool

## Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error context"
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource doesn't exist
- `DUPLICATE_ERROR`: Resource already exists
- `CONSTRAINT_ERROR`: Database constraint violation
- `PERMISSION_ERROR`: Insufficient permissions
- `SERVER_ERROR`: Internal server error