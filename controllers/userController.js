import pool from "../config/db_connection.js"
import { createError } from '../utils/ErrorHandler.js'
// Creating User
export const createUser = async (req, res, next) => {
    const { name, email, age } = req.body

    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *',
            [name, email, age]
        )
        res.status(201).json(result.rows[0])
    } catch (err) {
        next(err)
    }
}

// Fetching User with specific id
export const getUser = async (req, res, next) => {
    const { id } = req.params

    try{
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id])

        if(result.rows.length > 0){
            res.status(200).json(result.rows[0])
        }else{
            next(createError(404, 'User not Found'))
        }
    }catch(err){
        next(err)
    }
}

// Fetching All Users
export const getUsers = async (req, res, next) => {
    try{
        const result = await pool.query("SELECT * FROM users")
        res.status(200).json(result.rows)
    }catch(err){
        next(err)
    }
}

// Updating User
export const updateUser = async (req, res, next) => {
    const { id } = req.params
    const { name, email, age } = req.body

    try{
        const result = await pool.query(
            "UPDATE users SET name = $1, email = $2, age = $3 WHERE id = $4 RETURNING *",
            [name, email, age, id]
        )

        if(result.rows.length > 0){
            res.status(201).json(result.rows[0])
        }else{
            next(404, 'User not Found.')
        }
    }catch(err){
        next(err)
    }
}

// Deleting User
export const deleteUser = async (req, res, next) => {
    const { id } = req.params

    try{
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING *",
            [id]
        )

        if(result.rows.length > 0){
            res.status(204).send()
        }else{
            next(createError(404, 'User not Found.'))
        }
    }catch(err){
        next(err)
    }
}