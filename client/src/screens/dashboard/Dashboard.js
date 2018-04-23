import React, { Component } from "react";
import axios from "axios";
import jwt from "../../util/jwt";

class Dashboard extends Component {
  fetchData = () => {
    const token = jwt.getToken();
    console.log("token = " + token);
    return axios.request("GET", {
      url: "/data",
      headers: {
        authorization: "Bearer " + token,
        "content-type": "application/json"
      }
    });
  };

  state = {
    data: {}
  };

  async componentDidMount() {
    const data = await this.fetchData();
    this.setState({
      data: data.data
    });
  }

  render() {
    const { data } = this.state;
    console.log(data);
    return <p>dashboard</p>;
  }
}

export default Dashboard;
