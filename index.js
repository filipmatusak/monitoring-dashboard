"use strict";

import {
  saveRefreshToken,
  removeRefreshToken,
  getRefreshToken
} from "./server/cache";
import jwt from "./server/jwt";
import operations from "./demo/operations.json";
import { createData } from "./server/demo";
import {
  authApiUrl,
  directoryUrl,
  oauthPublicKey,
  demo
} from "./server/config";
import {
  singInAuth,
  refreshAccessToken,
  testToken,
  getUserFromAuth,
  sendNoAccess
} from "./server/auth";

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

app.use(bodyParser.json());

if (demo) createData();

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

app.get("/data", async (req, res) => {
  console.log("get data");
  testToken(req, res, async token => {
    let user = await getUserFromAuth(token);
    let data = await prepareData(user);

    res.send(data);
  });
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
