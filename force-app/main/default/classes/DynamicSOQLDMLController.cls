public with sharing class DynamicSOQLDMLController {
  /**
   * Execute a Soql Query
   * @param query The soql query to execute
   *
   * @return SObject[]
   **/
  @AuraEnabled
  public static SObject[] executeSoqlQuery(String query) {
    return Database.query(query);
  }

  /**
   * Get JavaScript from a Custom Metadata with a given name
   * @param cmdtName The name of Custom Metadata record to fetch the script from
   *
   * @return String
   **/
  @AuraEnabled(cacheable=true)
  public static String getJSFromCmdt(String cmdtName) {
    JS_Button__mdt[] jsButton = [SELECT Script__c FROM JS_Button__mdt WHERE DeveloperName = :cmdtName LIMIT 1];
    if (jsButton.size() == 1)
      return jsButton[0].Script__c;
    else
      return '';
  }

  /**
   * Short Description
   * @param recordId Get the SObject Type given a record Id
   *
   * @return String
   **/
  @AuraEnabled(cacheable=true)
  public static String getSObjectTypeFromId(Id recordId) {
    return recordId.getSObjectType().getDescribe().getName();
  }

  /**
   * Execute a DML statement
   * @param operation 'Insert','Update' or 'Upsert'
   * @param strdata The records to update, stringified
   * @param sobjectType The SObject type to perform the DML on
   *
   * @return Id[]
   **/
  @AuraEnabled
  public static Id[] executeDml(String operation, String strData, String sObjectType) {
    SObject[] records = (SObject[]) JSON.deserialize(strData, Type.forName('List<' + sObjectType + '>'));
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
