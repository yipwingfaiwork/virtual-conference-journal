
// Database configuration
// NOTE: These values are used by the backend server only
// They should be stored in environment variables in a .env file
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'relax_hotel_system',
  port: Number(process.env.DB_PORT) || 8889, // MAMP default MySQL port
}
