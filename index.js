var express = require('express');
var app = express(); // define our app using express
var bodyparser = require('body-parser');
var path = require('path');
var cors = require('cors');
 
require('dotenv').config();
 
const port = process.env.PORT || 3001;
 
const fabric_routes = require('./api/routes/fabric-routes');
 
app.use(cors());
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname,'public')));
 
// app.use(bodyparser.urlencoded({extended:falase})); // URL ENCODED PARSING (we are not using this)
 
// The following lines ensures to avoid the CORS issue.
app.use((req,res,next)=>{
 res.header('Access-Control-Allow-Origin','*');
 res.header("Accept","application/json,text/plain");
 res.header(
 'Access-Control-Allow-Headers',
 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
 );
 if (req.method === 'OPTIONS') {
 res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
 return res.status(200).json({});
 }
 next();
});


 
app.use('/api',fabric_routes);
 
app.listen(port,()=>{
 console.info(`SEFOOD SUPPLYCHAIN APP SERVER started on ${port}`);
 
});
 
module.exports = app;

