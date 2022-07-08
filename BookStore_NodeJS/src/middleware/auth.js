const jwt = require("jsonwebtoken");
const Register = require("../models/user_registers");

const auth = async (req,res,next) =>{
    try {
        const tokenCookie = req.cookies.jwt;
        const vertifyUser = jwt.verify(tokenCookie,process.env.SECRET_KEY);
        // console.log(vertifyUser);
        const user = await Register.findOne({_id:vertifyUser._id});
        res.locals.user = user;
        req.token = tokenCookie;
        next();
    } catch (error) {
        res.status(401).render("error");
    }
}

module.exports = auth;