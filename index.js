const express=require("express")
const cors=require("cors")
const body_parser=require("body-parser")
const authRoutes = require("./Routes/authRoutes")
const cookieParser = require("cookie-parser");
const verifyToken = require("./Middleware/verifyToken");
const userRouter = require("./Routes/userRoutes");
require("dotenv").config()
const app=express()

app.use(cookieParser());
app.use(body_parser.json())
app.get("/",async(req,res)=>{
    try{
       return res?.status(200).json({msg:"Welcome To Backend",status:200})
    }catch(err){
        return res?.status(500)?.json({msg:"Server Error!!. please try after some time..."})
    }
})
// authentication route
app.use("/auth",authRoutes)

// userroute
app.use("/user",verifyToken,userRouter)
app.listen(8000,()=>{
    console.log(`port is running on ${process.env.PORT_NAME} `)
})
