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

    console.log(props);

    this.state = {
      device: props.props
    };
  }

  render() {
    return (
      <AccordionItem>
        <AccordionItemTitle>
          <div className="device-title-wrapper">
            <p>{this.state.device.name}</p>
          </div>
        </AccordionItemTitle>
        <AccordionItemBody>
          <p>Body content</p>
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Device;
