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
const checkSession = (req, res, next) => {
    // Check if session exists
    if (req.session && req.session.user) {
        // Session exists, continue to the next middleware/route handler
        next();
    } else {
        // Session doesn't exist, or user is not logged in
        res.status(401).json({ message: "Unauthorized" });
    }
};

router.post('/signup',(req,res)=>{
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if(err){
            res.json({Error:err})
        }
        else{
            const sql='Insert into Employee (userid,username,password) values (?,?,?)';
            const values=[req.body.userid,req.body.username,hash];
            console.log(values)
            con.query(sql,values,(err,results)=>{
                if(err){
                    res.json({Error:err})
                }
                console.log("user is created",results)
    
                res.json("user successfully created")
            })
        }
      
    
      });
  
 


})

router.post('/signin',(req,res)=>{
const sql='select * from Employee where userid=(?)'
const values=[req.body.userid]
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
router.post('/giveattendence',checkSession,(req,res)=>{
    const currentDate = new Date();
const formattedDateInput = currentDate.toLocaleDateString('en-GB'); 
const parts = formattedDateInput.split('/');
const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
console.log(formattedDate)
const sql1='SELECT type_id,cafeid FROM Orders WHERE orderid=? ';
const values1=[req.body.orderid];
con.query(sql1,values1,(err1,result1)=>{
    if(err1){
        res.json({Error:err1})
    }
    else{
        console.log(result1[0].type_id)
        if(result1[0].type_id==1){
            const sql='INSERT INTO Attendance (cafeid,userid,date1) VALUES(?,?,?)';
            const values=[result1[0].cafeid,req.session.user[0].userid,formattedDate];
            con.query(sql,values,(err)=>{
                if(err){
                    res.json({Error:err})
                }
                else{
                    res.json({Message:"Attendance updated"})
                }
            })
        }
        else{
            res.json({Message:"U can't update ur attendance for take away"})
        }
    }
})


})
router.get('/notifications',checkSession,(req,res)=>{
    const sql='SELECT * FROM Notifications WHERE userid=?';
    const value=[req.session.user[0].userid];
    con.query(sql,value,(err,result)=>{
        if(err){
            res.json({Error:err})
        }
        else{
            res.json({Message:result})
        }
    })
})
router.post('/description',checkSession,(req,res)=>{
    const sql1='select descriptionid from Description where description=?';
    const values1=[req.body.description];
    con.query(sql1,values1,(err1,res1)=>{
        if(err1){
            res.json({Error:err1})
        }
        else{
            const sql='Select itemname from Items where descriptionid=?';
            const values=[res1[0].descriptionid]
            con.query(sql,values,(err2,res2)=>{
                if(err2){
                    res.json({Error:err2})
                }
                else{
                    res.json({Message:res2})
                }
            })
        }
    })

})

module.exports = router;
