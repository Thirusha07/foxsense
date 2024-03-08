const express=require('express')
const bodyparser=require('body-parser')
var session =require("express-session")
var cookieparser=require("cookie-parser")
var cors=require('cors')
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
      methods: ["GET", "POST","UPDATE","DELETE"],
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


var employee=require('./routes/employee.js')
app.use('/employee',employee)
var cafeteria=require('./routes/cafeteria.js')
app.use('/cafeteria',cafeteria)
var menu=require('./routes/menu.js')
app.use('/menu',menu)
var order=require('./routes/emporders.js')
app.use('/orders',order)


app.listen(port,()=>{
    console.log(`Server running at ${port}`)
})