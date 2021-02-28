/* Go to https://cors-anywhere.herokuapp.com/ and request access to the demo for the below `fetch` statement to work */
/* Also add https://cors-anywhere.herokuapp.com/ to CSP trusted sites list */
let respBlob = await fetch(
  "https://cors-anywhere.herokuapp.com/https://www.eurofound.europa.eu/sites/default/files/ef_publication/field_ef_document/ef1663en.pdf"
).then((resp) => resp.blob());

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        let base64data = reader.result;
        debugger;
        resolve(base64data.substring(base64data.indexOf(",") + 1));
      };
    } catch (e) {
      reject(e);
    }
  });
};

let base64data = await blobToBase64(respBlob);
let cv = [
  {
    Title: "SF.pdf",
    VersionData: base64data,
    PathOnClient: "Salesforce.pdf",
    FirstPublishLocationId: recordId
  }
];
let fileIds = await dml.insert(cv, "ContentVersion");
console.log("file ids", fileIds);
toast("File added", "success");
$A.get("e.force:refreshView").fire();
