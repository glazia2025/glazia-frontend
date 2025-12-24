"use client";
/* eslint-disable @next/next/no-img-element */
import {
  useDescriptionsQuery,
  useOptionsQuery,
  useSeriesQuery,
  useSystemsQuery,
} from "@/lib/quotations/queries";
import { Description, HandleOption, OptionWithRate } from "@/lib/quotations/types";
import { Trash2 } from "lucide-react";

export interface QuotationItem {
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

export function QuotationItemRow({ item, index, onChange, removeItem, canRemove }: Props) {
  const systemsQuery = useSystemsQuery();
  const seriesQuery = useSeriesQuery(item.systemType);
  const descriptionsQuery = useDescriptionsQuery(item.systemType, item.series);
  const optionsQuery = useOptionsQuery(item.systemType);
  const handleOption =
    optionsQuery.data?.handleOptions.find((h) => h.name === item.handleType);

  const calculateRate = (next: QuotationItem) => {
    const desc =
      descriptionsQuery.data?.descriptions.find((d) => d.name === next.description);
    const baseRates = desc?.baseRates ?? [];
    const slab = AREA_SLABS.find((s) => next.area <= s.max);
    const baseRate = baseRates[slab?.index ?? 0] ?? 0;

    const colorRate =
      optionsQuery.data?.colorFinishes.find((c) => c.name === next.colorFinish)?.rate ?? 0;
    const meshRate =
      next.meshPresent === "Yes"
        ? optionsQuery.data?.meshTypes.find((m) => m.name === next.meshType)?.rate ?? 0
        : 0;
    const glassRate =
      optionsQuery.data?.glassSpecs.find((g) => g.name === next.glassSpec)?.rate ?? 0;
    const handleOpt =
      optionsQuery.data?.handleOptions.find((h) => h.name === next.handleType);
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

  const handleFieldChange = (field: keyof QuotationItem, raw: string | number) => {
    const value = typeof raw === "string" ? raw : raw;
    const next: QuotationItem = { ...item, [field]: value };

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
      next.area = (width * height) / (304.78 ** 2);
    }

    if (field === "quantity") {
      next.quantity = Number(raw) || 0;
    }

    if (field === "meshPresent" && value !== "Yes") {
      next.meshType = "";
    }

    const { rate, baseRate, areaSlabIndex, handleCount } = calculateRate(next);
    next.rate = rate;
    next.baseRate = baseRate;
    next.areaSlabIndex = areaSlabIndex;
    next.handleCount = handleCount;
    next.amount = next.quantity * next.rate;
    onChange(next);
  };

  return (
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
          onChange={(e) => handleFieldChange("width", parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
          placeholder="Width"
        />
      </td>
      <td className="border border-gray-300 px-2 py-2">
        <input
          type="number"
          value={item.height}
          onChange={(e) => handleFieldChange("height", parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
          placeholder="Height"
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
        </select>
      </td>
      <td className="border border-gray-300 px-2 py-2">
        <select
          value={item.series}
          onChange={(e) => handleFieldChange("series", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
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

      <td className="border border-gray-300 px-2 py-2">
        <select
          value={item.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
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

      <td className="border border-gray-300 px-2 py-2">
        <select
          value={item.colorFinish}
          onChange={(e) => handleFieldChange("colorFinish", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
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
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
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
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
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
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
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
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
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
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
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

      <td className="border border-gray-300 px-2 py-2">
        <input
          type="number"
          value={item.rate.toFixed(2)}
          onChange={(e) => handleFieldChange("rate", parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-gray-50 text-gray-600"
        />
      </td>
      <td className="border border-gray-300 px-2 py-2">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => handleFieldChange("quantity", parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
          min={0}
        />
      </td>
      <td className="border border-gray-300 px-2 py-2">
        <div className="flex items-center justify-center h-20 w-24 bg-gray-50 rounded-lg border border-gray-200">
          {item.refImage ? (
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
  );
}
