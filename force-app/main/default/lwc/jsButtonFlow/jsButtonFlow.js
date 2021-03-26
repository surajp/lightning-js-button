import { LightningElement, api } from "lwc";
import { FlowNavigationNextEvent, FlowNavigationFinishEvent } from "lightning/flowSupport";

export default class JsButtonFlow extends LightningElement {
  @api availableActions = [];
  @api js;
  @api cmdtName;
  @api recordIds;
  _notifiedParent = false;

  @api
  buttonLabel = "JS Button";

  @api
  buttonVariant = "brand";

  @api
  response = null;

  async renderedCallback() {
    this.response = await this.template.querySelector("c-js-button-lwc").invoke();
    if (typeof this.response === "object") this.response = JSON.stringify(this.response);
    else if (typeof this.response !== "string") this.response = "" + this.response;
    this.navigate();
  }

  get recordIdStr() {
    return this.recordIds ? this.recordIds.join(",") : null;
  }

  navigate() {
    if (this.availableActions.find((action) => action === "FINISH")) {
      this.dispatchEvent(new FlowNavigationFinishEvent());
    } else if (this.availableActions.find((action) => action === "NEXT")) {
      this.dispatchEvent(new FlowNavigationNextEvent());
    }
  }
}
