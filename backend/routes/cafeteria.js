const express=require('express')
const bodyparser=require('body-parser')
const bcrypt = require("bcrypt")
var session =require("express-session")
var cors=require('cors')
var cookieparser=require("cookie-parser")
var mysql=require('mysql')
port=8000
const app=express()
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())
const saltRounds=10
app.use(session({
    key: "user",
    secret: "sample",
    resave: false,
    saveUninitialized: true,
    cookie: { expires: false }
  }))
app.use(cookieparser())

app.use(
    cors({
      origin: '*',
      methods: ["GET", "POST"],
      credentials: true
    })
  );



var con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Samaya#9421",
    database:"cafeteria"

})
con.connect();

var router=express.Router();

router.post('/signup',(req,res)=>{
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const sql='Insert into Cafeteria (cafeid,name,password,location) values (?,?,?,?)';
        const values=[req.body.cafeid,req.body.name,hash,req.body.location];
        console.log(values)
        if(err){
            res.json({Error:err})
        }
        else{
            con.query(sql,values,(err,results)=>{
                if(err){
                    res.json({Error1:err})
                }
                console.log("cafeteria is created",results)
    
                res.json("cafeteria successfully created")
            })
        }

    
      });
  
 


})

router.post('/signin',(req,res)=>{
const sql='select * from Cafeteria where cafeid=(?)'
const values=[req.body.cafeid]
con.query(sql,values,(err,results)=>{
    if(err){
        res.json({Error:err})
    }
    else{
        console.log(results)
        if(results.length==0){
            res.json("Invalid user")
        }
        else{
            console.log(results[0].password)
            bcrypt.compare(req.body.password,results[0].password,(err1,result)=>{
                if(err1){
                    res.json({Error:err1})
                }
                else{
                    console.log(result)
                    if(result==true){
                            req.session.user=results
                            res.json("login succesful")
                            console.log(req.session)
                    }
                    else{
                        res.json("Invalid password")
                    }
                }
               
            })
        }
    }
 
       
})
})

module.exports = router;
