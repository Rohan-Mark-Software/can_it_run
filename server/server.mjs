import * as helper from './server_helper.mjs';
import express from 'express';
import mysql from 'mysql2/promise';  // Notice the /promise
import cors from 'cors';

const PORT = process.env.PORT || 3001;

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'dydgh2011',
  password: '14135647',
  database: 'BENCHMARKS'
});

const app = express();
app.use(cors());  // Enable CORS for all routes

const init = async () => {
  await helper.db_update("CPU");
  await helper.db_update("GPU");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

init().catch(err => {
  console.error('An error occurred:', err);
});

app.get('/api/suggestions', async (req, res) => {
  const userInput = req.query.input;
  const type = req.query.type; // either 'cpu' or 'gpu'

  if (!['CPU', 'GPU'].includes(type.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid type parameter' });
  }

  console.log(type + ' type and model ' + userInput);
  try {
    const [rows] = await db.query(`SELECT Model FROM ${type} WHERE Model LIKE ? LIMIT 3`, [`%${userInput}%`]);
    res.json(rows);
    console.log(rows)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});