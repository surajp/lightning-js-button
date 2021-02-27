/* Create multiple accounts and related contacts in a single api call */
let accts = [],
  cntcs = [];
accts.push({ body: { Name: "Amazon", Industry: "E-commerce" }, referenceId: "Amazon" });
accts.push({ body: { Name: "Facebook", Industry: "Social Media" }, referenceId: "Facebook" });
accts.push({ body: { Name: "Google", Industry: "Search" }, referenceId: "Google" });
accts.push({ body: { Name: "Netflix", Industry: "Entertainment" }, referenceId: "Netflix" });

/* create one contact for each Account */
cntcs.push({
  body: {
    LastName: "Bezos",
    FirstName: "Jeff",
    Email: "bezos@amazon.example.com",
    Title: "CEO of Amazon",
    AccountId: "@{Amazon.id}"
  },
  referenceId: "Jeff"
});

cntcs.push({
  body: {
    LastName: "Zuckerberg",
    FirstName: "Marc",
    Email: "marc@facebook.example.com",
    Title: "CEO of Facebook",
    AccountId: "@{Facebook.id}"
  },
  referenceId: "Marc"
});

cntcs.push({
  body: {
    LastName: "Pichai",
    FirstName: "Sundar",
    Email: "pichai@google.example.com",
    Title: "CEO of Google",
    AccountId: "@{Google.id}"
  },
  referenceId: "Sundar"
});

cntcs.push({
  body: {
    LastName: "Hastings",
    FirstName: "Reed",
    Email: "reed@netflix.example.com",
    Title: "CEO of Netflix",
    AccountId: "@{Netflix.id}"
  },
  referenceId: "Reed"
});

/* create subrequests for Account and Contact by adding `method` and `url` properties */
accts = accts.map((a) => ({
  ...a,
  method: "POST",
  url: "/services/data/v51.0/sobjects/Account"
}));
cntcs = cntcs.map((c) => ({
  ...c,
  method: "POST",
  url: "/services/data/v51.0/sobjects/Contact"
}));

/*setup and make composite api request */
let compositeReq = { allOrNone: true, compositeRequest: [...accts, ...cntcs] };
let response = await sfapi(
  "/composite/" /*path excluding base url*/,
  "POST" /*method*/,
  {} /* additional headers */,
  JSON.stringify(compositeReq) /* request body */
);
alert(JSON.stringify(response));
