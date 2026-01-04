import {contacts} from "./queries";
import {pool} from "../config/database";


export const getAll = async (req, res) => {
    try {
        // todo: add the query to get all of the contacts from the database
    } catch (err) {
        console.error(err)
    }
}

export const delete_contact = async (req, res) => {
    try {
        const { id } = req.params

        const query = contacts.delete

        const result = await pool.query(query, [id])

        if (result.rows.length === 0) {
            return res.status(404).send({
                success: false,
                error: "No such contact"
            })
        }

    } catch (err) {
        console.error(err)
        res.status(500).send({
            success: false,
            error: 'failed to delete contact',
            message: err.message
        })
    }
}

export const getStats = async (req, res) => {
    try {
        let query = contacts.getStats

        const result = await pool.query(query)

        res.json({
            success: true,
            data: result
        })
    } catch (err) {
        console.error('error fetching contact stats', err);

        res.status(500).json({
            success: false,
            error: "failed to fetch stats",
            message: err.message
        })
    }
}