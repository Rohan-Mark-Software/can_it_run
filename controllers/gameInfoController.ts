import GameInfoModel from '../models/infoModel';
import { GameInfo } from '../models/customDataTypes';
import { Request, Response } from 'express';


class GameController {
    private gameInfoModel: GameInfoModel;

    constructor() {
        this.gameInfoModel = new GameInfoModel();
    }

    async addGameInfo(req: Request, res: Response) {
        // try {
        //     if(req.body){
        //         const gameInfo: GameInfo = req.body;
        //         await this.gameInfoModel.addGameInfo(gameInfo);
        //         res.status(200).json({ message: 'Game info added successfully' });
        //     }
        // } catch (error) {
        //     console.error(error);
        //     res.status(500).json({ error: 'Internal Server Error' });
        // }
    }

    async getGameInfo(req: Request, res: Response) {

    }
}

module.exports = GameController;
