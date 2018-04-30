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
    selection: {
      selectAll: true,
      selectOK: true,
      selectOutages: true,
      selectSuspicious: true,
      selectedCount: 3
    }
  };

  async componentDidMount() {
    const data = await this.fetchData();

    if (data.error) {
      this.props.history.push("/login");
      return;
    } else {
      this.setState({
        originData: data.data,
        data: this.setVisibilityForTree(data.data, this.state.selection)
      });
    }
  }

  setVisibilityForTree = (data, selection) => {
    const {
      selectAll: all,
      selectOK: ok,
      selectOutages: out,
      selectSuspicious: sus
    } = selection;
    console.log("selection");
    console.log(selection);
    if (all) return data;
    else
      return data
        .map(org => {
          org.operations = org.operations.map(op => {

            console.log("old devices");
            console.log(op.devices)
            op.devices = op.devices.filter(
              d =>
                (ok && !d.isOutage && !d.isSuspicious) ||
                (out && d.isOutage) ||
                (sus && d.isSuspicious)
            );

            console.log("new devices");
            console.log(op.devices)

            op.operation.outagesCount = op.operation.outages.filter(
              o =>
                op.devices.find(d => o.device_id === d._id) &&
                o.severity === "outage"
            ).length;

            op.operation.suspiciousCount = op.operation.outages.filter(
              o =>
                op.devices.find(d => o.device_id === d._id) &&
                o.severity === "suspicious"
            ).length;

            return op;
          });


          console.log("old operaions");
          console.log(org.operations);
          org.operations = org.operations.filter(
            op =>
              op.devices.length > 0 &&
              ((ok &&
                op.operation.suspiciousCount === 0 &&
                op.operation.outagesCount === 0) ||
                (out && op.operation.outagesCount > 0) ||
                (sus && op.operation.suspiciousCount > 0))
          );

          console.log("new operaions");
          console.log(org.operations);

          org.organization.operationsCount = org.operations.length;
          org.organization.okOperations = org.operations.filter(
            op =>
              op.operation.outagesCount === 0 &&
              op.operation.suspiciousCount === 0
          ).length;
          org.organization.operationsWithOutages = org.operations.filter(
            op => op.operation.outagesCount > 0
          ).length;
          org.organization.operationsWithSuspicious = org.operations.filter(
            op => op.operation.suspiciousCount > 0
          ).length;

          return org;
        })
        .filter(
          org =>
            org.operations.length > 0 &&
            ((ok && org.organization.okOperations > 0) ||
              (out &&
                org.organization.operationsWithOutages > 0) ||
              (sus && org.organization.operationsWithSuspicious > 0))
        );
  };

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
      .catch(function (e, c, d) {
        return;
      });
  };

  handleChange = field => {
    let {
      selectAll,
      selectOK,
      selectOutages,
      selectSuspicious,
      selectedCount
    } = this.state.selection;

    if (field === "selectAll") {
      if (selectAll === false) {
        selectAll = true;
        selectOK = true;
        selectOutages = true;
        selectSuspicious = true;
        selectedCount = 3;
      } else {
        selectAll = false;
        selectOK = false;
        selectOutages = false;
        selectSuspicious = false;
        selectedCount = 0;
      }
    } else {
      if (selectedCount === 3 && this.state.selection[field]) {
        selectAll = false;
        selectedCount = 2;
      } else if (selectedCount === 2 && !this.state.selection[field]) {
        selectAll = true;
        selectedCount = 3;
      } else {
        if (this.state.selection[field]) selectedCount--;
        else selectedCount++;
      }
      if (field === "selectOK") selectOK = !selectOK;
      if (field === "selectOutages") selectOutages = !selectOutages;
      if (field === "selectSuspicious") selectSuspicious = !selectSuspicious;
    }

    this.setState({
      selection: {
        selectAll,
        selectedCount,
        selectOK,
        selectOutages,
        selectSuspicious
      },
      data: this.setVisibilityForTree(
        JSON.parse(JSON.stringify(this.state.originData)),
        {
          selectAll,
          selectOK,
          selectOutages,
          selectSuspicious
        }
      )
    });
  };

  render() {
    console.log("render");
    console.log(this.state);
    const { data, selection } = this.state;
    const { selectAll, selectOK, selectOutages, selectSuspicious } = selection;
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
          <div className='dashboard-content'>
            <div className="dashboard-wrapper">
              <Accordion accordion={false}>
                {data.map(group => {
                  return (
                    <Organization
                      group={group}
                      key={"org_" + group.organization._id}
                      selection={selection}
                    />
                  );
                })}
              </Accordion>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Dashboard;
