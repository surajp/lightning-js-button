({
  /*
  regexp: {
    SOQL: new RegExp(/\|\|\s?(select\s+[^|]+)\s?\|\|/, "gi")
  },
    */
  REGEX_SOQL: "\\|\\|\\s?(select\\s+[^|]+)\\s?\\|\\|",
  REGEX_UPDATE: "\\|\\|\\s?update\\s([^|;]+);?\\s*\\|\\|",
  REGEX_INSERT_UPSERT:
    "\\|\\|\\s?(insert|upsert)\\s([\\w\\d_]+)\\s?\\(\\s?(\\w+).*\\|\\|",

  callApexAction: function (component, action) {
    return new Promise(
      $A.getCallback((resolve, reject) => {
        action.setCallback(this, (result) => {
          if (component.isValid() && result.getState() === "SUCCESS") {
            resolve(result.getReturnValue());
          } else {
            reject(
              result.getError() ? result.getError()[0].message : "Unknown error"
            );
          }
        });
        $A.enqueueAction(action);
      })
    );
  },

  runJS: function (component, resolve, reject) {
    let helper = this;
    let recordId = component.get("v.recordId");
    let js = component.get("v.js");
    //replace consecutive spaces
    js = js.replace(/\s+/g, " ");

    //parse soql
    js = js.replace(
      new RegExp(helper.REGEX_SOQL, "gi"),
      "await helper.executeSoql(cmp,`$1`);"
    );

    //parse updates
    js = js.replace(
      new RegExp(helper.REGEX_UPDATE, "gi"),
      "await helper.executeDml(cmp,'update',$1);"
    );

    //parse inserts
    js = js.replace(
      new RegExp(helper.REGEX_INSERT_UPSERT, "gi"),
      "await helper.executeDml(cmp,'$1',$3,'$2');"
    );

    Function(
      "recordId",
      "cmp",
      "helper",
      `return (async (recordId,cmp,helper)=>{${js}})(recordId,cmp,helper)`
    )(recordId, component, helper)
      .then((op) => {
        if (Array.isArray(op)) {
          if (op[0] && typeof op[0] !== "string")
            op = op.map((row) => JSON.stringify(row));
          component.set("v.outputArray", op);
        } else component.set("v.output", op);
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  },

  fetchJSFromCmdt: function (cmp) {
    let helper = this;
    return new Promise(
      $A.getCallback((resolve, reject) => {
        let cmdtAction = cmp.get("c.getJSFromCmdt");
        cmdtAction.setParams({ cmdtName: cmp.get("v.cmdtName") });
        helper
          .callApexAction(cmp, cmdtAction)
          .then((js) => {
            cmp.set("v.js", js);
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      })
    );
  },

  executeSoql: function (cmp, soql) {
    return new Promise(
      $A.getCallback((resolve, reject) => {
        let soqlAction = cmp.get("c.executeSoqlQuery");
        soqlAction.setParams({ query: soql });
        soqlAction.setCallback(this, (result) => {
          resolve(result.getReturnValue());
        });
        $A.enqueueAction(soqlAction);
      })
    );
  },

  getSObjectType: function (cmp, record, sobjectType) {
    let helper = this;
    return new Promise(
      $A.getCallback((resolve, reject) => {
        if (!sobjectType) {
          let getSobjectTypeAction = cmp.get("c.getSObjectTypeFromId");
          getSobjectTypeAction.setParams({ recordId: record.Id });
          helper
            .callApexAction(cmp, getSobjectTypeAction)
            .then((type) => resolve(type))
            .catch((err) => reject(err));
        } else resolve(sobjectType);
      })
    );
  },

  executeDml: function (cmp, dmlType, records, sobjectType) {
    let helper = this;
    return new Promise(
      $A.getCallback((resolve, reject) => {
        if (!Array.isArray(records)) records = [records];
        helper
          .getSObjectType(cmp, records[0], sobjectType)
          .then((sobjectType) => {
            records.forEach((rec) =>
              Object.assign(rec, { attributes: { type: sobjectType } })
            );
            let dmlAction = cmp.get("c.executeDml");
            dmlAction.setParams({
              operation: dmlType,
              strData: sobjectType
                ? JSON.stringify(records, (k, v) =>
                    typeof v === "number" ? "" + v : v
                  )
                : null,
              sObjectType: sobjectType
            });
            helper
              .callApexAction(cmp, dmlAction)
              .then((res) => resolve(res))
              .catch((err) => reject(err));
          })
          .catch((err) => reject(err));
      })
    );
  }
});
