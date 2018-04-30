import React, { Component } from "react";
import axios from "axios";
import jwt from "../../util/jwt";
import ProgressBar from "react-toolbox/lib/progress_bar";
import { Accordion } from "react-accessible-accordion";

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
    data: []
  };

  async componentDidMount() {
    const data = await this.fetchData();

    if (data.error) {
      this.props.history.push("/login");
      return;
    } else {
      this.setState({
        data: data.data,
        organizationsComps: data.data.map(group => {
          return (
            <Organization group={group} key={"org_" + group.organization._id} />
          );
        })
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

  render() {
    console.log(this.state);
    const { organizationsComps } = this.state;
    if (this.state.loading) {
      return <ProgressBar type="circular" mode="indeterminate" />;
    } else {
      return (
        <div>
          <div className="app-bar">
            <p className='app-title'>Monitoring Dashboard</p>
            <button className="logout-button" onClick={this.logOut}>
              Logout
            </button>
          </div>
          <div className="dashboard-wrapper">
            <Accordion accordion={false}>{organizationsComps}</Accordion>
          </div>
        </div>
      );
    }
  }
}

export default Dashboard;
