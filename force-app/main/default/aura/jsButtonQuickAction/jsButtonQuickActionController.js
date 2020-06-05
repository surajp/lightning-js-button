({
  doInit: function (component) {
    component
      .find("jsbutton")
      .invoke()
      .then(
        $A.getCallback((resp) => {
          console.log('>> resp '+JSON.stringify(resp));
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
