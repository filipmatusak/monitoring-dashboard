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

  selectColor = () => {
    const {device} = this.state;
    if(device.outage && device.outage.severity === 'outage') return 'with-outages';
    else if(device.outage && device.outage.severity === 'suspicious') return 'with-suspicious';
    else return 'without-outages';
  }

  render() {
    const { device } = this.state;
    return (
      <AccordionItem disabled={false}>
        <AccordionItemTitle className={this.selectColor()}>
          <div className="device-title-wrapper">
            <p>{this.state.device.name}</p>
          </div>
          <div>
            <p>{device.uuid}</p>
            <p>{device.monitoring.status}</p>
            <p>{device.type}</p>
          </div>
        </AccordionItemTitle>
        <AccordionItemBody>
          <p>{device.model}</p>
          <p>{device.monitoring.last_heartbeat_at}</p>
          <p>{device.monitoring.last_data_at}</p>
        </AccordionItemBody>
      </AccordionItem>
    );
  }
}

export default Device;
