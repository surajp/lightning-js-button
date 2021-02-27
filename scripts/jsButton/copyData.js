/***
 * This script moves Account, Contact and Opportunity data from a source instance to the current SF instance.
 * The source instance is expected to be configured using a named credential named 'source'
 */
let baseurl = "callout:source/services/data/v48.0/query?q=";
let resp = await callout(baseurl + "Select+Id,Name+from+Account", "GET", {
  Accept: "application/json"
});
resp = JSON.parse(resp.body);

if (!resp.done) {
  toast("Request to fetch Accounts failed", "error");
}
let accts = resp.records;
resp = await callout(baseurl + "Select+Id,LastName,FirstName,Email,AccountId+from+Contact", "GET", {
  Accept: "application/json"
});
resp = JSON.parse(resp.body);
if (!resp.done) {
  toast("Request to fetch Contacts failed", "error");
}
let contacts = resp.records;

resp = await callout(baseurl + "Select+Id,Name,CloseDate,StageName,AccountId,ContactId+from+Opportunity", "GET", {
  Accept: "application/json"
});
resp = JSON.parse(resp.body);
if (!resp.done) {
  toast("Request to fetch Opportunities failed", "error");
}
let opps = resp.records;

let acctsToInsert = accts.map((a) => {
  let b = { ...a };
  delete b.Id;
  delete b.attributes;
  return b;
});

let newAcctIds = [];
try {
  newAcctIds = await dml.insert(acctsToInsert, "Account");
} catch (err) {
  toast(JSON.stringify(err), "error");
}
let acctIdMap = accts.reduce((obj, a, i) => ({ ...obj, [a.Id]: newAcctIds[i] }), {});

let contactsToInsert = contacts
  .map((c) => {
    let d = { ...c, AccountId: acctIdMap[c.AccountId] };
    delete d.Id;
    delete d.attributes;
    return d;
  })
  .filter((c) => c.AccountId);

let newCtctIds = [];
try {
  newCtctIds = await dml.insert(contactsToInsert, "Contact");
} catch (err) {
  toast(JSON.stringify(err), "error");
}
let ctctIdMap = contacts.reduce((obj, c, i) => ({ ...obj, [c.Id]: newCtctIds[i] }), {});

let oppsToInsert = opps
  .map((o) => {
    let p = {
      ...o,
      AccountId: acctIdMap[o.AccountId],
      ContactId: ctctIdMap[o.ContactId]
    };
    delete p.Id;
    delete p.attributes;
    return p;
  })
  .filter((o) => o.AccountId);

let newOppIds = [];
try {
  newOppIds = dml.insert(oppsToInsert, "Opportunity");
} catch (err) {
  toast(JSON.stringify(err), "error");
}
toast("Data transfer complete", "success");
