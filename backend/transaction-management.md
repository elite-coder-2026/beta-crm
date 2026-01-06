# Transaction Management in Beta CRM

## Table of Contents
- [Overview](#overview)
- [Why Transactions Matter](#why-transactions-matter)
- [PostgreSQL Transaction Basics](#postgresql-transaction-basics)
- [Implementation in Node.js](#implementation-in-nodejs)
- [Transaction Patterns in Beta CRM](#transaction-patterns-in-beta-crm)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Testing Transactions](#testing-transactions)

## Overview

Transaction management is a critical aspect of database operations that ensures data integrity and consistency. In Beta CRM, we use PostgreSQL transactions to handle complex operations that involve multiple database queries.

## Why Transactions Matter

Transactions provide **ACID** properties:

- **Atomicity**: All operations in a transaction succeed or fail together
- **Consistency**: Database remains in a valid state before and after the transaction
- **Isolation**: Concurrent transactions don't interfere with each other
- **Durability**: Committed changes persist even after system failures

### Real-World Example: Contact Merge

When merging two contacts, we need to:
1. Update the primary contact with data from secondary
2. Update all activities to point to primary contact
3. Update all deals to point to primary contact
4. Update all notes to point to primary contact
5. Delete the secondary contact

If step 3 fails, we don't want steps 1-2 to be saved - we need ALL operations to succeed or ALL to fail.

## PostgreSQL Transaction Basics

### Basic Commands

```sql
BEGIN;           -- Start a transaction
COMMIT;          -- Save all changes
ROLLBACK;        -- Undo all changes
SAVEPOINT name;  -- Create a savepoint
ROLLBACK TO name; -- Rollback to savepoint
```

### Isolation Levels

PostgreSQL supports four isolation levels:

1. **READ UNCOMMITTED** - Lowest isolation (not actually implemented in PostgreSQL)
2. **READ COMMITTED** - Default level, prevents dirty reads
3. **REPEATABLE READ** - Prevents non-repeatable reads
4. **SERIALIZABLE** - Highest isolation, prevents phantom reads

## Implementation in Node.js

### Basic Transaction Pattern

```javascript
const { query } = require('../config/database');

async function performTransaction() {
    try {
        // Start transaction
        await query('BEGIN');

        try {
            // Perform multiple operations
            await query('INSERT INTO ...');
            await query('UPDATE ...');
            await query('DELETE ...');

            // If all succeed, commit
            await query('COMMIT');

            return { success: true };
        } catch (error) {
            // If any operation fails, rollback
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
    }
}
```

### Using a Connection Pool

For better connection management:

```javascript
const { pool } = require('../config/database');

async function performTransactionWithPool() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Perform operations using the same client
        await client.query('INSERT INTO ...');
        await client.query('UPDATE ...');

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        // Always release the client back to the pool
        client.release();
    }
}
```

## Transaction Patterns in Beta CRM

### 1. Contact Merge Transaction

```javascript
const mergeContacts = async (req, res, next) => {
    try {
        const { primary_id, secondary_id } = req.body;

        // Start transaction
        await query('BEGIN');

        try {
            // Step 1: Merge contact data
            const mergeResult = await query(contacts.mergeContacts, [primary_id, secondary_id]);

            if (mergeResult.rows.length === 0) {
                await query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    error: 'Primary contact not found'
                });
            }

            // Step 2: Update all related records
            await query('UPDATE beta_crm_db.activities SET contact_id = $1 WHERE contact_id = $2',
                       [primary_id, secondary_id]);
            await query('UPDATE beta_crm_db.deals SET contact_id = $1 WHERE contact_id = $2',
                       [primary_id, secondary_id]);
            await query('UPDATE beta_crm_db.notes SET contact_id = $1 WHERE contact_id = $2',
                       [primary_id, secondary_id]);

            // Step 3: Delete secondary contact
            await query('DELETE FROM beta_crm_db.contacts WHERE id = $1', [secondary_id]);

            // All operations successful, commit
            await query('COMMIT');

            res.json({
                success: true,
                message: 'Contacts merged successfully',
                data: mergeResult.rows[0]
            });
        } catch (error) {
            // Any error, rollback everything
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error merging contacts:', error);
        next(error);
    }
};
```

### 2. Bulk Import Transaction

```javascript
const importContacts = async (req, res, next) => {
    try {
        const { contacts: contactsData } = req.body;
        const results = { imported: 0, skipped: 0, errors: [] };

        await query('BEGIN');

        try {
            for (const contactData of contactsData) {
                // Validate and check duplicates
                if (!contactData.first_name || !contactData.last_name) {
                    results.errors.push({
                        error: 'Missing required fields',
                        data: contactData
                    });
                    results.skipped++;
                    continue;
                }

                // Insert contact
                const result = await query(contacts.create, [...params]);
                results.imported++;
            }

            // All imports successful
            await query('COMMIT');

            res.json({
                success: true,
                message: `Imported ${results.imported} contacts`,
                results
            });
        } catch (error) {
            // Rollback all imports on any error
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error importing contacts:', error);
        next(error);
    }
};
```

### 3. Custom Fields Update Transaction

```javascript
const setContactFields = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { fields } = req.body;
        const results = [];

        await query('BEGIN');

        try {
            for (const field of fields) {
                // Update each custom field
                const result = await query(customFields.setContactField, [
                    id,
                    field.field_id,
                    JSON.stringify(field.value)
                ]);
                results.push(result.rows[0]);
            }

            // All fields updated successfully
            await query('COMMIT');

            res.json({
                success: true,
                data: results
            });
        } catch (error) {
            // Rollback all field updates
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error setting custom fields:', error);
        next(error);
    }
};
```

### 4. Company Deletion with Validation

```javascript
const deleteCompany = async (req, res, next) => {
    try {
        const { id } = req.params;

        await query('BEGIN');

        try {
            // Check for dependencies
            const checkQuery = `
                SELECT
                    (SELECT COUNT(*) FROM beta_crm_db.contacts WHERE company_id = $1) as contact_count,
                    (SELECT COUNT(*) FROM beta_crm_db.deals WHERE company_id = $1) as deal_count
            `;
            const checkResult = await query(checkQuery, [id]);

            if (checkResult.rows[0].contact_count > 0 || checkResult.rows[0].deal_count > 0) {
                // Can't delete, has dependencies
                await query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    error: 'Cannot delete company with associated records',
                    details: checkResult.rows[0]
                });
            }

            // Safe to delete
            const deleteResult = await query('DELETE FROM beta_crm_db.companies WHERE id = $1 RETURNING *', [id]);

            if (deleteResult.rows.length === 0) {
                await query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    error: 'Company not found'
                });
            }

            await query('COMMIT');

            res.json({
                success: true,
                message: 'Company deleted successfully'
            });
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error deleting company:', error);
        next(error);
    }
};
```

## Best Practices

### 1. Always Use Try-Catch-Finally

```javascript
async function safeTransaction() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        // ... operations ...
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release(); // Always release the connection
    }
}
```

### 2. Keep Transactions Short

```javascript
// ❌ Bad: Long-running transaction
async function badTransaction() {
    await query('BEGIN');

    const users = await query('SELECT * FROM users'); // Large dataset

    for (const user of users.rows) {
        await someSlowOperation(user); // External API call
        await query('UPDATE users SET processed = true WHERE id = $1', [user.id]);
    }

    await query('COMMIT');
}

// ✅ Good: Process in batches, minimal transaction scope
async function goodTransaction() {
    const users = await query('SELECT * FROM users');

    for (const user of users.rows) {
        await someSlowOperation(user); // Outside transaction

        await query('BEGIN');
        await query('UPDATE users SET processed = true WHERE id = $1', [user.id]);
        await query('COMMIT');
    }
}
```

### 3. Use Savepoints for Partial Rollbacks

```javascript
async function complexTransaction() {
    await query('BEGIN');

    try {
        await query('INSERT INTO orders ...');

        await query('SAVEPOINT items_start');

        try {
            for (const item of orderItems) {
                await query('INSERT INTO order_items ...', [item]);
            }
        } catch (error) {
            // Only rollback items, not the entire order
            await query('ROLLBACK TO items_start');
            // Handle partial success
        }

        await query('COMMIT');
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}
```

### 4. Handle Deadlocks

```javascript
async function retryOnDeadlock(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            // PostgreSQL deadlock error code
            if (error.code === '40P01' && attempt < maxRetries) {
                console.log(`Deadlock detected, retry ${attempt}/${maxRetries}`);
                await new Promise(resolve => setTimeout(resolve, 100 * attempt));
                continue;
            }
            throw error;
        }
    }
}

// Usage
const result = await retryOnDeadlock(async () => {
    return await performTransaction();
});
```

### 5. Use Appropriate Isolation Levels

```javascript
async function readOnlyTransaction() {
    await query('BEGIN ISOLATION LEVEL READ COMMITTED READ ONLY');
    const result = await query('SELECT ...');
    await query('COMMIT');
    return result;
}

async function criticalTransaction() {
    await query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    // Critical operations that need highest isolation
    await query('COMMIT');
}
```

## Error Handling

### Common PostgreSQL Error Codes

```javascript
function handleDatabaseError(error) {
    switch (error.code) {
        case '23505': // Unique violation
            return { status: 400, message: 'Duplicate entry exists' };

        case '23503': // Foreign key violation
            return { status: 400, message: 'Referenced record does not exist' };

        case '23502': // Not null violation
            return { status: 400, message: 'Required field is missing' };

        case '40P01': // Deadlock detected
            return { status: 503, message: 'Database busy, please retry' };

        case '25P02': // In failed transaction
            return { status: 500, message: 'Transaction failed' };

        default:
            return { status: 500, message: 'Database error occurred' };
    }
}
```

### Transaction State Management

```javascript
class TransactionManager {
    constructor(pool) {
        this.pool = pool;
        this.client = null;
        this.inTransaction = false;
    }

    async begin() {
        if (this.inTransaction) {
            throw new Error('Transaction already in progress');
        }

        this.client = await this.pool.connect();
        await this.client.query('BEGIN');
        this.inTransaction = true;
    }

    async commit() {
        if (!this.inTransaction) {
            throw new Error('No transaction in progress');
        }

        await this.client.query('COMMIT');
        this.inTransaction = false;
        this.client.release();
        this.client = null;
    }

    async rollback() {
        if (!this.inTransaction) {
            throw new Error('No transaction in progress');
        }

        await this.client.query('ROLLBACK');
        this.inTransaction = false;
        this.client.release();
        this.client = null;
    }

    async query(text, params) {
        if (!this.inTransaction) {
            throw new Error('No transaction in progress');
        }

        return this.client.query(text, params);
    }
}

// Usage
const tm = new TransactionManager(pool);

try {
    await tm.begin();
    await tm.query('INSERT INTO ...');
    await tm.query('UPDATE ...');
    await tm.commit();
} catch (error) {
    await tm.rollback();
    throw error;
}
```

## Performance Considerations

### 1. Connection Pooling

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    max: 20,                // Maximum connections in pool
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Timeout for new connections
});
```

### 2. Batch Operations

```javascript
// ❌ Bad: Multiple round trips
async function insertManyBad(items) {
    await query('BEGIN');
    for (const item of items) {
        await query('INSERT INTO items (name) VALUES ($1)', [item.name]);
    }
    await query('COMMIT');
}

// ✅ Good: Single query with multiple values
async function insertManyGood(items) {
    const values = items.map((item, i) => `($${i + 1})`).join(',');
    const params = items.map(item => item.name);

    await query('BEGIN');
    await query(`INSERT INTO items (name) VALUES ${values}`, params);
    await query('COMMIT');
}
```

### 3. Prepared Statements

```javascript
// Prepare statement once
const insertContact = {
    name: 'insert-contact',
    text: 'INSERT INTO contacts (first_name, last_name, email) VALUES ($1, $2, $3)',
    values: []
};

// Reuse many times
async function createManyContacts(contacts) {
    await query('BEGIN');

    for (const contact of contacts) {
        insertContact.values = [contact.first_name, contact.last_name, contact.email];
        await query(insertContact);
    }

    await query('COMMIT');
}
```

## Testing Transactions

### Unit Testing with Rollback

```javascript
describe('Transaction Tests', () => {
    let client;

    beforeEach(async () => {
        client = await pool.connect();
        await client.query('BEGIN');
    });

    afterEach(async () => {
        // Always rollback to keep test database clean
        await client.query('ROLLBACK');
        client.release();
    });

    it('should merge contacts successfully', async () => {
        // Create test data
        await client.query('INSERT INTO contacts (id, name) VALUES ($1, $2)', [1, 'John']);
        await client.query('INSERT INTO contacts (id, name) VALUES ($1, $2)', [2, 'Jane']);

        // Test merge operation
        await mergeContacts(client, 1, 2);

        // Verify results
        const result = await client.query('SELECT * FROM contacts WHERE id = $1', [1]);
        expect(result.rows[0].name).toBe('John Jane');
    });
});
```

### Integration Testing

```javascript
describe('Transaction Integration Tests', () => {
    it('should rollback on error', async () => {
        const initialCount = await getContactCount();

        try {
            await importContacts([
                { first_name: 'Valid', last_name: 'Contact' },
                { first_name: null, last_name: 'Invalid' }, // This will cause error
            ]);
        } catch (error) {
            // Expected error
        }

        const finalCount = await getContactCount();
        expect(finalCount).toBe(initialCount); // No contacts should be added
    });
});
```

## Common Pitfalls and Solutions

### 1. Forgotten Rollback

```javascript
// ❌ Bad: No rollback on early return
async function badTransaction() {
    await query('BEGIN');

    if (someCondition) {
        return; // Transaction left open!
    }

    await query('COMMIT');
}

// ✅ Good: Always handle transaction state
async function goodTransaction() {
    await query('BEGIN');

    try {
        if (someCondition) {
            await query('ROLLBACK');
            return;
        }

        await query('COMMIT');
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}
```

### 2. Nested Transactions

```javascript
// PostgreSQL doesn't support true nested transactions
// Use savepoints instead

async function parentTransaction() {
    await query('BEGIN');

    try {
        await query('INSERT INTO parent...');

        // Create savepoint for nested operation
        await query('SAVEPOINT nested');

        try {
            await nestedOperation();
        } catch (error) {
            // Only rollback nested operation
            await query('ROLLBACK TO nested');
        }

        await query('COMMIT');
    } catch (error) {
        await query('ROLLBACK');
        throw error;
    }
}
```

### 3. Transaction Timeout

```javascript
// Set statement timeout for long-running transactions
async function timeoutTransaction() {
    await query('BEGIN');

    try {
        // Set 5 second timeout for this transaction
        await query('SET LOCAL statement_timeout = 5000');

        await longRunningOperation();

        await query('COMMIT');
    } catch (error) {
        await query('ROLLBACK');

        if (error.code === '57014') {
            throw new Error('Operation timed out');
        }
        throw error;
    }
}
```

## Summary

Transaction management is crucial for maintaining data integrity in Beta CRM. Key points:

1. **Always use transactions** for operations involving multiple queries
2. **Keep transactions short** to avoid locking issues
3. **Handle errors properly** with try-catch-finally blocks
4. **Release connections** back to the pool
5. **Test with rollbacks** to ensure data consistency
6. **Use appropriate isolation levels** based on requirements
7. **Monitor and log** transaction performance

By following these patterns and best practices, Beta CRM ensures reliable and consistent data operations even under concurrent load and error conditions.