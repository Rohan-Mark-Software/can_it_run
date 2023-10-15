import * as helper from './server_helper.mjs';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
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
  // await helper.benchmark_db_update("CPU");
  // await helper.benchmark_db_update("GPU");
  // await helper.setting_helper_functions();
  // await helper.game_db_update();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

init().catch(err => {
  console.error('An error occurred:', err);
});

app.get('/api/suggestions', async (req, res) => {
  const userInput = req.query.input;
  const type = req.query.type;

  if (!['CPU', 'GPU', 'GAME'].includes(type.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid type parameter' });
  }

  console.log(type + ' type and model ' + userInput);
  try {
    const rows = await helper.search_target(userInput,type.toUpperCase());
    console.log("Sending response:", rows);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/request_data', async (req, res) => {
  const game = req.query.game;
  try {
    const rows = await helper.get_game(game);
    console.log("Sending response:", rows);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/api/comparison", async (req, res) => {
  const user_cpu = req.query.user_cpu;
  const user_gpu = req.query.user_gpu;
  const user_ram = req.query.user_ram;
  const game_name = res.query.game_name;
  try{
    const game_info = await helper.search_target(game_name);

  }catch(err){
    console.error(err);
    re
  }
  
});