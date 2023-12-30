import mysql, { Pool, Connection, ResultSetHeader, RowDataPacket } from 'mysql2';
import fs from 'fs';
import { parse } from 'csv-parse';
import { join } from 'path';
import OpenAI from "openai";

// enter the API key here.
// DON'T FORGET TO REMOVE THIS BEFORE UPLOADING ON GITHUB
const APIKey: string = "";
const openai = new OpenAI({ apiKey: APIKey });

class InfoModel {
    private pool: Pool;

    constructor(){
        this.pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'MAIN_DB'
        });
    }

    // methods related to reading files
    private readCSVFile(filePath: string): Promise<string[][]> {
        return new Promise((resolve, reject) => {
            const data: string[][] = [];
            fs.createReadStream(filePath)
            .pipe(parse())
            .on('data', (row: string[]) => {
                data.push(row);
            })
            .on('end', () => {
                resolve(data);
            })
            .on('error', (error) => {
                reject(error);
            });
        });
    }

    // methods related to database
    private async query(sql: string, values?: any[]): Promise<RowDataPacket[] | ResultSetHeader> {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    console.error('Error getting MySQL connection:', err);
                    reject(err);
                    return;
                }

                connection.query(sql, values, (error, results) => {
                    connection.release();

                    if (error) {
                        console.error('Error executing MySQL query:', error);
                        reject(error);
                    } else {
                        resolve(results as RowDataPacket[] | ResultSetHeader);
                    }
                });
            });
        });
    }

    async initializeDatabase(): Promise<void> {
        console.log('Initializing database');

        try {
            await this.formatDatabase();
            console.log(`Database formated`);
            await this.query(`USE MAIN_DB`);
            console.log(`Database MAIN_DB selected`);
        } catch (error) {
            console.error('Error creating database:', error);
            throw error;
        }

        const [CPUData, GPUData, GameInfoData] = await Promise.all([
            this.readCSVFile(join(__dirname, '../datas/CPU_UserBenchmarks.csv')),
            this.readCSVFile(join(__dirname, '../datas/GPU_UserBenchmarks.csv')),
            this.readCSVFile(join(__dirname, '../datas/game_info.csv'))
        ]);
        console.log(CPUData.length + " CPU data");
        console.log(GPUData.length + " GPU data");
        console.log(GameInfoData.length + " game data");
        console.log("read CSV file");
        await this.createTable("CPU_INFO", CPUData);
        console.log("CPU table created");
        await this.createTable("GPU_INFO", GPUData);
        console.log("GPU table created");
        await this.createTable("GAME_INFO", GameInfoData);
        console.log("GAME_INFO table created");
        await this.addColumn("GAME_INFO", "LOWEST_POSSIBLE", "VARCHAR(255)");
        await this.addColumn("GAME_INFO", "HIGHEST_IMPOSSIBLE", "VARCHAR(255)");

        await this.deleteColumn("CPU_INFO", "TYPE");
        console.log("CPU_INFO Type deleted");
        await this.deleteColumn("CPU_INFO", "PART_NUMBER");
        console.log("CPU_INFO Part_Number deleted");

        await this.deleteColumn("GPU_INFO", "TYPE");
        console.log("GPU_INFO Type deleted");
        await this.deleteColumn("GPU_INFO", "PART_NUMBER");
        console.log("GPU_INFO Part_Number deleted");

        await this.combineColumns("CPU_INFO", "BRAND", "MODEL", "cpu_name");
        console.log("CPU_INFO Brand Model columnds combined as cpu_name");
        await this.combineColumns("GPU_INFO", "BRAND", "MODEL", "gpu_name");
        console.log("GPU_INFO Brand Model columnds combined as gpu_name");

        await this.deleteColumn("CPU_INFO", "BRAND");
        console.log("CPU_INFO BRAND deleted");
        await this.deleteColumn("CPU_INFO", "MODEL");
        console.log("CPU_INFO MODEL deleted");

        await this.deleteColumn("GPU_INFO", "BRAND");
        console.log("GPU_INFO BRAND deleted");
        await this.deleteColumn("GPU_INFO", "MODEL");
        console.log("GPU_INFO MODEL deleted");
    }

    // create methods
    async createDatabase(name: string): Promise<void> {
        try {
            await this.query(`CREATE DATABASE IF NOT EXISTS ${name}`);
            console.log(`Database "${name}" created or already exists`);
        } catch (error) {
            console.error('Error creating database:', error);
            throw error;
        }
    }

    async createTable(name: string, data: string[][]): Promise<void> {
        try {
            if (data.length < 2) {
                throw new Error('Insufficient data to create table');
            }

            const headers = data[0];
            const formattedHeaders = headers.map((header) => header.replace(/\s+/g, '_'));
            let columnDefinitions = "";
            if (name === "GAME_INFO"){
                columnDefinitions = formattedHeaders.map((header) => `\`${header.toUpperCase()}\` TEXT`).join(', ');
            }else{
                columnDefinitions = formattedHeaders.map((header) => `\`${header.toUpperCase()}\` VARCHAR(512)`).join(', ');
            }

            console.log(`CREATE TABLE IF NOT EXISTS ${name} (${columnDefinitions})`);
            await this.query(`CREATE TABLE IF NOT EXISTS ${name} (${columnDefinitions})`);
            console.log(`Table "${name}" created or already exists`);

            const addInfoPromises = data.slice(1).map(async (row) => {
                await this.addInfo(name, formattedHeaders, row);
            });
            await Promise.all(addInfoPromises);
            console.log(`Table "${name}" initialized`);
            
        } catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
    }

    // add methods
    async addInfo(table: string, columns: string[], datas: string[]): Promise<void> {
        try {
            const placeholders = Array(datas.length).fill('?').join(', ');
            
            const sql = `INSERT INTO ${table} (${columns.map((header) => `\`${header}\``).join(', ')}) VALUES (${placeholders})`;
    
            await this.query(sql, datas)
            .catch((error) => {
                console.error('Error:', error);
           });
        } catch (error) {
            console.error('Error adding row:', error);
            throw error;
        }
    }

    async addColumn(table: string, column: string, size: string): Promise<void> {
        try {
            const doesColumnExist = await this.checkIfColumnExists(table, column);

            if (doesColumnExist) {
                await this.deleteColumn(table, column);
                console.log(`Column "${column}" deleted from table "${table}"`);
            }

            const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${size}`;
            await this.query(sql);
            console.log(`Column "${column}" added to table "${table}"`);
        } catch (error) {
            console.error('Error adding column:', error);
            throw error;
        }

    }

    // remove methods
    async formatDatabase(): Promise<void> {
        try {
            const rows = await this.query(
                'SELECT * FROM information_schema.tables WHERE table_schema = ?',
                ['MAIN_DB']
            ) as RowDataPacket[];
            for (const row of rows) {
                const tableName = row.TABLE_NAME;
                await this.query(`DROP TABLE IF EXISTS ${tableName}`);
                console.log(`Dropped table: ${tableName}`);
            }
          } catch (error) {
            console.error('Error dropping tables:', error);
          }
    }

    async deleteColumn(table: string, column: string): Promise<void> {
        try {
            const sql = `ALTER TABLE ${table} DROP COLUMN ${column}`;
            await this.query(sql);
        } catch (error) {
            console.error('Error deleting column:', error);
            throw error;
        }
    }

    // get methods
    async getInfo(table: string, targetColumn: string, target: string, column: string): Promise<string[][]>{
        try {
            const formattedTarget = target.toLowerCase();
            const sql = `SELECT ${column} FROM ${table} WHERE LOWER(${targetColumn}) LIKE ? LIMIT 3`;
    
            const result = await this.query(sql, [`%${formattedTarget}%`]) as RowDataPacket[];
            const formattedResult = result.map((row) => {
                return Object.values(row) as string[];
            });
            return formattedResult;
        } catch (error) {
            console.error('Error retrieving information:', error);
            throw error;
        }
    }

    // etc
    async combineColumns(table: string, column_one: string, column_two: string, new_column: string): Promise<void>{
        try {
            await this.addColumn(table, new_column, "VARCHAR(255)");
            const sql = `UPDATE ${table} SET ${new_column} = CONCAT(${column_one}, ' ', ${column_two});`
            await this.query(sql);
        } catch (error) {
            console.error('Error deleting column:', error);
            throw error;
        }
    }

    async checkIfColumnExists(table: string, column: string): Promise<boolean> {
        const sql = `SHOW COLUMNS FROM ${table} LIKE '${column}'`;
        const result = await this.query(sql) as RowDataPacket[];
        return result.length > 0;
    }

    async openAIAPICall(userSpec:string, gameInfo:string): Promise<string>{
        // change this
        try {
            const a = `cpu = intel Core i9-13900KS, gpu = MSI RTX 4090 SUPRIM X 24G, ram = 16gb`;
            const b = `name = A Game of Thrones: The Board Game - Digital Edition, min_cpu = Intel Pentium D or AMD Athlon 64 X2, min_gpu = Graphics card with DX11 or OpenGL 3.x capabilities, min_ram = 2 GB RAM `;

            const message = `
            My computer's specification is this:
            ${userSpec}

            and the game's name and, minimum requirement that I want to play is this:
            ${gameInfo}.

            based on these information, do you think I can play this game on my computer or not?
        `;
            const completion = await openai.chat.completions.create({
                messages: [
                    {"role": "system", 
                    "content": `
                        You will receive user's computer's specification and some game's information,
                        you have to answer if the user can play the game on their computer or not.
                        You must say in yes or no. don't attach any explanation about your answer.
                        if the name of hardware specification is unknown, 
                        consider it has better performace than other models that you already know since newer model has better performance than older models. 
                        also you can guess it's performance based on it's name since most of the hardware units' model has somekind of pattern and code in their names.
                    `},
                    {"role": "assistant", 
                    "content": "YES"},
                    {"role": "assistant", 
                    "content": "NO"},

                    {"role": "user", 
                    "content": message}
                ],
                model: "gpt-3.5-turbo",
            });

            if (completion.choices[0].message.content){
                // console.log(message);
                // console.log(`================================`);
                // console.log(completion.choices[0].message.content);
                return completion.choices[0].message.content.toUpperCase() as string;
            }else{
                return "error";
            }
          } catch (error) {
            console.error('Error in OpenAI API call:', error);
            throw error;
          }
    }
}

export default InfoModel
