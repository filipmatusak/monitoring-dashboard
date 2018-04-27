import React from "react";

import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody
} from "react-accessible-accordion";

class Device extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      device: props.device
    };
  }

  render() {
    return (
      <AccordionItem disabled={false}>
        <AccordionItemTitle>
          <div className="device-title-wrapper">
            <p>{this.state.device.name}</p>
          </div>
        </AccordionItemTitle>
        <AccordionItemBody>
          <p>Model</p>
          <p>Body content</p>
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Device;
