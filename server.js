const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const PORT = 3000;

const api = require('./routes/api')

const app = express(); //Créer un instance d'express
app.use(cors());

app.set('view engine', 'ejs')

app.use(bodyParser.json()) // On utilise body-parser pour manipuler les données json

app.use('/api', api)

app.get('/', (req, res)=>{
    res.send('Hello world form server')
})

app.get('/googleLogin', (req,res)=>{
    res.render('login')
})
app.get('/loginTrait', (req,res)=>{
    console.log(window.mail)
})
app.listen(PORT, (req, res)=>{
    console.log('server is listening on Port' + PORT)
})
