import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose
.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",
})
.then(()=>console.log("Database Connected"))
.catch((e)=>console.log(e));

const userSchema =new mongoose.Schema({
    name:String,
    email:String,
    password:String,
});

const User= mongoose.model("User",userSchema)

const app = express();

const users=[];

//Using Middlewares
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({ extended:true}));
app.use(cookieParser());

//Setting up View Engine
app.set("view engine","ejs");

const isAuthenticated=async(req,res,next)=>{
    const {token}=req.cookies;

    if(token){
       // res.render("logout");
    const decoded=  jwt.verify(token,"ygygugsgaggssvaig");
     console.log(decoded);
req.user= await User.findById(decoded._id);

       next()
      }
      else{
       res.render("login");
      }
};

app.get("/login",isAuthenticated,(req,res)=>{//
    console.log(req.user);
res.render("logout",{name:req.user.name});
});
app.get("/login",(req,res)=>{
res.render("login");

})
app.get("/",(req,res)=>{
    res.render("index");
    });

app.get("/register",(req,res)=>{
res.render("register");
});

app.get("/index",(req,res)=>{
    res.redirect("/")
    });

app.get("/forgot_password",(req,res)=>{
    res.render("forgot_password");
    });


/*app.get("/",isAuthenticated,(req,res,)=>{
    res.render("logout");
});*/
app.get("/login",(req,res)=>{//

   // console.log(req.cookies.token);

   const {token}=req.cookies;

   if(token){
     res.render("logout");
   }
   else{
    res.render("login");
   }
   // res.render("login.ejs");
   res.redirect("/login")
});

app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    let user=await User.findOne({email});

    if (!user) return res.redirect("/register");

    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch)return res.render("login",{message:"Incorrect Password"});
    const token=jwt.sign({_id:user._id},"ygygugsgaggssvaig");
    // console.log(token);
 
     res.cookie("token",token,{
     httpOnly:true,
     expires:new Date(Date.now()+60*1000)
     });
      res.redirect("/login");//
});
app.post("/register",async(req,res)=>{

    const{name,email,password}=req.body;

      let user= await User.findOne({email});

       if(user){
       return res.redirect("/login");
       }
     const hashedPassword=await bcrypt.hash(password,10);

        user =await User.create({
        name,
        email,
        password:hashedPassword,
    });
    const token=jwt.sign({_id:user._id},"ygygugsgaggssvaig");
   // console.log(token);

    res.cookie("token",token,{
httpOnly:true,expires:new Date(Date.now()+60*1000)
    });
     res.redirect("/login");//
})
/*app.get("/add",(req,res)=>{
 Messge.create({ name:"Manish", email: "manishkumartgo@gmail.com"}).then(() => {
res.send("Nice");
 });   
});
*/

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
httpOnly:true,expires:new Date(Date.now()),
    });
     res.redirect("/login");//
})




app.listen(5000,()=>{
    console.log("Server is working");
});