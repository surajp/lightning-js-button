public with sharing class DynamicSOQLDMLController {
  @AuraEnabled
  public static SObject[] executeSoqlQuery(String query) {
    return Database.query(query);
  }

  @AuraEnabled(cacheable=true)
  public static String getJSFromCmdt(String cmdtName) {
    JS_Button__mdt[] jsButton = [
      SELECT Script__c
      FROM JS_Button__mdt
      WHERE DeveloperName = :cmdtName
      LIMIT 1
    ];
    if (jsButton.size() == 1)
      return jsButton[0].Script__c;
    else
      return '';
  }

  @AuraEnabled(cacheable=true)
  public static String getSObjectTypeFromId(Id recordId) {
    return recordId.getSObjectType().getDescribe().getName();
  }

  @AuraEnabled
  public static Id[] executeDml(
    String operation,
    String strData,
    String sObjectType
  ) {
    SObject[] records = (SObject[]) JSON.deserialize(
      strData,
      Type.forName('List<' + sObjectType + '>')
    );
    if (operation == 'insert') {
      insert records;
      return new List<Id>(new Map<Id, SObject>(records).keySet());
    } else if (operation == 'update') {
      update records;
      return new List<Id>(new Map<Id, SObject>(records).keySet());
    } else if (operation == 'upsert') {
      upsert records;
      return new List<Id>(new Map<Id, SObject>(records).keySet());
    }
    return null;
  }
}
