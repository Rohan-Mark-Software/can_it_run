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

    for (let i = 0; i < 9; i++) {
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
    const game_data = await infoModel.getInfo("GAME_INFO", 'game_name', game, "*");
    let i = 0;
    for (const item of game_data) {
        if (item[0] === game){
            i = game_data.indexOf(item);
        }
    }
    if(cpu === "" || gpu === "" || ram === ""){
        res.render('result', {
            game_name: game_data[i][0],

            min_cpu: game_data[i][1],
            min_gpu: game_data[i][2],
            min_ram: game_data[i][3],
            min_dx: game_data[i][4],
            min_os: game_data[i][5],
            min_sto: game_data[i][6],
            min_net: game_data[i][7],

            rec_cpu: game_data[i][8],
            rec_gpu: game_data[i][9],
            rec_ram: game_data[i][10],
            rec_dx: game_data[i][11],
            rec_os: game_data[i][12],
            rec_sto: game_data[i][13],
            rec_net: game_data[i][14]
        });
    }else{
        try {
            callCompareInfosAsync(req)
            .then((data) => {
                let compare_result = ""
                if(data.toLowerCase() === "yes"){
                    compare_result = "You Can Run This Game!";
                }else if(data.toLowerCase() === "no"){
                    compare_result = "You Can't Run This Game";
                }else{
                    compare_result = "Something Went Wrong...";
                }
                res.render('result', { 
                    result: compare_result,

                    game_name: game_data[i][0],

                    min_cpu: game_data[i][1],
                    min_gpu: game_data[i][2],
                    min_ram: game_data[i][3],
                    min_dx: game_data[i][4],
                    min_os: game_data[i][5],
                    min_sto: game_data[i][6],
                    min_net: game_data[i][7],
        
                    rec_cpu: game_data[i][8],
                    rec_gpu: game_data[i][9],
                    rec_ram: game_data[i][10],
                    rec_dx: game_data[i][11],
                    rec_os: game_data[i][12],
                    rec_sto: game_data[i][13],
                    rec_net: game_data[i][14],
                    
                    user_cpu: cpu,
                    user_gpu: gpu,
                    user_ram: ram
                });
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