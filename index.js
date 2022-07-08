const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const mysql = require("mysql");
const fs = require("fs")
const dbinfo = fs.readFileSync('./database.json');
//받아온 json데이터를 객체형태로 변경 JSON.parse
const conf = JSON.parse(dbinfo)
const connection = mysql.createConnection({
    host:conf.host,
    user:conf.user,
    password:conf.password,
    port:conf.port,
    database:conf.database
})
app.use(express.json());
app.use(cors());

app.get('/customers', async (req, res)=> {   
    connection.query(
        "select * from customers_table",
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})
app.get('/customers/:no', async (req, res)=> {  
    const params = req.params; 
    connection.query(
        `select * from customers_table where no = ${params.no}`,
        (err, rows, fields)=>{
            res.send(rows[0]);
        }
    )
})

//서버실행
app.listen(port, ()=>{
    console.log("고객 서버가 돌아가고 있습니다.")
})