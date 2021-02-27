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
        } else if (js) {
          helper.runJS(component, resolve, reject);
        }
      })
    );
  }
});
