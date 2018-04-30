import React from "react";

import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody
} from "react-accessible-accordion";

import Device from "./Device";

class Operation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      operation: props.operation,
      devices: props.devices
    };
  }

  selectColor = () => {
    const { operation } = this.state;
    if (operation.outagesCount > 0) return "with-outages";
    else if (operation.suspiciousCount > 0) return "with-suspicious";
    else return "without-outages";
  };

  render() {
    const { devices, operation } = this.state;
    return (
      <AccordionItem>
        <AccordionItemTitle className={"accordion-title " + this.selectColor()}>
          <div className="operation-title">
            <p className="operation-name">{operation.name}</p>

            <p className="operation-status">
              All devices: {this.state.devices.length}
            </p>
            <p className="operation-status">
              Outages: {this.state.operation.outagesCount}
            </p>
            <p className="operation-status">
              Suspicious: {this.state.operation.suspiciousCount}
            </p>
            <p className="operations-modules">
              {operation.modules.length > 0 &&
                "Corrupted modules: " + operation.modules.join(", ")}
            </p>
          </div>
        </AccordionItemTitle>
        <AccordionItemBody>
          <Accordion accordion={false}>
            {devices.map(d => <Device device={d} key={"device_" + d._id} />)}
          </Accordion>
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Operation;
