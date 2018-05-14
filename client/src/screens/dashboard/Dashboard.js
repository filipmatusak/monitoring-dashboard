import React, { Component } from "react";
import ProgressBar from "react-toolbox/lib/progress_bar";
import { Accordion } from "react-accessible-accordion";
import Checkbox from "react-toolbox/lib/checkbox";
import Organization from "./Organization";
import { logOut, withToken } from "../../util/auth";
import Input from "react-toolbox/lib/input/Input";

import "./style.css";

class Dashboard extends Component {
  fetchData = () => {
    this.setState({
      loading: true
    });

    return withToken("GET", "/data", { "content-type": "application/json" })
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
      selectedCount: 3,
      search: ""
    }
  };

  setExpandedFalse = data => {
    data.forEach(org => {
      org.isExpanded = false;
      org.isSearched = true;
    });
    data.forEach(org =>
      org.operations.forEach(op => {
        op.isExpanded = false;
        op.isSearched = true;
      })
    );
    data.forEach(org =>
      org.operations.forEach(op =>
        op.devices.forEach(d => {
          d.isExpanded = false;
          d.isSearched = true;
        })
      )
    );

    return data;
  };

  async componentDidMount() {
    const data = await this.fetchData();

    if (data.error) {
      this.props.history.push("/login");
      return;
    } else {
      this.setState({
        data: this.setExpandedFalse(
          this.setVisibilityForTree(data.data, this.state.selection)
        )
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
    //console.log("selection");
    //console.log(selection);

    data.forEach(org => {
      org.operations.forEach(op => {
        op.devices.forEach(
          d =>
            (d.isSelected =
              (ok && !d.isOutage && !d.isSuspicious) ||
              (out && d.isOutage) ||
              (sus && d.isSuspicious))
        );

        op.operation.outagesCount = op.operation.outages.filter(
          o =>
            op.devices.find(d => d.isSelected && o.device_id === d._id) &&
            o.severity === "outage"
        ).length;

        op.operation.suspiciousCount = op.operation.outages.filter(
          o =>
            op.devices.find(d => d.isSelected && o.device_id === d._id) &&
            o.severity === "suspicious"
        ).length;

        return op;
      });

      org.operations.forEach(
        op =>
          (op.isSelected =
            op.devices.filter(x => x.isSelected).length > 0 &&
            ((ok &&
              op.operation.suspiciousCount === 0 &&
              op.operation.outagesCount === 0) ||
              (out && op.operation.outagesCount > 0) ||
              (sus && op.operation.suspiciousCount > 0)))
      );

      org.organization.operationsCount = org.operations.filter(
        x => x.isSelected
      ).length;

      org.organization.okOperations = org.operations
        .filter(x => x.isSelected)
        .filter(
          op =>
            op.operation.outagesCount === 0 &&
            op.operation.suspiciousCount === 0
        ).length;
      org.organization.operationsWithOutages = org.operations
        .filter(x => x.isSelected)
        .filter(op => op.operation.outagesCount > 0).length;
      org.organization.operationsWithSuspicious = org.operations
        .filter(x => x.isSelected)
        .filter(op => op.operation.suspiciousCount > 0).length;
    });

    data.forEach(
      org =>
        (org.isSelected =
          org.operations.length > 0 &&
          ((ok && org.organization.okOperations > 0) ||
            (out && org.organization.operationsWithOutages > 0) ||
            (sus && org.organization.operationsWithSuspicious > 0)))
    );

    return data;
  };

  match = (str, pattern) => {
    return str && str.toLowerCase().includes(pattern.toLowerCase());
  };

  setSearchForTree = (search, data) => {
    //console.log("search");
    //console.log(search);
    const match = this.match;
    data.filter(x => x.isSelected).forEach(org => {
      org.isSearched = false;

      if (
        match(org.organization.name, search) ||
        match(org.organization._id, search)
      ) {
        org.isSearched = true;
        org.isExpanded = false;
        org.operations.filter(x => x.isSelected).forEach(op => {
          op.isSearched = true;
          op.isExpanded = false;
          op.devices
            .filter(x => x.isSelected)
            .forEach(d => (d.isSearched = true));
        });
      } else {
        org.operations.filter(x => x.isSelected).forEach(op => {
          op.isSearched = false;

          if (
            match(op.operation.name, search) ||
            match(op.operation._id, search)
          ) {
            org.isSearched = true;
            org.isExpanded = true;
            op.isSearched = true;
            op.isExpanded = false;
          } else {
            
            op.devices.filter(x => x.isSelected).forEach(d => {
              if (
                match(d.name, search) ||
                match(d.sn, search) ||
                match(d.uuid, search)
              ) {
                d.isSearched = true;
                d.isExpanded = false;
                op.isSearched = true;
                op.isExpanded = true;
                org.isSearched = true;
                org.isExpanded = true;
              } else d.isSearched = d.isExpanded = false;
            });
          }
        });
      }
    });

    return data;
  };

  handleSearchChange = (search, data) => {
    let newData = this.setSearchForTree(search, data)
    this.setState({
      data: newData,
      selection: Object.assign(this.state.selection, { search: search })
    });
  }

  handleSelectionChange = (field, value) => {
    let {
      selectAll,
      selectOK,
      selectOutages,
      selectSuspicious,
      selectedCount,
      search
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
    } else if (field === "search") {
      search = value;
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

    let newData = this.setVisibilityForTree(this.state.data, {
      selectAll,
      selectOK,
      selectOutages,
      selectSuspicious
    });

    this.setState({
      selection: {
        selectAll,
        selectedCount,
        selectOK,
        selectOutages,
        selectSuspicious,
        search
      },
      data: this.setSearchForTree(search, newData)
    });
  };

  onChange = key => {};

  render() {
    console.log("render");
    console.log(this.state);
    const { data, selection } = this.state;
    const {
      selectAll,
      selectOK,
      selectOutages,
      selectSuspicious,
      search
    } = selection;
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
                onChange={this.handleSelectionChange.bind(this, "selectAll")}
              />
            </div>
            <div className="checkbox-wrapper">
              <Checkbox
                checked={selectOK}
                label="OK"
                onChange={this.handleSelectionChange.bind(this, "selectOK")}
              />
            </div>
            <div className="checkbox-wrapper">
              <Checkbox
                checked={selectOutages}
                label="Outages"
                onChange={this.handleSelectionChange.bind(
                  this,
                  "selectOutages"
                )}
              />
            </div>
            <div className="checkbox-wrapper">
              <Checkbox
                checked={selectSuspicious}
                label="Suspicious"
                onChange={this.handleSelectionChange.bind(
                  this,
                  "selectSuspicious"
                )}
              />
            </div>
            <button className="logout-button" onClick={logOut.bind(this)}>
              Logout
            </button>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-wrapper">
              <div className="search-wrapper">
                <Input
                  type="search"
                  hint={search === "" ? "Search" : null}
                  value={search}
                  onChange={value => this.handleSearchChange(value, data)}
                />
              </div>
              <Accordion accordion={false} onChange={this.onChange}>
                {data.filter(x => x.isSelected && x.isSearched).map(group => {
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
