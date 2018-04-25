import React from "react";

import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody
} from "react-accessible-accordion";

import Operation from "./Operation";

class Organization extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      organization: props.props.organization,
      operations: props.props.operations,
      operationComps: props.props.operations.map(op => <Operation props={op} />)
    };
  }

  render() {
    const { operationComps } = this.state;
    return (
      <AccordionItem>
        <AccordionItemTitle>
          <div className="device-title-wrapper">
            <p>{this.state.organization.name}</p>
          </div>
        </AccordionItemTitle>
        <AccordionItemBody>
          <Accordion accordion={false}>{operationComps}</Accordion>
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Organization;
