/**
 ** description: Controller for making api calls and sending the response back
 **/

public with sharing class APICallController {
  @AuraEnabled
  public static HttpResponseWrapper makeApiCall(
    String endPoint,
    String method,
    String bodyStr,
    Map<String, String> headers
  ) {
    HttpRequest req = new HttpRequest();
    req.setEndpoint(endPoint);
    req.setMethod(method);
    if (method != 'GET') {
      req.setBody(bodyStr);
    }
    if (headers != null) {
      for (String key : headers.keySet()) {
        req.setHeader(key, headers.get(key));
      }
    }
    HttpResponse resp = new Http().send(req);
    Map<String, String> respHeaders = new Map<String, String>();
    for (String key : resp.getHeaderKeys()) {
      respHeaders.put(key, String.valueOf(resp.getHeader(key)));
    }
    return new HttpResponseWrapper(resp.getBody(), resp.getStatusCode(), respHeaders);
  }
}
