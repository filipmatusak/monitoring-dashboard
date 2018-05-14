import React from "react";

import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody
} from "react-accessible-accordion";

import Operation from "./Operation";

class Organization extends React.Component {

  selectColor = () => {
    const { organization } = this.props.group;
    const { selectOutages, selectSuspicious } = this.props.selection;
    if (selectOutages && organization.operationsWithOutages > 0) return "with-outages";
    else if (selectSuspicious && organization.operationsWithSuspicious > 0)
      return "with-suspicious";
    else return "without-outages";
  };

  onChange = (key) => {
    /*let changed = this.props.group.operations.filter(x => x.isSelected)[key];
    changed.isExpanded = !changed.isExpanded*/
  }

  render() {
    const { operations, organization, isExpanded } = this.props.group;
    const { selection } = this.props;
    return (
      <AccordionItem expanded={isExpanded}>
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
            {operations.filter(x => x.isSelected && x.isSearched).map(op => (
              <Operation
                operation={op.operation}
                devices={op.devices}
                key={"org_" + op.operation._id}
                selection={selection}
                isExpanded={op.isExpanded}
              />
            ))}
          </Accordion>
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Organization;
