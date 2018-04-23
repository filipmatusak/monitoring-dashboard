import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import Login from './screens/login/Login';
import Dashboard from './screens/dashboard/Dashboard';


class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <div>
           <Route path="/login" component={Login} />
           <Route path="/dashboard" component={Dashboard} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
