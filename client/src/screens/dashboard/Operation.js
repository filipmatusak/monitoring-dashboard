import React from "react";

import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody
} from "react-accessible-accordion";

import Device from "./Device";

class Operation extends React.Component {

  selectColor = () => {
    const { operation } = this.props;
    const { selectOutages, selectSuspicious } = this.props.selection;
    if (selectOutages && operation.outagesCount > 0) return "with-outages";
    else if (selectSuspicious && operation.suspiciousCount > 0) return "with-suspicious";
    else return "without-outages";
  };

  render() {
    const { devices, operation, selection, isExpanded } = this.props;
    return (
      <AccordionItem expanded={isExpanded}>
        <AccordionItemTitle className={"accordion-title " + this.selectColor()}>
          <div className="operation-title">
            <p className="operation-name">{operation.name}</p>

            <p className="operation-status">
              All devices: {this.props.devices.length}
            </p>
            <p className="operation-status">
              Outages: {this.props.operation.outagesCount}
            </p>
            <p className="operation-status">
              Suspicious: {this.props.operation.suspiciousCount}
            </p>
            <p className="operations-modules">
              {operation.modules.length > 0 &&
                "Corrupted: " + operation.modules.join(", ")}
            </p>
          </div>
        </AccordionItemTitle>
        <AccordionItemBody>
          <Accordion accordion={false}>
            {devices.filter(x => x.isSelected && x.isSearched).map(d => <Device device={d} key={"device_" + d._id} selection={selection}/>)}
          </Accordion>
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Operation;
