"use strict";

var queries = {
  permissions: {
    getUserPermsAndTeam: "\n           select u.*,\n                  json_agg(distinct jsonb_build_object(\n                      'permissions', up.permission,\n                      'resource', up.resource,\n                  )) as permissions,\n                  json_agg(distinct jsonb_build_object(\n                      'tem_id', t.id,\n                      'team_name', t.name\n                  )) as teams\n           from beta_crm_db.users u\n           left join beta_crm_db.user_permissions up on u.id = up.granted_by\n           left join beta_crm_db.user_teams t on u.id = t.user_id\n           where u.id = $1\n           group by u.id\n        "
  },
  tasks: {
    getAllTasks: "\n            select *\n            from beta_crm_db.tasks t\n            left join beta_crm_db.users assigned_to  on t.assigned_to = assigned_to.id\n            left join beta_crm_db.users created_by  on t.assigned_to = created_by.id\n            left join beta_crm_db.companies c on t.company_id = c.id\n            left join beta_crm_db.deals c on t.deal_id = deal_id\n        "
  },
  search: {
    searchUsers: "\n            select t.id,\n                   t.f_name,\n                   t.l_name\n            from beta_crm_db.users t\n            where t.l_name = $1 and t.f_name = $2\n        ",
    searchGroups: ""
  },
  cte: {
    getTeamHierarchy: "\n            with recursive org_chart as (\n                select u,id,\n                       u.f_name,\n                       u.l_name,\n                       u.manager_id,\n                       u.role,\n                       1 as level\n                from beta_crm_db.users u where u.manager_id is null\n                                         \n                union all\n                \n                select *\n                from beta_crm_db.users u\n                inner join org_chart oc on u.manager_id = oc.id\n            )\n            select * from org_chart order by level, l_name\n        "
  }
};