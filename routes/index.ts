import express from 'express';
import InfoModel from '../models/infoModel';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

export default router;