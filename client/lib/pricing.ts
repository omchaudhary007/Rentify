import type { Subcategory } from "@/types/category";

export const RENTAL_PLANS = [
  { key: "monthPercent", months: 1, label: "1 month", short: "1 mo" },
  { key: "threeMonthPercent", months: 3, label: "3 months", short: "3 mo" },
  { key: "sixMonthPercent", months: 6, label: "6 months", short: "6 mo" },
  { key: "oneYearPercent", months: 12, label: "12 months", short: "1 yr" },
  { key: "twoYearPercent", months: 24, label: "24 months", short: "2 yr" },
] as const;

export type RentalPlanKey = (typeof RENTAL_PLANS)[number]["key"];

export type PlanPercentSource = Pick<
  Subcategory,
  | "monthPercent"
  | "threeMonthPercent"
  | "sixMonthPercent"
  | "oneYearPercent"
  | "twoYearPercent"
>;

export interface Dimensions {
  weight: number;
  length: number;
  width: number;
  height: number;
}

export function isRentalPlanKey(value: string | null | undefined): value is RentalPlanKey {
  return RENTAL_PLANS.some((plan) => plan.key === value);
}

export function getPlan(planKey: RentalPlanKey) {
  return RENTAL_PLANS.find((plan) => plan.key === planKey) ?? RENTAL_PLANS[0];
}

export function getPlanPercent(
  subcategory: PlanPercentSource | undefined,
  planKey: RentalPlanKey,
): number | null {
  if (!subcategory) return null;
  const percent = subcategory[planKey];
  return Number.isFinite(percent) && percent > 0 ? percent : null;
}

export function calculateRent(price: number, percent: number): number {
  if (!Number.isFinite(price) || !Number.isFinite(percent)) return 0;
  return Math.floor((price * percent) / 100);
}

export function calculateDeliveryCharge({
  weight,
  length,
  width,
  height,
}: Dimensions): number {
  const safe = (value: number) => (Number.isFinite(value) ? value : 0);
  const base = 100;
  const weightExtra = Math.max(0, Math.ceil((safe(weight) - 5) / 5));
  const lengthExtra = Math.max(0, Math.ceil((safe(length) - 50) / 50));
  const widthExtra = Math.max(0, Math.ceil((safe(width) - 50) / 50));
  const heightExtra = Math.max(0, Math.ceil((safe(height) - 50) / 50));
  return base + (weightExtra + lengthExtra + widthExtra + heightExtra) * 100;
}

export interface CheckoutTotal {
  rent: number;
  deliveryCharge: number;
  total: number;
  percent: number | null;
}

export function calculateCheckoutTotal(
  product: { price: number } & Dimensions,
  subcategory: PlanPercentSource | undefined,
  planKey: RentalPlanKey,
): CheckoutTotal {
  const deliveryCharge = calculateDeliveryCharge(product);
  const percent = getPlanPercent(subcategory, planKey);
  const rent = percent === null ? 0 : calculateRent(product.price, percent);
  const total = percent === null ? 0 : rent + 2 * deliveryCharge;
  return { rent, deliveryCharge, total, percent };
}

export function formatEffectiveMonthly(total: number, months: number): string {
  if (!Number.isFinite(total) || months <= 0) return "—";
  return String(Math.round(total / months));
}

export interface RentalPlanOption {
  key: RentalPlanKey;
  label: string;
  short: string;
  months: number;
  rent: number;
  total: number;
  effectiveMonthly: number;
  percent: number | null;
}

export function buildRentalPlans(
  price: number,
  subcategory: PlanPercentSource | undefined,
  options?: { dimensions?: Dimensions; includeDelivery?: boolean },
): RentalPlanOption[] {
  const includeDelivery = options?.includeDelivery ?? true;
  const delivery = options?.dimensions ? calculateDeliveryCharge(options.dimensions) : 0;

  return RENTAL_PLANS.map((plan) => {
    const percent = getPlanPercent(subcategory, plan.key);
    const rent = percent === null ? 0 : calculateRent(price, percent);
    const total = percent === null ? 0 : rent + (includeDelivery ? 2 * delivery : 0);
    return {
      key: plan.key,
      label: plan.label,
      short: plan.short,
      months: plan.months,
      rent,
      total,
      effectiveMonthly: percent === null ? 0 : Math.round(total / plan.months),
      percent,
    };
  });
}
