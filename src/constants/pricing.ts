import type { PlatformSettings } from "@/types";

export const subscriptionPlans = [
  { key: "insuranceOnlyPrice", label: "Insurance Only", modules: "Insurance" },
  { key: "roadTaxOnlyPrice", label: "Road Tax Only", modules: "Road Tax" },
  { key: "pucOnlyPrice", label: "PUC Only", modules: "PUC" },
  { key: "taxPucPrice", label: "Tax + PUC", modules: "Road Tax + PUC" },
  { key: "insuranceTaxPrice", label: "Insurance + Tax", modules: "Insurance + Road Tax" },
  { key: "insurancePucPrice", label: "Insurance + PUC", modules: "Insurance + PUC" },
  {
    key: "allModulesPrice",
    label: "All 3 Modules",
    modules: "Insurance + Road Tax + PUC",
  },
] as const satisfies readonly {
  key: keyof PlatformSettings;
  label: string;
  modules: string;
}[];

export type PricingKey = (typeof subscriptionPlans)[number]["key"];

export function isPricingKey(value: string | null): value is PricingKey {
  return subscriptionPlans.some((plan) => plan.key === value);
}
