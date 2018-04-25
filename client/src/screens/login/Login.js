import React, { Component } from 'react';
//import cssModules from 'react-css-modules';
import Input from 'react-toolbox/lib/input/Input';
import Button from 'react-toolbox/lib/button/Button';
import axios from 'axios'
import jwt from '../../util/jwt'

import './loginStyle.css';


class Login extends Component {
    
    state = {
        username: '',
        password: ''
    };
    
    handleChange(name, value) {
        this.setState({
        ...this.state,
        [name]: value
        });
    }

    signIn = credentials => {
      new Promise((resolve, reject) => {
         // console.log("creadentials = " + credentials);
        axios
          .post(`/login`, credentials)
          .then((data) => {
            jwt.setToken(data.data.token);
    
            resolve(data.user);
    
            // Redirect to origin path if present
            if (window.location.search) {
              const originPath = decodeURIComponent(window.location.search.split('=')[1]);
              this.props.history.push(originPath);
              console.log("originPath = " + originPath);
            } else {
              console.log("push");
              this.props.history.push('/dashboard');
            }
          })
          .catch(reject);
      })
    };


    render() {
        return (
          <div className="login-screen-container">
            <div className="login-wrapper">
              <div className="header-wrapper">
                <span>Admin Console</span>
              </div>
    
              {
                this.props.errorMessage &&
                  <div className="login-error-msg">
                    <span>{this.props.errorMessage}</span>
                  </div>
              }
    
              <form
                onSubmit={(e) => {
                  e.preventDefault();
    
                  if (this.state.username && this.state.password) {
                    this.signIn({
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
                  onChange={value => this.handleChange('username', value)}
                  autoFocus
                  required
                />
                <Input
                  type="password"
                  label="Password"
                  value={this.state.password}
                  onChange={value => this.handleChange('password', value)}
                  required
                />
    
                <div className="login-button-wrapper">
                  <Button
                    label={this.props.isSigningIn ? 'Signing in...' : 'Sign in'}
                    raised
                    primary
                    type="submit"
                    disabled={this.props.isSigningIn}
                    style={{ width: '100%' }}
                  />
                </div>
              </form>
            </div>
          </div>
        );
      }
}

export default Login;