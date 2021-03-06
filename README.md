# Pure JS Buttons in Lightning

JS buttons are back in Lightning! (For now, at least) And they are even more
powerful than JS buttons in classic. Run SOQL and DML statements seamlessly.
Make callouts to APIs, including Salesforce APIs directly from JavaScript!
This would allow you to build buttons that do amazing things, just using
JavaScript. Check out the [scripts](./scripts/jsButton) folder for examples.
Feel free to raise a PR to contribute your own scripts.

### The Setup

The button can be made available to users via a quick action powered by the
`jsButtonQuickAction` component. The actual JavaScript should be entered into a
`JS_Button__mdt` custom metadata record, into the `Script__c` field with the
same name as the name of the SObject. The repo contains a couple of samples
for `Account` and `Contact`. The corollary is that, out of the box, only one
button per SObjectType may be supported, for quick actions. You can add any
number of buttons on the flexipage, with the underlying JS added using the
flexipage builder.

### APIs

The library supports the following apis

- soql
- dml (dml.insert, dml.update, dml.upsert and dml.del ) // `delete` is a resrved keyword :(
- callout ( used for calling external services through Apex. Named credentials are supported! )
- sfapi ( used for calling Salesforce APIs from the same org. Requires CORS and
  CSP Trusted Sites setup. Details below)
- toast ( show a platform toast message )

### The Syntax

This is the fun part. I haven't, obviously, explored all possible scenarios and
the information may still be incomplete. Please raise an issue if you come
across something I haven't covered.

- Simple examples (no soql/dml)

```js
alert("hello,world");
```

```js
toast(
  Array(5)
    .fill(0)
    .map((e, i) => "Hello, " + i)
); /* `toast` service to show message toasts */
```

- Fetch 100 of the latest Accounts and for upto 10 of the ones without a Contact, add a Contact

```js
let accts = await soql(
  `Select Name,(Select Id from Contacts) from Account order by createddate desc
  limit 100`
); /* Querying child records is supported */
let contacts = accts
  .filter((a) => !a.Contacts || a.Contacts.length === 0)
  .slice(0, 10)
  .map((a) => ({ LastName: a.Name + "-Contact", AccountId: a.Id }));
let contactIds = await dml.insert(
  contacts,
  "Contact"
); /*Note how the SObjectType has been specified. This is required for insert and upsert*/
$A.get("e.force:refreshView").fire(); /* $A is supported!*/
```

- Act in the context of the current record

```js
let acct = await soql(
  `Select NumberOfEmployees from Account where Id='${recordId}'`
); /* Note the use of template literal syntax to resolve 
variable values in the query */
acct[0].NumberOfEmployees = (acct[0].NumberOfEmployees || 0) + 10;
let acctId = await dml.update(acct);
acct = await soql(`Select NumberOfEmployees from Account where Id='${acctId}'`);
toast(acct[0].NumberOfEmployees, "success");
$A.get("e.force:refreshView").fire();
```

- Add a 'File' to the current record

```js
let fileContent = btoa("Hello World");
/* convert your file content to base64 data before uploading */
let cv = {
  VersionData: fileContent,
  Title: "My Awesome File",
  PathOnClient: "MyFile.txt",
  FirstPublishLocationId: recordId
};
let cvId = await dml.insert(cv, "ContentVersion");
toast("New file Added", "success");
$A.get("e.force:refreshView").fire();
```

### About the Syntax

- Note how the syntax is linear for SOQL and DML. Coupled with JavaScript's
  support for manipulating arrays, this makes it easier to manipulate data,
  even compared to Apex in several instances.
- `dml.insert` and `dml.upsert` expect the SObjectType as the second argument.
  Thus `dml.insert(acct,"Account")`
- Statements with contextual arguments such as `recordId`
  are best expressed using [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).
- All statements must be strictly terminated by a semicolon.

### Known Limitations

- Single-line comments are not supported.
- Haven't tested DML with date, datetime, boolean, geolocation and other
  compound fields. I will update this section as I do so.
- To insert `ContentVersion` make sure to set `VersionData` to base64 data.
  Refer to the example [here](./scripts/jsButton/createContactFiles.js) for details.
- The maximum size of files I was able to upload was around 2 MB.
  Anything larger will fail silently due to heap size limits in Apex

### Using Salesforce (and other) APIs in your script

To use Salesforce APIs from your org, using the `sfapi` method, take the following steps:

- Add your lightning domain (ends with `lightning.force.com`) to the `CORS` list under `Setup`.
- Add your classic domain to `CSP Trusted Sites` list under `Setup`.

This allows you to write scripts for admins to perform tasks like [deleting inactive versions of flows](./scripts/jsButton/deleteInactiveFlowVersions.js) or [use composite api](./scripts/jsButton/compositeApiExample.js)
for creating parent and child records.
To access protected APIs such as those from other Salesforce orgs, use a named credential and the `callout` api. For Public APIs, you can use `fetch` directly.
