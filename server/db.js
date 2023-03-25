require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.DBPORT,
  database: process.env.DBNAME,
});

module.exports = pool;
