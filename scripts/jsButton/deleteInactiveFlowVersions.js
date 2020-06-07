try {
  this.httpRequest.setEndpoint(
    "callout:salesforce/services/data/v48.0/tooling/query/?q=Select+Id,FullName+from+Flow+where+status+!=+'Active'"
  );

  let resp = await this.httpRequest.send();
  let respJson = JSON.parse(resp.body);

  let results = await Promise.all(
    respJson.records.map(async (rec) => {
      this.httpRequest.clear();
      let flowId = rec.Id;
      this.httpRequest.setEndpoint(
        "callout:salesforce/services/data/v48.0/tooling/sobjects/Flow/" + flowId + "/"
      );
      this.httpRequest.setMethod("DELETE");
      resp = await this.httpRequest.send();
      return resp.statusCode;
    })
  );

  alert(results);
} catch (e) {
  alert(JSON.stringify(e));
}
