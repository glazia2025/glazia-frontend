"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Download, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { generateQuotationPDF } from "@/utils/pdfGenerator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuotationItemRow, QuotationItem } from "@/components/QuotationItemRow";
import axios from "axios";
import { loadGlobalConfig } from "@/utils/globalConfig";
import { API_BASE_URL } from "@/services/api";


interface CustomerDetails {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface GlobalConfig {
  logo?: string;
  logoUrl?: string;
  prerequisites?: string;
  terms?: string;
  additionalCosts: {
    installation: number;
    transport: number;
    loadingUnloading: number;
    discountPercent: number;
  };
}

interface BackendQuotation {
  _id?: string;
  quotationDetails?: {
    id?: string;
    date?: string;
    opportunity?: string;
    terms?: string;
    notes?: string;
    validUntil?: string;
    generatedId?: string;
  };
  customerDetails?: CustomerDetails;
  items?: Array<
    Omit<QuotationItem, "meshPresent" | "handleCount" | "subItems"> & {
      meshPresent?: boolean;
      handleCount?: number;
      subItems?: Array<
        Omit<QuotationItem, "meshPresent" | "handleCount" | "subItems"> & {
          meshPresent?: boolean;
          handleCount?: number;
        }
      >;
    }
  >;
  globalConfig?: GlobalConfig;
}

const COMBINATION_SYSTEM = "Combination";
const initialGlobalConfig: GlobalConfig = {
  logo: "",
  logoUrl: "",
  prerequisites: "",
  terms: "",
  additionalCosts: {
    installation: 0,
    transport: 0,
    loadingUnloading: 0,
    discountPercent: 0,
  },
};

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params.id as string;
  const globalConfigLocked = useRef(false);

  const [queryClient] = useState(() => new QueryClient());
  const [loading, setLoading] = useState(true);
  const [quotationFound, setQuotationFound] = useState(false);
  
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [items, setItems] = useState<QuotationItem[]>([]);

  const [quotationDetails, setQuotationDetails] = useState({
    quotationNumber: "",
    date: new Date().toISOString().split('T')[0],
    validUntil: "",
    terms: "1. Prices are valid for 30 days from the date of quotation.\n2. Payment terms: 50% advance, 50% on delivery.\n3. Delivery time: 15-20 working days.",
    notes: "",
    opportunity: "",
  });

  const [profitPercentage, setProfitPercentage] = useState<number>(0);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(initialGlobalConfig);
  const [error, setError] = useState<string | null>(null);

  // Load existing quotation data
  useEffect(() => {
    const loadQuotation = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");
        const response = await axios.get<BackendQuotation>(
          `${API_BASE_URL}/api/quotations/${quotationId}`,
          token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : undefined
        );
        const data = response.data.quotation;
        if (!data) {
          setQuotationFound(false);
          return;
        }
        const qbDetails = data.quotationDetails || {};
        setQuotationDetails({
          quotationNumber: qbDetails.id || data._id || "",
          date: qbDetails.date || new Date().toISOString().split("T")[0],
          validUntil: qbDetails.validUntil || "",
          terms: qbDetails.terms || quotationDetails.terms,
          notes: qbDetails.notes || "",
          opportunity: qbDetails.opportunity || "",
          generatedId: data.generatedId || "",
        });
        setProfitPercentage(data.breakdown?.profitPercentage || 0);
        setCustomerDetails({
          name: data.customerDetails?.name || "",
          company: data.customerDetails?.company || "",
          email: data.customerDetails?.email || "",
          phone: data.customerDetails?.phone || "",
          address: data.customerDetails?.address || "",
          city: data.customerDetails?.city || "",
          state: data.customerDetails?.state || "",
          pincode: data.customerDetails?.pincode || "",
        });
        const mappedItems: QuotationItem[] =
          data.items?.map((item) => ({
            id: item.id || crypto.randomUUID(),
            refCode: item.refCode || "",
            location: item.location || "",
            width: item.width || 0,
            height: item.height || 0,
            area: item.area || 0,
            systemType: item.systemType || "",
            series: item.series || "",
            description: item.description || "",
            colorFinish: item.colorFinish || "",
            glassSpec: item.glassSpec || "",
            handleType: item.handleType || "",
            handleColor: item.handleColor || "",
            handleCount: item.handleCount ?? 0,
            meshPresent: item.meshPresent ? "Yes" : item.meshPresent === false ? "No" : "",
            meshType: item.meshType || "",
            rate: item.rate || 0,
            quantity: item.quantity || 1,
            amount: item.amount || 0,
            refImage: item.refImage || "",
            remarks: item.remarks || "",
            baseRate: item.baseRate || 0,
            areaSlabIndex: item.areaSlabIndex || 0,
            subItems:
              item.subItems?.map((subItem) => ({
                id: subItem.id || crypto.randomUUID(),
                refCode: subItem.refCode || "",
                location: subItem.location || "",
                width: subItem.width || 0,
                height: subItem.height || 0,
                area: subItem.area || 0,
                systemType: subItem.systemType || "",
                series: subItem.series || "",
                description: subItem.description || "",
                colorFinish: subItem.colorFinish || "",
                glassSpec: subItem.glassSpec || "",
                handleType: subItem.handleType || "",
                handleColor: subItem.handleColor || "",
                handleCount: subItem.handleCount ?? 0,
                meshPresent:
                  subItem.meshPresent ? "Yes" : subItem.meshPresent === false ? "No" : "",
                meshType: subItem.meshType || "",
                rate: subItem.rate || 0,
                quantity: subItem.quantity || 1,
                amount: subItem.amount || 0,
                refImage: subItem.refImage || "",
                remarks: subItem.remarks || "",
                baseRate: subItem.baseRate || 0,
                areaSlabIndex: subItem.areaSlabIndex || 0,
              })) || [],
          })) || [
            {
              id: "1",
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
              subItems: [],
            },
          ];
        setItems(mappedItems);
        if (data.globalConfig) {
          globalConfigLocked.current = true;
          setGlobalConfig((prev) => ({
            ...prev,
            ...data.globalConfig,
            additionalCosts: {
              ...prev.additionalCosts,
              ...(data.globalConfig.additionalCosts || {}),
            },
          }));
        }
        setQuotationFound(true);
      } catch (err) {
        console.error("Error loading quotation", err);
        setError("Failed to load quotation");
        setQuotationFound(false);
      } finally {
        setLoading(false);
      }
    };

    if (quotationId) {
      loadQuotation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationId]);

  const fetchData = async () => {
    const config = await loadGlobalConfig();
    if (config && !globalConfigLocked.current) {
      console.log(config, "Config<>><><>...");
      setGlobalConfig((prev) => ({
        ...prev,
        ...config,
        additionalCosts: {
          ...prev.additionalCosts,
          ...(config.additionalCosts || {}),
        },
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateItem = (nextItem: QuotationItem) => {
    setItems((prev) => prev.map((item) => (item.id === nextItem.id ? nextItem : item)));
  };

  const duplicateItem = (id: string) => {
    setItems((prev) => {
      const sourceIndex = prev.findIndex((it) => it.id === id);
      if (sourceIndex === -1) return prev;
      const source = prev[sourceIndex];
      const cloned: QuotationItem = {
        ...source,
        id: crypto.randomUUID(),
        subItems: source.subItems?.map((sub) => ({
          ...sub,
          id: crypto.randomUUID(),
        })),
      };
      const next = [...prev];
      next.splice(sourceIndex + 1, 0, cloned);
      return next;
    });
  };

  // Add item function
  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
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
      meshPresent: "",
      meshType: "",
      rate: 0,
      quantity: 1,
      amount: 0,
      refImage: "",
      remarks: "",
      subItems: [],
    };
    setItems([...items, newItem]);
  };

  // Remove item function
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Calculate total
  const getItemTotals = (item: QuotationItem) => {
    if (item.systemType === COMBINATION_SYSTEM && item.subItems?.length) {
      return item.subItems.reduce(
        (acc, sub) => {
          acc.amount += sub.amount;
          acc.area += sub.area * sub.quantity;
          acc.quantity += sub.quantity;
          return acc;
        },
        { amount: 0, area: 0, quantity: 0 }
      );
    }

    return {
      amount: item.amount,
      area: item.area * item.quantity,
      quantity: item.quantity,
    };
  };

  const calculateTotal = () =>
    items.reduce((total, item) => total + getItemTotals(item).amount, 0);

  const calculateTotalArea = () =>
    items.reduce((total, item) => total + getItemTotals(item).area, 0);

  const calculateTotalQuantity = () =>
    items.reduce((total, item) => total + getItemTotals(item).quantity, 0);

  const calculateTotalWithProfit = () => {
    const baseTotal = calculateTotal();
    const profitAmount = (baseTotal * profitPercentage) / 100;
    console.log(baseTotal, profitAmount, "Base total and profit amount");
    return baseTotal + profitAmount;
  };

  const getAdditionalCost = (key: keyof GlobalConfig["additionalCosts"]) =>
    Number(globalConfig.additionalCosts?.[key] || 0);

  const calculateFinalTotal = () => {
    const totalWithProfit = calculateTotalWithProfit();
    const additionalCosts =
      getAdditionalCost("transport") +
      getAdditionalCost("installation") +
      getAdditionalCost("loadingUnloading");
    const discount = (getAdditionalCost("discountPercent") / 100) * (totalWithProfit + additionalCosts);
    return totalWithProfit + additionalCosts - discount;
  };

  const handleLogoUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setGlobalConfig((prev) => ({ ...prev, logoUrl: result, logo: result }));
    };
    reader.readAsDataURL(file);
  };

  const logoPreview = globalConfig.logoUrl || globalConfig.logo || "";

  // Update quotation (instead of create new)
  const handleUpdate = async () => {
    const totalAmount = calculateFinalTotal().toFixed(2);

    console.log("Total amount", totalAmount);

    const payload = {
      quotationDetails: {
        date: quotationDetails.date,
        opportunity: quotationDetails.opportunity || "",
        terms: quotationDetails.terms,
        notes: quotationDetails.notes,
        validUntil: quotationDetails.validUntil,
      },
      customerDetails,
      items: items.map((item) => ({
        ...item,
        handleCount: item.handleCount ?? 0,
        meshPresent: item.meshPresent === "Yes",
        subItems: item.subItems?.map((sub) => ({
          ...sub,
          handleCount: sub.handleCount ?? 0,
          meshPresent: sub.meshPresent === "Yes",
        })),
      })),
      globalConfig,
      breakdown: {
        totalAmount,
        profitPercentage
      },
    };

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${API_BASE_URL}/api/quotations/${quotationId}`,
        payload,
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined
      );
      alert('Quotation updated successfully!');
      router.push('/quotations');
    } catch (err) {
      console.error("Error updating quotation", err);
      alert('Error updating quotation. Please try again.');
    }
  };

  // Download PDF function
  const handleDownloadPDF = async () => {
    const quotation = {
      id: quotationId,
      ...quotationDetails,
      customerDetails,
      items,
      globalConfig,
      total: calculateTotalWithProfit(), // Use total with profit for PDF
      baseTotal: calculateTotal(), // Include base total
      profitPercentage, // Include profit percentage
      createdAt: new Date().toISOString(),
    };

    try {
      await handleUpdate();
      await generateQuotationPDF(quotation);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      {loading ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#124657] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quotation...</p>
          </div>
        </div>
      ) : !quotationFound ? (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-3xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quotation not found</h3>
            <p className="text-gray-600 mb-6">The quotation you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
            <Link
              href="/quotations"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#124657] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Quotations</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          {error && (
            <div className="mx-4 mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="px-4 pt-24 pb-8">
        {/* Fixed Header with Action Buttons */}
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
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-xl font-bold text-[#124657]">Edit Quotation</h1>
                  <p className="text-sm text-gray-600">#{quotationDetails.generatedId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleUpdate}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#124657] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Quotation</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quotation Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quotation Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={quotationDetails.date}
                    onChange={(e) => setQuotationDetails({...quotationDetails, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opportunity Stage
                  </label>
                  <select
                    value={quotationDetails.opportunity}
                    onChange={(e) => setQuotationDetails({...quotationDetails, opportunity: e.target.value})}
                    defaultValue="Enquiry"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
                  >
                    <option value="Enquiry">Enquiry</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Under Negotiation">Under Negotiation</option>
                    <option value="Order Confirmed">Order Confirmed</option>
                    <option value="Order Lost">Order Lost</option>
                  </select>
                </div>
              </div>
            </div>

          {/* Customer Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={customerDetails.address}
                    onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={customerDetails.city}
                    onChange={(e) => setCustomerDetails({...customerDetails, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={customerDetails.state}
                    onChange={(e) => setCustomerDetails({...customerDetails, state: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={customerDetails.pincode}
                    onChange={(e) => setCustomerDetails({...customerDetails, pincode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Global Config</h2>
              <Link
                href="/quotations/settings"
                className="text-sm font-medium text-[#124657] hover:underline"
              >
                Manage
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
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
                        setGlobalConfig((prev) => ({ ...prev, logoUrl: "", logo: "" }))
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
                  onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites of Installation
                </label>
                <textarea
                  value={globalConfig.prerequisites || ""}
                  onChange={(e) =>
                    setGlobalConfig((prev) => ({ ...prev, prerequisites: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms &amp; Conditions
              </label>
              <textarea
                value={globalConfig.terms || ""}
                onChange={(e) =>
                  setGlobalConfig((prev) => ({ ...prev, terms: e.target.value }))
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
              />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Installation (₹/sqft)
                </label>
                <input
                  type="number"
                  value={globalConfig.additionalCosts.installation}
                  onChange={(e) =>
                    setGlobalConfig((prev) => ({
                      ...prev,
                      additionalCosts: {
                        ...prev.additionalCosts,
                        installation: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport (₹)
                </label>
                <input
                  type="number"
                  value={globalConfig.additionalCosts.transport}
                  onChange={(e) =>
                    setGlobalConfig((prev) => ({
                      ...prev,
                      additionalCosts: {
                        ...prev.additionalCosts,
                        transport: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loading &amp; Unloading (₹)
                </label>
                <input
                  type="number"
                  value={globalConfig.additionalCosts.loadingUnloading}
                  onChange={(e) =>
                    setGlobalConfig((prev) => ({
                      ...prev,
                      additionalCosts: {
                        ...prev.additionalCosts,
                        loadingUnloading: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={globalConfig.additionalCosts.discountPercent}
                  onChange={(e) =>
                    setGlobalConfig((prev) => ({
                      ...prev,
                      additionalCosts: {
                        ...prev.additionalCosts,
                        discountPercent: Number(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Items</h2>
              <button
                onClick={addItem}
                className="flex items-center space-x-2 px-4 py-2 bg-[#124657] text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Totals Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Total Quantity</div>
                <div className="text-lg font-bold text-gray-900">{calculateTotalQuantity()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Total Area</div>
                <div className="text-lg font-bold text-gray-900">{calculateTotalArea().toFixed(2)} sq ft</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Base Amount</div>
                <div className="text-lg font-bold text-gray-900">₹{calculateTotal().toLocaleString('en-IN')}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">Profit %</div>
                <input
                  type="number"
                  value={profitPercentage === 0 ? "" : profitPercentage.toString()}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setProfitPercentage(0);
                    } else {
                      setProfitPercentage(Number(val));
                    }
                  }}
                  className="mt-1 w-20 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Final Amount</div>
                <div className="text-lg font-bold text-[#124657]">
                  ₹
                  {calculateFinalTotal().toLocaleString("en-IN")}
                </div>
                {profitPercentage > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    +₹{((calculateTotal() * profitPercentage) / 100).toLocaleString('en-IN')} profit
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto shadow-lg rounded-lg">
              <table className="w-full border-collapse border border-gray-300 min-w-max">
                <thead>
                  {/* Main Header Row */}
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 min-w-[60px]" rowSpan={2}>S.No</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-[120px]" rowSpan={2}>Ref Code</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 min-w-[120px]" rowSpan={2}>Location</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-[100px]" rowSpan={2}>Width</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-[100px]" rowSpan={2}>Height</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 min-w-[120px]" rowSpan={2}>System Type</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 min-w-[100px]" rowSpan={2}>Series</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 min-w-[180px]" rowSpan={2}>Description</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-[150px]" rowSpan={2}>Color Finish</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-[180px]" rowSpan={2}>Glass Spec</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 bg-blue-50 min-w-[200px]" colSpan={2}>Handle</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 bg-green-50 min-w-[160px]" colSpan={2}>Mesh</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-[150px]" rowSpan={2}>Rate</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 w-[70px]" rowSpan={2}>Qty</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 min-w-[100px]" rowSpan={2}>Ref Image</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 min-w-[150px]" rowSpan={2}>Remarks</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 min-w-[100px]" rowSpan={2}>Actions</th>
                  </tr>
                  {/* Sub Header Row */}
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 bg-blue-50 min-w-[100px]">Type</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 bg-blue-50 min-w-[100px]">Color</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 bg-green-50 min-w-[80px]">Present</th>
                    <th className="border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 bg-green-50 min-w-[80px]">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <QuotationItemRow
                      key={item.id}
                      item={item}
                      index={index}
                      onChange={updateItem}
                      removeItem={removeItem}
                      duplicateItem={duplicateItem}
                      canRemove={items.length > 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
      )}
    </QueryClientProvider>
  );
}
