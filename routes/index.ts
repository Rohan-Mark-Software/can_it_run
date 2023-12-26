import express from 'express';
import InfoController from '../controllers/infoController';
import { Request, Response } from 'express';

const router = express.Router();
const infoController = new InfoController();

router.get('/', (req, res) => {
    res.render('index');
});

router.post('/compare', async (req, res) => {
    try {
        const result = await infoController.compareInfos(req);
        res.render('result', { result: result });
    } catch (error) {
        console.error('Error comparing infos:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/suggestions', async (req, res) => {
    try {
        const tableName = 'GAME_INFO';
        const targetColumn = 'game_name';
        const target = req.query.input || '';

         await infoController.getInfo(req, res);
        
    } catch (error) {
        console.error('Error getting game suggestions:', error);
    }
});

export default router;