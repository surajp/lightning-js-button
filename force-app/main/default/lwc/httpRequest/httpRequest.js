import { api } from "lwc";
import makeApiCall from "@salesforce/apex/APICallController.makeApiCall";

export default class HttpRequest {
  endPoint = "";
  method = "GET";
  body = null;
  headers = {};

  @api
  setEndpoint(val) {
    this.endPoint = val;
  }

  @api
  setMethod(val) {
    this.method = val;
  }

  @api
  setBody(val) {
    this.body = val;
  }

  @api
  addHeader(key, value) {
    if (typeof value !== "string")
      throw "You may only set string values for headers";
    this.headers[key] = value;
  }

  @api
  clear() {
    this.endPoint = "";
    this.method = "GET";
    this.body = null;
    this.headers = {};
  }

  @api
  async send() {
    let resp = await makeApiCall({
      endPoint: this.endPoint,
      method: this.method,
      bodyStr: this.body ? JSON.stringify(this.body) : "",
      headers: this.headers
    });
    return resp;
  }
}
