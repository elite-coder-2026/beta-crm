const { query } = require('../config/database');
const { companies } = require('./queries');

/**
 * Get all companies with optional filtering
 * GET /api/companies
 */
const getAll = async (req, res, next) => {
    try {
        const {
            industry,
            company_size,
            status,
            owner_id,
            limit = 50,
            offset = 0
        } = req.query;

        let sql = companies.getAll;
        const params = [];
        let paramCount = 1;

        if (industry) {
            sql = sql.replace('where 1=1', `where 1=1 AND c.industry = $${paramCount}`);
            params.push(industry);
            paramCount++;
        }

        if (company_size) {
            sql = sql.includes('AND')
                ? sql.replace('group by', `AND c.company_size = $${paramCount} group by`)
                : sql.replace('where 1=1', `where 1=1 AND c.company_size = $${paramCount}`);
            params.push(company_size);
            paramCount++;
        }

        if (status) {
            sql = sql.includes('AND')
                ? sql.replace('group by', `AND c.status = $${paramCount} group by`)
                : sql.replace('where 1=1', `where 1=1 AND c.status = $${paramCount}`);
            params.push(status);
            paramCount++;
        }

        if (owner_id) {
            sql = sql.includes('AND')
                ? sql.replace('group by', `AND c.owner_id = $${paramCount} group by`)
                : sql.replace('where 1=1', `where 1=1 AND c.owner_id = $${paramCount}`);
            params.push(owner_id);
            paramCount++;
        }

        sql += ` ORDER BY c.created_at DESC`;
        sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await query(sql, params);

        res.json({
            success: true,
            count: result.rows.length,
            total: result.rows[0]?.total_count || 0,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        next(error);
    }
};

/**
 * Get single company by ID
 * GET /api/companies/:id
 */
const getById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(companies.getById, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Company not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching company:', error);
        next(error);
    }
};

/**
 * Create new company
 * POST /api/companies
 */
const create = async (req, res, next) => {
    try {
        const {
            name,
            website,
            industry,
            company_size,
            email,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            description,
            logo_url,
            linkedin_url,
            twitter_url,
            facebook_url,
            annual_revenue,
            number_of_employees,
            founded_year,
            owner_id,
            status = 'active'
        } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Company name is required'
            });
        }

        // Check for duplicates
        const duplicateCheck = await query(companies.checkDuplicate, [
            name,
            website || null,
            email || null,
            null // for new company, no ID to exclude
        ]);

        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'A company with this name, website, or email already exists',
                duplicates: duplicateCheck.rows
            });
        }

        const params = [
            name,
            website,
            industry,
            company_size,
            email,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            description,
            logo_url,
            linkedin_url,
            twitter_url,
            facebook_url,
            annual_revenue,
            number_of_employees,
            founded_year,
            owner_id,
            status
        ];

        const result = await query(companies.create, params);

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating company:', error);
        next(error);
    }
};

/**
 * Update company
 * PUT /api/companies/:id
 */
const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if company exists
        const existingResult = await query(companies.update, [id]);

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Company not found'
            });
        }

        // Check for duplicates if name, website, or email is being updated
        if (updates.name || updates.website || updates.email) {
            const duplicateCheck = await query(companies.checkDuplicate, [
                updates.name || existingResult.rows[0].name,
                updates.website || existingResult.rows[0].website,
                updates.email || existingResult.rows[0].email,
                id // exclude current company
            ]);

            if (duplicateCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'A company with this name, website, or email already exists',
                    duplicates: duplicateCheck.rows
                });
            }
        }

        const allowedFields = [
            'name', 'website', 'industry', 'company_size', 'email', 'phone',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code',
            'country', 'description', 'logo_url', 'linkedin_url', 'twitter_url',
            'facebook_url', 'annual_revenue', 'number_of_employees', 'founded_year',
            'owner_id', 'status'
        ];

        const setClause = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                setClause.push(`${key} = $${paramCount}`);
                values.push(updates[key]);
                paramCount++;
            }
        });

        if (setClause.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        // Add updated_at
        setClause.push(`updated_at = current_timestamp`);

        // Add id as last parameter for WHERE clause
        values.push(id);

        const updateQuery = `
            update beta_crm_db.companies
            set ${setClause.join(', ')}
            where id = ${paramCount}
            returning *
        `;

        const result = await query(updateQuery, values);

        res.json({
            success: true,
            message: 'Company updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating company:', error);
        next(error);
    }
};

/**
 * Delete company
 * DELETE /api/companies/:id
 */
const deleteCompany = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if company has associated contacts or deals
        const checkQuery = `
            select
                (select count(*) from beta_crm_db.contacts where company_id = $1) as contact_count,
                (select count(*) from beta_crm_db.deals where company_id = $1) as deal_count
        `;
        const checkResult = await query(checkQuery, [id]);

        if (checkResult.rows[0].contact_count > 0 || checkResult.rows[0].deal_count > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete company with associated contacts or deals',
                details: {
                    contacts: checkResult.rows[0].contact_count,
                    deals: checkResult.rows[0].deal_count
                }
            });
        }

        const result = await query(companies.delete, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Company not found'
            });
        }

        res.json({
            success: true,
            message: 'Company deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting company:', error);
        next(error);
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteCompany
};