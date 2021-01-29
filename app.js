require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");
const app = express();
const userSchema = new mongoose.Schema({
  email:String,
  password:String
});

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(session({  ///1.
  secret: 'miku39!',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));
app.use(passport.initialize());///2.
app.use(passport.session());///3.
userSchema.plugin(passportLocalMongoose);///4.
const User = new mongoose.model("user",userSchema);
passport.use(User.createStrategy());///5.
passport.serializeUser(User.serializeUser());///5.
passport.deserializeUser(User.deserializeUser());///5.

mongoose.connect("mongodb://localhost:27017/userDB",{ useNewUrlParser: true,useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);///6. out of warning

////////////////////////////////////////////Requests//////////////////////////////////
app.get("/",function(req,res){
  res.render("home");
});
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/register",function(req,res){
  res.render("register");
});
app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});
////////////////////////////////////////////Response//////////////////////////////////
app.post("/register",function(req,res){
  User.register({username:req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});
app.post("/login",function(req,res){
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user,function(err){
    if(!err){
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }else{
      console.log(err);
    }
  });
});
app.listen(3939,function(){
  console.log("Secret is online");
});
