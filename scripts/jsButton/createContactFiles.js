/* Creates 5 files related to the current Contact record */
let con = await soql(`select LastName from Contact where Id='${recordId}'`);
let files = Array(5)
  .fill(0)
  .map((e, i) => ({
    VersionData: btoa(con[0].LastName + "-" + i),
    PathOnClient: "file.txt",
    Title: con[0].LastName + "-File-" + i,
    FirstPublishLocationId: recordId
  }));
let fileIds = await dml.insert(files, "ContentVersion");
toast("done", "success");
