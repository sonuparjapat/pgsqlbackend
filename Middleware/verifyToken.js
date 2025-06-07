const jwt = require("jsonwebtoken");
const verifyToken=async(req,res,next)=>{
    const token=req.cookies.token
    // console.log(token,"token from cookeie")
    if(token){
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }else{
        return res.status(401).json({ error: "No token. Unauthorized!" });
    }
}
module.exports=verifyToken