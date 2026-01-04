"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Plus, Save } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { generateQuotationPDF } from "@/utils/pdfGenerator";
import { QuotationItemRow, QuotationItem } from "@/components/QuotationItemRow";
import { loadGlobalConfig } from "@/utils/globalConfig";

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

const initialItem: QuotationItem = {
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
};
const COMBINATION_SYSTEM = "Combination";

function CreateQuotationContent() {
  const router = useRouter();
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

  const [items, setItems] = useState<QuotationItem[]>([initialItem]);

  const [quotationDetails, setQuotationDetails] = useState({
    quotationNumber: "",
    date: new Date().toISOString().split("T")[0],
    validUntil: "",
    opportunity: "Enquiry",
    terms:
      "1. Prices are valid for 30 days from the date of quotation.\n2. Payment terms: 50% advance, 50% on delivery.\n3. Delivery time: 15-20 working days.",
    notes: "",
  });

  const [profitPercentage, setProfitPercentage] = useState<number>(0);
  const [globalConfig, setGlobalConfig] = useState({});

  const getNextQuotationNumber = () => {
    const existing = JSON.parse(localStorage.getItem("quotations") || "[]");
    const lastNumber =
      existing.length > 0
        ? Math.max(
            ...existing.map((q: { quotationNumber: string }) => {
              const match = q.quotationNumber.match(/QUO-(\d+)/);
              return match ? parseInt(match[1]) : 0;
            })
          )
        : 0;
    return `QUO-${String(lastNumber + 1).padStart(3, "0")}`;
  };

  useEffect(() => {
    setQuotationDetails((prev) => ({ ...prev, quotationNumber: getNextQuotationNumber() }));
  }, []);

  const fetchData = async () => {
    const config = await loadGlobalConfig();
    if (config) {
      console.log(config, "Config<>><><>...");
      setGlobalConfig(config);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleItemChange = (nextItem: QuotationItem) => {
    setItems((prev) => prev.map((it) => (it.id === nextItem.id ? nextItem : it)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        ...initialItem,
        id: Date.now().toString(),
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

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
    return baseTotal + profitAmount;
  };

  const handleSave = () => {

    const totalAmount = calculateTotalWithProfit().toFixed(2);

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
      breakdown: {
        totalAmount,
        profitPercentage
      },
    };

    console.log("Saving quotation", payload);

    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/quotations`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      )
      .then(() => {
        alert("Quotation saved successfully!");
        router.push("/quotations");
      })
      .catch((err) => {
        console.error("Error saving quotation", err);
        alert("Error saving quotation. Please try again.");
      });
  };

  const handleDownloadPDF = async () => {
    const finalQuotationNumber = quotationDetails.quotationNumber || getNextQuotationNumber();
    const quotation = {
      id: Date.now().toString(),
      ...quotationDetails,
      quotationNumber: finalQuotationNumber,
      customerDetails,
      items,
      total: calculateTotal(),
      createdAt: new Date().toISOString(),
    };

    try {
      await generateQuotationPDF(quotation);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 pt-24 pb-8">
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
                <h1 className="text-xl font-bold text-[#124657]">Create New Quotation</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#124657] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Quotation</span>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quotation Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={quotationDetails.date}
                  onChange={(e) => setQuotationDetails({ ...quotationDetails, date: e.target.value })}
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                <input
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                  rows={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={customerDetails.city}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={customerDetails.state}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                <input
                  type="text"
                  value={customerDetails.pincode}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, pincode: e.target.value })}
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
                  Logo URL
                </label>
                <img
                      src={globalConfig?.logo}
                      alt="Logo preview"
                      className="h-30 w-auto rounded border border-gray-200 bg-white p-2"
                    />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prerequisites of Installation
                </label>
                <textarea
                  value={globalConfig?.prerequisites}
                  readOnly
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms &amp; Conditions
              </label>
              <textarea
                value={globalConfig?.terms}
                readOnly
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Installation
                </label>
                <input
                  type="number"
                  value={globalConfig?.additionalCosts?.installation}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport
                </label>
                <input
                  type="number"
                  value={globalConfig?.additionalCosts?.transport}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loading &amp; Unloading
                </label>
                <input
                  type="number"
                  value={globalConfig?.additionalCosts?.loadingUnloading}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={globalConfig?.additionalCosts?.discountPercent}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Total Quantity</div>
                <div className="text-lg font-bold text-gray-900">{calculateTotalQuantity()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Total Area</div>
                <div className="text-lg font-bold text-gray-900">{calculateTotalArea().toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Base Total</div>
                <div className="text-lg font-bold text-gray-900">₹ {calculateTotal().toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Profit %</div>
                <input
                  type="number"
                  value={profitPercentage}
                  onChange={(e) => setProfitPercentage(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-20 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Total with Profit</div>
                <div className="text-lg font-bold text-[#124657]">₹{(calculateTotalWithProfit() + parseInt(globalConfig?.additionalCosts?.transport) + parseInt(globalConfig?.additionalCosts?.installation) + parseInt(globalConfig?.additionalCosts?.loadingUnloading) - ((parseInt(globalConfig?.additionalCosts?.discountPercent) / 100) * calculateTotalWithProfit())).toLocaleString('en-IN')}</div>
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
                      onChange={handleItemChange}
                      removeItem={removeItem}
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
  );
}

export default function CreateQuotationPage() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CreateQuotationContent />
    </QueryClientProvider>
  );
}
