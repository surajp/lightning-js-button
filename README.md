# Pure JS Button in Lightning

JS buttons are back in Lightning! For now, at least. And they are even more powerful than JS buttons in classic, in some respects. SOQL and DML statements supported!

### The Setup

The button can be made available to users via a quick action powered by the `jsButtonQuickAction` component. The actual JavaScript should be entered into a `JS_Button__mdt` custom metadata record, into the `Script__c` field with the same name as the name of the SObject. The repo contains a couple of samples for Account and Contact. The corollary is that, out of the box, only one button per SObjecttype may be supported. 

### The Syntax

This is the fun part. The syntax is quite permissive, with some restrictions, which I will cover below. I haven't, obviously, explored all possible scenarios and the information may still be incomplete. Please raise an issue if you come across something I haven't covered.

* Simple examples (no soql/dml)

```javascript 
alert('hello,world');
```

```javascript
alert(Array(5).fill(0).map((e,i)=>'Hello, '+i));
```

* Fetch 10 of the 100 latest Accounts without a Contact and add a Contact to each of them

```javascript 
let accts=|| Select Name,(Select Id from Contacts) from Account order by createddate desc limit 100 ||;
let contacts = accts.filter((a)=>!a.Contacts || a.Contacts.length===0).slice(0,10).map((a)=>({LastName: a.Name+'-Contact', AccountId: a.Id}));
let contactIds = || insert Contact(contacts) ||; /*Note how the SObjectType has been specified. This is required for insert and upsert*/
$A.get('e.force:refreshView').fire(); /* $A is supported!*/
```

* Act in the context of the current record

```javascript
let acct = || Select NumberOfEmployees from Account where Id='${recordId}' ||;
acct[0].NumberOfEmployees = (acct[0].NumberOfEmployees || 0) + 10;
let acctId = || update acct ||;
acct = || Select NumberOfEmployees from Account where Id='${acctId}' ||;
alert(acct[0].NumberOfEmployees);
$A.get('e.force:refreshView').fire();
```

### About the Syntax

* Note how the syntax is linear for SOQL and DML. Coupled with JavaScript's support for manipulating arrays, this makes it easier to manipulate data, even compared to Apex in several instances.
* SOQL and DML statements must be enclosed in `||`. Semi-colon can be inside or outside the `||`
* Upsert and Update statements must be qualified with the SObjectType thus `|| insert Account(accts) ||;`
* SOQL statements are parsed using template literals. Any arguments should follow the appropriate syntax `${argument}`
* SOQL and DML statements may not be wrapped in a function.

### Known Limitations

* Support for delete has been intentionally withheld.
* Single-line comments are not supported. 
* Haven't tested DML with date, datetime, boolean, geolocation and other compound fields. I will update this section as I do so.
* Explicit use of async/await, Promises and Generators is not supported, atm.
* DML on Files, Attachments, Documents, etc. is not supported

### For Developers: Extending to more than one Button per SObjectType

If you need more than one button on an SObjectType, you may create a lightning component quickAction with the name of the custom metadata record containing your JS passed in to the `jsButton` child component. You will also need to implement an `init` method to invoke the controller method in `jsButton`. Refer to the `jsButtonQuickAction` component for implementation details

