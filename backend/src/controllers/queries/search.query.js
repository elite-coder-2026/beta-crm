export const searchQuery = {
    contacts: `
        select *
        from beta_crm_db.contacts c
        where c.status != 'deleted'
            and (first_name ilike $1 or last_name ilike $1 or email ilike $1)
        order by c.first_name , c.last_name
        limit $2
    `,

    companies: `
        select *
        from beta_crm_db.contacts c
        where c.status != 'deleted'
            and c.name ilike $1
        order by c.name
        limit $2
    `,

    deals: `
        select d.id,
               d.name as label,
               d.value
        from beta_crm_db.deals d
        where d.title ilike $1
        order by d.created_at desc
        limit $2
    `,

    users: `
        select u.id,
               u.f_name || ' ' || u.l_name,
               u.email
        from beta_crm_db.users u
        where u.full_name ilike $1
        order by u.created_at desc
        limit $2
    `,

    searchContacts: `
        select
        from beta_crm_db.contacts c
        where c.status != 'deleted'
            and (
                first_name ilike $1 or last_name ilike $1 or email ilike $1 or phone ilike $1
            )
        order by
            case
                when first_name ilike $2 then 1
                when last_name ilike $2 then 2
                else 3
            end
        limit $3
    `,

    searchDeals: `
        select 'deal' as type,
               d.id,
               d.name as label,
               d.value,
               d.stage,
               d.status
        from beta_crm_db.deals d
        left join beta_crm_db.companies c on d.company_id = c.id
        where d.name ilike $1
        order by d.created_at desc
        limit $3
    `,

    searchCompanies: `
        select 'company' as name
        from beta_crm_db.companies c
        where status != 'deleted'
            and (
                c.name ilike $1 or c.industry ilike $1 or c.email ilike $1
            )
        order by
            case when c.name ilike $2 then 1 else 2
            end
        limit $3
        
    `
}