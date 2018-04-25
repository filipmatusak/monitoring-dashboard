"use strict";

import { saveRefreshToken, removeRefreshToken, getRefreshToken } from "./server/util/cache";
import jwt from "./server/util/jwt";

const express = require("express");
const http = require("http");
const querystring = require("querystring");
const zlib = require("zlib");
const request = require("request");
const bodyParser = require("body-parser");

const PORT = 3001;
const HOST = "0.0.0.0";

const app = express();

const authApiUrl = process.env.AUTH_URL;
const directoryUrl = process.env.DIRECTORY_URL;
const oauthPublicKey = process.env.OAUTH_PUBLIC_KEY;

app.use(bodyParser.json());

const getUserFromAuth = access_token => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        headers: {
          "content-type": "application/json",
          'Authorization': "Bearer " + access_token
        },
        url: authApiUrl + "/users/me"
      },
      function(err, response, body) {
        resolve(JSON.parse(body));
      }
    );
  });
};

const refreshAccessToken = refresh_token => {
  return new Promise((resolve, reject) => {
    request.post(
      {
        headers: {
          "content-type": "application/json"
        },
        url: authApiUrl + "/oauth/token"
      },{
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      },
      function(err, response, body) {
        resolve(JSON.parse(body));
      }
    );
  });
};

const singInAuth = creadentials => {
  return new Promise((resolve, reject) => {
    request.post(
      {
        headers: { "content-type": "application/json" },
        url: authApiUrl + "/oauth/sign_in",
        body: JSON.stringify(creadentials)
      },
      function(err, response, body) {
        resolve(JSON.parse(body));
      }
    );
  });
};

const getAllocationsForOperation = operation_id => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        headers: { "content-type": "application/json" },
        url: directoryUrl + "/allocations?operation_id=" + operation_id
      },
      function(err, response, body) {
        resolve(JSON.parse(body));
      }
    );
  });
};

const getDevice = device_id => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        headers: { "content-type": "application/json" },
        url: directoryUrl + "/devices/" + device_id
      },
      function(err, response, body) {
        resolve(JSON.parse(body));
      }
    );
  });
};

const prepareData = async user => {
  return Promise.all(
    user.operation_ids.map(async operation_id => {
      let allocations = await getAllocationsForOperation(operation_id);
      let devices = await Promise.all(
        allocations.map(allocation => {
          return getDevice(allocation.device_id);
        })
      );
      return { operation_id: operation_id, devices: devices };
    })
  );
};

const sendNoAccess = res => {
  res.status(401).json({
    errorType: "No access",
    errorMessage: "Invalid email or password"
  });
}

app.get("/data", async (req, res) => {
  const authHeader = req.get("authorization");
  if (!authHeader || authHeader.length < 20){ 
    console.log("without header");
    sendNoAccess(res);
  } else {
    const token = authHeader.split(" ")[1];  
    console.log("token from header = " + token + " " + authHeader + " " + authHeader.length);
    let user = await getUserFromAuth(token);
    console.log("user = " + JSON.stringify(user));
    if(user.error) {
      // try refresh token
      const refreshToken = getRefreshToken(token);
      console.log("from cache = " + refreshToken);
      if (refreshToken === null || refreshToken === undefined) { 
        console.log("without refresh token");
        sendNoAccess(res);
      }
      else {
        console.log("refresh token = " + refreshToken);
        let freshToken = await refreshAccessToken(refreshToken);
        saveRefreshToken(freshToken);
        user = await getUserFromAuth(freshToken);
        let data = await prepareData(user);
        console.log("user = " + JSON.stringify(user));
        //console.log("token = " + JSON.stringify(freshToken));
        res.send(data); 
      }
    } else {
      let data = await prepareData(user);
      console.log("user = " + JSON.stringify(user));
     //console.log("token = " + JSON.stringify(token));
      res.send(data); 
    }
  }
});

app.post("/login", async (req, res) => {
  try {
    let token = await singInAuth(req.body);
    
    saveRefreshToken(token);
    console.log("refresh token = " + token.refresh_token);

    res.send({ token: token.access_token });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      errorType: "No access",
      errorMessage: "Invalid email or password"
    });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

if (process.env.NODE_ENV === "development") {
  const args = ["start"];
  const opts = { stdio: null, cwd: "client", shell: true };
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
