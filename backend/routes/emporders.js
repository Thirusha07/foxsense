const express=require('express')
const bodyparser=require('body-parser')

var session =require("express-session")
var cookieparser=require("cookie-parser")
var cors=require('cors')
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
router.post('/placeorder',checkSession,(req,res)=>{
    var bill=0;
    const currentDate = new Date();
    const formattedDateInput = currentDate.toLocaleDateString('en-GB'); 
    const parts = formattedDateInput.split('/');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    console.log(formattedDate)
    const status="pending";
    const sq='SELECT status_id FROM Status WHERE status=?';
    const value=[status];
    con.query(sq,value,(err,result)=>{
        if(err){
            res.json({Error:err})
        }
        else{
            const sql1='SELECT cafeid FROM Cafeteria WHERE name=?';
    const values1=[req.body.cafename];
    con.query(sql1,values1,(err1,result1)=>{
        if(err1){
            res.json({Error:err1})
        }
        else{
            const sql2='SELECT typeid FROM Ordertype WHERE type=?';
            const values2=[req.body.type];
            con.query(sql2,values2,(err2,result2)=>{
                if(err2){
                    res.json({Error:err2})
                }
                else{
                    var location;
                    if(result2[0].typeid==1){
                         location ="dine in";   
                    }
                    else{
                         location=req.body.location;
                    }
                    const sql3='INSERT INTO Orders (userid,cafeid,type_id,status_id,location,date1) VALUES(?,?,?,?,?,?)'
                    const values3=[req.session.user[0].userid,result1[0].cafeid,result2[0].typeid,result[0].status_id,location,formattedDate];
                    con.query(sql3,values3,(err3,results)=>{
                        if(err3){
                            res.json({Error:err3})
                        }
                        else{
                           console.log( results[0]);
                           const sql4='SELECT orderid FROM Orders WHERE userid=? AND cafeid=? AND date1=?';
                           const values4=[req.session.user[0].userid,result1[0].cafeid,formattedDate]
                           con.query(sql4,values4,(err4,result4)=>{
                            if(err4){
                                res.json({Error:err})
                            }
                            else{
                                const sql5='SELECT itemid,price FROM Items WHERE itemname=?';
                                for (const [index, item] of req.body.items.entries()) {
                                   
                                    const quantity = req.body.quantity[index];  
                                    console.log(item,quantity)
                                    con.query(sql5,item,(err5,result5)=>{
                                        if(err5){
                                            res.json({Error:err5})
                                        }
                                        else{
                                            const total=quantity *result5[0].price;
                                            bill=bill+total;
                                            console.log(total)
                                            const sql6='INSERT INTO  Orderitems(orderid,itemid,quantity,total) values(?,?,?,?)';
                                            const values6=[result4[0].orderid,result5[0].itemid,quantity,total]
                                            console.log("values6",values6)
                                            con.query(sql6,values6,(err6)=>{
                                                if(err6){
                                                    res.json({Error:err6})
                                                }
                                                else{
                                                    const sql7='INSERT INTO Bill(orderid,bill) VALUES(?,?)';
                                                    const values7=[result4[0].orderid,bill]
                                                    con.query(sql7,values7,(err7)=>{
                                                        if(err7){
                                                            res.json({Error:err7})
                                                        }
                                                        else{
                                                            res.json({TotalBill:bill})
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })}
                              

                            }
                           })
                        }
                    })
                    
                }
               
            })
        }
    })
    
        }

    })

    
})

router.post('/trackorder',checkSession,(req,res)=>{
    const sql1='SELECT status_id FROM Orders WHERE orderid=?';
    const values1=[req.body.orderid];
    con.query(sql1,values1,(err1,result1)=>{
        if(err1){
            res.json({Error:err1})
        }
        else{
            const sql2='SELECT status FROM Status WHERE statusid=?'
            const values2=[result1[0].status_id];
            con.query(sql2,values2,(err2,result2)=>{
                if(err2){
                    res.json({Error:err2})
                }
                else{
                    res.json({Status:result2})
                }

                
            })
        }
    })

})


module.exports=router;