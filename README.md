# Pure JS Buttons in Lightning

JS buttons are back in Lightning! (For now, at least) And they are even more powerful than JS buttons in classic. Run SOQL and DML statements seamlessly. Make callouts to APIs, including Salesforce APIs using named credentials directly from JavaScript! This would allow you to build buttons that do amazing things, just using JavaScript. Check out the `scripts` folder for examples. Feel free to raise a PR to contribute your own scripts.

### The Setup

The button can be made available to users via a quick action powered by the `jsButtonQuickAction` component. The actual JavaScript should be entered into a `JS_Button__mdt` custom metadata record, into the `Script__c` field with the same name as the name of the SObject. The repo contains a couple of samples for `Account` and `Contact`. The corollary is that, out of the box, only one button per SObjectType may be supported, for quick actions. You can add any number of buttons on the flexipage, with the underlying JS added using the flexipage builder.

### APIs

The library supports the following apis

* soql
* dml
* callout
* sfapi
* toast

### The Syntax

This is the fun part. I haven't, obviously, explored all possible scenarios and the information may still be incomplete. Please raise an issue if you come across something I haven't covered.

* Simple examples (no soql/dml)

```js

alert('hello,world');
```

```js
toast(Array(5).fill(0).map((e,i)=>'Hello, '+i)); /* `toast` service to show message toasts */
```

* Fetch 10 of the 100 latest Accounts without a Contact and add a Contact to each of them

```js
let accts= await soql(`Select Name,(Select Id from Contacts) from Account order by createddate desc limit 100`); /* Querying child records is supported */
let contacts = accts.filter((a)=>!a.Contacts || a.Contacts.length===0)
                    .slice(0,10)
                    .map((a)=>({LastName: a.Name+'-Contact', AccountId: a.Id}));
let contactIds = await dml("insert", contacts,"Contact") ; /*Note how the SObjectType has been specified. This is required for insert and upsert*/
$A.get('e.force:refreshView').fire(); /* $A is supported!*/
```

* Act in the context of the current record

```js
let acct = await soql(`Select NumberOfEmployees from Account where Id='${recordId}'`); /* Note the use of template literal syntax to resolve variable values in the query */
acct[0].NumberOfEmployees = (acct[0].NumberOfEmployees || 0) + 10;
let acctId = await dml("update",acct);
acct = await soql(`Select NumberOfEmployees from Account where Id='${acctId}'`);
toast(acct[0].NumberOfEmployees,"success");
$A.get('e.force:refreshView').fire();
```

### About the Syntax

* Note how the syntax is linear for SOQL and DML. Coupled with JavaScript's support for manipulating arrays, this makes it easier to manipulate data, even compared to Apex in several instances.
* `Insert` and `upsert` statements must be qualified with the SObjectType thus `dml("insert",acct,"Account")`
* SOQL statements are parsed using template literals. Any arguments should follow the appropriate syntax `${argument}`
* SOQL and DML statements may not be wrapped in a function.
* All statements must be strictly terminated by a semicolon.

### Known Limitations

* Single-line comments are not supported. 
* Haven't tested DML with date, datetime, boolean, geolocation and other compound fields. I will update this section as I do so.
* SOQL and DML statements should be enclosed in async functions, if they are required to be contained in functions. The program automatically adds `await` to SOQL and DML statements
* Inserting `ContentVersion` is supported. Make sure to set `VersionData` to base64 data.

### Using Salesforce (and other) APIs in your script

You can use any of Salesforce's APIs (REST, Tooling, Metadata) by setting up a named credential for your own Salesforce instance. This allows you to write scripts for admins to perform tasks like [deleting inactive versions of flows](scripts/jsButton/deleteInactiveFlowVersions.js), or [creating new JS Buttons](scripts/jsButton/createNewJSButton.js)! You can also use named credentials to interact with other APIs as well, of course. Although, for Public APIs, you can just use `fetch` directly. The Salesforce named credential set up would need to have the following scopes (api refresh_token offline_access web). You would need to set up your own Connected App and a Salesforce Auth. Provider that uses this connected app.
