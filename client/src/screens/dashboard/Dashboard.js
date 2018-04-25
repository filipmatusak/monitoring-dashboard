import React, { Component } from "react";
import axios from "axios";
import jwt from "../../util/jwt";
import ProgressBar from "react-toolbox/lib/progress_bar";

import Organization from "./Organization";

import { Accordion } from "react-accessible-accordion";

// Demo styles, see 'Styles' section below for some notes on use.
import "react-accessible-accordion/dist/fancy-example.css";

import "./style.css";

class Dashboard extends Component {
  fetchData = () => {
    const token = jwt.getToken();
    //console.log("token = " + token);
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
    organizations: []
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
          return <Organization props={group} />;
        })
      });
    }
  }

  render() {
    console.log(this.state);
    const { organizationsComps } = this.state;
    if (this.state.loading) {
      return <ProgressBar type="circular" mode="indeterminate" />;
    } else {
      return <Accordion accordion={false}>{organizationsComps}</Accordion>;
    }
  }
}

export default Dashboard;
