import {searchQuery} from './queries/search.query.js';
/**
 * todo: I think its time for me to take a break and smoke some weed and then comme back and write more fucking beautiful code.
 */
export const search = async (req, res) => {
    try {
        const { q, entity = 'contacts', limit = 10 } = req.query

        if (!q || q.trim().length < 1) {
            return res.json({
                success: true,
                results: []
            })
        }

        const st = `${q}%`
        let query

        switch (entity) {
            case 'contacts':
               query =  searchQuery.contacts;
               break;

            case 'companies':
                query =  searchQuery.companies;
                break;

            case 'deals':
                query =  searchQuery.deals;
                break;

            case 'users':
                query = searchQuery.users;
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'invalid entity type, use: contact, companies, deals, or users'
                })
        }
    } catch (err) {
        console.error(err);
    }
}