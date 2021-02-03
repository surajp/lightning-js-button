try {
  let cmpName = prompt(
    "Enter the name for your aura bundle. This will be the name of the custom metadata record backing this bundle as well"
  );
  if (!cmpName) return;
  let body = {
    MasterLabel: cmpName,
    Description: "created by js button",
    ApiVersion: 48.0,
    DeveloperName: cmpName
  };
  let resp = await callout(
    "callout:salesforce/services/data/v48.0/tooling/sobjects/AuraDefinitionBundle/",
    "POST",
    { "Content-Type": "application/json" },
    body
  );
  let auraBundleId = JSON.parse(resp.body).id;
  alert(auraBundleId);
  let source = ` <aura:component implements="force:lightningQuickActionWithoutHeader,force:hasRecordId,force:hasSObjectName"> <c:jsButtonLwc aura:id="jsbutton" recordId="{!v.recordId}" cmdtName="${cmpName}" oninitcomplete="{!c.doInit}" ></c:jsButtonLwc> </aura:component>`;
  body = {
    AuraDefinitionBundleId: auraBundleId,
    DefType: "COMPONENT",
    Format: "XML",
    Source: source
  };
  resp = await callout(
    "callout:salesforce/services/data/v48.0/tooling/sobjects/AuraDefinition/",
    "POST",
    { "Content-Type": "application/json" },
    body
  );
  alert(resp.statusCode);
  source = ` ({ doInit: function (component) { component .find("jsbutton") .invoke() .then( $A.getCallback((resp) => { $A.get("e.force:closeQuickAction").fire(); })) .catch( $A.getCallback((err) => { $A.get("e.force:closeQuickAction").fire(); })); } });`;
  body = {
    AuraDefinitionBundleId: auraBundleId,
    DefType: "CONTROLLER",
    Format: "JS",
    Source: source
  };
  resp = await callout(
    "callout:salesforce/services/data/v48.0/tooling/sobjects/AuraDefinition/",
    "POST",
    { "Content-Type": "application/json" },
    body
  );
  toast(resp.statusCode, "success");
} catch (e) {
  toast(JSON.stringify(e), "error");
}
