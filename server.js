/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
Modified: Nima Sherpa
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();


router.route('/signup')
    .post(function(req, res)
    {
    if (!req.body.username || !req.body.password)
    {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    }
    else
    {
        var newUser = {username: req.body.username, password: req.body.password};
        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'})
    }
    })
    // All other methods should return error (e.g. GET, PUT, DELETE, PATCH) will return not supporting message
    .all(function(req, res)
    {
        res.status(401).send("Request HTTP method not supported in Signup.");
    });

router.route('/signin')
    .post(function (req, res)
    {
    var user = db.findOne(req.body.username);
    if (!user) {res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});}
    else
    {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {res.status(401).send({success: false, msg: 'Authentication failed.'});}
    }
    })
    // All other methods should return error (e.g. GET, PUT, DELETE, PATCH) will return not supporting message
    .all(function(req, res)
    {
        res.status(401).send("Request HTTP method not supported in Signin.");
    });

// function for the HTTP method request for the movies
// this function has parameters request HTTP method and a respective reference number of each assigned method
// GET METHOD reference_num = 1,
// POST METHOD reference_num = 2,
// PUT METHOD reference_num = 3,
// DELETE METHOD reference_num = 4.
// if a function call with reference_num == 1 is called, then it prints GET's assigned output message i.e., "GET movies".
// Similarly with assigned reference_num of 4 given method, it'll print its respective message in the BODY.
function requestJSONObjectForMovieRequirement(req,reference_num)
{
    let req_message;
    if(reference_num ==1){req_message = "GET movies"}
    else if(reference_num == 2) {req_message = "movie saved"}
    else if(reference_num == 3) {req_message = "movie updated"}
    else {req_message = "movie deleted"}
    var json = {
        status:200,
        message:req_message,
        headers:req.headers,
        env:process.env.UNIQUE_KEY
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}
// working for the /movies task of the assignment
router.route('/movies')
    .get(function(req, res)              // GET HTTP Method
        {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
        var o = requestJSONObjectForMovieRequirement(req,1);      // calling the requestJSON... function with reference_num
        res.json(o);
    }
    )
    .post(function(req, res)          // POST HTTP Method
        {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var x = requestJSONObjectForMovieRequirement(req,2);    // calling the requestJSON... function with reference_num
            res.json(x);
        }
    )
    // PUT should require authentication (JWT Auth)
    .put(authJwtController.isAuthenticated, function(req, res)          // PUT HTTP Method
        {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var z = requestJSONObjectForMovieRequirement(req,3);    // calling the requestJSON... function with reference_num
            res.json(z);
        }
    )
    // Delete should require authentication (Basic Auth)
    .delete(authController.isAuthenticated, function(req, res)          // DELETE HTTP Method
        {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var y = requestJSONObjectForMovieRequirement(req,4);   // calling the requestJSON... function with reference_num
            res.json(y);
        }
    )
    // All other methods should return error (e.g. PATCH) not supported
    .all(function (req, res) {
            console.log(req.body);
            res = res.status(403);
            res.send("Request HTTP method not supported.");
        }
    );

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only
