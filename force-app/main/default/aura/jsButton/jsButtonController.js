({
  invoke: function (component, event, helper) {
    return new Promise(
      $A.getCallback((resolve, reject) => {
        let js = component.get("v.js");
        if (!js && component.get("v.cmdtName")) {
          helper
            .fetchJSFromCmdt(component)
            .then(() => {
              helper.runJS(component, resolve, reject);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          helper.runJS(component, resolve, reject);
        }
      })
    );
  }
});
