'use strict';

const express = require('express');
const http = require('http');
const querystring = require('querystring');
const zlib = require("zlib");
const request = require('request');
const bodyParser = require("body-parser");


const PORT = 3001;
const HOST = '0.0.0.0';

const app = express();

const authApiUrl = process.env.AUTH_URL;
const directoryUrl = process.env.DIRECTORY_URL;

app.use(bodyParser.json());


const getUserFromAuth = token => {
    console.log("access token = " + token.access_token);
    return new Promise((resolve, reject) => {
        request.get({
                headers: {
                    'content-type' : 'application/json',
                    "Authorization" : "Bearer " + token.access_token
                },
                url: authApiUrl + "/users/me"},
            function(err, response, body){
                resolve(JSON.parse(body));
            })
    });
};

const singInAuth = creadentials => {
    return new Promise((resolve, reject) => {
        request.post({
                headers: { 'content-type' : 'application/json'},
                url: authApiUrl + "/oauth/sign_in",
                body: JSON.stringify(creadentials) },
            function(err, response, body){
                resolve(JSON.parse(body));
            });
    });
};

const getAllocationsForOperation = operation_id => {
    return new Promise((resolve, reject) => {
        request.get({
                headers: { 'content-type' : 'application/json'},
                url: directoryUrl + "/allocations?operation_id=" + operation_id},
            function(err, response, body){
                resolve(JSON.parse(body));
            });
    });
};

const getDevice = device_id => {
    return new Promise((resolve, reject) => {
        request.get({
                headers: { 'content-type' : 'application/json'},
                url: directoryUrl + "/devices/" + device_id},
            function(err, response, body){
                resolve(JSON.parse(body));
            });
    });
};

const prepareData = async (user) => {
    return Promise.all(user.operation_ids.map(async (operation_id) => {
        let allocations = await getAllocationsForOperation(operation_id);
        let devices = await Promise.all(allocations.map((allocation) => { return getDevice(allocation.device_id);}));
        return {"operation_id": operation_id, "devices": devices};
    }));
};

app.post('/login', async (req, res) => {

    try {
        let token = await singInAuth(req.body);
        let user = await getUserFromAuth(token);
        let data = await prepareData(user);

        delete user.operation_ids;

        res.send({"token": token, "user": user, "data": data});
    } catch (err) {
        res.status(401).json({
            errorType: 'No access',
            errorMessage: 'Invalid email or password'
        });
    }
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}


if (process.env.NODE_ENV === 'development') {
    const args = ["start"];
    const opts = { stdio: "inherit", cwd: "client", shell: true };
    require("child_process").spawn("npm", args, opts);
}

async function startServer() {
    app.get("/*", async (req, res) => {
        res.send("Hello world");
    });

    app.listen(3001, () => {
        console.log("listening on port 3001");
    });
}

startServer();


