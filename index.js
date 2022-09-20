const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const port = process.env.PORT || 3001;
const mysql = require("mysql");
const fs = require("fs")
const bcrypt = require('bcrypt');
const saltRounds = 10;
app.use(express.static("public"));
const dbinfo = fs.readFileSync('./database.json');
const multer = require("multer")

let jwt = require("jsonwebtoken");
let secretObj = require('./ignorefile/jwt');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
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
app.use("/upload", express.static("upload"));

//파일요청시 파일이 저장될 경로와 파일이름(요청된 원본파일이름) 지정
storage = multer.diskStorage({
    destination: "./upload/",
    filename: function(req, file, cb){
        let num = file.originalname.lastIndexOf(".");
        let re = file.originalname.substring(num);
        let imgname = String(Date.now())+re;
        cb(null, `${imgname}`);
    }
})

// 업로드객체 
upload = multer({
    storage:storage,
    limits: { fieldSize: 1000000 }
})

// upload경로로 포스트 요청이 왔을때 응답
app.post("/upload", upload.single("img"), function(req, res, next){
    res.send({
        imageUrl: req.file.filename
    });
})




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
//테스트
app.post("/aaa",async (req, res)=>{
    console.log(req.body);
    res.send(req.body);
})
//회원가입 요청
app.post("/join", async (req, res)=>{
    let myPlanintextPass = req.body.userpass;
    let myPass = "";
    if(myPlanintextPass != ''  &&  myPlanintextPass != undefined){
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(myPlanintextPass, salt, function(err, hash) {
                // Store hash in your password DB.
                myPass = hash;
                console.log(myPass);
                //쿼리작성
                const {username, userphone, userorg, usermail} = req.body;
                connection.query("insert into customer_members(username, userpass, userphone, userorg,usermail, regdate) values(?,?,?,?,?,DATE_FORMAT(now(),'%Y-%m-%d'))",
                    [username, myPass, userphone, userorg, usermail],
                    (err, result, fields) => {
                        console.log(result)
                        console.log(err)
                        res.send("등록되었습니다.")
                    }
                )
            });
        });
    }
})

// 로그인 요청
app.post('/login', async (req, res) => {
    // usermail값에 일치하는 데이터가 있는지 select문 1234 -> #dfwew2rE
    // userpass 암호화 해서 쿼리 결과의 패스워드랑 일치하는지를 체크
    const { usermail, userpass } = req.body;
    connection.query(`select * from customer_members where usermail = '${usermail}'`,
        (err, rows, fields)=>{
            if(rows != undefined){
                if(rows[0] == undefined){
                    res.send("실패")
                }else {
                    bcrypt.compare(userpass, rows[0].userpass, function(err, result) {
                        // result == true
                        if(result == true){
                            res.send(rows[0])
                        }else {
                            res.send("실패")
                        }
                    });
                }
            }else {
                res.send("실패")
            }
        }
    )
})

//  gallery 포스트 요청시
app.post("/gallery", async (req, res) => {
    const { usermail, title, imgurl, desc } = req.body;
    connection.query("insert into customer_gallery(`title`,`imgurl`,`desc`,`usermail`) values(?,?,?,?)",
    [title, imgurl, desc, usermail] ,
    (err, result, fields)=>{
        res.send("등록되었습니다.")
    })
})
// gallelry 겟 요청시 
app.get("/gallery", async (req, res) => {
    connection.query("select * from customer_gallery",
    (err, result, fields)=>{
        res.send(result)
    })
})


//서버실행
app.listen(port, ()=>{
    console.log("고객 서버가 돌아가고 있습니다.")
})