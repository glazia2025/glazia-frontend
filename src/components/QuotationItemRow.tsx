"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { useDescriptionsQuery, useOptionsQuery } from "@/lib/quotations/queries";
import type { Description, OptionsResponse } from "@/lib/quotations/types";

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

type InlinePatch = Partial<
  Pick<
    QuotationItem,
    | "colorFinish"
    | "glassSpec"
    | "handleType"
    | "handleColor"
    | "meshType"
    | "rate"
    | "baseRate"
    | "areaSlabIndex"
    | "handleCount"
  >
>;

interface Props {
  item: QuotationItem;
  index: number;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  onEdit: (id: string) => void;
  onInlineUpdate: (id: string, patch: InlinePatch) => void;
  onInlineSubItemUpdate: (parentId: string, subItemId: string, patch: InlinePatch) => void;
  canRemove: boolean;
}

const COMBINATION_SYSTEM = "Combination";
const AREA_SLABS = [
  { max: 20, index: 0 },
  { max: 40, index: 1 },
  { max: Infinity, index: 2 },
];
const roundToTwo = (value: number) => Number(value.toFixed(2));

const formatValue = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return "-";
  return value;
};

const calculateRateForItem = (
  next: {
    area: number;
    description: string;
    colorFinish: string;
    glassSpec: string;
    handleType: string;
    handleColor: string;
    meshPresent: string;
    meshType: string;
  },
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
  const handleUnitRate = handleOpt?.colors.find((c) => c.name === next.handleColor)?.rate ?? 0;
  const handleRate = handleCount > 0 ? (handleCount * handleUnitRate) / (next.area || 1) : 0;

  return {
    rate: roundToTwo(baseRate + colorRate + meshRate + glassRate + handleRate),
    handleCount,
    baseRate,
    areaSlabIndex: slab?.index ?? 0,
  };
};

function getPresetImagePath(description: string): string {
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

function QuotationSubItemEditRow({
  parentId,
  item,
  index,
  onInlineSubItemUpdate,
}: {
  parentId: string;
  item: QuotationSubItem;
  index: number;
  onInlineSubItemUpdate: (parentId: string, subItemId: string, patch: InlinePatch) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const presetImage = getPresetImagePath(item.description);
  const optionsSystemType = item.systemType || "Casement";
  const metaOptionsQuery = useOptionsQuery(optionsSystemType);
  const descriptionsQuery = useDescriptionsQuery(optionsSystemType, item.series || "");
  const selectedHandleOption =
    metaOptionsQuery.data?.handleOptions.find((opt) => opt.name === item.handleType) ?? null;

  useEffect(() => {
    setImageError(false);
  }, [presetImage]);

  const updateWithCalculatedRate = (
    patch: Partial<Pick<QuotationSubItem, "colorFinish" | "glassSpec" | "handleType" | "handleColor" | "meshType">>
  ) => {
    const next = {
      area: item.area,
      description: item.description,
      colorFinish: patch.colorFinish ?? item.colorFinish,
      glassSpec: patch.glassSpec ?? item.glassSpec,
      handleType: patch.handleType ?? item.handleType,
      handleColor: patch.handleColor ?? item.handleColor,
      meshPresent: item.meshPresent,
      meshType: patch.meshType ?? item.meshType,
    };
    const calc = calculateRateForItem(next, descriptionsQuery.data?.descriptions, metaOptionsQuery.data);
    onInlineSubItemUpdate(parentId, item.id, {
      ...patch,
      rate: calc.rate,
      baseRate: calc.baseRate,
      areaSlabIndex: calc.areaSlabIndex,
      handleCount: calc.handleCount,
    });
  };

  return (
    <tr className="bg-white">
      <td className="border border-gray-200 px-2 py-2 text-center text-xs font-medium">{index + 1}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.refCode)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.location)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs text-right">{formatValue(item.width)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs text-right">{formatValue(item.height)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.systemType)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.series)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.description)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">
        <select
          value={item.colorFinish || ""}
          onChange={(e) => updateWithCalculatedRate({ colorFinish: e.target.value })}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:ring-2 focus:ring-[#124657] focus:border-transparent"
        >
          <option value="">Select</option>
          {metaOptionsQuery.data?.colorFinishes.map((opt) => (
            <option key={opt.name} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2 text-xs">
        <select
          value={item.glassSpec || ""}
          onChange={(e) => updateWithCalculatedRate({ glassSpec: e.target.value })}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:ring-2 focus:ring-[#124657] focus:border-transparent"
        >
          <option value="">Select</option>
          {metaOptionsQuery.data?.glassSpecs.map((opt) => (
            <option key={opt.name} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2 text-xs">
        <select
          value={item.handleType || ""}
          onChange={(e) => updateWithCalculatedRate({ handleType: e.target.value, handleColor: "" })}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:ring-2 focus:ring-[#124657] focus:border-transparent"
        >
          <option value="">Select</option>
          {metaOptionsQuery.data?.handleOptions.map((opt) => (
            <option key={opt.name} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2 text-xs">
        <select
          value={item.handleColor || ""}
          onChange={(e) => updateWithCalculatedRate({ handleColor: e.target.value })}
          disabled={!item.handleType}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:ring-2 focus:ring-[#124657] focus:border-transparent"
        >
          <option value="">Select</option>
          {(selectedHandleOption?.colors ?? []).map((opt) => (
            <option key={opt.name} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
      </td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.meshPresent)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">
        {item.meshPresent === "Yes" ? (
          <select
            value={item.meshType || ""}
            onChange={(e) => updateWithCalculatedRate({ meshType: e.target.value })}
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:ring-2 focus:ring-[#124657] focus:border-transparent"
          >
            <option value="">Select</option>
            {metaOptionsQuery.data?.meshTypes.map((opt) => (
              <option key={opt.name} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-gray-500">NA</span>
        )}
      </td>
      <td className="border border-gray-200 px-2 py-2 text-xs text-right">
        <input
          type="number"
          value={item.rate}
          onChange={(e) =>
            onInlineSubItemUpdate(parentId, item.id, { rate: Number(e.target.value) || 0 })
          }
          className="w-full rounded border border-gray-300 px-2 py-1 text-right text-xs focus:ring-2 focus:ring-[#124657] focus:border-transparent"
        />
      </td>
      <td className="border border-gray-200 px-2 py-2 text-xs text-right">{formatValue(item.quantity)}</td>
      <td className="border border-gray-200 px-2 py-2">
        <div className="flex items-center justify-center h-14 w-20 bg-gray-50 rounded border border-gray-200">
          {presetImage && !imageError ? (
            <img
              src={presetImage}
              alt={item.description || "Product"}
              className="max-h-full max-w-full object-contain rounded"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="text-xs text-gray-400 text-center">No Image</div>
          )}
        </div>
      </td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.remarks)}</td>
    </tr>
  );
}

export function QuotationItemRow({
  item,
  index,
  removeItem,
  duplicateItem,
  onEdit,
  onInlineUpdate,
  onInlineSubItemUpdate,
  canRemove,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const isCombination = item.systemType === COMBINATION_SYSTEM;
  const optionsSystemType = isCombination ? "" : item.systemType || "Casement";
  const metaOptionsQuery = useOptionsQuery(optionsSystemType);
  const descriptionsQuery = useDescriptionsQuery(optionsSystemType, isCombination ? "" : item.series || "");
  const selectedHandleOption =
    metaOptionsQuery.data?.handleOptions.find((opt) => opt.name === item.handleType) ?? null;

  useEffect(() => {
    setImageError(false);
  }, [item.refImage]);

  const updateWithCalculatedRate = (
    patch: Partial<Pick<QuotationItem, "colorFinish" | "glassSpec" | "handleType" | "handleColor" | "meshType">>
  ) => {
    const next = {
      area: item.area,
      description: item.description,
      colorFinish: patch.colorFinish ?? item.colorFinish,
      glassSpec: patch.glassSpec ?? item.glassSpec,
      handleType: patch.handleType ?? item.handleType,
      handleColor: patch.handleColor ?? item.handleColor,
      meshPresent: item.meshPresent,
      meshType: patch.meshType ?? item.meshType,
    };
    const calc = calculateRateForItem(next, descriptionsQuery.data?.descriptions, metaOptionsQuery.data);
    onInlineUpdate(item.id, {
      ...patch,
      rate: calc.rate,
      baseRate: calc.baseRate,
      areaSlabIndex: calc.areaSlabIndex,
      handleCount: calc.handleCount,
    });
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="border border-gray-300 px-3 py-3 text-center text-sm font-medium">{index + 1}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.refCode)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.location)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm text-right">{formatValue(item.width)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm text-right">{formatValue(item.height)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.systemType)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.series)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.description)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">
          {isCombination ? (
            <span className="text-gray-500">NA</span>
          ) : (
            <select
              value={item.colorFinish || ""}
              onChange={(e) => updateWithCalculatedRate({ colorFinish: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-[#124657] focus:border-transparent"
            >
              <option value="">Select</option>
              {metaOptionsQuery.data?.colorFinishes.map((opt) => (
                <option key={opt.name} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
          )}
        </td>
        <td className="border border-gray-300 px-2 py-2 text-sm">
          {isCombination ? (
            <span className="text-gray-500">NA</span>
          ) : (
            <select
              value={item.glassSpec || ""}
              onChange={(e) => updateWithCalculatedRate({ glassSpec: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-[#124657] focus:border-transparent"
            >
              <option value="">Select</option>
              {metaOptionsQuery.data?.glassSpecs.map((opt) => (
                <option key={opt.name} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
          )}
        </td>
        <td className="border border-gray-300 px-2 py-2 text-sm">
          {isCombination ? (
            <span className="text-gray-500">NA</span>
          ) : (
            <select
              value={item.handleType || ""}
              onChange={(e) => updateWithCalculatedRate({ handleType: e.target.value, handleColor: "" })}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-[#124657] focus:border-transparent"
            >
              <option value="">Select</option>
              {metaOptionsQuery.data?.handleOptions.map((opt) => (
                <option key={opt.name} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
          )}
        </td>
        <td className="border border-gray-300 px-2 py-2 text-sm">
          {isCombination ? (
            <span className="text-gray-500">NA</span>
          ) : (
            <select
              value={item.handleColor || ""}
              onChange={(e) => updateWithCalculatedRate({ handleColor: e.target.value })}
              disabled={!item.handleType}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-[#124657] focus:border-transparent"
            >
              <option value="">Select</option>
              {(selectedHandleOption?.colors ?? []).map((opt) => (
                <option key={opt.name} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
          )}
        </td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.meshPresent)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">
          {isCombination || item.meshPresent !== "Yes" ? (
            <span className="text-gray-500">{isCombination ? "NA" : "-"}</span>
          ) : (
            <select
              value={item.meshType || ""}
              onChange={(e) => updateWithCalculatedRate({ meshType: e.target.value })}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-[#124657] focus:border-transparent"
            >
              <option value="">Select</option>
              {metaOptionsQuery.data?.meshTypes.map((opt) => (
                <option key={opt.name} value={opt.name}>
                  {opt.name}
                </option>
              ))}
            </select>
          )}
        </td>
        <td className="border border-gray-300 px-2 py-2 text-sm text-right">
          <input
            type="number"
            value={item.rate}
            onChange={(e) => onInlineUpdate(item.id, { rate: Number(e.target.value) || 0 })}
            className="w-full rounded border border-gray-300 px-2 py-1 text-right text-sm focus:ring-2 focus:ring-[#124657] focus:border-transparent"
          />
        </td>
        <td className="border border-gray-300 px-2 py-2 text-sm text-right">{formatValue(item.quantity)}</td>
        <td className="border border-gray-300 px-2 py-2">
          <div className="flex items-center justify-center h-20 w-24 bg-gray-50 rounded-lg border border-gray-200">
            {item.refImage && !imageError ? (
              <img
                src={item.refImage}
                alt={item.description || "Product"}
                className="max-h-full max-w-full object-contain rounded shadow-sm"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-sm text-gray-400 text-center">No Image</div>
            )}
          </div>
        </td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.remarks)}</td>
        <td className="border border-gray-300 px-2 py-2 text-center">
          <button
            onClick={() => onEdit(item.id)}
            className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
            title="Edit Item"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => duplicateItem(item.id)}
            className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
            title="Duplicate Item"
          >
            <Copy className="w-5 h-5" />
          </button>
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
            <div className="mb-3 text-sm font-semibold text-gray-700">Sub Rows</div>
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
                  </tr>
                </thead>
                <tbody>
                  {(item.subItems || []).map((subItem, subIndex) => (
                    <QuotationSubItemEditRow
                      key={subItem.id}
                      parentId={item.id}
                      item={subItem}
                      index={subIndex}
                      onInlineSubItemUpdate={onInlineSubItemUpdate}
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
