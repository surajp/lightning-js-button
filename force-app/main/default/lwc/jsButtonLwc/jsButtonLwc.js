import { LightningElement, api } from "lwc";
import fetchJSFromCmdt from "@salesforce/apex/DynamicSOQLDMLController.getJSFromCmdt";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import callout from "c/httpRequest";
import sfapi from "c/apiService";
import soql from "c/soqlService";
import * as dml from "c/dmlService";
import toast from "c/toastService";

export default class JsButtonLwc extends LightningElement {
  @api js;
  @api cmdtName;
  @api recordId;
  _notifiedParent = false;

  @api
  buttonLabel = "JS Button";

  @api
  buttonVariant = "brand";

  isScriptLoaded = false;
  _isRunning = false;

  get spinnerClass() {
    return this._isRunning ? "" : "slds-hide";
  }

  renderedCallback() {
    if (!this._notifiedParent) this.dispatchEvent(new CustomEvent("initcomplete"));
    this._notifiedParent = true;
  }

  @api
  async invoke() {
    if (!this.js && this.cmdtName) {
      this.cmdtName = this.cmdtName.replace(/\./g, "_"); //quickAction API returns action name as SObject.Action_API_Name. Replace '.' with '_' and use that as the api name to fetch the corresponding custom metadata record.
      let js = await fetchJSFromCmdt({ cmdtName: this.cmdtName });
      return this.runJS(js);
    } else if (this.js) {
      return this.runJS(this.js);
    }
  }

  _showError(message) {
    this.dispatchEvent(new ShowToastEvent({ message, variant: "error" }));
  }

  async runJS(js) {
    this._isRunning = true;
    //replace consecutive spaces
    //don't replace consecutive spaces
    //js = js.replace(/\s+/g, " ");

    try {
      //eslint-disable-next-line
      let op = await Function(
        "recordId",
        "soql",
        "dml",
        "callout",
        "sfapi",
        "toast",
        `return (async ()=>{${js}})()`
      ).bind(this)(this.recordId, soql, dml, callout, sfapi, toast);
      return op;
    } catch (err) {
      console.error("An error occurred ", err);
      alert("Unhandled error in script " + err.message ? err.message : err);
    } finally {
      this._isRunning = false;
    }
    return false;
  }
}
