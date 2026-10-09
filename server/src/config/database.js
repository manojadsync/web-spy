import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Initialize connection using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME || 'web_spy_db', 
  process.env.DB_USERNAME || 'postgres', 
  process.env.DB_PASSWORD || 'password', 
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');
    // await sequelize.sync({ alter: true }); // Sync models to create tables
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default sequelize;
