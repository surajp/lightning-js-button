import getSessionId from "@salesforce/apex/GetSessionIdController.getSessionId";

export default async function sfapi(
  endPoint,
  method = "GET",
  headers = { "Content-Type": "application/json" },
  body = null
) {
  const sessionId = await getSessionId();
  headers = Object.extend(headers, {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionId}`
  });
  const result = await fetch(endPoint, {
    method,
    body,
    headers
  });
  return result;
}
