  /***
   * This script moves Account, Contact and Opportunity data from a source instance to the current SF instance.
   * The source instance is expected to be configured using a named credential named 'source'
   */
  let baseurl = "callout:source/services/data/v48.0/query?q=";
  this.httpRequest.setEndpoint(baseurl + "Select+Id,Name+from+Account");
  this.httpRequest.addHeader("Accept", "application/json");
  let resp = await this.httpRequest.send();
  resp = JSON.parse(resp.body);

  if (!resp.done) {
    alert("Request to fetch Accounts failed");
  }
  let accts = resp.records;
  this.httpRequest.setEndpoint(
    baseurl + "Select+Id,LastName,FirstName,Email,AccountId+from+Contact"
  );
  resp = await this.httpRequest.send();
  resp = JSON.parse(resp.body);
  if (!resp.done) {
    alert("Request to fetch Contacts failed");
  }
  let contacts = resp.records;

  this.httpRequest.setEndpoint(
    baseurl +
      "Select+Id,Name,CloseDate,StageName,AccountId,ContactId+from+Opportunity"
  );
  resp = await this.httpRequest.send();
  resp = JSON.parse(resp.body);
  if (!resp.done) {
    alert("Request to fetch Opportunities failed");
  }
  let opps = resp.records;

  let acctsToInsert = accts.map((a) => {
    let b = { ...a };
    delete b.Id;
    delete b.attributes;
    return b;
  });

  let newAcctIds=[];
  try{
    newAcctIds = || insert Account(acctsToInsert) ||;
  }catch(err){
    alert(JSON.stringify(err));
  }
  let acctIdMap = accts.reduce(
    (obj, a, i) => ({ ...obj, [a.Id]: newAcctIds[i] }),
    {}
  );

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
    newCtctIds = || insert Contact(contactsToInsert) ||;
  } catch (err) {
    alert(JSON.stringify(err));
  }
  let ctctIdMap = contacts.reduce(
    (obj, c, i) => ({ ...obj, [c.Id]: newCtctIds[i] }),
    {}
  );

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
    newOppIds = || insert Opportunity(oppsToInsert) ||;
  } catch (err) {
    alert(JSON.stringify(err));
  }
  alert('Data transfer complete');
