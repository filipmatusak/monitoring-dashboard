"use strict";

import {
  saveRefreshToken,
  removeRefreshToken,
  getRefreshToken
} from "./server/util/cache";
import jwt from "./server/util/jwt";

const express = require("express");
const http = require("http");
const querystring = require("querystring");
const zlib = require("zlib");
const request = require("request");
const bodyParser = require("body-parser");
const groupArray = require("group-array");

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
          Authorization: "Bearer " + access_token
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
  console.log("refresh_token in f");
  console.log(refresh_token);
  console.log(authApiUrl + "/oauth/token");
  return new Promise((resolve, reject) => {
    request.post(
      {
        headers: {
          "content-type": "application/json"
        },
        url: authApiUrl + "/oauth/token",
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: refresh_token
        })
      },
      function(err, response, body) {
        console.log(err);
        console.log(body);
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
        // take only active allocations
        resolve(JSON.parse(body).filter(b => !b.end_datetime));
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

const getOperation = operation_id => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        headers: { "content-type": "application/json" },
        url: directoryUrl + "/operations/" + operation_id
      },
      function(err, response, body) {
        resolve(JSON.parse(body));
      }
    );
  });
};

const getOrganization = organization_id => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        headers: { "content-type": "application/json" },
        url: directoryUrl + "/organizations/" + organization_id
      },
      function(err, response, body) {
        resolve(JSON.parse(body));
      }
    );
  });
};

const getOutages = operation_id => {
  const d = new Date();
  const time = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  return new Promise((resolve, reject) => {
    request.get(
      {
        headers: { "content-type": "application/json" },
        url:
          directoryUrl +
          "/outages?operation_id=" +
          operation_id +
          "&start=" +
          time +
          "&end=" +
          time
      },
      function(err, response, body) {
        resolve(JSON.parse(body));
      }
    );
  });
};

const prepareData = async user => {
  const operations = await Promise.all(
    user.operation_ids.slice(1, 50).map(async operation_id => {
      const operation = await getOperation(operation_id);
      const outages = await getOutages(operation_id);
      const allocations = await getAllocationsForOperation(operation_id);
      const devices = (await Promise.all(
        allocations.map(allocation => {
          return getDevice(allocation.device_id);
        })
      ))
        .filter(d => d.active === true)
        .map(d => {
          d.outages = outages.filter(o => o.device_id === d._id);
          d.isSuspicious = d.outages.some(o => o.severity === "suspicious");
          d.isOutage = d.outages.some(o => o.severity === "outage");
          return d;
        });

      operation.outages = outages;
      operation.outagesCount = outages.filter(
        o => o.severity === "outage"
      ).length;
      operation.suspiciousCount = outages.filter(
        o => o.severity === "suspicious"
      ).length;
      operation.modules = Array.from(new Set(outages.flatMap(o => o.modules)));
      return {
        operation: operation,
        devices: devices
      };
    })
  );

  let grouped = groupArray(operations, "operation.organization_id");

  let data = await Promise.all(
    Object.values(grouped).map(async group => {
      const organization = await getOrganization(
        group[0].operation.organization_id
      );
      organization.operationsCount = group.length;
      organization.okOperations = group.filter(
        op =>
          op.operation.outagesCount === 0 && op.operation.suspiciousCount === 0
      ).length;
      organization.operationsWithOutages = group.filter(
        op => op.operation.outagesCount > 0
      ).length;
      organization.operationsWithSuspicious = group.filter(
        op => op.operation.suspiciousCount > 0
      ).length;
      return { organization: organization, operations: group };
    })
  );

  return data;
};

const sendNoAccess = res => {
  res.status(401).json({
    errorType: "No access",
    errorMessage: "Invalid email or password"
  });
};

app.get("/data", async (req, res) => {
  const authHeader = req.get("authorization");
  if (!authHeader || authHeader.length < 20) {
    console.log("without header");
    sendNoAccess(res);
  } else {
    const token = authHeader.split(" ")[1];
    let user = await getUserFromAuth(token);
    //  console.log("user = " + JSON.stringify(user));
    if (user.error) {
      // try refresh token
      const refreshToken = getRefreshToken(token);
      console.log("from cache = " + refreshToken);
      if (refreshToken === null || refreshToken === undefined) {
        console.log("without refresh token");
        sendNoAccess(res);
      } else {
        console.log("refresh token = " + refreshToken);
        let freshToken = await refreshAccessToken(refreshToken);
        console.log("fresh token = " + freshToken);
        saveRefreshToken(freshToken);
        user = await getUserFromAuth(freshToken.access_token);
        let data = await prepareData(user);
        console.log("user = " + JSON.stringify(user));
        //console.log("token = " + JSON.stringify(freshToken));
        res.send(data);
      }
    } else {
      let data = await prepareData(user);
      //  console.log("user = " + JSON.stringify(user));
      console.log("token = " + JSON.stringify(token));
      //console.log("data = " + JSON.stringify(data));
      res.send(data);
    }
  }
});

app.post("/login", async (req, res) => {
  try {
    let token = await singInAuth(req.body);
    console.log(token);
    if (token.error) {
      sendNoAccess(res);
      return;
    }

    saveRefreshToken(token);

    res.send({ token: token.access_token });
  } catch (err) {
    console.log(err);
    sendNoAccess(res);
  }
});

app.post("/logout", async (req, res) => {
  const authHeader = req.get("authorization");
  if (!authHeader || authHeader.length < 20) sendNoAccess(res);
  const token = authHeader.split(" ")[1];

  removeRefreshToken(token);

  res.status(200).send();
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
