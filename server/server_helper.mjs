import fs from 'fs';
import csv from 'csv-parser';
import mysql from 'mysql2/promise';  // Notice the /promise

export async function benchmark_db_update(target) {  // Made it async
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'dydgh2011',
            password: '14135647',
            database: 'BENCHMARKS'
        });
        
        console.log('Connected to the benchmarks database to update');

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

export async function game_db_update() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'dydgh2011',
            password: '14135647',
            database: 'BENCHMARKS'
        });
        
        console.log('Connected to the database to update');

        const [tables] = await db.query('SHOW TABLES LIKE ?', ["GAME"]);
        if (tables.length !== 0) {
            console.log('Table already exists.');
            const dropTableSQL = `DROP TABLE ${"GAME"}`;
            await db.query(dropTableSQL);
            console.log('Table droped.');
        }

        const createTableSQL = `
        CREATE TABLE \`GAME\` (
          \`Model\` VARCHAR(512) PRIMARY KEY,
          \`MIN_CPU\` TEXT,
          \`MIN_GPU\` TEXT,
          \`MIN_RAM\` TEXT,
          \`MIN_DX\` TEXT,
          \`MIN_OS\` TEXT,
          \`MIN_STO\` TEXT,
          \`MIN_NET\` TEXT,
          \`REC_CPU\` TEXT,
          \`REC_GPU\` TEXT,
          \`REC_RAM\` TEXT,
          \`REC_DX\` TEXT,
          \`REC_OS\` TEXT,
          \`REC_STO\` TEXT,
          \`REC_NET\` TEXT
        )
        `;
        await db.query(createTableSQL);
        console.log('Table created');

        const uniqueRows = new Set();

        const readStream = fs.createReadStream('game_info.csv').pipe(csv());

        for await (const row of readStream) {
            if (!uniqueRows.has(row.game_name)) {
                const query = `
                INSERT INTO GAME (
                    \`Model\`, 
                    \`MIN_CPU\`, 
                    \`MIN_GPU\`, 
                    \`MIN_RAM\`, 
                    \`MIN_DX\`, 
                    \`MIN_OS\`, 
                    \`MIN_STO\`,
                    \`MIN_NET\`,
                    \`REC_CPU\`, 
                    \`REC_GPU\`, 
                    \`REC_RAM\`, 
                    \`REC_DX\`, 
                    \`REC_OS\`, 
                    \`REC_STO\`,
                    \`REC_NET\`
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
                     await db.query(query, [row.game_name
                    , row.min_cpu
                    , row.min_gpu
                    , row.min_ram
                    , row.min_dx
                    , row.min_os
                    , row.min_sto
                    , row.min_net
                    , row.rec_cpu
                    , row.rec_gpu
                    , row.rec_ram
                    , row.rec_dx
                    , row.rec_os
                    , row.rec_sto
                    , row.rec_net]);
                uniqueRows.add(row.game_name);
            }
        }

        console.log('game CSV file successfully processed');
        await db.end();
    } catch (err) {
        console.error('An error occurred:', err);
    }
}

export async function setting_helper_functions(){
    try{
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'dydgh2011',
            password: '14135647',
            database: 'BENCHMARKS'
        });

        //do this query before run this
        // GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

        //GRANT SUPER ON *.* TO 'dydgh2011'@'%';
        // FLUSH PRIVILEGES;


        // re weight this
        const createLevenshteinFunction = `
        CREATE FUNCTION LEVENSHTEIN(s1 VARCHAR(255), s2 VARCHAR(255)) 
        RETURNS INT 
        DETERMINISTIC 
        BEGIN 
            DECLARE s1_len, s2_len, i, j, c, c_temp, cost INT; 
            DECLARE s1_char CHAR; 
            -- max strlen=255
            DECLARE cv0, cv1 VARBINARY(256); 
            SET s1_len = CHAR_LENGTH(s1), s2_len = CHAR_LENGTH(s2), cv1 = 0x00, j = 1, i = 1, c = 0; 
            IF s1 = s2 THEN 
                RETURN 0; 
            ELSEIF s1_len = 0 THEN 
                RETURN s2_len; 
            ELSEIF s2_len = 0 THEN 
                RETURN s1_len; 
            ELSE 
                WHILE j <= s2_len DO 
                    SET cv1 = CONCAT(cv1, UNHEX(HEX(j))), j = j + 1; 
                END WHILE; 
                WHILE i <= s1_len DO 
                    SET s1_char = SUBSTRING(s1, i, 1), c = i, cv0 = UNHEX(HEX(i)), j = 1; 
                    WHILE j <= s2_len DO 
                        SET c = c + 1; 
                        IF s1_char = SUBSTRING(s2, j, 1) THEN  
                            SET cost = 0; ELSE SET cost = 1; 
                        END IF; 
                        SET c_temp = ORD(SUBSTRING(cv1, j, 1)) + cost; 
                        IF c > c_temp THEN SET c = c_temp; END IF; 
                            SET c_temp = ORD(SUBSTRING(cv1, j+1, 1)) + 1; 
                        IF c > c_temp THEN  
                            SET c = c_temp;  
                        END IF; 
                        SET cv0 = CONCAT(cv0, UNHEX(HEX(c))), j = j + 1; 
                    END WHILE; 
                    SET cv1 = cv0, i = i + 1; 
                END WHILE; 
            END IF; 
            RETURN c; 
        END;        
        `;
        try {
            await db.query(createLevenshteinFunction);
            console.log('Levenshtein Distance function created successfully');
        } catch (err) {
            console.error('Error creating the Levenshtein Distance function:', err);
        }
        await db.end();
    }catch (err) {
        console.error('An error occurred:', err);
    }
}

export async function search_target(target, type){
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'dydgh2011',
            password: '14135647',
            database: 'BENCHMARKS'
        });
    
        // Split the target into words
        const words = target.split(/\s+/);
    
        // Create LIKE conditions for each word
        const likeConditions = words.map(word => `Model LIKE ?`).join(' AND ');
    
        // Create an array of parameterized query replacements
        const queryParams = words.map(word => `%${word}%`);
    
        // Construct the SQL query using LIKE conditions
        const query = `
            SELECT Model
            FROM ${type}
            WHERE ${likeConditions}
            LIMIT 3;
        `;
    
        // Execute the query
        const [rows] = await db.query(query, queryParams);
        db.end();
        return rows;
    } catch (error) {
        console.error('Error executing the query:', error);
    }
    
}

export async function get_game(target){
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'dydgh2011',
            password: '14135647',
            database: 'BENCHMARKS'
        });

        const query = `
            SELECT *
            FROM GAME
            WHERE Model = ?;
        `;
    
        // Execute the query
        const [rows] = await db.query(query, [target]);
        db.end();
        return rows;
    } catch (error) {
        console.error('Error executing the query:', error);
    }
}