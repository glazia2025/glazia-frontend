"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import {
  loadGlobalConfig,
  saveGlobalConfig,
} from "@/utils/globalConfig";

export default function QuotationSettingsPage() {
  const [config, setConfig] = useState<any>({});
  const [status, setStatus] = useState<string>("");

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

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-xl font-bold text-[#124657]">Quotation Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              {status && <span className="text-sm text-green-600">{status}</span>}
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

      <div className="px-4 pt-24 pb-8 space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Branding</h2>
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
                  onClick={() => setConfig((prev) => ({ ...prev, logoUrl: "", logo: "" }))}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove logo
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
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
              onChange={(e) => setConfig((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="www.example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
            />
          </div>
        </div>
      </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Legal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms &amp; Conditions
              </label>
              <textarea
                value={config?.terms}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, terms: e.target.value }))
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
                  setConfig((prev) => ({ ...prev, prerequisites: e.target.value }))
                }
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Costs</h2>
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
                Loading &amp; Unloading (₹)
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

      </div>
    </div>
  );
}
