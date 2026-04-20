// Lead qualification logic
import { getService } from "./servicesData";

export function qualifyLead(data) {
  if (!data.is_homeowner) {
    return { qualified: false, reason: "Not the homeowner" };
  }
  if (!data.is_residential) {
    return { qualified: false, reason: "Non-residential property" };
  }
  if (data.timeline === "researching") {
    return { qualified: false, reason: "Just researching — no immediate project" };
  }
  const service = getService(data.service);
  if (service) {
    const budgetOpt = service.budgetOptions.find(b => b.value === data.budget);
    if (budgetOpt && !budgetOpt.qualified) {
      return { qualified: false, reason: "Budget below minimum for this service" };
    }
  }
  if (!/^\d{5}$/.test(data.zip_code || "")) {
    return { qualified: false, reason: "Invalid ZIP code" };
  }
  return { qualified: true, reason: "" };
}