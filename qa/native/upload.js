import { data } from "./services";
export async function uploadPhoto() {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  if (data.scenario === "upload-error") throw new Error("QA fixture offline");
  return "qa-asset";
}
