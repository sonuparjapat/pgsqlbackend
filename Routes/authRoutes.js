const express=require("express")
const authRoutes=express.Router()
const bcrypt=require("bcryptjs")
const pool=require("../db.js")
const jwt = require("jsonwebtoken");
const { json } = require("body-parser")
require("dotenv").config()
authRoutes.post("/register",async(req,res)=>{
    const { name, email, phone, password, country_id, profession_id } = req.body;
    const requiredFields = {
        name: "Name",
        email: "Email",
        phone: "Phone",
        password: "Password",
        country_id: "Country",
        profession_id: "Profession"
      };
      const errors={}
    for (let key in requiredFields){
       if(!req.body[key]){
        errors[key]=`${requiredFields[key]} is Required`
       }
    }
    if(Object.keys(errors)?.length>=1){
        return res.status(406).json({status:406,errors})
    }

    // validating email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }
  
    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number." });
    }

    try{
// check if already exists

const existing=await pool.query("SELECT name FROM users WHERE email=$1 OR phone =$2",[email,phone])

if(existing?.rows?.length>0){
    return res.status(403).json({msg:"This user is Already exists with provided email id or phone number",status:403})
}
    // console.log("NOt exists")
     // Hash the password
     const saltRounds = 10;
     const hashedPassword = await bcrypt.hash(password, saltRounds);
     await pool.query("INSERT INTO users   (name, email, phone, password, country_id, profession_id) VALUES ($1,$2,$3,$4,$5,$6)",[name, email, phone, hashedPassword, country_id, profession_id])
    return res.status(201).json({msg:"User Registered Successfully",status:201})

    }catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error. Please try again." });
      }
})
authRoutes.post("/login",async(req,res)=>{
    // console.log(process.env.JWT_SECRET)

    const {email,password}=req.body
    // Check if email & password provided
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    try{
const userdata=await pool.query("SELECT * FROM users WHERE email=$1",[email])
// console.log(userdata,"userdata")
if(userdata?.rows?.length>0){
    const match = await bcrypt.compare(password, userdata?.rows[0].password);
const user=userdata?.rows[0]
    if(match) {
        // Create JWT token
        // console.log("hello")
        const token = jwt.sign(
        user,
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
       
       return res
        .cookie("token", token, {
          httpOnly: true,        // can't access in JS
          secure: false,          // send over HTTPS only (set to false for localhost)
          sameSite: "strict",    // restrict cross-site
          maxAge: 3600000        // 1 hour in milliseconds
        })
        .status(200)
        .json({
          success: true,
          message: "Login successful",
          userdata:{  name:user.name,
            email:user.email,
            phone:user.phone,
          
            country_id:user.country_id,
            profession_id: user.profession_id}
        });
    }else{
        return res?.status(400).json({status:400,msg:"Password Mismatch"})
    }
}else{
    return res.status(204).json({status:204,msg:"User Doesn't Exists"})
}
    }catch(err){
        return res.status(500).json({status:500,msg:"Server error.please try again"})
    }
})
authRoutes.post("/logout",async(req,res)=>{
    res.clearCookie("token").status(200).json({ message: "Logged out",status:200 });
})
module.exports=authRoutes