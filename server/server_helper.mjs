import fs from 'fs';
import csv from 'csv-parser';
import mysql from 'mysql2/promise';  // Notice the /promise

export async function db_update(target) {  // Made it async
    try {
        const db = await mysql.createConnection({
            host: 'mysql',
            user: 'dydgh2011',
            password: '14135647',
            database: 'BENCHMARKS'
        });
        
        console.log('Connected to the database to update');

        const [tables] = await db.query('SHOW TABLES LIKE ?', [target]);
        if (tables.length === 0) {
            const createTableSQL = `
            CREATE TABLE \`${target}\` (
            \`Brand\` VARCHAR(255),
            \`Model\` VARCHAR(255),
            \`Rank\` INT,
            PRIMARY KEY (\`Brand\`, \`Model\`)
            )
            `;            
            await db.query(createTableSQL);
            console.log('Table created');
        } else {
            const dropTableSQL = `DROP TABLE ${target}`;
            await db.query(dropTableSQL);
            console.log('Table already exists.');
        }

        const uniqueRows = new Set();

        const readStream = fs.createReadStream(target + '_UserBenchmarks.csv').pipe(csv());

        for await (const row of readStream) {
            const uniqueIdentifier = `${row.Brand}-${row.Model}`;
            if (!uniqueRows.has(uniqueIdentifier)) {
                const query = `INSERT INTO ${target} (\`Brand\`, \`Model\`, \`Rank\`) VALUES (?, ?, ?)`;
                await db.query(query, [row.Brand, row.Model, row.Rank]); // Added values here
                uniqueRows.add(uniqueIdentifier);
            }
        }
        

        console.log('CSV file successfully processed');

        await db.end();
    } catch (err) {
        console.error('An error occurred:', err);
    }
}
