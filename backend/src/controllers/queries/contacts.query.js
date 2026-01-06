export const contacts = {
    existingContact: `
        select c.id from beta_crm_db.contacts c where c.id = $1
    `,

    // todo: the update query is in side the controller itself
    // todo: so there is no need to write the query here

    deleteContact: `
        delete from beta_crm_db.contacts c
        where c.id = $1
        returning c.id,
            c.first_name,
            c.last_name,
            c.email
    `,

    getStats: `
        select
            count(*) as total_contacts,
            count(*) filter (where c.status = 'active') as active_contacts
        from beta_crm_db.contacts c where c.status = $1
    `
}