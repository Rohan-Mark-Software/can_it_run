import mysql, { Pool, Connection, ResultSetHeader, RowDataPacket } from 'mysql2';
import { GameInfo } from './customDataTypes';
import fs from 'fs';
import { parse } from 'csv-parse';
import { join } from 'path';

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

    async formatDatabase(): Promise<void> {
        try {
            const rows = await this.query(
                'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
                ['MAIN_DB']
            ) as RowDataPacket[];
            
            for (const row of rows) {
                const tableName = row.table_name;
                await this.query(`DROP TABLE IF EXISTS ${tableName}`);
                console.log(`Dropped table: ${tableName}`);
            }
          } catch (error) {
            console.error('Error dropping tables:', error);
          }
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
            this.readCSVFile(join(__dirname, '../src/CPU_UserBenchmarks.csv')),
            this.readCSVFile(join(__dirname, '../src/GPU_UserBenchmarks.csv')),
            this.readCSVFile(join(__dirname, '../src/game_info.csv'))
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

    }

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
                columnDefinitions = formattedHeaders.map((header) => `\`${header}\` TEXT`).join(', ');
            }else{
                columnDefinitions = formattedHeaders.map((header) => `\`${header}\` VARCHAR(512)`).join(', ');
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

    async addInfo(table: string, columns: string[], data: string[]): Promise<void> {
        try {
            const placeholders = Array(data.length).fill('?').join(', ');
            
            const sql = `INSERT INTO ${table} (${columns.map((header) => `\`${header}\``).join(', ')}) VALUES (${placeholders})`;
    
            await this.query(sql, data)
            .catch((error) => {
                console.error('Error:', error);
           });
        } catch (error) {
            console.error('Error adding row:', error);
            throw error;
        }
    }

}

export default InfoModel;
