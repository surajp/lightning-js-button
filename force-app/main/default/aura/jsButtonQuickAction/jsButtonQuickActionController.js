({
  doInit: function (component) {
    component
      .find("quickActionAPI")
      .getSelectedActions()
      .then((resp) => {
        console.log("quick action name ", resp.actions[0].actionName);
        component.set("v.cmdtName", resp.actions[0].actionName);
        return Promise.resolve(true); // this ensures the attribute value is set in the markup before we invoke the js button
      })
      .catch((err) => console.error("Getting quick action name failed", err))
      .then(() => component.find("jsbutton").invoke())
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
});
