"use client";
/* eslint-disable @next/next/no-img-element */
import {
  useDescriptionsQuery,
  useOptionsQuery,
  useSeriesQuery,
  useSystemsQuery,
} from "@/lib/quotations/queries";
import {
  Description,
  HandleOption,
  OptionWithRate,
  OptionsResponse,
} from "@/lib/quotations/types";
import { Trash2 } from "lucide-react";

interface QuotationItemBase {
  id: string;
  refCode: string;
  location: string;
  width: number;
  height: number;
  area: number;
  systemType: string;
  series: string;
  description: string;
  colorFinish: string;
  glassSpec: string;
  handleType: string;
  handleColor: string;
  handleCount?: number;
  meshPresent: string;
  meshType: string;
  rate: number;
  quantity: number;
  amount: number;
  refImage: string;
  remarks: string;
  baseRate?: number;
  areaSlabIndex?: number;
}

export interface QuotationSubItem extends QuotationItemBase {}

export interface QuotationItem extends QuotationItemBase {
  subItems?: QuotationSubItem[];
}

interface Props {
  item: QuotationItem;
  index: number;
  onChange: (nextItem: QuotationItem) => void;
  removeItem: (id: string) => void;
  canRemove: boolean;
}

const AREA_SLABS = [
  { max: 20, index: 0 },
  { max: 40, index: 1 },
  { max: Infinity, index: 2 },
];
const COMBINATION_SYSTEM = "Combination";

const indexToAlpha = (index: number): string => {
  let n = index;
  let result = "";
  while (n >= 0) {
    result = String.fromCharCode(97 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
};

const buildSubLabel = (count: number): string =>
  Array.from({ length: count }, (_, i) => indexToAlpha(i).toUpperCase()).join("+");

const applySubRefCodes = (
  parentRef: string,
  subItems: QuotationSubItem[]
): QuotationSubItem[] =>
  subItems.map((sub, idx) => ({
    ...sub,
    refCode: parentRef ? `${parentRef}-${indexToAlpha(idx)}` : "",
  }));

function getImagePath(description: string): string {
  if (!description) return "";
  if (description === "Fix") return "/Quotations/Fix.png";
  if (description === "French Door" || description === "French Window")
    return "/Quotations/French Door-Window.jpg";
  if (description === "Left Openable Window" || description === "Left Openable Door")
    return "/Quotations/Left Openable Door-Window.jpg";
  if (description === "Right Openable Window" || description === "Right Openable Door")
    return "/Quotations/Right Openable Door-Window.jpg";
  return `/Quotations/${description}.jpg`;
}

const createBlankSubItem = (): QuotationSubItem => ({
  id: crypto.randomUUID(),
  refCode: "",
  location: "",
  width: 0,
  height: 0,
  area: 0,
  systemType: "",
  series: "",
  description: "",
  colorFinish: "",
  glassSpec: "",
  handleType: "",
  handleColor: "",
  handleCount: 0,
  meshPresent: "",
  meshType: "",
  rate: 0,
  quantity: 1,
  amount: 0,
  refImage: "",
  remarks: "",
  baseRate: 0,
  areaSlabIndex: 0,
});

const calculateArea = (width: number, height: number) =>
  (width * height) / (304.78 ** 2);

const calculateRateForItem = (
  next: QuotationItemBase,
  descriptions: Description[] | undefined,
  options: OptionsResponse | undefined
) => {
  const desc = descriptions?.find((d) => d.name === next.description);
  const baseRates = desc?.baseRates ?? [];
  const slab = AREA_SLABS.find((s) => next.area <= s.max);
  const baseRate = baseRates[slab?.index ?? 0] ?? 0;

  const colorRate = options?.colorFinishes.find((c) => c.name === next.colorFinish)?.rate ?? 0;
  const meshRate =
    next.meshPresent === "Yes"
      ? options?.meshTypes.find((m) => m.name === next.meshType)?.rate ?? 0
      : 0;
  const glassRate = options?.glassSpecs.find((g) => g.name === next.glassSpec)?.rate ?? 0;
  const handleOpt = options?.handleOptions.find((h) => h.name === next.handleType);
  const handleCount = desc?.defaultHandleCount ?? 0;
  const handleUnitRate =
    handleOpt?.colors.find((c) => c.name === next.handleColor)?.rate ?? 0;
  const handleRate =
    handleCount > 0
      ? (handleCount * handleUnitRate) / (next.area || 1)
      : 0;

  return {
    rate: baseRate + colorRate + meshRate + glassRate + handleRate,
    baseRate,
    areaSlabIndex: slab?.index ?? 0,
    handleCount,
  };
};

const syncCombinationValues = (next: QuotationItem): QuotationItem => {
  const subItems = next.subItems ?? [];
  if (subItems.length === 0) {
    return {
      ...next,
      width: 0,
      height: 0,
      area: 0,
      rate: 0,
      amount: 0,
      quantity: 0,
    };
  }

  const totals = subItems.reduce(
    (acc, sub) => {
      acc.width += sub.width;
      acc.height += sub.height;
      acc.area += sub.area * sub.quantity;
      acc.amount += sub.amount;
      acc.quantity += sub.quantity;
      return acc;
    },
    { width: 0, height: 0, area: 0, amount: 0, quantity: 0 }
  );

  const rate = totals.area ? totals.amount / totals.area : 0;

  return {
    ...next,
    width: totals.width,
    height: totals.height,
    area: totals.area,
    rate,
    amount: totals.amount,
    quantity: totals.quantity,
  };
};

function QuotationSubItemRow({
  item,
  index,
  onChange,
  removeItem,
  canRemove,
}: {
  item: QuotationSubItem;
  index: number;
  onChange: (nextItem: QuotationSubItem) => void;
  removeItem: (id: string) => void;
  canRemove: boolean;
}) {
  const systemsQuery = useSystemsQuery();
  const seriesQuery = useSeriesQuery(item.systemType);
  const descriptionsQuery = useDescriptionsQuery(item.systemType, item.series);
  const optionsQuery = useOptionsQuery(item.systemType);
  const handleOption =
    optionsQuery.data?.handleOptions.find((h) => h.name === item.handleType);

  const handleFieldChange = (field: keyof QuotationSubItem, raw: string | number) => {
    const value = typeof raw === "string" ? raw : raw;
    const next: QuotationSubItem = { ...item, [field]: value };

    if (field === "systemType") {
      next.series = "";
      next.description = "";
      next.handleType = "";
      next.handleColor = "";
      next.colorFinish = "";
      next.glassSpec = "";
      next.meshPresent = "";
      next.meshType = "";
    }

    if (field === "series") {
      next.description = "";
      next.handleType = "";
      next.handleColor = "";
    }

    if (field === "description") {
      next.refImage = getImagePath(String(value));
    }

    if (field === "width" || field === "height") {
      const width = field === "width" ? Number(raw) : next.width;
      const height = field === "height" ? Number(raw) : next.height;
      next.area = calculateArea(width, height);
    }

    if (field === "quantity") {
      next.quantity = Number(raw) || 0;
    }

    if (field === "meshPresent" && value !== "Yes") {
      next.meshType = "";
    }

    const { rate, baseRate, areaSlabIndex, handleCount } = calculateRateForItem(
      next,
      descriptionsQuery.data?.descriptions,
      optionsQuery.data
    );
    next.rate = rate;
    next.baseRate = baseRate;
    next.areaSlabIndex = areaSlabIndex;
    next.handleCount = handleCount;
    next.amount = next.quantity * next.rate;
    onChange(next);
  };

  return (
    <tr className="bg-white">
      <td className="border border-gray-200 px-2 py-2 text-center text-xs font-medium">
        {index + 1}
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <input
          type="text"
          value={item.refCode}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657]"
          placeholder="Ref code..."
          disabled
        />
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <input
          type="text"
          value={item.location}
          onChange={(e) => handleFieldChange("location", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657]"
          placeholder="Location..."
        />
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <input
          type="text"
          value={item.width}
          onChange={(e) => {
            const sanitizedValue = e.target.value
              .replace(/[^0-9]/g, "")
              .toUpperCase();
            handleFieldChange("width", parseFloat(sanitizedValue) || 0)
          }}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657]"
          placeholder="Width"
        />
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <input
          type="text"
          value={item.height}
          onChange={(e) => {
            const sanitizedValue = e.target.value
              .replace(/[^0-9]/g, "")
              .toUpperCase();
            handleFieldChange("height", parseFloat(sanitizedValue) || 0)
          }}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657]"
          placeholder="Height"
        />
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <select
          value={item.systemType}
          onChange={(e) => handleFieldChange("systemType", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] bg-white"
        >
          <option value="">Select System</option>
          {systemsQuery.data?.systems
            .filter((s: string) => s !== COMBINATION_SYSTEM)
            .map((s: string) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <select
          value={item.series}
          onChange={(e) => handleFieldChange("series", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
          disabled={!item.systemType}
        >
          <option value="">Select Series</option>
          {seriesQuery.data?.series.map((s: string) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <select
          value={item.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
          disabled={!item.series}
        >
          <option value="">Select Description</option>
          {descriptionsQuery.data?.descriptions.map((d: Description) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <select
          value={item.colorFinish}
          onChange={(e) => handleFieldChange("colorFinish", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] bg-white"
        >
          <option value="">Select Color Finish</option>
          {optionsQuery.data?.colorFinishes.map((c: OptionWithRate) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <select
          value={item.glassSpec}
          onChange={(e) => handleFieldChange("glassSpec", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] bg-white"
        >
          <option value="">Select Glass Spec</option>
          {optionsQuery.data?.glassSpecs.map((c: OptionWithRate) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <select
          value={item.handleType}
          onChange={(e) => handleFieldChange("handleType", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] bg-white"
        >
          <option value="">Select Handle</option>
          {optionsQuery.data?.handleOptions.map((c: HandleOption) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <select
          value={item.handleColor}
          onChange={(e) => handleFieldChange("handleColor", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] bg-white"
        >
          <option value="">Select Color</option>
          {handleOption?.colors.map((c: OptionWithRate) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          )) || (
            <>
              <option value="Black">Black</option>
              <option value="Silver">Silver</option>
            </>
          )}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <select
          value={item.meshPresent}
          onChange={(e) => handleFieldChange("meshPresent", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] bg-white"
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <select
          value={item.meshType}
          onChange={(e) => handleFieldChange("meshType", e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] bg-white"
          disabled={item.meshPresent !== "Yes"}
        >
          <option value="">Select Mesh</option>
          {optionsQuery.data?.meshTypes.map((c: OptionWithRate) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <input
          type="text"
          value={item.rate.toFixed(2)}
          onChange={(e) => {
            const sanitizedValue = e.target.value
              .replace(/[^0-9]/g, "")
              .toUpperCase();
            handleFieldChange("rate", parseFloat(sanitizedValue) || 0)
          }}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] bg-gray-50 text-gray-600"
        />
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <input
          type="text"
          value={item.quantity}
          onChange={(e) => {
            const sanitizedValue = e.target.value
              .replace(/[^0-9]/g, "")
              .toUpperCase();
            handleFieldChange("quantity", parseFloat(sanitizedValue) || 0)
          }}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657]"
          min={0}
        />
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <div className="flex items-center justify-center h-16 w-20 bg-gray-50 rounded border border-gray-200">
          {item.refImage ? (
            <img
              src={item.refImage}
              alt={item.description || "Product"}
              className="max-h-full max-w-full object-contain rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="text-xs text-gray-400 text-center">No Image</div>
          )}
        </div>
      </td>
      <td className="border border-gray-200 px-2 py-2">
        <textarea
          value={item.remarks}
          onChange={(e) => handleFieldChange("remarks", e.target.value)}
          rows={2}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#124657] focus:border-[#124657] resize-none"
          placeholder="Add remarks..."
        />
      </td>
      <td className="border border-gray-200 px-2 py-2 text-center">
        {canRemove && (
          <button
            onClick={() => removeItem(item.id)}
            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
            title="Remove Sub Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
}

export function QuotationItemRow({ item, index, onChange, removeItem, canRemove }: Props) {
  const isCombination = item.systemType === COMBINATION_SYSTEM;
  const querySystemType = isCombination ? "" : item.systemType;
  const subLabel = isCombination && item.subItems?.length
    ? buildSubLabel(item.subItems.length)
    : "";
  const systemsQuery = useSystemsQuery();
  const seriesQuery = useSeriesQuery(querySystemType);
  const descriptionsQuery = useDescriptionsQuery(querySystemType, item.series);
  const optionsQuery = useOptionsQuery(querySystemType);
  const handleOption =
    optionsQuery.data?.handleOptions.find((h) => h.name === item.handleType);

  const handleSubItemChange = (nextSubItem: QuotationSubItem) => {
    const subItems = (item.subItems || []).map((sub) =>
      sub.id === nextSubItem.id ? nextSubItem : sub
    );
    const nextItem = syncCombinationValues({ ...item, subItems });
    onChange(nextItem);
  };

  const addSubItem = () => {
    const subItems = applySubRefCodes(
      item.refCode,
      [...(item.subItems || []), createBlankSubItem()]
    );
    const nextItem = syncCombinationValues({ ...item, subItems });
    onChange(nextItem);
  };

  const removeSubItem = (id: string) => {
    const subItems = applySubRefCodes(
      item.refCode,
      (item.subItems || []).filter((sub) => sub.id !== id)
    );
    const nextItem = syncCombinationValues({ ...item, subItems });
    onChange(nextItem);
  };

  const handleFieldChange = (field: keyof QuotationItem, raw: string | number) => {
    const value = typeof raw === "string" ? raw : raw;
    const next: QuotationItem = { ...item, [field]: value };

    if (field === "systemType") {
      if (value === COMBINATION_SYSTEM) {
        const initialSubItems = next.subItems?.length
          ? next.subItems
          : [createBlankSubItem()];
        next.subItems = applySubRefCodes(next.refCode, initialSubItems);
      } else {
        next.subItems = [];
      }
      next.series = "";
      next.description = "";
      next.handleType = "";
      next.handleColor = "";
      next.colorFinish = "";
      next.glassSpec = "";
      next.meshPresent = "";
      next.meshType = "";
    }

    if (field === "series") {
      next.description = "";
      next.handleType = "";
      next.handleColor = "";
    }

    if (field === "description") {
      next.refImage = getImagePath(String(value));
    }

    if (field === "refCode" && next.systemType === COMBINATION_SYSTEM) {
      next.subItems = applySubRefCodes(String(value), next.subItems || []);
    }

    if (field === "width" || field === "height") {
      const width = field === "width" ? Number(raw) : next.width;
      const height = field === "height" ? Number(raw) : next.height;
      next.area = calculateArea(width, height);
    }

    if (field === "quantity") {
      next.quantity = Number(raw) || 0;
    }

    if (field === "meshPresent" && value !== "Yes") {
      next.meshType = "";
    }

    if (next.systemType === COMBINATION_SYSTEM) {
      onChange(syncCombinationValues(next));
      return;
    }

    const { rate, baseRate, areaSlabIndex, handleCount } = calculateRateForItem(
      next,
      descriptionsQuery.data?.descriptions,
      optionsQuery.data
    );
    next.rate = rate;
    next.baseRate = baseRate;
    next.areaSlabIndex = areaSlabIndex;
    next.handleCount = handleCount;
    next.amount = next.quantity * next.rate;
    onChange(next);
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="border border-gray-300 px-3 py-3 text-center text-sm font-medium">
          {index + 1}
        </td>

        <td className="border border-gray-300 px-2 py-2">
          <input
            type="text"
            value={item.refCode}
            onChange={(e) => handleFieldChange("refCode", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
            placeholder="Ref code..."
          />
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <input
            type="text"
            value={item.location}
            onChange={(e) => handleFieldChange("location", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
            placeholder="Location..."
          />
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <input
            type="number"
            value={item.width}
             onChange={(e) => {
              const sanitizedValue = e.target.value
                .replace(/[^0-9]/g, "")
                .toUpperCase();
              handleFieldChange("width", parseFloat(sanitizedValue) || 0)
            }}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Width"
            disabled={isCombination}
          />
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <input
            type="number"
            value={item.height}
            onChange={(e) => {
              const sanitizedValue = e.target.value
                .replace(/[^0-9]/g, "")
                .toUpperCase();
              handleFieldChange("height", parseFloat(sanitizedValue) || 0)
            }}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Height"
            disabled={isCombination}
          />
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.systemType}
            onChange={(e) => handleFieldChange("systemType", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
          >
            <option value="">Select System</option>
            {systemsQuery.data?.systems.map((s: string) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            {!systemsQuery.data?.systems?.includes(COMBINATION_SYSTEM) && (
              <option value={COMBINATION_SYSTEM}>{COMBINATION_SYSTEM}</option>
            )}
          </select>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.series}
            onChange={(e) => handleFieldChange("series", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
            disabled={!item.systemType || isCombination}
          >
            <option value="">Select Series</option>
            {seriesQuery.data?.series.map((s: string) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </td>

        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
            disabled={!item.series || isCombination}
          >
            <option value="">Select Description</option>
            {descriptionsQuery.data?.descriptions.map((d: Description) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </td>

        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.colorFinish}
            onChange={(e) => handleFieldChange("colorFinish", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
            disabled={isCombination}
          >
            <option value="">Select Color Finish</option>
            {optionsQuery.data?.colorFinishes.map((c: OptionWithRate) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.glassSpec}
            onChange={(e) => handleFieldChange("glassSpec", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
            disabled={isCombination}
          >
            <option value="">Select Glass Spec</option>
            {optionsQuery.data?.glassSpecs.map((c: OptionWithRate) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.handleType}
            onChange={(e) => handleFieldChange("handleType", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
            disabled={isCombination}
          >
            <option value="">Select Handle</option>
            {optionsQuery.data?.handleOptions.map((c: HandleOption) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </td>

        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.handleColor}
            onChange={(e) => handleFieldChange("handleColor", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
            disabled={isCombination}
          >
            <option value="">Select Color</option>
            {handleOption?.colors.map((c: OptionWithRate) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            )) || (
              <>
                <option value="Black">Black</option>
                <option value="Silver">Silver</option>
              </>
            )}
          </select>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.meshPresent}
            onChange={(e) => handleFieldChange("meshPresent", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
            disabled={isCombination}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <select
            value={item.meshType}
            onChange={(e) => handleFieldChange("meshType", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
            disabled={isCombination || item.meshPresent !== "Yes"}
          >
            <option value="">Select Mesh</option>
            {optionsQuery.data?.meshTypes.map((c: OptionWithRate) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </td>

        <td className="border border-gray-300 px-2 py-2">
          <input
            type="text"
            value={item.rate.toFixed(2)}
            onChange={(e) => {
              const sanitizedValue = e.target.value
                .replace(/[^0-9]/g, "")
                .toUpperCase();
              handleFieldChange("rate", parseFloat(sanitizedValue) || 0)
            }}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-gray-50 text-gray-600"
            disabled={isCombination}
          />
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <input
            type="text"
            value={item.quantity}
            onChange={(e) => {
              const sanitizedValue = e.target.value
                .replace(/[^0-9]/g, "")
                .toUpperCase();
              handleFieldChange("quantity", parseFloat(sanitizedValue) || 0)
            }}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] disabled:bg-gray-50 disabled:text-gray-500"
            min={0}
            disabled={isCombination}
          />
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="flex items-center justify-center h-20 w-24 bg-gray-50 rounded-lg border border-gray-200">
            {subLabel ? (
              <div className="text-sm font-semibold tracking-wide text-gray-700">
                {subLabel}
              </div>
            ) : item.refImage ? (
              <img
                src={item.refImage}
                alt={item.description || "Product"}
                className="max-h-full max-w-full object-contain rounded shadow-sm"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            ) : (
              <div className="text-sm text-gray-400 text-center">No Image</div>
            )}
          </div>
        </td>
        <td className="border border-gray-300 px-2 py-2">
          <textarea
            value={item.remarks}
            onChange={(e) => handleFieldChange("remarks", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] resize-none"
            placeholder="Add remarks..."
          />
        </td>
        <td className="border border-gray-300 px-2 py-2 text-center">
          {canRemove && (
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
              title="Remove Item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </td>
      </tr>
      {isCombination && (
        <tr className="bg-gray-50">
          <td className="border border-gray-300 px-3 py-3" colSpan={19}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-700">Sub Rows</div>
              <button
                onClick={addSubItem}
                className="px-3 py-1 text-sm bg-[#124657] text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add Sub Row
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse min-w-max">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[50px]">#</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[90px]">Ref Code</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[120px]">Location</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[90px]">Width</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[90px]">Height</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[120px]">System Type</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[90px]">Series</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[140px]">Description</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[140px]">Color Finish</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[140px]">Glass Spec</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[120px]">Handle Type</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[120px]">Handle Color</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[90px]">Mesh</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[100px]">Mesh Type</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[90px]">Rate</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[70px]">Qty</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[110px]">Ref Image</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[140px]">Remarks</th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-gray-700 min-w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(item.subItems || []).map((subItem, subIndex) => (
                    <QuotationSubItemRow
                      key={subItem.id}
                      item={subItem}
                      index={subIndex}
                      onChange={handleSubItemChange}
                      removeItem={removeSubItem}
                      canRemove={(item.subItems || []).length > 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
