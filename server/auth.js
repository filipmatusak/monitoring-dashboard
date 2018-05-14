import { authApiUrl, demo} from "./config";
import { getRefreshToken } from "./cache";
import operations from "../demo/operations.json";

const request = require("request");

export function sendNoAccess(res){
  res.status(401).json({
    errorType: "No access",
    errorMessage: "Invalid email or password"
  });
};

export function singInAuth(creadentials){
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

export function getUserFromAuth(access_token){
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
        let res = JSON.parse(body);
        if (demo) res.operation_ids = operations.map(op => op._id);
        resolve(res);
      }
    );
  });
};

export function refreshAccessToken(refresh_token){
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


export async function testToken(req, res, next){
  const authHeader = req.get("authorization");
  //console.log("header = " + authHeader);
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
        res.headers.new_token = freshToken;
        saveRefreshToken(freshToken);
        next(freshToken);
      }
    } else {
      next(token);
    }
  }
}