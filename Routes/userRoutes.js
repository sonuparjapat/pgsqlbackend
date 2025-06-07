const express=require("express")
const pool = require("../db")
const userRouter=express.Router()
userRouter.get("/allusers",async(req,res)=>{
    console.log(req,"res")
    try{
const userdata=await pool.query("SELECT name,email,phone,country_id,profession_id,created_at FROM users")
if(userdata?.rows?.length>=1){
    return res?.status(200).json({status:200,data:userdata?.rows})
}else{
    return res?.status(204).json({status:204,data:[]})
}
    }catch(err){
        return res?.status(500).json({msg:"Server error!..,please try after some time",status:500})
    }
})
module.exports=userRouter