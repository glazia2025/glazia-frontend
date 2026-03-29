type PricingItem = {
  systemType?: string;
  area?: number;
  quantity?: number;
  amount?: number;
  rate?: number;
  width?: number;
  height?: number;
  subItems?: PricingItem[];
};

type AdditionalCosts = {
  installation?: number;
  transport?: number;
  loadingUnloading?: number;
  discountPercent?: number;
  showInstallation?: boolean;
  showTransport?: boolean;
  showLoadingUnloading?: boolean;
  showDiscount?: boolean;
};

export const roundToTwo = (value: number) => Number(value.toFixed(2));

export const applyProfitToRate = (rate: number, profitPercentage: number) =>
  profitPercentage > 0 ? roundToTwo(rate + (rate * profitPercentage) / 100) : roundToTwo(rate);

export const applyProfitToAmount = (amount: number, profitPercentage: number) =>
  profitPercentage > 0 ? roundToTwo(amount + (amount * profitPercentage) / 100) : roundToTwo(amount);

export const getItemQuantity = (item: PricingItem) => Math.max(1, item.quantity || 1);

const COMBINATION_SYSTEM = "Combination";

export const normalizeQuotationItemsForPricing = <T extends PricingItem>(items: T[]): T[] =>
  items.map((item) => {
    if (item.systemType !== COMBINATION_SYSTEM || !item.subItems?.length) {
      return item;
    }

    const subItems = item.subItems;
    const totals = subItems.reduce(
      (acc, sub) => {
        const subQuantity = getItemQuantity(sub);
        acc.width += Number(sub.width) || 0;
        acc.height += Number(sub.height) || 0;
        acc.area += (Number(sub.area) || 0) * subQuantity;
        acc.amount += Number(sub.amount) || 0;
        return acc;
      },
      { width: 0, height: 0, area: 0, amount: 0 }
    );

    const rate = totals.area ? roundToTwo(totals.amount / totals.area) : 0;

    return {
      ...item,
      width: totals.width,
      height: Number(item.height) || totals.height,
      area: roundToTwo(totals.area),
      rate,
      amount: roundToTwo(totals.amount * getItemQuantity(item)),
      subItems,
    };
  });

export const calculateQuotationPricing = (
  items: PricingItem[],
  additionalCosts?: AdditionalCosts,
  profitPercentage = 0
) => {
  const normalizedItems = normalizeQuotationItemsForPricing(items).map((item) => ({
    ...item,
    rate: applyProfitToRate(Number(item.rate) || 0, profitPercentage),
    amount: applyProfitToAmount(Number(item.amount) || 0, profitPercentage),
  }));
  const baseTotal = roundToTwo(
    normalizedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  );
  const totalArea = roundToTwo(
    normalizedItems.reduce(
      (sum, item) => sum + (Number(item.area) || 0) * getItemQuantity(item),
      0
    )
  );
  const totalQty = normalizedItems.reduce((sum, item) => sum + getItemQuantity(item), 0);

  const transport = Number(additionalCosts?.transport || 0);
  const installationRate = Number(additionalCosts?.installation || 0);
  const loadingUnloading = Number(additionalCosts?.loadingUnloading || 0);
  const installation = roundToTwo(installationRate * totalArea);
  const discount = roundToTwo(
    ((Number(additionalCosts?.discountPercent || 0) || 0) / 100) *
      (baseTotal + transport + installation + loadingUnloading)
  );

  const totalProjectCost = roundToTwo(
    baseTotal + transport + installation + loadingUnloading - discount
  );
  const gstValue = roundToTwo(totalProjectCost * 0.18);
  const grandTotal = roundToTwo(totalProjectCost + gstValue);
  const avgWithoutGst = totalArea ? roundToTwo(totalProjectCost / totalArea) : 0;
  const avgWithGst = totalArea ? roundToTwo(grandTotal / totalArea) : 0;

  return {
    items: normalizedItems,
    baseTotal,
    totalArea,
    totalQty,
    transport,
    installation,
    loadingUnloading,
    discount,
    totalProjectCost,
    gstValue,
    grandTotal,
    avgWithoutGst,
    avgWithGst,
  };
};
