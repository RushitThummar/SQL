const { faker } = require('@faker-js/faker');
// Get the client
const mysql = require('mysql2');
const express=require("express");
const apl=express();
const port=8080;
const path=require("path");
const methodOverride=require("method-override");
const { v4: uuidv4 } = require("uuid");
const { inherits } = require('util');

apl.use(methodOverride("_method"));
//write for pass user data to patch
apl.use(express.urlencoded({extended:true}));

apl.set("view engine","ejs");
apl.set("views",path.join(__dirname,"/views"));

// Create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'app',
  password:'sqlRushit11@'
});

//make random fake data
let getRandomUser = () => {
  return[
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
}

//home route
apl.get("/",(req,res)=>{
  let qu=`SELECT count(*) FROM user`;
  try{
    connection.query(qu,(err,result)=>{
        if(err) throw err;
        let count=result[0]["count(*)"];
        res.render("home.ejs",{count});
    });
  }catch(err){
    console.log(err);
    res.send("some erroe in DB");
  };
});
//when res.(send) connection automatic cut so we not need to write connection.end()

//show user rout
apl.get("/user",(req,res)=>{
  //it can show data in row formate
  let qu=`SELECT * FROM user`;
  try{
    connection.query(qu,(err,users)=>{
        if(err) throw err;
        res.render("showusers.ejs",{users});
    });
  }catch(err){
    console.log(err);
    res.send("some erroe in DB");
  };
});

//Edit rout
apl.get("/user/:id/edit",(req,res)=>{
  let {id} =req.params;
  let qu=`SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(qu,(err,result)=>{
        if(err) throw err;
        let user=result[0];
        res.render("edit.ejs",{user});
        //get pswd from mysql 'SELECT * FROM user WHERE email="your_emailid"'
        
    });
  }catch(err){
    console.log(err);
    res.send("some erroe in DB");
  };
});

//Update (DB) route
apl.patch("/user/:id",(req,res)=>{
  let {id} =req.params;
  //this data is come from edited form
  let {password: formPass, username: newUsername}=req.body;
  let qu=`SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(qu,(err,result)=>{
        if(err) throw err;
        let user=result[0];
        if(formPass != user.password){
        res.send("Wrong Password!.....Please try again");
        }else{
          let qu2=`UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
          connection.query(qu2,(err,result)=>{
            if(err) throw err;
            res.redirect("/user");
          })
        }
        //get pswd from mysql 'SELECT * FROM user WHERE email="your_emailid"'
    });
  }catch(err){
    console.log(err);
    res.send("some erroe in DB");
  };
});

//rendder new rout
apl.get("/user/new",(req,res)=>{
  res.render("new.ejs");
});

//route new user form
apl.post("/user/new",(req,res)=>{
  let {username, email, password}=req.body;
  let id=uuidv4();
  //query to insert new user
  let qu=`INSERT INTO user(id,username,email,password) VALUES ('${id}','${username}','${email}','${password}') `;
  try{
      connection.query(qu,(err,result)=>{
          if(err) throw err;
          console.log("new user was added");
          res.redirect("/user");
      });
    }catch(err){
      console.log(err);
    };
    
});

//rout delete form
apl.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let qu = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(qu, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

//delete user data
apl.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let qu = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(qu, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let qu2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(qu2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

apl.listen(port,()=>{
  console.log("server is listening on port 8080");
});

//----------------------------------------------------------------------------------------------------
// //for insert data inside user table
// let qu="INSERT INTO user (id,username,email,password) VALUES ?";
// let data=[];
// for(let i=1;i<=100;i++){
//   data.push(getRandomUser());//100 fake user
// };

// try{
//   connection.query(qu,[data],(err,result)=>{
//       if(err) throw err;
//       console.log(result);
//   });
// }catch(err){
//   console.log(err);
// };

// connection.end();
//-----------------------------------
// before run-->>
// $npm init //add author name
// $npm i ejs
// $npm i mysql2
// $npm i @faker-js/faker
// $npm i express
// $npm i uuid
// $npm i method-override
