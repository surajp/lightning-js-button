/* Creates 5 files related to the current Contact record */
let con = await soql(`select LastName from Contact where Id='${recordId}'`);
let files = Array(5)
  .fill(0)
  .map((e, i) => ({
    VersionData: btoa(con[0].LastName + "-" + i),
    PathOnClient: "file.txt",
    Title: con[0].LastName + "-File-" + i
  }));
let fileIds = await dml.insert(files, "ContentVersion");
let fileIdStr = fileIds.join("','");
let docIds = await soql(`select ContentDocumentId from ContentVersion where Id in ('${fileIdStr}')`);
let linkedEntities = docIds.map((e, i) => ({
  LinkedEntityId: recordId,
  ContentDocumentId: e.ContentDocumentId
}));
await dml.insert(linkedEntities, "ContentDocumentLink");
toast("done", "success");
