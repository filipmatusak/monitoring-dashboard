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
    console.log(props);
    console.log(props.selection);
    this.state = {
      organization: props.group.organization,
      operations: props.group.operations
    };
  }

  selectColor = () => {
    const { organization } = this.state;
    if (organization.operationsWithOutages > 0) return "with-outages";
    else if (organization.operationsWithSuspicious > 0)
      return "with-suspicious";
    else return "without-outages";
  };

  render() {
    const { operations, organization } = this.state;
    return (
      <AccordionItem>
        <AccordionItemTitle className={"accordion-title " + this.selectColor()}>
          <div className="organization-title">
            <p className="organization-name">{organization.name}</p>
            <div className="organization-operations-status">
              Operations: {organization.operationsCount}
            </div>
            <div className="organization-operations-status">
              OK: {organization.okOperations}
            </div>
            <div className="organization-operations-status">
              With outages: {organization.operationsWithOutages}
            </div>
            <div className="organization-operations-status">
              With suspicious: {organization.operationsWithSuspicious}
            </div>
          </div>
        </AccordionItemTitle>
        <AccordionItemBody>
          <Accordion accordion={false}>
            {operations.map(op => (
              <Operation
                operation={op.operation}
                devices={op.devices}
                key={"org_" + op.operation._id}
              />
            ))}
          </Accordion>
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Organization;
