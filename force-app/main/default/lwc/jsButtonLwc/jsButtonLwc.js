import { LightningElement, api } from "lwc";
import fetchJSFromCmdt from "@salesforce/apex/DynamicSOQLDMLController.getJSFromCmdt";
import executeSoql from "@salesforce/apex/DynamicSOQLDMLController.executeSoqlQuery";
import executeDml from "@salesforce/apex/DynamicSOQLDMLController.executeDml";
import getSObjectType from "@salesforce/apex/DynamicSOQLDMLController.getSObjectTypeFromId";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const REGEX_SOQL = "\\|\\|\\s?(select\\s+[^|]+)\\s?\\|\\|";
const REGEX_UPDATE = "\\|\\|\\s?update\\s([^|;]+);?\\s*\\|\\|";
const REGEX_INSERT_UPSERT =
  "\\|\\|\\s?(insert|upsert)\\s([\\w\\d_]+)\\s?\\(\\s?(\\w+).*\\|\\|";

export default class JsButtonLwc extends LightningElement {
  @api js;
  @api cmdtName;
  @api recordId;
  _notifiedParent = false;

  renderedCallback() {
    if (!this._notifiedParent)
      this.dispatchEvent(new CustomEvent("initcomplete"));
  }

  @api
  async invoke() {
    if (!this.js && this.cmdtName) {
      let js = await fetchJSFromCmdt({ cmdtName: this.cmdtName });
      await this.runJS(js);
    }else if(this.js){
      await this.runJS(this.js)
    }
  }

  _showError(message) {
    this.dispatchEvent(new ShowToastEvent({ message, variant: "error" }));
  }

  async executeSoql(query) {
    try {
      let results = await executeSoql({ query });
      return results;
    } catch (err) {
      this._showError(err);
    }
    return null;
  }

  async executeDml(dmlType, records, sObjectType) {
    try {
      if(records && !Array.isArray(records)){
        records = [records];
      }
      if (!sObjectType)
        sObjectType = await getSObjectType({ recordId: records[0].Id });
      records = records.map((rec) => ({
        ...rec,
        attributes: { type: sObjectType }
      }));
      let results = executeDml({
        operation: dmlType,
        strData: sObjectType
          ? JSON.stringify(records, (k, v) => {
              return typeof v === "number" ? "" + v : v;
            })
          : null,
        sObjectType
      });
      return results;
    } catch (err) {
      this._showError(err);
    }
    return null;
  }

  async runJS(js) {
    //replace consecutive spaces
    js = js.replace(/\s+/g, " ");

    //parse soql
    js = js.replace(
      new RegExp(REGEX_SOQL, "gi"),
      "await this.executeSoql(`$1`);"
    );

    //parse updates
    js = js.replace(
      new RegExp(REGEX_UPDATE, "gi"),
      "await this.executeDml('update',$1);"
    );

    //parse inserts
    js = js.replace(
      new RegExp(REGEX_INSERT_UPSERT, "gi"),
      "await this.executeDml('$1',$3,'$2');"
    );
    let op = await (Function("recordId", `return (async ()=>{${js}})()`).bind(this))(this.recordId);
    return op;
  }
}
