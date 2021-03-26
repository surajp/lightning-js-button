({
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
});
