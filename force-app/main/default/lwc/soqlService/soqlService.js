import executeSoql from "@salesforce/apex/DynamicSOQLDMLController.executeSoqlQuery";
import toast from "c/toastService";

export default async function soql(query) {
  try {
    let results = await executeSoql({ query });
    return results;
  } catch (err) {
    toast(err, "error");
  }
  return null;
}
