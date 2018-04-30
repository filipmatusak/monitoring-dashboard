import React from "react";

import {
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
    const { device } = this.state;
    if (device.isOutage === true)
      return "with-outages";
    else if (device.isSuspicious === true)
      return "with-suspicious";
    else return "without-outages";
  };

  render() {
    const { device } = this.state;
    return (
      <AccordionItem disabled={false}>
        <AccordionItemTitle className={"accordion-title " + this.selectColor()}>
          <div className="device-title">
            <p className="device-name">{this.state.device.name}</p>
            <p className="device-status">UUID: {device.uuid}</p>
            <p className="device-status">Type: {device.type}</p>
            <p className="device-status">Status: {device.monitoring.status}</p>
            <p className="device-status">
              {device.outages.length > 0 && "Outage: " + device.outages[0].description}
            </p>
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
