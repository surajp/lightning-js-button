import executeDml from "@salesforce/apex/DynamicSOQLDMLController.executeDml";
import getSObjectType from "@salesforce/apex/DynamicSOQLDMLController.getSObjectTypeFromId";
import toast from "c/toastService";

export default async function dml(dmlType, records, sObjectType) {
  try {
    if (records && !Array.isArray(records)) {
      records = [records];
    }
    if (!sObjectType)
      sObjectType = await getSObjectType({ recordId: records[0].Id });
    records = records.map((rec) => ({
      ...rec,
      attributes: { type: sObjectType }
    }));
    let results = executeDml({
      operation: dmlType,
      strData: sObjectType
        ? JSON.stringify(records, (k, v) => {
            return typeof v === "number" ? "" + v : v;
          })
        : null,
      sObjectType
    });
    return results;
  } catch (err) {
    toast(err, "error");
  }
  return null;
}
