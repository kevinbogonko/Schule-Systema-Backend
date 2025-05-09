import pg from 'pg'
import dotenv from 'dotenv'

// Configure the dotenv
dotenv.config()

const { Pool } = pg

const pool = new Pool({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    port : process.env.DB_PORT,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
})

pool.connect()
.then(() => console.log("Successful connection established..."))
.catch(err => console.error("An error occurred while establishing connection : ", err))

export default pool