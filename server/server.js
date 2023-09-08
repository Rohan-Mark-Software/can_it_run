const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());  // Enable CORS for all routes

const db = mysql.createConnection({
  host: 'mysql',
  user: 'dydgh2011',
  password: '14135647',
  database: 'BENCHMARKS'
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

app.get('/getData', (req, res) => {
  let sql = 'SELECT * FROM CPU';
  db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    res.json(results);
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
