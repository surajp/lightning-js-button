import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default function toast(message, variant = "info") {
  document.body.dispatchEvent(new ShowToastEvent({ message, variant }));
}
