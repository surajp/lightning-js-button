/************************************************************

*** Copyright (c) Vertex Computer Systems Inc. All rights reserved.

*** @author Suraj Pillai
*** @group Controller
*** @date 01/2021
*** @description Get API-ready session id of the current users
*** 
**/
public with sharing class GetSessionIdController {
  @AuraEnabled(cacheable=true)
  /****
   ** @description Returns the current user's session id that may be used for calling Salesforce APIs
   ** @return the current user's api-ready session id
   **/
  public static String getSessionId() {
    return (new PageReference('GetSessionId').getContent()).toString();
  }
}
