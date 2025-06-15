const express=require("express")
const pool = require("../db")
const userRouter=express.Router()
// To Get all users
userRouter.get("/allusers",async(req,res)=>{
    // console.log(req,"res")
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


// To delete user
userRouter.delete("/deleteuser/:id",async(req,res)=>{
    // console.log(req.user,"request")
    const {id}=req.params
   
try{
    if(id){
const data=await pool.query("SELECT * FROM users WHERE id=$1",[id])
if(data?.rows?.length>=1){
   const userdata=data?.rows[0]
   if(userdata?.id==req?.user?.id){
    await pool.query("DELETE FROM users where id=$1",[id])
    const alluserdata=await pool.query("SELECT * FROM users")
    
return res?.status(200).json({status:200,msg:"Deleted Successfully",users:alluserdata?.rows})
   }else{
    return res?.status(401).json({status:401,msg:"You are not allowed to perform this action"})
   }

}else {
    return res?.status(204)?.json({msg:"No Data found",status:204})
}

    }else{
        return res?.status(400).json({status:400,msg:"Please provide the Delete Id",staus:400})
    }

}catch(err){
    return res?.status(200)?.json({msg:"Server Error!!.. please try after some time..",status:500})
}
})

// To update user
userRouter.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, profession_id, country_id } = req.body;

  try {
    if (!id) {
      return res.status(400).json({
        status: 400,
        msg: "Please provide the Update ID",
      });
    }

    const data = await pool.query("SELECT * FROM users WHERE id=$1", [id]);

    if (data?.rows?.length == 0) {
      return res.status(404).json({ status: 404, msg: "No data found" });
    }

    const userdata = data.rows[0];

    if (userdata?.id !== req?.user?.id) {
      return res.status(401).json({
        status: 401,
        msg: "You are not allowed to perform this action",
      });
    }

    // Update user now
    const updated = await pool.query(
      "UPDATE users SET name=$1, country_id=$2, profession_id=$3 WHERE id=$4 RETURNING *",
      [name || userdata.name, country_id || userdata.country_id, profession_id || userdata.profession_id, id]
    );
const updateduserdata=updated.rows[0]
delete updateduserdata["password"]
    return res.status(200).json({
      status: 200,
      msg: "Updated Successfully",
      updatedUser: updateduserdata,
    });
  } catch (err) {
    console.error("Update Error: ", err.message);
    return res.status(500).json({
      msg: "Server Error!!.. please try after some time..",
      status: 500,
    });
  }
});
module.exports=userRouter