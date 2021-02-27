try {
  let resp = await callout(
    "callout:salesforce/services/data/v50.0/tooling/query/?q=Select+Id,FullName+from+Flow+where+status+!=+'Active'"
  );
  let respJson = JSON.parse(resp.body);

  let results = await Promise.all(
    respJson.records.map(async (rec) => {
      let flowId = rec.Id;
      resp = await callout(
        "callout:salesforce/services/data/v50.0/tooling/sobjects/Flow/" +
          flowId +
          "/",
        "DELETE"
      );
      return resp.statusCode;
    })
  );

  toast(JSON.stringify(results), "success");
} catch (e) {
  toast(JSON.stringify(e), "error");
}
