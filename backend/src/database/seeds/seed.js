const { pool } = require('../../config/database');
const bcrypt = require('bcrypt');

/**
 * Seed the database with initial data
 */
async function seed() {
  const client = await pool.connect();

  try {
    console.log('Starting database seeding...\n');

    await client.query('BEGIN');

    // 1. Seed Users
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersResult = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_active)
      VALUES
        ('admin@betacrm.com', $1, 'Admin', 'User', 'admin', '555-0001', true),
        ('john.doe@betacrm.com', $1, 'John', 'Doe', 'sales', '555-0002', true),
        ('jane.smith@betacrm.com', $1, 'Jane', 'Smith', 'sales', '555-0003', true),
        ('mike.johnson@betacrm.com', $1, 'Mike', 'Johnson', 'manager', '555-0004', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email;
    `, [hashedPassword]);
    console.log(`✓ Created ${usersResult.rowCount} users`);

    // 2. Seed Companies
    console.log('Seeding companies...');
    const companiesResult = await client.query(`
      INSERT INTO companies (name, website, industry, company_size, email, phone, city, state, country, owner_id)
      VALUES
        ('Tech Solutions Inc', 'https://techsolutions.com', 'Technology', '50-200', 'contact@techsolutions.com', '555-1001', 'San Francisco', 'CA', 'USA', 2),
        ('Marketing Pros LLC', 'https://marketingpros.com', 'Marketing', '10-50', 'info@marketingpros.com', '555-1002', 'New York', 'NY', 'USA', 2),
        ('Global Enterprises', 'https://globalenterprises.com', 'Finance', '200-500', 'contact@globalenterprises.com', '555-1003', 'Chicago', 'IL', 'USA', 3),
        ('Startup Ventures', 'https://startupventures.com', 'Technology', '1-10', 'hello@startupventures.com', '555-1004', 'Austin', 'TX', 'USA', 3)
      RETURNING id, name;
    `);
    console.log(`✓ Created ${companiesResult.rowCount} companies`);

    // 3. Seed Contacts
    console.log('Seeding contacts...');
    const contactsResult = await client.query(`
      INSERT INTO contacts (first_name, last_name, email, phone, job_title, company_id, owner_id, lead_status, city, state, country)
      VALUES
        ('Robert', 'Williams', 'robert.williams@techsolutions.com', '555-2001', 'CTO', 1, 2, 'qualified', 'San Francisco', 'CA', 'USA'),
        ('Emily', 'Brown', 'emily.brown@techsolutions.com', '555-2002', 'Product Manager', 1, 2, 'contacted', 'San Francisco', 'CA', 'USA'),
        ('David', 'Miller', 'david.miller@marketingpros.com', '555-2003', 'CEO', 2, 2, 'qualified', 'New York', 'NY', 'USA'),
        ('Sarah', 'Davis', 'sarah.davis@globalenterprises.com', '555-2004', 'VP Sales', 3, 3, 'proposal', 'Chicago', 'IL', 'USA'),
        ('James', 'Wilson', 'james.wilson@startupventures.com', '555-2005', 'Founder', 4, 3, 'new', 'Austin', 'TX', 'USA')
      RETURNING id, first_name, last_name;
    `);
    console.log(`✓ Created ${contactsResult.rowCount} contacts`);

    // 4. Seed Deals
    console.log('Seeding deals...');
    const dealsResult = await client.query(`
      INSERT INTO deals (title, description, value, stage, probability, expected_close_date, company_id, contact_id, owner_id, status, priority)
      VALUES
        ('Enterprise Software License', 'Annual license for 50 users', 50000.00, 'proposal', 75, CURRENT_DATE + INTERVAL '30 days', 1, 1, 2, 'open', 'high'),
        ('Marketing Campaign Q1', 'Digital marketing campaign for Q1', 25000.00, 'negotiation', 60, CURRENT_DATE + INTERVAL '15 days', 2, 3, 2, 'open', 'medium'),
        ('Financial Consulting Services', 'Year-long consulting engagement', 150000.00, 'qualification', 40, CURRENT_DATE + INTERVAL '60 days', 3, 4, 3, 'open', 'high'),
        ('Product Development Partnership', 'Joint product development', 75000.00, 'lead', 20, CURRENT_DATE + INTERVAL '90 days', 4, 5, 3, 'open', 'low')
      RETURNING id, title;
    `);
    console.log(`✓ Created ${dealsResult.rowCount} deals`);

    // 5. Seed Tasks
    console.log('Seeding tasks...');
    const tasksResult = await client.query(`
      INSERT INTO tasks (title, description, status, priority, due_date, assigned_to, created_by, deal_id)
      VALUES
        ('Follow up with CTO', 'Discuss technical requirements', 'pending', 'high', CURRENT_DATE + INTERVAL '2 days', 2, 1, 1),
        ('Prepare proposal', 'Create detailed proposal document', 'in_progress', 'high', CURRENT_DATE + INTERVAL '5 days', 2, 1, 1),
        ('Schedule demo', 'Set up product demo meeting', 'pending', 'medium', CURRENT_DATE + INTERVAL '7 days', 2, 1, 2),
        ('Contract review', 'Review contract terms', 'pending', 'high', CURRENT_DATE + INTERVAL '10 days', 3, 1, 3)
      RETURNING id, title;
    `);
    console.log(`✓ Created ${tasksResult.rowCount} tasks`);

    // 6. Seed Activities
    console.log('Seeding activities...');
    const activitiesResult = await client.query(`
      INSERT INTO activities (type, subject, description, activity_date, duration, status, user_id, contact_id, deal_id)
      VALUES
        ('call', 'Initial Discovery Call', 'Discussed company needs and budget', CURRENT_DATE - INTERVAL '5 days', 30, 'completed', 2, 1, 1),
        ('email', 'Sent Proposal', 'Emailed detailed proposal document', CURRENT_DATE - INTERVAL '3 days', NULL, 'completed', 2, 1, 1),
        ('meeting', 'Product Demo', 'Demonstrated key product features', CURRENT_DATE - INTERVAL '2 days', 60, 'completed', 2, 3, 2),
        ('call', 'Follow-up Call', 'Addressed questions about pricing', CURRENT_DATE - INTERVAL '1 day', 20, 'completed', 3, 4, 3)
      RETURNING id, subject;
    `);
    console.log(`✓ Created ${activitiesResult.rowCount} activities`);

    // 7. Seed Notes
    console.log('Seeding notes...');
    const notesResult = await client.query(`
      INSERT INTO notes (content, entity_type, entity_id, user_id)
      VALUES
        ('Very interested in our enterprise package. Decision maker confirmed.', 'contact', 1, 2),
        ('Budget approved for Q1. Moving forward with proposal.', 'deal', 1, 2),
        ('Needs integration with their existing CRM system.', 'company', 1, 2),
        ('Excellent call - they are ready to move forward quickly.', 'deal', 2, 2),
        ('Contact requested additional case studies.', 'contact', 4, 3)
      RETURNING id;
    `);
    console.log(`✓ Created ${notesResult.rowCount} notes`);

    await client.query('COMMIT');

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Email: admin@betacrm.com');
    console.log('Password: password123');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n✗ Seeding failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed if called directly
if (require.main === module) {
  seed().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = seed;
