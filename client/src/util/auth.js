import axios from "axios";
import jwt from "./jwt";

export function logOut(credentials) {
  const token = jwt.getToken();
  axios
    .request("POST", {
      url: "/logout",
      headers: {
        authorization: "Bearer " + token,
        "content-type": "application/json"
      }
    })
    .then(data => {
      console.log("logout");
      jwt.invalidate();
      this.props.history.push("/login");
    })
    .catch(function(e, c, d) {
      return;
    });
}

export function signIn(credentials) {
  // console.log("creadentials = " + credentials);
  let thiz = this;
  axios
    .post(`/login`, credentials)
    .then(data => {
      thiz.setState({
        isSigningIn: true
      });

      jwt.setToken(data.data.token);

      // Redirect to origin path if present
      if (window.location.search) {
        const originPath = decodeURIComponent(
          window.location.search.split("=")[1]
        );
        thiz.props.history.push(originPath);
        console.log("originPath = " + originPath);
      } else {
        console.log("push");
        thiz.props.history.push("/dashboard");
      }

      console.log("data");
      console.log(data);

      return data.user;
    })
    .catch(function(e, c, d) {
      thiz.setState({
        errorMessage: e.response.data.errorMessage
      });
      return;
    });
}

export function withToken(method, url, headers) {
  const token = jwt.getToken();

  headers.authorization = "Bearer " + token;

  return axios.request(method, { url, headers }).then(data => {
    console.log("data");
    console.log(data);
    if (data.headers.new_token) jwt.setToken(data.headers.new_token);
    delete data.new_token;
    return data;
  });
}
