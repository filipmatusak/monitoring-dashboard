import React, { Component } from "react";
//import cssModules from 'react-css-modules';
import Input from "react-toolbox/lib/input/Input";
import Button from "react-toolbox/lib/button/Button";
import { signIn } from "../../util/auth";
import "./loginStyle.css";

class Login extends Component {
  state = {
    username: "",
    password: "",
    isSigningIn: false,
    errorMessage: ""
  };

  handleChange(name, value) {
    this.setState({
      ...this.state,
      [name]: value
    });
  }

  render() {
    return (
      <div className="login-screen-container">
        <div className="login-wrapper">
          <div className="header-wrapper">
            <span>Monitoring Dashboard</span>
          </div>

          {this.state.errorMessage && (
            <div className="login-error-msg">
              <span>{this.state.errorMessage}</span>
            </div>
          )}

          <form
            onSubmit={e => {
              e.preventDefault();
              console.log(this);
              if (this.state.username && this.state.password) {
                signIn.bind(this)({
                  username: this.state.username.trim(),
                  password: this.state.password.trim()
                });
              }
            }}
          >
            <Input
              type="string"
              label="Email address"
              value={this.state.username}
              onChange={value => this.handleChange("username", value)}
              autoFocus
              required
            />
            <Input
              type="password"
              label="Password"
              value={this.state.password}
              onChange={value => this.handleChange("password", value)}
              required
            />

            <div className="login-button-wrapper">
              <Button
                label={this.state.isSigningIn ? "Signing in..." : "Sign in"}
                raised
                primary
                type="submit"
                disabled={this.state.isSigningIn}
                style={{ width: "100%" }}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default Login;
