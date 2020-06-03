import { LightningElement, api, wire } from "lwc";
import fetchJSFromCmdt from '@salesforce/apex/DynamicSOQLDMLController.getJSFromCmdt';
import executeSoql from '@salesforce/apex/DynamicSOQLDMLController.executeSoqlQuery';
import runDml from '@salesforce/apex/DynamicSOQLDMLController.executeDml';
import getSObjectType from '@salesforce/apex/DynamicSOQLDMLController.getSObjectTypeFromId';

const REGEX_SOQL = "\\|\\|\\s?(select\\s+[^|]+)\\s?\\|\\|";
const REGEX_UPDATE = "\\|\\|\\s?update\\s([^|;]+);?\\s*\\|\\|";
const REGEX_INSERT_UPSERT =
  "\\|\\|\\s?(insert|upsert)\\s([\\w\\d_]+)\\s?\\(\\s?(\\w+).*\\|\\|";
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
export default class JsButtonLwc extends LightningElement {
  @api js;
  @api cmdtName;
  @api recordId;

  @api
  async invoke() {
    if (!this.js && this.cmdtName) {
      this.js = await fetchJSFromCmdt({ cmdtName });
      return await this.runJS();
    } else if (this.js) {
      return await this.runJS();
    }
    throw Error("No script found to execute");
  }

  executeSoql(){
    //TODO: implement
  }

  executeDml(){
    //TODO: implement
  }


  runJS() {
    //replace consecutive spaces
    this.js = this.js.replace(/\s+/g, " ");

    //parse soql
    this.js = this.js.replace(
      new RegExp(helper.REGEX_SOQL, "gi"),
      "await this.executeSoql(cmp,`$1`);"
    );

    //parse updates
    this.js = this.js.replace(
      new RegExp(helper.REGEX_UPDATE, "gi"),
      "await this.executeDml(cmp,'update',$1);"
    );

    //parse inserts
    this.js = this.js.replace(
      new RegExp(helper.REGEX_INSERT_UPSERT, "gi"),
      "await this.executeDml(cmp,'$1',$3,'$2');"
    );

    return await AsyncFunction("recordId", `return ${js}`).bind(this)(recordId);

  }
}
