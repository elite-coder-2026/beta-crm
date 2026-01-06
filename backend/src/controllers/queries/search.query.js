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
        where u.j_name ilike $1
        order by u.created_at desc
        limit $2
    `
}