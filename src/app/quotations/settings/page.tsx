"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save,Search } from "lucide-react";
import {
  loadGlobalConfig,
  saveGlobalConfig,
} from "@/utils/globalConfig";

export default function QuotationSettingsPage() {
  const [config, setConfig] = useState<any>({});
  const [status, setStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState("profileStructure");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const config = await loadGlobalConfig();
    if (config) {
      console.log(config, "Config<>><><>...");
      setConfig(config);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = () => {
    saveGlobalConfig(config);
    setStatus("Saved.");
    window.setTimeout(() => setStatus(""), 2000);
  };

  const handleLogoUpload = (file: File | null) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setConfig((prev) => ({ ...prev, logoUrl: result, logo: result }));
    };
    reader.readAsDataURL(file);
  };

  const logoPreview = config?.logoUrl || config?.logo || "";
  const dummyData = [
  { code: "17955", name: "CMT BEAD 32MM", unit: "Kilogram", price: 320 },
  { code: "17954", name: "CMT BEAD 16MM", unit: "Kilogram", price: 320 },
  { code: "27003", name: "SLD SASH 29MM X 61.52MM", unit: "Kilogram", price: 320 },
  { code: "19097", name: "CMT OUTWARD SASH 59MM X 92MM", unit: "Kilogram", price: 320 },
];

return (
  <div className="min-h-screen bg-gray-50">

    {/* HEADER */}
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-4">
            <Link
              href="/quotations"
              className="flex items-center space-x-2 text-gray-600 hover:text-[#124657] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Quotations</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-bold text-[#124657]">
              Quotation Settings
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {status && (
              <span className="text-sm text-green-600">{status}</span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-[#124657] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>

        </div>
      </div>
    </div>

    {/* BODY */}
    <div className="px-4 pt-24 pb-8">
      <div className="flex gap-6">

        {/* SIDEBAR */}
        <div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 h-fit">
          <ul className="space-y-2 text-sm">
            {[
              { key: "profileStructure", label: "Quotation Structure" },
              { key: "profileRate", label: "Profile Rate" },
              { key: "hardwareRate", label: "Hardware Rate" },
              { key: "meshRate", label: "Mesh Rate" },
              { key: "glassRate", label: "Glass Rate" },
            ].map((item) => (
              <li
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`px-4 py-2 rounded-lg cursor-pointer transition 
                  ${
                    activeTab === item.key
                      ? "bg-[#124657] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 space-y-8">

          {activeTab === "profileStructure" && (
            <>
              {/* Branding */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Branding
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Image
                    </label>

                    {logoPreview && (
                      <div className="mb-4 flex items-center gap-4">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-16 w-auto rounded border border-gray-200 bg-white p-2"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              logoUrl: "",
                              logo: "",
                            }))
                          }
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Remove logo
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleLogoUpload(e.target.files?.[0] ?? null)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      value={config?.website || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      placeholder="www.example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    />
                  </div>

                </div>
              </div>

              {/* Legal */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Legal
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms & Conditions
                    </label>
                    <textarea
                      value={config?.terms}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          terms: e.target.value,
                        }))
                      }
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prerequisites of Installation
                    </label>
                    <textarea
                      value={config?.prerequisites}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          prerequisites: e.target.value,
                        }))
                      }
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    />
                  </div>

                </div>
              </div>

              {/* Additional Costs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Additional Costs
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Installation (₹/sqft)
                    </label>
                    <input
                      type="number"
                      value={config?.additionalCosts?.installation}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          additionalCosts: {
                            ...prev.additionalCosts,
                            installation: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transport (₹)
                    </label>
                    <input
                      type="number"
                      value={config?.additionalCosts?.transport}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          additionalCosts: {
                            ...prev.additionalCosts,
                            transport: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loading & Unloading (₹)
                    </label>
                    <input
                      type="number"
                      value={config?.additionalCosts?.loadingUnloading}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          additionalCosts: {
                            ...prev.additionalCosts,
                            loadingUnloading: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={config?.additionalCosts?.discountPercent}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          additionalCosts: {
                            ...prev.additionalCosts,
                            discountPercent: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    />
                  </div>

                </div>
              </div>

            </>
          )}
          {activeTab === "profileRate" && (
  <div className="space-y-6">

    {/* Page Heading */}
    <h2 className="text-2xl font-bold text-[#124657]">
      Profile Rate
    </h2>

    {/* Top Action Bar */}
    <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center justify-between">

      <select className="bg-[#124657] text-white px-4 py-2 rounded-md text-sm">
        <option>Default profile Rate</option>
      </select>

      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#124657] focus:outline-none"
          />
        </div>

        <button className="border border-[#124657] text-[#124657] px-4 py-2 rounded-md text-sm hover:bg-[#124657] hover:text-white transition">
          Update Pricing
        </button>

        <button className="text-gray-600 text-sm hover:text-[#124657]">
          Filter
        </button>

      </div>
    </div>

    {/* Table */}
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">

        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">SAP Code</th>
            <th className="px-4 py-3 text-left">Item Name</th>
            <th className="px-4 py-3 text-left">Unit</th>
            <th className="px-4 py-3 text-left">Price Level</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {dummyData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3">{item.code}</td>
              <td className="px-4 py-3">{item.name}</td>
              <td className="px-4 py-3">{item.unit}</td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  defaultValue={item.price}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#124657] focus:outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
    {/* Bottom Action Buttons */}
<div className="flex justify-end items-center gap-4 pt-4">

  <button
    type="button"
    className="text-gray-600 text-sm hover:text-[#124657]"
  >
    Reset
  </button>

  <button
    type="button"
    className="bg-[#124657] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
  >
    Save
  </button>

</div>

  </div>
)}
 {activeTab === "hardwareRate" && (
  <div className="space-y-6">

    {/* Page Heading */}
    <h2 className="text-2xl font-bold text-[#124657]">
      Hardware Rate
    </h2>

    {/* Top Action Bar */}
    <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center justify-between">

      <select className="bg-[#124657] text-white px-4 py-2 rounded-md text-sm">
        <option>Default Hardware Rate</option>
      </select>

      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#124657] focus:outline-none"
          />
        </div>

        <button className="border border-[#124657] text-[#124657] px-4 py-2 rounded-md text-sm hover:bg-[#124657] hover:text-white transition">
          Update Pricing
        </button>

        <button className="text-gray-600 text-sm hover:text-[#124657]">
          Filter
        </button>

      </div>
    </div>

    {/* Table */}
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">

        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">SAP Code</th>
            <th className="px-4 py-3 text-left">Item Name</th>
            <th className="px-4 py-3 text-left">Unit</th>
            <th className="px-4 py-3 text-left">Price Level</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {dummyData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3">{item.code}</td>
              <td className="px-4 py-3">{item.name}</td>
              <td className="px-4 py-3">{item.unit}</td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  defaultValue={item.price}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#124657] focus:outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
    {/* Bottom Action Buttons */}
<div className="flex justify-end items-center gap-4 pt-4">

  <button
    type="button"
    className="text-gray-600 text-sm hover:text-[#124657]"
  >
    Reset
  </button>

  <button
    type="button"
    className="bg-[#124657] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
  >
    Save
  </button>

</div>

  </div>
)}
 {activeTab === "glassRate" && (
  <div className="space-y-6">

    {/* Page Heading */}
    <h2 className="text-2xl font-bold text-[#124657]">
      Glass Rate
    </h2>

    {/* Top Action Bar */}
    <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center justify-end">

      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#124657] focus:outline-none"
          />
        </div>

        <button className="border border-[#124657] text-[#124657] px-4 py-2 rounded-md text-sm hover:bg-[#124657] hover:text-white transition">
          Update Pricing
        </button>

        <button className="text-gray-600 text-sm hover:text-[#124657]">
          Filter
        </button>

      </div>
    </div>

    {/* Table */}
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">

        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">SAP Code</th>
            <th className="px-4 py-3 text-left">Item Name</th>
            <th className="px-4 py-3 text-left">Unit</th>
            <th className="px-4 py-3 text-left">Price Level</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {dummyData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3">{item.code}</td>
              <td className="px-4 py-3">{item.name}</td>
              <td className="px-4 py-3">{item.unit}</td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  defaultValue={item.price}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#124657] focus:outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
    {/* Bottom Action Buttons */}
<div className="flex justify-end items-center gap-4 pt-4">

  <button
    type="button"
    className="text-gray-600 text-sm hover:text-[#124657]"
  >
    Reset
  </button>

  <button
    type="button"
    className="bg-[#124657] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
  >
    Save
  </button>

</div>

  </div>
)}
{activeTab === "meshRate" && (
  <div className="space-y-6">

    {/* Page Heading */}
    <h2 className="text-2xl font-bold text-[#124657]">
      Mesh Rate
    </h2>

    {/* Top Action Bar */}
    <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center justify-end">

      <div className="flex items-center gap-3">

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#124657] focus:outline-none"
          />
        </div>

        <button className="border border-[#124657] text-[#124657] px-4 py-2 rounded-md text-sm hover:bg-[#124657] hover:text-white transition">
          Update Pricing
        </button>

        <button className="text-gray-600 text-sm hover:text-[#124657]">
          Filter
        </button>

      </div>
    </div>

    {/* Table */}
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">

        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">SAP Code</th>
            <th className="px-4 py-3 text-left">Item Name</th>
            <th className="px-4 py-3 text-left">Unit</th>
            <th className="px-4 py-3 text-left">Price Level</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {dummyData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3">{item.code}</td>
              <td className="px-4 py-3">{item.name}</td>
              <td className="px-4 py-3">{item.unit}</td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  defaultValue={item.price}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#124657] focus:outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
    {/* Bottom Action Buttons */}
<div className="flex justify-end items-center gap-4 pt-4">

  <button
    type="button"
    className="text-gray-600 text-sm hover:text-[#124657]"
  >
    Reset
  </button>

  <button
    type="button"
    className="bg-[#124657] text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
  >
    Save
  </button>

</div>

  </div>
)}
        </div> {/* RIGHT CONTENT END */}
      </div> {/* FLEX END */}
    </div> {/* BODY END */}
  </div>
);
}
