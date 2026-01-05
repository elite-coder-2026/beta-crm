export const tasks = {
    getAllTasks: `
        select t.*,
               assigned_to.f_name as assigned_to_f_name,
               assigned_to.l_name as assigned_to_l_name,
               created_by.f_name  as created_by,
               assigned_to.l_name as assigned_to_l_name,
               c.name             as company_name,
               ct.first_name      as contact_first_name
        -- todo: i think its time to smoke more weed and eat more.

        from beta_crm_db.tasks t
                 left join beta_crm_db.users assigned_to on t.assigned_to = assigned_to.id
                 left join beta_crm_db.users created_by on t.assigned_to = created_by.id
                 left join beta_crm_db.companies c on t.company_id = c.id

            -- fixme: find out what is 
                 left join beta_crm_db.deals d on t.id = d.id
                 left join beta_crm_db.contacts ct on t.contact_id = d.contact_id
    `,

    getTaskById: `
        select t.*,
               assigned_to.f_name as assigned_to_f_name,
               assigned_to.l_name as assigned_to_l_name,
               created_by.f_name  as created_by_first_name,
               created_by.l_name  as created_by_last_name,
               c.name             as company_name,
               ct.first_name      as contact_first_name,
               ct.last_name       as contact_last_name,
               d.title            as deal_title
        from beta_crm_db.tasks t
                 left join beta_crm_db.users assigned_to on t.assigned_to = assigned_to.id
                 left join beta_crm_db.users created_by on t.assigned_to = created_by.id
                 left join beta_crm_db.companies c on t.company_id = c.id
                 left join beta_crm_db.contacts ct on t.company_id = c.id
                 left join beta_crm_db.deals d on t.company_id = d.id
    `,

    createTask: `
        insert into beta_crm_db.tasks (id, title, description, status, priority, due_date, completed_at, assigned_to,
                                       created_by, company_id, contact_id)
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
        select *
        from beta_crm_db.tasks t
        left join beta_crm_db.users assigned_to on t.assigned_to = assigned_to.id
        left join beta_crm_db.companies c on c.id = assigned_to.id
        where t.assigned_to = $1
        
    `,

    getOverdueTask: `
        select *
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
    `
};
const generateId = () => {
}

generateId();

const queries = {
    tasks: {





    },
    permissions: {
        getUserPermsAndTeam: `
            select u.*,
                   json_agg(distinct jsonb_build_object(
                           'permissions', up.permission,
                           'resource', up.resource,
                                     )) as permissions,
                   json_agg(distinct jsonb_build_object(
                           'tem_id', t.id,
                           'team_name', t.name
                                     )) as teams
            from beta_crm_db.users u
                     left join beta_crm_db.user_permissions up on u.id = up.granted_by
                     left join beta_crm_db.user_teams t on u.id = t.user_id
            where u.id = $1
            group by u.id
        `,


    },


    search: {
        searchUsers: `
            select t.id,
                   t.f_name,
                   t.l_name
            from beta_crm_db.users t
            where t.l_name = $1
              and t.f_name = $2
        `,

        searchGroups: ``
    },

}

export const contacts = {
    getAllContacts: `
        select c.id,
               c.first_name,
               c.last_name,
               c.email,
               c.phone,    c.job_title,
               c.lead_status,
               comp.id,
               c.created_at,
               c.updated_at,
               count(*) over() as total_count
               
        from beta_crm_db.contacts c
        left join beta_crm_db.companies comp on c.id = comp.id
    `,
    getById: `
        select c.*,
               comp.name as company_name,
               comp.industry as company_undestry,
               json_agg(
                    json_build_object(
                        'id': a.id,
                        'type': a.type,
                        'subject': a.subject,
                        'due_date': a.due_date,
                        'status': a.status,
                    ) order by a.due_date desc
               ) filter (where a.id is not null) as recent_activity
        from beta_crm_db.contacts c
        left join beta_crm_db.companies comp on c.id = comp.id
        left join beta_crm_db.activities a on a.contact_id = c.id
        where c.id = $1
        group by c.id, 
                 comp.name, 
                 comp.industry
    `,
    create: `
        insert into beta_crm_db.contacts (first_name, last_name, email, phone, mobile, job_title, department, company_id, owner_id, address_line1, address_line2, city, state, postal_code, country, linkedin_url, twitter_url, description, lead_src, lead_status, status, created_at, updated_at) 
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), now())
        returning *
    `,

    update: ``,

    checkExisting: `
        select * from beta_crm_db.contacts c where c.id = $1
    `,

    delete: `
        delete from beta_crm_db.contacts 
        where id = $1
        returning id, first_name, last_name, email
    `,

    getStats: `
        select 
            count(*) as total_contacts,
            count(*) filter (where status = 'active') as active_contacts,
            count(*) filter(where status = 'inactive') as inactive_contacts,
            count(*) filter (where created_at >= now() - interval '30 days' ) as new_this_month,
            count(distinct company_id) as unique_companies
        from beta_crm_db.contacts c
        where c.status != 'completed'
    `
};

export const search = {
    contacts: `
       select 
           'contact' as type,
           id,
           first_name || ' ' || last_name as name,
           email,
           phone,
           company_id
       from beta_crm_db.contacts
       where status != 'deleted'
            and (
                first_name ilike $1 or
                last_name ilike $1 or
                email ilike $1 or
                phone ilike $1
           )
       order by
           case
                when first_name ilike $2 then 1
                when last_name ilike $3 then 1
                else 3
            end
       limit $3
    `,
}

export const user_workload = {
    getAllTasksForUser: `
        select a.*,
               
               c.id as contact_id,
               c.first_name || ' ' || last_name as name,
               c.email as contact_email,
               
               comp.id as company_id,
               comp.name as company_name,
               comp.industry as company_undestry,
               
               d.id as deal_id,
               d.title as deal_title,
               d.value as deal_value,
               d.status as deal_status,
               
               case
                    when a.due_date < now() and a.activity_status != 'completed' then extract(day from now() - a.due_date)::integer
                    else 0
               end as days_overdue,
            
               case
                   when a.due_date >= now() and a.activity_status != 'completed' then extract(day from now() - a.due_date)::integer
                   else 0
            end as days_until_due
        
        from 
            beta_crm_db.activities a 
        
        left join beta_crm_db.contacts c on a.contact_id = c.id
        left join beta_crm_db.companies comp on c.id = comp.id
        left join beta_crm_db.deals d on a.deal_id = d.id
        where a.owner_id = $1
    `,

    getTasksByProject: `

        select
            coalesce(comp.id, 0) as project_id,
            coalesce(comp.name, 'no company') as project_name,
            count(*) as total_tasks,
            count(*) filter (where activity_status = 'pending') as pending_tasks,
            count(*) filter (where activity_status = 'in_progress') as pending_tasks,
            count(*) filter (where activity_status = 'completed') as overdue_tasks,
            min(a.due_date) filter (where a.activity_status = 'completed') as next_due_date,
            json_agg(
                json_build_object(
                    'id', a.id,
                    'subject', a.subject,
                    'due_date', a.due_date,
                    'activity_status', a.activity_status,
                    'priority', a.priority,
                    'type', a.activity_type,
                ) order by due_date
            ) filter ( where a.activity_status != 'completed' ) as tasks
        from beta_crm_db.activities a
        left join beta_crm_db.companies comp on a.company_id = comp.id
        where a.owner_id = $1
            and a.activity_status != 'completed'
        group by comp.id, comp.name
        order by overdue_tasks desc
    `
}