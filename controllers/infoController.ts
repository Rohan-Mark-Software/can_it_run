import infoModel from '../models/infoModel';
import { Request, Response } from 'express';

// ignore this file, it's dummy file
class InfoController {
    private InfoModel: infoModel;

    constructor() {
        this.InfoModel = new infoModel();
    }

    async addInfo(req: Request, res: Response) {
        const { tableName, columnNames, datas } = req.body;
        try {
            await this.InfoModel.addInfo(tableName, columnNames, datas);
            res.status(200).json({ success: true, message: 'Data added successfully' });
        } catch (error) {
            console.error('Error adding info:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async getInfo(req: Request, res: Response) {
        try {
            const { tableName, targetColumn, target, column } = req.query;

            if (!tableName || !targetColumn || !target) {
                return res.status(400).json({ success: false, message: 'Missing required parameters' });
            }

            const result = await this.InfoModel.getInfo(tableName as string, targetColumn as string, target as string, column as string);
            
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error getting info:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async compareInfos(req: Request): Promise<string>{
        try{
            const { game, cpu, gpu, ram} = req.body;
            const userSpec = `CPU = ${cpu}, GPU = ${gpu}, RAM = ${ram}`;
            const game_data = await this.InfoModel.getInfo("GAME_INFO", "game_name", game, "*");
            // find item that fits target
            let i = 0;
            for (const item of game_data) {
                if (item[0] === game){
                    i = game_data.indexOf(item);
                }
            }
            if(game_data[i][0] === ""|| game_data[i][1] === ""|| game_data[i][2] === ""|| game_data[i][2] === ""){
                return "unknown";
            }
            const gameInfo = `Name = ${game_data[i][0]}, Minimum CPU requirement = ${game_data[i][1]}, Minimum GPU requirement = ${game_data[i][2]}, Minimum RAM requirement = ${game_data[i][3]}`;
            const result = await this.InfoModel.openAIAPICall(userSpec, gameInfo);
            return result;
        }catch (error) {
            console.error('Error getting info:', error);
            return "";
        }
    }
}

export default InfoController;
