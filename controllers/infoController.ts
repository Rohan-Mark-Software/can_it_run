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
            const { tableName, targetColumn, target } = req.query;

            if (!tableName || !targetColumn || !target) {
                return res.status(400).json({ success: false, message: 'Missing required parameters' });
            }

            const result = await this.InfoModel.getInfo(tableName as string, targetColumn as string, target as string);
            
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('Error getting info:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async compareInfos(req: Request, res: Response) {
        try{
            const { userSpec, gameInfo } = req.body;
            const result = await this.InfoModel.openAIAPICall(userSpec, gameInfo);
            res.status(200).json({ success: true, data: result});
        }catch (error) {
            console.error('Error getting info:', error);
            res.status(500).json({success: false, message: 'APIcall fail'});
        }
    }
}

export default InfoController;
