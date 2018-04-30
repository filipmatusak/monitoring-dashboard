import React, { Component } from "react";
import axios from "axios";
import jwt from "../../util/jwt";
import ProgressBar from "react-toolbox/lib/progress_bar";
import { Accordion } from "react-accessible-accordion";
import Checkbox from "react-toolbox/lib/checkbox";
import Organization from "./Organization";

import "./style.css";

class Dashboard extends Component {
  fetchData = () => {
    const token = jwt.getToken();
    console.log(token);
    this.setState({
      loading: true
    });
    return axios
      .request("GET", {
        url: "/data",
        headers: {
          authorization: "Bearer " + token,
          "content-type": "application/json"
        }
      })
      .then(data => {
        this.setState({
          loading: false
        });
        return data;
      })
      .catch(error => {
        console.log("error");
        return { error: "unauthorized" };
      });
  };

  state = {
    data: [],
    selectAll: true,
    selectOK: true,
    selectOutages: true,
    selectSuspicious: true
  };

  async componentDidMount() {
    const data = await this.fetchData();

    if (data.error) {
      this.props.history.push("/login");
      return;
    } else {
      this.setState({
        data: data.data
      });
    }
  }

  logOut = credentials => {
    const token = jwt.getToken();
    let dashboard = this;
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
  };

  handleChange = field => {
    if (field === "selectAll") {
      if (this.state.selectAll === false)
        this.setState({
          selectAll: true,
          selectOK: true,
          selectOutages: true,
          selectSuspicious: true
        });
      else {
        this.setState({
          selectAll: false,
          selectOK: false,
          selectOutages: false,
          selectSuspicious: false
        });
      }
    } else {
      this.setState({ [field]: !this.state[field] });
    }
  };

  render() {
    console.log(this.state);
    const {
      data,
      selectAll,
      selectOK,
      selectOutages,
      selectSuspicious
    } = this.state;
    if (this.state.loading) {
      return <ProgressBar type="circular" mode="indeterminate" />;
    } else {
      return (
        <div>
          <div className="app-bar">
            <p className="app-title">Monitoring Dashboard</p>

            <div className="checkbox-wrapper">
              <Checkbox
                checked={selectAll}
                label="All"
                onChange={this.handleChange.bind(this, "selectAll")}
              />
            </div>
            <div className="checkbox-wrapper">
              <Checkbox
                checked={selectOK}
                label="OK"
                onChange={this.handleChange.bind(this, "selectOK")}
              />
            </div>
            <div className="checkbox-wrapper">
              <Checkbox
                checked={selectOutages}
                label="Outages"
                onChange={this.handleChange.bind(this, "selectOutages")}
              />
            </div>
            <div className="checkbox-wrapper">
              <Checkbox
                checked={selectSuspicious}
                label="Suspicious"
                onChange={this.handleChange.bind(this, "selectSuspicious")}
              />
            </div>
            <button className="logout-button" onClick={this.logOut}>
              Logout
            </button>
          </div>
          <div className="dashboard-wrapper">
            <Accordion accordion={false}>
              {data.map(group => {
                return (
                  <Organization
                    group={group}
                    key={"org_" + group.organization._id}
                  />
                );
              })}
            </Accordion>
          </div>
        </div>
      );
    }
  }
}

export default Dashboard;
