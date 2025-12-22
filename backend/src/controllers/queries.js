const generateId = () => {
}

const queries = {
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

    tasks: {
        getAllTasks: `
            select t.*,
                   assigned_to.f_name as assigned_to_f_name,
                   assigned_to.l_name as assigned_to_l_name,
                   created_by.f_name as created_by,
                   assigned_to.l_name as assigned_to_l_name,
                   c.name as company_name,
                   ct.first_name as contact_first_name
            -- todo: i think its time to smoke more weed and eat more.
            
            from beta_crm_db.tasks t
            left join beta_crm_db.users assigned_to  on t.assigned_to = assigned_to.id
            left join beta_crm_db.users created_by  on t.assigned_to = created_by.id
            left join beta_crm_db.companies c on t.company_id = c.id
                
            -- fixme: find out what is 
            left join beta_crm_db.deals d on t.deal_id = deal.id
            left join beta_crm_db.contacts ct on t.contact_id = contact_id
        `,

        getTaskById: `
            select *
            from beta_crm_db.tasks t 
            left join beta_crm_db.users assigned_to  on t.assigned_to = assigned_to.id
            left join beta_crm_db.users created_by  on t.assigned_to = created_by.id
            
            
        `
    },

    search: {
        searchUsers: `
            select t.id,
                   t.f_name,
                   t.l_name
            from beta_crm_db.users t
            where t.l_name = $1 and t.f_name = $2
        `,

        searchGroups: ``
    },

    cte: {
        getTeamHierarchy: `
            with recursive org_chart as (
                select u,id,
                       u.f_name,
                       u.l_name,
                       u.manager_id,
                       u.role,
                       1 as level
                from beta_crm_db.users u where u.manager_id is null
                                         
                union all
                
                select *
                from beta_crm_db.users u
                inner join org_chart oc on u.manager_id = oc.id
            )
            select * from org_chart order by level, l_name
        `
    }
}