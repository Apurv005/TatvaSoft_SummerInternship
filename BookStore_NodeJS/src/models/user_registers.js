const mongooes = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();


const userSchema = new mongooes.Schema({
    firstname: {
        type: String,
        required : true
    },
    lastname: {
        type: String,
        required : true
    },
    email: {
        type: String,
        required : true,
        unique: true
    },
    password: {
        type: String,
        required : true
    },
    confirmpassword: {
        type: String,
        required : true
    },
    tokens:[
        {
            token:{
                type : String,
                required : true
            }
        }
    ]
});
// console.log(process.env.SECRET_KEY);
// User Authentication Token..
userSchema.methods.generateAuthenticationToken = async function(res,req){
    try {
        const token = jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;

    } catch (error) {
        // return error;
        res.status(400).send({
            success : false,
            message : "Token Generation Failed"
        })
    }
}



userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcryptjs.hash(this.password,10);
        this.confirmpassword = await bcryptjs.hash(this.password,10);
    }
    next();
});

const Register = new mongooes.model("Register",userSchema);
module.exports = Register;