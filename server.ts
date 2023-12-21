import express, { Request, Response } from 'express';
import InfoModel from './models/infoModel';

const infoModel = new InfoModel();

const app = express();
const port = 3000;

infoModel.initializeDatabase();

app.use(express.json());
app.use(express.static("public"));


// server starts
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
