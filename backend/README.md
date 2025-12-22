# Beta CRM - Backend

Backend API for Beta CRM application built with Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beta_crm
DB_USER=your_username
DB_PASSWORD=your_password
```

### 3. Create Database

```bash
createdb beta_crm
```

Or using psql:

```sql
CREATE DATABASE beta_crm;
```

### 4. Run Migrations

```bash
npm run migrate
```

This will create all necessary tables in your database.

### 5. Seed Database (Optional)

```bash
npm run seed
```

This will populate your database with sample data for testing.

Default credentials after seeding:
- Email: `admin@betacrm.com`
- Password: `password123`

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload
- `npm run migrate` - Run all pending migrations
- `npm run migrate:down` - Rollback the last migration
- `npm run seed` - Seed the database with sample data
- `npm run db:reset` - Reset database (rollback, migrate, and seed)

## Database Schema

### Tables

1. **users** - System users and CRM users
2. **companies** - Company/Account records
3. **contacts** - Contact records
4. **deals** - Sales opportunities/deals
5. **tasks** - Task management
6. **activities** - Activity tracking (calls, emails, meetings)
7. **notes** - Notes that can be attached to any entity

### Relationships

- Companies have many Contacts
- Contacts belong to Companies
- Deals belong to Companies and Contacts
- Tasks can be linked to Companies, Contacts, or Deals
- Activities can be linked to Companies, Contacts, or Deals
- Notes use a polymorphic relationship (can attach to any entity)

## API Endpoints

### Health Check

```
GET /health - Check API status
GET /api - API welcome message
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool
│   ├── controllers/             # Request handlers
│   ├── database/
│   │   ├── migrations/          # SQL migration files
│   │   │   ├── 001_create_users_table.sql
│   │   │   ├── 002_create_companies_table.sql
│   │   │   ├── 003_create_contacts_table.sql
│   │   │   ├── 004_create_deals_table.sql
│   │   │   ├── 005_create_tasks_table.sql
│   │   │   ├── 006_create_activities_table.sql
│   │   │   └── 007_create_notes_table.sql
│   │   ├── seeds/               # Seed data scripts
│   │   │   └── seed.js
│   │   └── migrate.js           # Migration runner
│   ├── middleware/
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── notFound.js          # 404 handler
│   ├── models/                  # Database models
│   ├── routes/                  # API routes
│   ├── services/                # Business logic
│   └── utils/                   # Helper functions
├── tests/                       # Test files
├── .env                         # Environment variables
├── .env.example                 # Example environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # NPM dependencies and scripts
├── README.md                    # This file
└── server.js                    # Express server entry point
```

## Development

### Running the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Creating New Migrations

Create a new file in `src/database/migrations/` with the naming convention:

```
XXX_description.sql
```

Example: `008_add_tags_table.sql`

Migration file structure:

```sql
-- Up
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Down
DROP TABLE IF EXISTS tags;
```

### Testing Database Connection

```bash
node -e "require('./src/config/database').query('SELECT NOW()')"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | beta_crm |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | postgres |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| CORS_ORIGIN | CORS allowed origin | http://localhost:3000 |

## Technologies

- **Express** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client
- **bcrypt** - Password hashing
- **helmet** - Security headers
- **cors** - Cross-Origin Resource Sharing
- **morgan** - HTTP request logger
- **dotenv** - Environment variables
- **nodemon** - Development auto-reload

## License

ISC
