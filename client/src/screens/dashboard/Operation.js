import React from "react";
import Button from "react-toolbox/lib/button/Button";

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
      deviceComps: props.devices.map(d => (
        <Device device={d} key={d._id} />
      ))
    };
  }

  selectColor = () => {
    const {operation} = this.state;
    if(operation.outagesCount > 0) return 'with-outages';
    else if(operation.suspiciousCount > 0) return 'with-suspicious';
    else return 'without-outages';
  }

  render() {
    const { deviceComps, operation } = this.state;
    return (
      <AccordionItem>
        <AccordionItemTitle className={this.selectColor()}>
          <div className="operation-title">
            <div className="operation-name">
              <p>{operation.name}</p>
            </div>
            <div className="operations-modules">
              {operation.modules.map(m => <p key={m}>{m}</p>)}
            </div>
            <div className="operations-devices">
              <p>{this.state.devices.length}</p>
            </div>
            <div className="operations-outages">
              <p>{this.state.operation.outagesCount}</p>
            </div>
            <div className="operations-suspicious">
              <p>{this.state.operation.suspiciousCount}</p>
            </div>
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
