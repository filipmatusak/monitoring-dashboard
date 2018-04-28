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
      devices: props.devices,
      deviceComps: props.devices.map(d => <Device device={d} key={"device_" + d._id} />)
    };
  }

  selectColor = () => {
    const { operation } = this.state;
    if (operation.outagesCount > 0) return "with-outages";
    else if (operation.suspiciousCount > 0) return "with-suspicious";
    else return "without-outages";
  };

  render() {
    const { deviceComps, operation } = this.state;
    return (
      <AccordionItem>
        <AccordionItemTitle className={"accordion-title " + this.selectColor()}>
          <div className="operation-title">
            <p className="operation-name">{operation.name}</p>

            <p className="operation-status">
              All devices: {this.state.devices.length}
            </p>
            <p className="operation-status">
              Corrupted devices: {this.state.operation.outagesCount}
            </p>
            <p className="operation-status">
              Suspicious devices: {this.state.operation.suspiciousCount}
            </p>
            {operation.modules && (
              <div className="operations-modules">
                <p>Corrupted modules: {operation.modules.join(", ")}</p>
              </div>
            )}
          </div>
        </AccordionItemTitle>
        <AccordionItemBody>
          <Accordion accordion={false}>{deviceComps}</Accordion>
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Operation;
