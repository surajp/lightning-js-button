let records = [];
for (let i = 0; i < 10; i++) {
  let contact = undefined;
  try {
    contact = await (
      await fetch("https://randomuser.me/api/", {
        headers: { "Content-Type": "application/json" }
      })
    ).json();
  } catch (err) {
    toast(err, "error");
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
await dml.insert(records, "Contact");
toast("Contacts created", "success");
$A.get("e.force:refreshView").fire();
