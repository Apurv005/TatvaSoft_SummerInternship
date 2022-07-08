const express = require("express");
const app = express();
const db = require("./db/conn");
const path = require("path");
const port = process.env.PORT || 3000;
const hbs = require("hbs");
const Register = require("./models/user_registers");
const bcryptjs = require("bcryptjs");
require("jsonwebtoken");
require('dotenv').config();
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const Book = require("./models/add_books");
const { nextTick } = require("process");

const staticPath = path.join(__dirname,"../public");
app.use(express.static(staticPath));

const templatePath = path.join(__dirname,"../templates/views");
app.set("view engine","hbs");
app.set("views",templatePath);


const partialsPath = path.join(__dirname,"../templates/partials");
hbs.registerPartials(partialsPath);

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(cookieParser());

app.get("/",(req,res)=>{
    res.status(200).render("index");
});

app.post("/register", async (req,res)=>{
    try {
        const password = req.body.password;
        const cPassword = req.body.confirmpassword;
        // console.log(password);
        if(password === cPassword){


            const registerUser = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                password : password,
                confirmpassword : cPassword
            });

            //1. Password Hashing..
            // middleware in user_registration.js..
            
            //2. Token For Registration
            // middleware
            const token = await registerUser.generateAuthenticationToken(); 

            const registerResult = await registerUser.save();
            // console.log(registerResult);
            res.status(201).send({  
                "success" : true,
                "message" : "Success | You Can Login.. :)"
            })
        }else{
            res.status(400).send({  
                "success" : false,
                "message" : "Fail | Password are not match.. :)"
            })
        }

    } catch (error) {
        res.status(400).send({
            "success" : false,
            "message" : "Fail | Emial Already Exists.."
        });
    }
});

app.post("/login", async (req,res)=>{
    try {

        const cEmail = req.body.email;
        const cPassword = req.body.password;

        
        const userEmail = await Register.findOne({email : cEmail});
        // console.log(userEmail);
        if(userEmail){
            const passwordMatch = await bcryptjs.compare(cPassword,userEmail.password);
            if(passwordMatch){
                const loginToken = await userEmail.generateAuthenticationToken(); 

                // Add token to client side cookie[in browser]..
                res.cookie("jwt",loginToken,{
                    httpOnly: true,
                });

                res.status(200).send({
                    success : true,
                    message : "Login Successful :)",
                })
            }else{
                res.status(400).send({
                    success: false,
                    message : "Please Enter Valid Credentials"
                })
            }
        }
        else{
            res.status(400).send({
                success: false,
                message : "Please Register First.."
            })
        }
    }catch(e){
            res.status(400).send({
                success: false,
                message : "Something went Wrong..!"
            });
    }
});


app.get("/books", auth , (req,res)=>{
    const {user} = res.locals;
    const bookLists = Book.find({},(err,data)=>{
        if(err){
            res.status(400).render("books",{name : user.firstname, logout: true, bookList : err});
        }
        else{
            console.log("helo");
            res.status(200).render("books",{name : user.firstname, logout: true, bookList : data});
        }
    })
})
// app.get("/*",(req,res,next)=>{
//     res.setHeader('Last-Modified', (new Date()).toUTCString());
//     next();
// })


// app.get("/books:title", (req,res)=>{
    
//     const {user} = res.locals;
//     const titleBook = req.params.title;
//     console.log(titleBook);
//     const arr = [];
//     let count = false;
//     const bookLists = Book.find({},(err,data)=>{
//         for(let i =0; i < data.length ;i++){
//             if(data[i].title.toLowerCase() === titleBook.toLowerCase()){
//                 arr.push(data[i]);
//                 count = true;
//             }
//         }
//         // console.log(arr);
//         if(count == false){
//             res.status(200).render("books.hbs",{logout: true, noData : true});
//         }else{
//             res.set("Content-type",'text/html');
//             console.log(arr.length);
//             res.status(200).render("books",{logout: true, bookList : [1,2,3]});
//             // res.status(200).send({Hello});
//         }
//     })
// });


app.post("/books", async (req,res)=>{
    console.log("In Books");
    try {
        const addBook = new Book({
            title : req.body.title,
            category : req.body.category,
            description : req.body.description,
            price : req.body.price,
        });

        console.log(addBook);
        const addBookRes = await addBook.save();
        console.log(addBookRes);
        res.status(201).send({  
            "success" : true,
            "message" : "Success | Book is saved.. :)"
        })

    } catch (error) {
        res.status(400).send({
            "success" : false,
            "message" : error
        });
    }
})


app.get("/cart",auth,(req,res)=>{
    const {user} = res.locals;
    res.status(200).send("Welcome To Cart..");
});

app.get("/logout",auth,async (req,res)=>{
    const {user} = res.locals;
    try {
        res.clearCookie("jwt");
        // console.log("Logout Successfully");
        await user.save();
        res.status(200).redirect("/");
    } catch (error) {
        res.status(500).send({error});
    }
})

app.listen(port,()=>{
    console.log(`Server started at port ${port}`);
});