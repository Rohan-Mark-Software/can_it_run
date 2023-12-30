import express from 'express';
import InfoController from '../controllers/infoController';
import { Request, Response } from 'express';

const router = express.Router();
const infoController = new InfoController();

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
    console.log(results);

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
    console.log(yesCount + " yes");
    console.log(noCount + " no");

    return final_result;
}

router.post('/compare', async (req, res) => {
    try {

        callCompareInfosAsync(req)
        .then((data) => {
            console.log(data);
            res.render('result', { result: data });
        })
        .catch((error) => {
            console.error(error);
        });
        
    } catch (error) {
        console.error('Error comparing infos:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/suggestions', async (req, res) => {
    try {
        await infoController.getInfo(req, res);
    } catch (error) {
        console.error('Error getting game suggestions:', error);
    }
});

export default router;