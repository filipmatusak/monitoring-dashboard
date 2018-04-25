import React, { Component } from 'react';
import cssModules from 'react-css-modules';
import Input from 'react-toolbox/lib/input/Input';
import Button from 'react-toolbox/lib/button/Button';
import axios from 'axios'
import jwt from '../../util/jwt'
import { connect } from 'react-redux';
const request = require("request");

import style from './loginStyle.css';

export const USER_LOGIN = 'USER_LOGIN';

export const signIn = credentials => ({
    type: USER_LOGIN,
    payload: new Promise((resolve, reject) => {
      request
        .post(`/login`, credentials)
        .then((data) => {
          console.log('data', data);
          jwt.setToken(data.token);
          saveUser(data.user);
  
          resolve(data.user);
  
          // Redirect to origin path if present
          if (window.location.search) {
            const originPath = decodeURIComponent(window.location.search.split('=')[1]);
            browserHistory.push(originPath);
          } else {
            browserHistory.push('/dashboard');
          }
        })
        .catch(reject);
    })
  });