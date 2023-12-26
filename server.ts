import express, { Request, Response, response } from 'express';
import InfoModel from './models/infoModel';
import InfoController from './controllers/infoController';
import { join } from 'path';
import indexRouter from './routes/index';

const infoModel = new InfoModel();
const infoController = new InfoController();

const app = express();
const port = 3000;
const router = express.Router();

//infoModel.initializeDatabase();

app.set('view engine', 'hbs');
app.set('views', join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use('/', indexRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = router;
