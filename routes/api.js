const express = require("express");
var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require("../models/users");
const Admin = require("../models/admin");

const bcrypt = require('bcrypt');


const mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId;

const db =
  "mongodb+srv://DallahDev:Mahrifa13@cluster0.whqmr.mongodb.net/mindSet_db?retryWrites=true&w=majority";

mongoose.connect(
  db,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    //Connection dans mongoodb
    if (err) {
      console.error("error!" + err);
    } else {
      console.log("Connection successfully");
    }
  }
);

router.get("/", (req, res) => {
  res.send("Response from API");
});

//---------------Génération de mot de pass automatique----------------
const randomFunc = {
	lower: getRandomLower,
	upper: getRandomUpper,
	number: getRandomNumber,
	symbol: getRandomSymbol
}
const length = 6;
	const hasLower = true;
	const hasUpper = true;
	const hasNumber = true;
	const hasSymbol = true;

  function generatePassword(lower, upper, number, symbol, length) {
    let generatedPassword = '';
      const typesCount = lower + upper + number + symbol;
    const typesArr = [{lower}, {upper}, {number}, {symbol}].filter(item => Object.values(item)[0]);
    
    // create a loop
    for(let i=0; i<length; i+=typesCount) {
      typesArr.forEach(type => {
        const funcName = Object.keys(type)[0];
              //console.log(funcName)
        generatedPassword += randomFunc[funcName]();
      });
    }
    
    const finalPassword = generatedPassword.slice(0, length);
    
    return finalPassword;
  }
  
  function getRandomLower() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  }
  
  function getRandomUpper() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  }
  
  function getRandomNumber() {
    return +String.fromCharCode(Math.floor(Math.random() * 10) + 48);
  }
  
  function getRandomSymbol() {
    const symbols = '!@#$'
    return symbols[Math.floor(Math.random() * symbols.length)];
  }
//----------------fin-------------------------

//-----------------Création de compte----------------------
router.post("/register", (req, res) => {
  var pwd = generatePassword(hasLower, hasUpper, hasNumber, hasSymbol, length);

  // Insertion des données dans la base de donnée
  let userData = req.body;
  const saltRounds = 10;

  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(pwd, salt);
  userData.password = hash;

  User.findOne({ email: userData.email }, (error, user) => {
    if (error) {
      console.log(error);
    } else {
      if (user) {
        res.status(401).send("Address mail invalide");
      } else {
        if(userData.profil == "Administrateur"){
          let admin = new Admin(userData);
              admin.save((error, registredUser) => {
                if (error) {
                  console.log("error");
                } else {
                  sendMail(userData.email, pwd);
                  let newPwd = userData.password;
                  let payload = {subject: registredUser._id}
                  let token = jwt.sign(payload, 'mindSet')
                  res.status(200).send({token,newPwd});
                }
              });
        }else{
          let user = new User(userData);
          user.save((error, registredUser) => {
            if (error) {
              console.log("error");
            } else {
              sendMail(userData.email, pwd);
              let payload = {subject: registredUser._id}
              let token = jwt.sign(payload, 'mindSet')
              let newPwd = userData.password;
              res.status(200).send({token,newPwd});
            }
          });
        }
      }
    }
  });
});

//----------Connexion avec un compte-----------------
router.post("/login", (req, res) => {
  let userData = req.body;

  User.findOne({ email: userData.email }, (error, user) => {
    if (error) {
      console.log(error);
    } else {
      if (!user) {
        Admin.findOne({ email: userData.email }, (error, admin) => {
          if (error) {
            console.log(error);
          } else {
            if (!admin) {
              res.status(401).send("Adress mail invalide");
            } else {
              if (!bcrypt.compareSync(userData.password, admin.password)) {
                res.status(401).send("Mot de pass invalide");
              } else {
                let payload = {subject: admin._id}
                let profil = admin.profil;
                let token = jwt.sign(payload, 'mindSet')
                res.status(200).send({token,profil});
              }
            }
          }
        });
      } else {
        if (!bcrypt.compareSync(userData.password, user.password)) {
          res.status(401).send("Mot de pass invalide");
        } else {
          let payload = {subject: user._id}
          let profil = user.profil;
          let token = jwt.sign(payload, 'mindSet')
          res.status(200).send({token,profil});
        }
      }
    }
  });
});

//----------Recupération de mot de passe---------------
router.post("/forgetPwd", (req, res) => {
  let userData = req.body;
  var pwd = generatePassword(hasLower, hasUpper, hasNumber, hasSymbol, length);
  
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(pwd, salt);

  User.findOne({ email: userData.email }, (error, user) => {
    if (error) {
      console.log(error);
    } else {
      if (!user) {
        Admin.findOne({ email: userData.email }, (error, admin) => {
          if (error) {
            console.log(error);
          } else {
            if (!admin) {
              res.status(401).send("Adress mail invalide");
            } else {
              sendMail(userData.email, pwd);
              Admin.updateOne({ email: admin.email }, { $set: {password: hash} }, function(err, result) {
                if (err) throw err;
                console.log("Votre mot de passe vous a été nvoyé")
                res.status(200).send(result);
              });
            }
          }
        });
      } else {
        sendMail(userData.email, pwd);
        User.updateOne({ email: user.email }, { $set: {password: hash} }, function(err, result) {
          if (err) throw err;
          console.log("Votre mot de passe vous a été nvoyé")
          res.status(200).send(result);
        });
        
      }
    }
  });
});

//-----------------Modifier Un utilisateur----------------
router.put("/Update/:id", (req, res)=>{
  let userData = req.body;
  let myquery = userData._id
  var newvalues = { $set: {nom: userData.nom, prenom: userData.prenom, email: userData.email, profil: userData.profil} };
  User.updateOne(myquery, newvalues, function(err, result) {
    if (err) throw err;
    console.log("1 document updated");
    res.status(200).send(result);
  });
})

//------------Supprimer un utilisateur--------------------
// router.post("/delete", (req, res)=>{
//   let userData = req.body;
//   var myquery = { id: userData._id };
//   User.deleteOne(myquery, function(err, result) {
//     if (err) throw err;
//     console.log("1 document deleted");
//     res.status(200).send(result);
//   });
// })
router.delete('/:id', (req, res) => {
  if (!ObjectId.isValid(req.params.id))
      return res.status(400).send(`No record with given id : ${req.params.id}`);

  User.findByIdAndRemove(req.params.id, (err, doc) => {
      if (!err) { res.send(doc); }
      else { console.log('Error in User Delete :' + JSON.stringify(err, undefined, 2)); }
  });
});

//-------------Afficher Tout les Utilisateurs------------------
router.get("/allUser", (req, res)=>{
  User.find((error, result) => {
    if (error) throw err;
    res.status(200).send(result);
  });
})

//*********La fonction d'envoie de mail***********
sendMail=(mail,pwd)=>{
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dallahconf123@gmail.com',
      pass: 'Mahrifa 13'
    }
  });
  
  var mailOptions = {
    from: 'dallahconf123@gmail.com',
    to: mail,
    subject: 'Création de compte',
    text: `Votre mot de passe:${pwd}`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = router;
