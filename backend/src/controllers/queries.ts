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