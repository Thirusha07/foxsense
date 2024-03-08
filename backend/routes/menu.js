const express=require('express')
const bodyparser=require('body-parser')
var session =require("express-session")
var cookieparser=require("cookie-parser")
var mysql=require('mysql')

const app=express()
app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())
app.use(session({
    key: "user",
    secret: "sample",
    resave: false,
    saveUninitialized: true,
    cookie: { expires: false }
  }))
app.use(cookieparser())



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
router.post('/additems',checkSession,(req,res)=>{
    const sql1='SELECT descriptionid FROM Description WHERE description=?';
    const value1=[req.body.description];
    con.query(sql1,value1,(err1,result1)=>{
        if(err1){
            res.json({Error:err1})
        }
        else{
            const sql2='INSERT INTO Items (itemname,price,description_id) VALUES(?,?,?)';
            const values2=[req.body.name,req.body.price,result1[0].descriptionid]
            con.query(sql2,values2,(err2)=>{
                if(err2){
                    res.json({Error:err2})
                }
                else{
                    res.json({Message:"Item inserted"})
                }
            })
        }
    })
 
})

router.post('/createmenu',checkSession,(req,res)=>{
    const sql1="SELECT daysid  FROM Days WHERE days=?"
    const values1=[req.body.day];
    con.query(sql1,values1,(err1,result1)=>{
        if(err1){
            res.json({Error:err1})
        }
        else{
            const sql2='SELECT itemid FROM Items WHERE itemname=? ';
            for(const items of req.body.itemname)
            {
                con.query(sql2,items,(err2,result2)=>{
                    if(err2){
                        res.json({Error:err2})
                    }
                    else{
                        const sql3='INSERT INTO Menus (cafeid,days_id,item_id) VALUES(?,?,?)';
                        const values3=[req.session.user[0].cafeid,result1[0].daysid,result2[0].itemid]
                        con.query(sql3,values3,(err3)=>{
                            if(err3){
                                res.json({Error1:err3})
                            }
                            else{
                                res.json({Message:"Item inserted"})
                            }
                        })
                    }
                })
            }

        }
    })
   


})
router.get('/vieworders',checkSession,(req,res)=>{
    const currentDate = new Date();
    const formattedDateInput = currentDate.toLocaleDateString('en-GB'); 
    const parts = formattedDateInput.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    console.log(formattedDate)
    const sql1='SELECT * FROM Orders WHERE Cafeid=? AND date1=?';
    const values1=[req.session.user[0].cafeid,formattedDate];
    con.query(sql1,values1,(err1,result1)=>{
        if(err1){
            res.json({Error:err1})
        }
        else{
            res.json({result1})
        }
    })
}) 

router.post('/changeorderstatus',checkSession,(req,res)=>{
    const sql='SELECT status_id FROM Status WHERE status=?';
    const values=[req.body.status];
    con.query(sql,values,(errr,result)=>{
        if(errr){
            res.json({Error:errr})
        }
        else{
            const sql1='UPDATE Orders SET status_id=? WHERE orderid=?';
            const values1=[result[0].statusid,req.body.orderid]
            con.query(sql1,values1,(err1)=>{
                if(err1){
                    res.json({Error:err1})
                }
                else{
                    if(result[0].statusid==4){
                        const sql2='INSERT INTO Notification (orderid,userid,statusid) VALUES(?,?,?)';
                        const values2=[req.body.orderid,req.body.userid,result[0].statusid];
                        con.query(sql2,values2,(err2)=>{
                            if(err2){
                                res.json({Error:err2})
                            }
                            else{
                                res.json({Message:"Order is out for delivery"})
                            }
                        })
                    }
                    else{
                        res.json({Message:"Order status Updated"})
                    }
                  
                }
            })
        }

    })


})
module.exports=router;