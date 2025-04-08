
// Database configuration
// NOTE: Never expose these values directly in frontend code
// These should be stored in environment variables on your backend server
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_database',
  port: Number(process.env.DB_PORT) || 3306,
}
