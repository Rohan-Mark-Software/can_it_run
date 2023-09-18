import fs from 'fs';
import csv from 'csv-parser';
import mysql from 'mysql2/promise';  // Notice the /promise

export async function db_update(target) {  // Made it async
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'dydgh2011',
            password: '14135647',
            database: 'BENCHMARKS'
        });
        
        console.log('Connected to the database to update');

        const [tables] = await db.query('SHOW TABLES LIKE ?', [target]);
        if (tables.length !== 0) {
            console.log('Table already exists.');
            const dropTableSQL = `DROP TABLE ${target}`;
            await db.query(dropTableSQL);
            console.log('Table droped.');
        }
        const createTableSQL = `
        CREATE TABLE \`${target}\` (
          \`Model\` VARCHAR(255) PRIMARY KEY,
          \`Rank\` INT
        )
        `;        
        await db.query(createTableSQL);
        console.log('Table created');

        const uniqueRows = new Set();

        const readStream = fs.createReadStream(target + '_UserBenchmarks.csv').pipe(csv());

        for await (const row of readStream) {
        const uniqueIdentifier = `${row.Brand} ${row.Model}`;  // Concatenating brand and model
        if (!uniqueRows.has(uniqueIdentifier)) {
            const query = `INSERT INTO ${target} (\`Model\`, \`Rank\`) VALUES (?, ?)`;  // Changed query
            await db.query(query, [uniqueIdentifier, row.Rank]);  // Inserting concatenated brand and model
            uniqueRows.add(uniqueIdentifier);
        }
        }


        

        console.log('CSV file successfully processed');

        await db.end();
    } catch (err) {
        console.error('An error occurred:', err);
    }
}
