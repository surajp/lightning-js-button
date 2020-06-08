try {
  let cmpName = prompt(
    "Enter the name for your aura bundle. This will be the name of the custom metadata record backing this bundle as well"
  );

  if (!cmpName) return;

  this.httpRequest.setEndpoint(
    "callout:salesforce/services/data/v48.0/tooling/sobjects/AuraDefinitionBundle/"
  );

  this.httpRequest.setMethod("POST");

  this.httpRequest.addHeader("Content-Type", "application/json");

  this.httpRequest.setBody({
    MasterLabel: cmpName,
    Description: "created by js button",
    ApiVersion: 48.0,
    DeveloperName: cmpName
  });

  let resp = await this.httpRequest.send();

  let auraBundleId = JSON.parse(resp.body).id;

  alert(auraBundleId);

  this.httpRequest.clear();

  this.httpRequest.setEndpoint(
    "callout:salesforce/services/data/v48.0/tooling/sobjects/AuraDefinition/"
  );

  this.httpRequest.setMethod("POST");
  this.httpRequest.addHeader("Content-Type", "application/json");

  let source = ` <aura:component implements="force:lightningQuickActionWithoutHeader,force:hasRecordId,force:hasSObjectName">
  <c:jsButtonLwc
  aura:id="jsbutton"
  recordId="{!v.recordId}"
  cmdtName="${cmpName}"
  oninitcomplete="{!c.doInit}"
  ></c:jsButtonLwc>
  </aura:component>`;

  this.httpRequest.setBody({
    AuraDefinitionBundleId: auraBundleId,
    DefType: "COMPONENT",
    Format: "XML",
    Source: source
  });

  resp = await this.httpRequest.send();

  alert(resp.statusCode);

  source = ` ({
  doInit: function (component) {
  component
  .find("jsbutton")
  .invoke()
  .then(
  $A.getCallback((resp) => {
  $A.get("e.force:closeQuickAction").fire();
  })
  )
  .catch(
  $A.getCallback((err) => {
  $A.get("e.force:closeQuickAction").fire();
  })
  );
  }
  });`;

  this.httpRequest.setBody({
    AuraDefinitionBundleId: auraBundleId,
    DefType: "CONTROLLER",
    Format: "JS",
    Source: source
  });

  resp = await this.httpRequest.send();

  alert(resp.statusCode);
} catch (e) {
  alert(JSON.stringify(e));
}
