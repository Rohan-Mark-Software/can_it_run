import * as helper from './server_helper.mjs';
import express from 'express';
import cors from 'cors';

const PORT = process.env.PORT || 3001;

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
