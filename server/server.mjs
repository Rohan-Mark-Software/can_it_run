import * as helper from './server_helper.mjs';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import * as features from './features.mjs';
const PORT = process.env.PORT || 3001;

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'dydgh2011',
  password: '14135647',
  database: 'BENCHMARKS'
});

const app = express();
app.use(cors()); 

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
  // fetch http://localhost:3001/api/suggestions?input=${input}&type=${type}
  const userInput = req.query.input;
  const type = req.query.type;

  if (!['CPU', 'GPU', 'GAME'].includes(type.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid type parameter' });
  }

  console.log(type + ' type and model ' + userInput);

  if (type === 'Game'){
    const rows = await features.get_game_by_name(userInput);
    // console.log("Sending response:", rows);
    res.json(rows);
  }else{
    try {
      const [rows] = await db.query(`SELECT Model FROM ${type} WHERE Model LIKE ? LIMIT 3`, [`%${userInput}%`]);
      console.log("Sending response:", rows);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});