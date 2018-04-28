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
      organization: props.group.organization,
      operations: props.group.operations,
      operationComps: props.group.operations.map(op => (
        <Operation operation={op.operation} devices={op.devices} key={op.operation._id}/>
      ))
    };
  }

  selectColor = () => {
    const {organization} = this.state;
    if(organization.operationsWithOutages > 0) return 'with-outages';
    else if(organization.operationsWithSuspicious > 0) return 'with-suspicious';
    else return 'without-outages';
  }

  render() {
    const { operationComps, organization } = this.state;
    return (
      <AccordionItem>
        <AccordionItemTitle className={this.selectColor()}>
          <div className="organization-title">
            <div className="organization-name">
              <p>{organization.name}</p>
            </div>
            <div className="organization-operations-status">
              <p>{organization.operationsCount - organization.operationsWithOutages}/{organization.operationsCount}</p>
            </div>
          </div>
        </AccordionItemTitle>
        <AccordionItemBody>
          <Accordion accordion={false} >{operationComps}</Accordion>
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Organization;
