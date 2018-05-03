import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import "./App.css";
import Login from "./screens/login/Login";
import Dashboard from "./screens/dashboard/Dashboard";
import "./assets/react-toolbox/theme.css";
import theme from "./assets/react-toolbox/theme.js";
import ThemeProvider from "react-toolbox/lib/ThemeProvider";

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <div className="App">
          <Router>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/dashboard" component={Dashboard} />
              <Redirect from="/*" to="/dashboard" />
            </Switch>
          </Router>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
