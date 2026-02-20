"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";

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
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  onEdit: (id: string) => void;
  canRemove: boolean;
}

const COMBINATION_SYSTEM = "Combination";

const formatValue = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return "-";
  return value;
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

function QuotationSubItemDisplayRow({
  item,
  index,
}: {
  item: QuotationSubItem;
  index: number;
}) {
  const [imageError, setImageError] = useState(false);
  const presetImage = getPresetImagePath(item.description);

  useEffect(() => {
    setImageError(false);
  }, [presetImage]);

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
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.colorFinish)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.glassSpec)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.handleType)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.handleColor)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.meshPresent)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs">{formatValue(item.meshType)}</td>
      <td className="border border-gray-200 px-2 py-2 text-xs text-right">{formatValue(item.rate)}</td>
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
  canRemove,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const isCombination = item.systemType === COMBINATION_SYSTEM;

  useEffect(() => {
    setImageError(false);
  }, [item.refImage]);

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
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.colorFinish)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.glassSpec)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.handleType)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.handleColor)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.meshPresent)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm">{formatValue(item.meshType)}</td>
        <td className="border border-gray-300 px-2 py-2 text-sm text-right">{formatValue(item.rate)}</td>
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
                    <QuotationSubItemDisplayRow key={subItem.id} item={subItem} index={subIndex} />
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
