const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;
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

// app.get("경로", 함수)
// connection.query("쿼리문", 함수)
app.get('/customers', async (req, res)=> {   
    connection.query(
        "select * from customers_table",
        (err, rows, fields)=>{
            res.send(rows);
        }
    )
})
// localhost:3001/custromers/1
app.get('/customers/:no', async (req, res)=> {  
    const params = req.params; 
    connection.query(
        `select * from customers_table where no = ${params.no}`,
        (err, rows, fields)=>{
            res.send(rows[0]);
        }
    )
})

//수정하기
//update 테이블 이름
//set 필드이름1= 데이터값1
//where 필드이름 = 값

// addCustomer post요청이 오면 처리  req => 요청하는 객체,  res => 응답하는 객체
// c_name: "",
// c_phone: "",
// c_birth: "",
// c_gender: "",
// c_add: "",
// c_adddetail: ""
// mysql 쿼리 select / update / delete / insert
// insert into 테이블(컬럼1, 컬럼2, 컬럼3,....) values(?,?,?)
// query("쿼리",[값1,값2,값3,값4,값5,값6],함수)
// insert into customers_table(name, phone, birth, gender, add1, add2)
// values(?,?,?,?,?,?)
app.post("/addCustomer",async (req, res)=>{
    const { c_name, c_phone, c_birth,c_gender,c_add,c_adddetail } = req.body;
    connection.query("insert into customers_table(name, phone, birth, gender, add1, add2) values(?,?,?,?,?,?)",
        [c_name, c_phone,c_birth, c_gender,c_add,c_adddetail] ,
        (err,result,fields )=>{
        console.log(result)
        res.send("등록 되었습니다.")
    })
    
})

//삭제요청시 처리 /delCoustomer/${no}
//delete from 테이블명 조건절
//delete from customers_table where no = no
app.delete('/delCoustomer/:no', async (req, res) => {
    const params = req.params;
    console.log("삭제");
    connection.query(
        `delete from customers_table where no = ${params.no}`, 
        (err, rows, fields)=>{
            res.send(rows)
        })

})

//수정하기
// update 테이블이름 set 컬럼명 = 값 where no = 값
// update customers_table set name='', phone='', birth='',gender='',add1='', add2='' where no=
// http://localhost:3001/editcustomer/1
app.put('/editcustomer/:no', async (req, res)=>{
    //파라미터 값을 가지고 있는 객체 
    const params = req.params;
    const { c_name, c_phone, c_birth,c_gender,c_add,c_adddetail } = req.body;
    connection.query(`update customers_table set name='${c_name}', phone='${c_phone}', birth='${c_birth}',gender='${c_gender}',add1='${c_add}', add2='${c_adddetail}' where no=${params.no}`,
    (err,result,fields)=>{
        res.send(result)
    })
})




//서버실행
app.listen(port, ()=>{
    console.log("고객 서버가 돌아가고 있습니다.")
})