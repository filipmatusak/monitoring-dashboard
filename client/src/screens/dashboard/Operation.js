import React from "react";

import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody
} from "react-accessible-accordion";

import Device from './Device';

class Operation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      operation: props.props.operation,
      devices: props.props.devices,
      deviceComps: props.props.devices.map(d => <Device props={d}/>)
    };
  }

  render() {
    const { deviceComps } = this.state;
    return (
      <AccordionItem>
        <AccordionItemTitle>
          <div className="device-title-wrapper">
            <p>{this.state.operation.name}</p>
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
