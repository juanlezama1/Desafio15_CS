import dotenv from 'dotenv'


// Configura las variables de entorno, a las que se puede acceder por process.env.___
dotenv.config ()

const config_vars = {
    mongo_db_url: process.env.MONGO_DB_URL,
    session_secret: process.env.SESSION_SECRET,
    cookies_secret: process.env.COOKIES_SECRET,
    hash_cost: process.env.HASH_COST,
    jwt_secret: process.env.JWT_SECRET,
    port: process.env.PORT
}

export default config_vars