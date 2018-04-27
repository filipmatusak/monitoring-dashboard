import React from "react";
import Table from "react-toolbox/lib/table";

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
      deviceComps: props.devices.map(d => <Device device={d} />)
    };
  }

  render() {
    const { deviceComps, operation } = this.state;
    return (
      <AccordionItem>
        <AccordionItemTitle>
          <div className="operation-title">
            <div className="operation-name">
              <p>{operation.name}</p>
            </div>
            <div className="operations-modules">
              {operation.modules.map(m => <p>{m}</p>)}
            </div>
          </div>
        </AccordionItemTitle>
        <AccordionItemBody>
          
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Operation;
