let records = [];
for (let i = 0; i < 10; i++) {
  let contact = undefined;
  try {
    contact = JSON.parse((await callout("callout:random_user/api")).body);
  } catch (err) {
    toast(err.body.message, "error");
  }
  let record = {
    FirstName: contact.results[0].name.first,
    LastName: contact.results[0].name.last,
    Email: contact.results[0].email,
    Phone: contact.results[0].phone,
    AccountId: recordId
  };
  records.push(record);
}
await dml("insert", records, "Contact");
$A.get("e.force:refreshView").fire();
