import organizations from "../demo/organizations.json";
import operations from "../demo/operations.json";
import devices from "../demo/devices.json";
import allocations from "../demo/allocations.json";
import outages from "../demo/outages.json";
import users from "../demo/users.json";
import { directoryUrl } from "./config";
const request = require("request");

const send = (data, path) => {
  data.map(obj => {
    request.post(
      {
        headers: {
          "content-type": "application/json"
        },
        url: directoryUrl + path,
        body: JSON.stringify(obj)
      },
      function(err, response, body) {
        if (err) {
          console.log(path);
          console.log(body);
          console.log(err);
        }
      }
    );
  });
};

export function createData() {
  console.log("     creating demo data      ");
  send(organizations, "/organizations");
  send(operations, "/operations");
  send(devices, "/devices");
  send(allocations, "/allocations");
  send(outages, "/outages");
  send(users, "/users");
}
