import express from 'express';
import InfoController from '../controllers/infoController';
import InfoModel from '../models/infoModel';

import { Request, Response } from 'express';

const router = express.Router();
const infoController = new InfoController();
const infoModel = new InfoModel();

router.get('/', (req, res) => {
    res.render('index');
});

async function callCompareInfosAsync(req: Request) {
    const promises = [];

    for (let i = 0; i < 10; i++) {
        promises.push(infoController.compareInfos(req));
    }
    const results = await Promise.all(promises);
            
    let yesCount = 0;
    let noCount = 0;

    for (const response of results) {
        if(response.toLowerCase().includes('yes')){
            yesCount++;
        } else if(response.toLowerCase().includes('no')){
            noCount++;
        }
    }

    let final_result;
    if (yesCount > noCount) {
        final_result = "yes";
    } else if (noCount > yesCount) {
        final_result = "no";
    } else {
        final_result = "unknown"; 
    }

    return final_result;
}

router.post('/compare', async (req, res) => {
    const { game, cpu, gpu, ram} = req.body;
    if(cpu === "" || gpu === "" || ram === ""){
        res.render('result', { result: "none"});
    }else{
        try {
            callCompareInfosAsync(req)
            .then((data) => {
                // also gives the user information too
                res.render('result', { result: data });
            })
            .catch((error) => {
                console.error(error);
            });
            
        } catch (error) {
            console.error('Error comparing infos:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
});

router.get('/suggestions', async (req, res) => {
    try {
        await infoController.getInfo(req, res);
    } catch (error) {
        console.error('Error getting game suggestions:', error);
    }
});

router.get('/getData', async (req, res) => {
    try {
        const {tableName, targetColumn, target, column} = req.query;
        const data = await infoModel.getInfo(tableName as string, targetColumn as string, target as string, column as string);
        let i = 0;
        for (const item of data) {
            if (item[0] === target){
                i = data.indexOf(item);
            }
        }

        res.status(200).json({ success: true, data: data[i] });

    } catch (error) {
        console.error('Error getting infos:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;