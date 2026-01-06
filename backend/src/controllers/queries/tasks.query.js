export const tasks = {
    getAllTasks: `
        select t.*,
               assigned_to.f_name as assigned_to_first_name,
               assigned_to.l_name as assigned_to_last_name,
               assigned_to.email as assigned_to_email,
               created_by.f_name as created_by_first_name,
               created_by.l_name as created_by_last_name,
               c.name as company_name,
               ct.first_name as contact_first_name,
               ct.last_name as contact_last_name,
               d.title as deal_title
        from beta_crm_db.tasks t
                 left join beta_crm_db.users assigned_to on t.assigned_to = assigned_to.id
                 left join beta_crm_db.users created_by on t.created_by = created_by.id
                 left join beta_crm_db.companies c on t.company_id = c.id
                 left join beta_crm_db.contacts ct on t.contact_id = ct.id
                 left join beta_crm_db.deals d on t.deal_id = d.id
    `,

    getTaskById: `
        select t.*,
               assigned_to.f_name as assigned_to_first_name,
               assigned_to.l_name as assigned_to_last_name,
               assigned_to.email as assigned_to_email,
               created_by.f_name as created_by_first_name,
               created_by.l_name as created_by_last_name,
               c.name as company_name,
               ct.first_name as contact_first_name,
               ct.last_name as contact_last_name,
               d.title as deal_title
        from beta_crm_db.tasks t
                 left join beta_crm_db.users assigned_to on t.assigned_to = assigned_to.id
                 left join beta_crm_db.users created_by on t.created_by = created_by.id
                 left join beta_crm_db.companies c on t.company_id = c.id
                 left join beta_crm_db.contacts ct on t.contact_id = ct.id
                 left join beta_crm_db.deals d on t.deal_id = d.id
        where t.id = $1
    `,

    createTask: `
        insert into beta_crm_db.tasks (title, description, status, priority, due_date, assigned_to,
                                       created_by, company_id, contact_id, deal_id)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        returning *
    `,

    checkIfTaskExists: `
        select t.id
        from beta_crm_db.tasks t
        where t.id = $1
    `,

    // updateTasks: `
    //
    // `,

    deleteTask: `
        delete from beta_crm_db.tasks t where t.id = $1 returning t.id
    `,

    getTasksByAssignedUser: `
        select t.*,
               assigned_to.f_name as assigned_to_first_name,
               assigned_to.l_name as assigned_to_last_name,
               c.name as company_name,
               d.title as deal_title
        from beta_crm_db.tasks t
        left join beta_crm_db.users assigned_to on t.assigned_to = assigned_to.id
        left join beta_crm_db.companies c on t.company_id = c.id
        left join beta_crm_db.deals d on t.deal_id = d.id
        where t.assigned_to = $1
    `,

    getOverdueTask: `
        select t.*,
               assigned_to.f_name as assigned_to_first_name,
               assigned_to.l_name as assigned_to_last_name,
               c.name as company_name
        from beta_crm_db.tasks t
        left join beta_crm_db.users assigned_to on t.assigned_to = assigned_to.id
        left join beta_crm_db.companies c on t.company_id = c.id
        where t.due_date < current_timestamp
        and t.status != 'completed'
    `,

    completedTasks: `
        update beta_crm_db.tasks t
        set status = 'completed',
            completed_at = current_timestamp
        where t.id = $1 returning *
    `,

    getTaskStats: `
        select
            count(*) as total,
            count(case when status = 'pending' then 1 end) as pending,
            count(case when status = 'in_progress' then 1 end) as in_progress,
            count(case when status = 'completed' then 1 end) as completed,
            count(case when due_date < current_timestamp and status != 'completed' then 1 end) as overdue,
            count(case when priority = 'high' then 1 end) as high_priority,
            count(case when priority = 'medium' then 1 end) as medium_priority,
            count(case when priority = 'low' then 1 end) as low_priority
        from beta_crm_db.tasks
    `
};