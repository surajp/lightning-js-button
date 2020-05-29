({
  doInit: function (component, event, helper) {
    component
      .find("jsbutton")
      .invoke()
      .then(
        $A.getCallback(() => {
          $A.get("e.force:closeQuickAction").fire();
        })
      )
      .catch(
        $A.getCallback((err) => {
          alert("An error occurred " + err);
          $A.get("e.force:closeQuickAction").fire();
        })
      );
  }
});
