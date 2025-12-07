"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Trash2, Download, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { generateQuotationPDF } from "@/utils/pdfGenerator";

type SystemType = "Casement" | "Sliding" | "Slide N Fold" | "";

const AREA_SLABS = [
  { max: 20,   index: 0 },
  { max: 40,   index: 1 },
  { max: Infinity, index: 2 }
];

const baseRateTable = {
  'Casement': {
    "40mm": {
      "Fix": [200, 170, 145],

      "Left Openable Window": [300, 255, 217],
      "Right Openable Window": [300, 255, 217],
      "Top Hung Window": [300, 255, 217],
      "Bottom Hung Window": [300, 255, 217],

      "French Window": [330, 281, 238],

      "default": [0, 0, 0]
    },

    "50mm": {
      "Fix": [250, 213, 181],

      "Left Openable Window": [375, 319, 271],
      "Right Openable Window": [375, 319, 271],
      "Top Hung Window": [375, 319, 271],
      "Bottom Hung Window": [375, 319, 271],

      "Tilt and Turn Window": [1000, 1000, 1000],
      "Parallel Window": [1000, 1000, 1000],

      "French Window": [400, 340, 289],

      "Left Openable Door": [450, 450, 450],
      "Right Openable Door": [450, 450, 450],
      "French Door": [475, 475, 475],

      "default": [0, 0, 0]
    },

    "114mm": {
      "Left Openable": [750, 750, 750],
      "Right Openable": [750, 750, 750],

      "Left Openable + Fixed": [650, 650, 650],
      "Fixed + Right Openable": [650, 650, 650],
      "Left Openable + Fixed + right Openable": [650, 650, 650],

      "default": [0, 0, 0]
    }
  },

  'Sliding': {
    "29mm": {
      "2 Track 2 Glass Panel": [500, 425, 361],
      "2 Track 3 Glass Panel": [550, 468, 397],
      "2 Track 4 Glass Panel": [600, 510, 434],

      "3 Track 2 Glass 1 Mesh Panel": [600, 510, 434],
      "3 Track 3 Glass Panel": [625, 531, 452],
      "3 Track 3 Glass 1 Mesh Panel": [650, 553, 470],
      "3 Track 4 Glass Panel 2 Mesh Panel": [700, 595, 506],

      "default": [0, 0, 0]
    },

    "44mm": {
      "2 Track 2 Glass Panel": [625, 531, 452],
      "2 Track 3 Glass Panel": [688, 584, 497],
      "2 Track 4 Glass Panel": [750, 638, 542],

      "3 Track 2 Glass 1 Mesh Panel": [750, 638, 542],
      "3 Track 3 Glass Panel": [781, 664, 564],
      "3 Track 3 Glass 1 Mesh Panel": [813, 691, 587],
      "3 Track 4 Glass 2 Mesh Panel": [875, 744, 632],
      "3 Track 6 Glass Panel": [900, 765, 650],

      "default": [0, 0, 0]
    }
  },

  "Slide n Fold": {
    "Glazia GU": {
      "2 Panel (1+1)": [1300, 1170, 1053],
      "3 Panel (1+2)": [1250, 1125, 1013],
      "4 Panel (1+3)": [1200, 1080, 972],
      "5 Panel (1+4)": [1150, 1035, 932],
      "6 Panel (1+5)": [1100, 990, 891],

      "default": [0, 0, 0]
    }
  }
};

const handleCountTable: Record<string, Record<string, Record<string, number>>> = {
  Casement: {
    "40mm": {
      "Fix": 0,
      "Left Openable Window": 1,
      "Right Openable Window": 1,
      "Top Hung Window": 1,
      "Bottom Hung Window": 1,
      "French Window": 2,
    },
    "50mm": {
      "Fix": 0,
      "Left Openable Window": 1,
      "Right Openable Window": 1,
      "Top Hung Window": 1,
      "Bottom Hung Window": 1,
      "Tilt and Turn Window": 1,
      "Parallel Window": 2,
      "French Window": 2,
      "Left Openable Door": 1,
      "Right Openable Door": 1,
      "French Door": 2,
    },
    "114mm": {
      "Left Openable": 2,
      "Right Openable": 2,
      "Left Openable + Fixed": 2,
      "Fixed + Right Openable": 2,
      "Left Openable + Fixed + right Openable": 4,
    },
  },

  Sliding: {
    "29mm": {
      "2 Track 2 Glass Panel": 2,
      "2 Track 3 Glass Panel": 2,
      "2 Track 4 Glass Panel": 2,
      "3 Track 2 Glass 1 Mesh Panel": 3,
      "3 Track 3 Glass Panel": 3,
      "3 Track 3 Glass 1 Mesh Panel": 3,
      "3 Track 4 Glass Panel 2 Mesh Panel": 4,
    },
    "44mm": {
      "2 Track 2 Glass Panel": 2,
      "2 Track 3 Glass Panel": 2,
      "2 Track 4 Glass Panel": 2,
      "3 Track 2 Glass 1 Mesh Panel": 3,
      "3 Track 3 Glass Panel": 3,
      "3 Track 3 Glass 1 Mesh Panel": 3,
      "3 Track 4 Glass 2 Mesh Panel": 4,
      "3 Track 6 Glass Panel": 3,
    }
  },

  "Slide n Fold": {
    "Glazia GU": {
      "2 Panel (1+1)": 2,
      "3 Panel (1+2)": 3,
      "4 Panel (1+3)": 4,
      "5 Panel (1+4)": 5,
      "6 Panel (1+5)": 6,
    }
  }
};


const handleRateTable: Record<string, Record<string, Record<string, number>>> = {
  Sliding: {
    "Metro Handle": { Black: 650, Silver: 650 },
    "Touch Lock": { Black: 250, Silver: 250 },
    "D handle": { Black: 600, Silver: 600 },
    "Pop-up handle": { Black: 350, Silver: 350 }
  },
  Casement: {
    "Mortise Handle with lock": { Black: 1500, Silver: 1500 },
    "L handle": { Black: 350, Silver: 350 },
    "Cremone Handle": { Black: 250, Silver: 250 },
    "Cocksper Handle": { Black: 100, Silver: 100 }
  }
};

const meshRateTable: Record<string, Record<string, number>> = {
  Yes: {
    "SS Mesh - Black": 25,
    "SS Mesh - Natural": 22,
    "Pleated Mesh": 200
  },
  No: {
     "SS Mesh - Black": 0,
    "SS Mesh - Natural": 0,
    "Pleated Mesh": 0
  }
};


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

interface QuotationItem {
  id: string;
  refCode: string;
  location: string;
  width: number;
  height: number;
  area: number;
  systemType: SystemType;
  series: string;
  description: string;
  colorFinish: string;
  glassSpec: string;
  handleType: string;
  handleColor: string;
  meshPresent: string;
  meshType: string;
  rate: number;
  quantity: number;
  amount: number;
  refImage: string;
  remarks: string;
}

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params.id as string;

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
  });

  const [profitPercentage, setProfitPercentage] = useState<number>(0);

  // Load existing quotation data
  useEffect(() => {
    const loadQuotation = () => {
      try {
        const existingQuotations = JSON.parse(localStorage.getItem('quotations') || '[]');
        const quotation = existingQuotations.find((q: any) => q.id === quotationId);
        
        if (quotation) {
          setQuotationFound(true);
          setCustomerDetails(quotation.customerDetails);
          setItems(quotation.items);
          setQuotationDetails({
            quotationNumber: quotation.quotationNumber,
            date: quotation.date,
            validUntil: quotation.validUntil,
            terms: quotation.terms,
            notes: quotation.notes,
          });
          // Load profit percentage if it exists
          setProfitPercentage(quotation.profitPercentage || 0);
        } else {
          setQuotationFound(false);
        }
      } catch (error) {
        console.error('Error loading quotation:', error);
        setQuotationFound(false);
      } finally {
        setLoading(false);
      }
    };

    if (quotationId) {
      loadQuotation();
    }
  }, [quotationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#124657] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotation...</p>
        </div>
      </div>
    );
  }

  if (!quotationFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-3xl">📄</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quotation not found</h3>
          <p className="text-gray-600 mb-6">The quotation you're looking for doesn't exist or has been deleted.</p>
          <Link
            href="/quotations"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#124657] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quotations</span>
          </Link>
        </div>
      </div>
    );
  }

  // Rate calculation functions
  function getColorFinishRate(colorFinish: string): number {
    if (
      colorFinish === "Grey-Tex 2200" ||
      colorFinish === "Grey-Tex 2900" ||
      colorFinish === "Matt Black - 9005" ||
      colorFinish === "White - 9003" ||
      colorFinish === "Anodic Bronze - SW28BN" ||
      colorFinish === "Champagne - SDA53N"
    ) {
      return 60;
    }
    else if (
      colorFinish === "Champagne" ||
      colorFinish === "Black"
    ) {
      return 75;
    }
    else if (
      colorFinish === "Wenge" ||
      colorFinish === "XYZ" ||
      colorFinish === "ABC"
    ) {
      return 180;
    }
    else {
      return 0;
    }
  }

  function getGlassRate(glassSpec: string): number {
    // Clear Toughened Glass
    if (
      glassSpec === "5mm Clear Toughened" ||
      glassSpec === "6mm Clear Toughened" ||
      glassSpec === "8mm Clear Toughened" ||
      glassSpec === "10mm Clear Toughened" ||
      glassSpec === "12mm Clear Toughened"
    ) {
      switch (glassSpec) {
        case "5mm Clear Toughened": return 65;
        case "6mm Clear Toughened": return 75;
        case "8mm Clear Toughened": return 100;
        case "10mm Clear Toughened": return 125;
        case "12mm Clear Toughened": return 150;
      }
    }
    // Frosted Toughened Glass
    else if (glassSpec === "5/6mm Frosted Toughened") {
      return 80;
    }
    // DGU Glass
    else if (
      glassSpec === "20mm (5+10+5) DGU Glass" ||
      glassSpec === "24mm (6+12+6) DGU Glass" ||
      glassSpec === "32mm (8+12+8) DGU Glass"
    ) {
      switch (glassSpec) {
        case "20mm (5+10+5) DGU Glass": return 200;
        case "24mm (6+12+6) DGU Glass": return 225;
        case "32mm (8+12+8) DGU Glass": return 300;
      }
    }
    // Security/Laminated Glass
    else if (
      glassSpec === "11.52mm (5+1.52+5) Laminated Glass" ||
      glassSpec === "13.52mm (6+1.52+6) Laminated Glass" ||
      glassSpec === "17.52mm (8+1.52+8) Laminated Glass"
    ) {
      switch (glassSpec) {
        case "11.52mm (5+1.52+5) Laminated Glass": return 275;
        case "13.52mm (6+1.52+6) Laminated Glass": return 300;
        case "17.52mm (8+1.52+8) Laminated Glass": return 350;
      }
    }
    // DGU Laminated Glass
    else if (glassSpec === "31.52mm (6+1.52+6+12+6) DGU Laminated Glass") {
      return 425;
    }
    // Clear Float Glass
    else if (glassSpec === "5/6mm Clear Float Glass") {
      return 60;
    }
    // Default fallback
    return 0;
  }

  function getTotalHandleCost(item: QuotationItem) {
    const count = handleCountTable[item.systemType]?.[item.series]?.[item.description] ?? 0;
    const rate = handleRateTable[item.systemType]?.[item.handleType]?.[item.handleColor] ?? 0;
    return (count * rate)/item.area;
  }

  function getMeshRate(item: QuotationItem) {
    const rate = meshRateTable[item.meshPresent]?.[item.meshType] ?? 0;
    return rate;
  }

  const calculateRate = (item: QuotationItem) => {
    const system = baseRateTable[item.systemType as keyof typeof baseRateTable];
    console.log('system', system);
    if (!system) return 0;

    const series = system[item.series as keyof typeof system];
    console.log('series', series);
    if (!series) return 0;

    console.log(item.description, 'description');
    const descriptionRates = series[item.description];
    console.log('descriptionRates', descriptionRates);
    if (!descriptionRates) return 0;

    const slab = AREA_SLABS.find(s => item.area <= s.max);
    const baseRate = descriptionRates[slab?.index as keyof typeof descriptionRates];
    const colorRate = getColorFinishRate(item.colorFinish);
    const glassRate = getGlassRate(item.glassSpec);
    const handleRate = getTotalHandleCost(item);
    const meshRate = getMeshRate(item);

    console.log(baseRate, colorRate, glassRate, handleRate, meshRate, 'rates');

    const rate = baseRate + colorRate + glassRate + handleRate + meshRate;
    return rate || 0;
  }

  // Function to get image path based on description
  const getImagePath = (description: string): string => {

    if (!description) return "";

    if (description === 'Fix') {
      console.log(description, 'description', '/Quotations/Fix.png');
      return '/Quotations/Fix.png';
    }

    if (description === 'French Door' || description === 'French Window') {
      console.log(description, 'description', '/Quotations/French Door-Window.jpg');
      return '/Quotations/French Door-Window.jpg';
    }

    if (description === 'Left Openable Window' || description === 'Left Openable Door') {
      console.log(description, 'description', '/Quotations/Left Openable Door-Window.jpg');
      return '/Quotations/Left Openable Door-Window.jpg';
    }

    if (description === 'Right Openable Window' || description === 'Right Openable Door') {
      console.log(description, 'description', '/Quotations/Right Openable Door-Window.jpg');
      return '/Quotations/Right Openable Door-Window.jpg';
    }

    console.log(description, 'description', `/Quotations/${description}.jpg`);

    return description ? `/Quotations/${description}.jpg` : "";
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        // Auto-calculate area when width or height changes
        if (field === 'width' || field === 'height') {
          updatedItem.area = (updatedItem.width * updatedItem.height) / (304.78 ** 2);
        }

        // Auto-calculate amount when quantity, rate, or area changes
        if (field === 'quantity' || field === 'rate' || field === 'area') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }

        // Auto-update refImage when description changes
        if (field === 'description') {
          updatedItem.refImage = getImagePath(value as string);
        }

        if (field !== 'rate') {
          const rate = calculateRate(updatedItem);
          console.log(rate);
          updatedItem.rate = rate;
        }

        
        updatedItem.amount = updatedItem.quantity * updatedItem.rate;

        return updatedItem;
      }
      return item;
    }));
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
      remarks: ""
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
  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.amount, 0);
  };

  const calculateTotalArea = () => {
    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
    const totalArea = items.reduce((total, item) => total + item.area, 0);
    return totalArea * totalQuantity;
  };

  const calculateTotalQuantity = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateTotalWithProfit = () => {
    const baseTotal = calculateTotal();
    const profitAmount = (baseTotal * profitPercentage) / 100;
    return baseTotal + profitAmount;
  };

  // Update quotation (instead of create new)
  const handleUpdate = () => {
    const updatedQuotation = {
      id: quotationId, // Keep the same ID
      ...quotationDetails,
      customerDetails,
      items,
      total: calculateTotalWithProfit(), // Save with profit included
      baseTotal: calculateTotal(), // Save base total separately
      profitPercentage,
      updatedAt: new Date().toISOString(), // Add updated timestamp
    };

    // Update in localStorage
    const existingQuotations = JSON.parse(localStorage.getItem('quotations') || '[]');
    const updatedQuotations = existingQuotations.map((q: any) =>
      q.id === quotationId ? { ...q, ...updatedQuotation } : q
    );
    localStorage.setItem('quotations', JSON.stringify(updatedQuotations));

    alert('Quotation updated successfully!');
    router.push('/quotations');
  };

  // Download PDF function
  const handleDownloadPDF = async () => {
    const quotation = {
      id: quotationId,
      ...quotationDetails,
      customerDetails,
      items,
      total: calculateTotalWithProfit(), // Use total with profit for PDF
      baseTotal: calculateTotal(), // Include base total
      profitPercentage, // Include profit percentage
      createdAt: new Date().toISOString(),
    };

    try {
      await generateQuotationPDF(quotation);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <p className="text-sm text-gray-600">#{quotationDetails.quotationNumber}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quotation Number
                  </label>
                  <input
                    type="text"
                    value={quotationDetails.quotationNumber}
                    onChange={(e) => setQuotationDetails({...quotationDetails, quotationNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                  />
                </div>
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
                  value={profitPercentage}
                  onChange={(e) => setProfitPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] text-center"
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Final Amount</div>
                <div className="text-lg font-bold text-[#124657]">₹{calculateTotalWithProfit().toLocaleString('en-IN')}</div>
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
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-3 text-center text-sm font-medium">{index + 1}</td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={item.refCode}
                          onChange={(e) => updateItem(item.id, 'refCode', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
                          placeholder="Ref code..."
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={item.location}
                          onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
                          placeholder="Location..."
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={item.width}
                          onChange={(e) => updateItem(item.id, 'width', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
                          placeholder="Width"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={item.height}
                          onChange={(e) => updateItem(item.id, 'height', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
                          placeholder="Height"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <select
                          value={item.systemType}
                          onChange={(e) => updateItem(item.id, 'systemType', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
                        >
                          <option value="">Select System</option>
                          <option value="Casement">Casement</option>
                          <option value="Sliding">Sliding</option>
                          <option value="Slide N Fold">Slide N Fold</option>
                        </select>
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <select
                          value={item.series}
                          onChange={(e) => updateItem(item.id, 'series', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                          disabled={item.systemType === ''}
                        >
                          <option value="">Select Series</option>
                          {item.systemType === 'Casement' && (
                            <>
                              <option value="40mm">40mm</option>
                              <option value="50mm">50mm</option>
                              <option value="114mm">114mm</option>
                            </>
                          )}
                          {item.systemType === 'Sliding' && (
                            <>
                              <option value="29mm">29mm</option>
                              <option value="44mm">44mm</option>
                            </>
                          )}
                          {item.systemType === 'Slide N Fold' && (
                            <>
                              <option value="Glazia GU">Glazia GU</option>
                            </>
                          )}
                        </select>
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                            disabled={item.series === ''}
                          >
                            <option value="">Select Description</option>
                            {
                              item.systemType === 'Casement' && item.series === '40mm' && (
                                <>
                                  <option value="Fix">Fix</option>
                                  <option value="Left Openable Window">Left Openable Window</option>
                                  <option value="Right Openable Window">Right Openable Window</option>
                                  <option value="Top Hung Window">Top Hung Window</option>
                                  <option value="Bottom Hung Window">Bottom Hung Window</option>
                                  <option value="French Window">French Window</option>
                                </>
                              )
                            }
                            {
                              item.systemType === 'Casement' && item.series === '50mm' && (
                                <>
                                  <option value="Fix">Fix</option>
                                  <option value="Left Openable Window">Left Openable Window</option>
                                  <option value="Right Openable Window">Right Openable Window</option>
                                  <option value="Top Hung Window">Top Hung Window</option>
                                  <option value="Bottom Hung Window">Bottom Hung Window</option>
                                  <option value="Tilt and Turn Window">Tilt and Turn Window</option>
                                  <option value="Parallel Window">Parallel Window</option>
                                  <option value="French Window">French Window</option>
                                  <option value="Left Openable Door">Left Openable Door</option>
                                  <option value="Right Openable Door">Right Openable Door</option>
                                  <option value="French Door">French Door</option>
                                </>
                              )
                            }
                            {
                              item.systemType === 'Casement' && item.series === '114mm' && (
                                <>
                                    <option value="Left Openable">Left Openable</option>
                                    <option value="Right Openable">Right Openable</option>
                                    <option value="Left Openable + Fixed">Left Openable + Fixed</option>
                                    <option value="Fixed + Right Openable">Fixed + Right Openable</option>
                                    <option value="Left Openable + Fixed + right Openable">Left Openable + Fixed + right Openable</option>
                                </>
                              )
                            }
                            {
                              item.systemType === 'Sliding' && item.series === '29mm' && (
                                <>
                                  <option value="2 Track 2 Glass Panel">2 Track 2 Glass Panel</option>
                                  <option value="2 Track 3 Glass Panel">2 Track 3 Glass Panel</option>
                                  <option value="2 Track 4 Glass Panel">2 Track 4 Glass Panel</option>
                                  <option value="3 Track 2 Glass 1 Mesh Panel">3 Track 2 Glass 1 Mesh Panel</option>
                                  <option value="3 Track 3 Glass Panel">3 Track 3 Glass Panel</option>
                                  <option value="3 Track 3 Glass 1 Mesh Panel">3 Track 3 Glass 1 Mesh Panel</option>
                                  <option value="3 Track 4 Glass Panel 2 Mesh Panel">3 Track 4 Glass Panel 2 Mesh Panel</option>
                                </>
                              )
                            }
                            {
                              item.systemType === 'Sliding' && item.series === '44mm' && (
                                <>
                                  <option value="2 Track 2 Glass Panel">2 Track 2 Glass Panel</option>
                                  <option value="2 Track 3 Glass Panel">2 Track 3 Glass Panel</option>
                                  <option value="2 Track 4 Glass Panel">2 Track 4 Glass Panel</option>
                                  <option value="3 Track 2 Glass 1 Mesh Panel">3 Track 2 Glass 1 Mesh Panel</option>
                                  <option value="3 Track 3 Glass Panel">3 Track 3 Glass Panel</option>
                                  <option value="3 Track 3 Glass 1 Mesh Panel">3 Track 3 Glass 1 Mesh Panel</option>
                                  <option value="3 Track 4 Glass Panel 2 Mesh Panel">3 Track 4 Glass Panel 2 Mesh Panel</option>
                                  <option value="3 Track 6 Glass Panel">3 Track 6 Glass Panel</option>
                                </>
                              )
                            }
                            {
                              item.systemType === 'Slide N Fold' && item.series === 'Glazia GU' && (
                                <>
                                  <option value="2 Panel (1+1)">2 Panel (1+1)</option>
                                  <option value="3 Panel (1+2)">3 Panel (1+2)</option>
                                  <option value="4 Panel (1+3)">4 Panel (1+3)</option>
                                  <option value="5 Panel (1+4)">5 Panel (1+4)</option>
                                  <option value="6 Panel (1+5)">6 Panel (1+5)</option>
                                </>
                              )
                            }
                          </select>
                        </td>
                      <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={item.colorFinish}
                            onChange={(e) => updateItem(item.id, 'colorFinish', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
                          >
                            <option value="">Select Color Finish</option>

                            {/* Powder Coating Options */}
                            <optgroup label="Powder Coating">
                              <option value="Grey-Tex 2200">Grey-Tex 2200</option>
                              <option value="Grey-Tex 2900">Grey-Tex 2900</option>
                              <option value="Matt Black-9005">Matt Black - 9005</option>
                              <option value="White-9003">White - 9003</option>
                              <option value="Anodic Bronze-SW28BN">Anodic Bronze - SW28BN</option>
                              <option value="Champagne-SDA53N">Champagne - SDA53N</option>
                            </optgroup>

                            {/* Anodizing Options */}
                            <optgroup label="Anodizing">
                              <option value="Champagne">Champagne</option>
                              <option value="Black">Black</option>
                            </optgroup>

                            {/* Wooden Options */}
                            <optgroup label="Wooden">
                              <option value="Wenge">Wenge</option>
                              <option value="XYZ">XYZ</option>
                              <option value="ABC">ABC</option>
                            </optgroup>
                          </select>
                        </td>
                      <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={item.glassSpec}
                            onChange={(e) => updateItem(item.id, 'glassSpec', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
                          >
                            <option value="">Select Glass Spec</option>

                            {/* Clear Toughened Glass Options */}
                            <optgroup label="Clear Toughened Glass">
                              <option value="5mm Clear Toughened">5mm Clear Toughened</option>
                              <option value="6mm Clear Toughened">6mm Clear Toughened</option>
                              <option value="8mm Clear Toughened">8mm Clear Toughened</option>
                              <option value="10mm Clear Toughened">10mm Clear Toughened</option>
                              <option value="12mm Clear Toughened">12mm Clear Toughened</option>
                            </optgroup>

                            {/* Frosted Toughened Glass Options */}
                            <optgroup label="Frosted Toughened Glass">
                              <option value="5/6mm Frosted Toughened">5/6mm Frosted Toughened</option>
                            </optgroup>

                            {/* DGU Glass Options */}
                            <optgroup label="DGU Glass">
                              <option value="20mm (5+10+5) DGU Glass">20mm (5+10+5) DGU Glass</option>
                              <option value="24mm (6+12+6) DGU Glass">24mm (6+12+6) DGU Glass</option>
                              <option value="32mm (8+12+8) DGU Glass">32mm (8+12+8) DGU Glass</option>
                            </optgroup>

                            {/* Security/Laminated Glass Options */}
                            <optgroup label="Security/Laminated Glass">
                              <option value="11.52mm (5+1.52+5) Laminated Glass">11.52mm (5+1.52+5) Laminated Glass</option>
                              <option value="13.52mm (6+1.52+6) Laminated Glass">13.52mm (6+1.52+6) Laminated Glass</option>
                              <option value="17.52mm (8+1.52+8) Laminated Glass">17.52mm (8+1.52+8) Laminated Glass</option>
                            </optgroup>

                            {/* DGU Laminated Glass Options */}
                            <optgroup label="DGU Laminated Glass">
                              <option value="31.52mm (6+1.52+6+12+6) DGU Laminated Glass">31.52mm (6+1.52+6+12+6) DGU Laminated Glass</option>
                            </optgroup>

                            {/* Clear Float Glass Options */}
                            <optgroup label="Clear Float Glass">
                              <option value="5/6mm Clear Float Glass">5/6mm Clear Float Glass</option>
                            </optgroup>
                          </select>
                        </td>
                      <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={item.handleType}
                            onChange={(e) => updateItem(item.id, 'handleType', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
                          >
                            <option value="">Select Handle</option>
                            {
                              item.systemType === 'Sliding' && (
                                <>
                                  <option value="Metro Handle">Metro Handle</option>
                                  <option value="Touch Lock">Touch Lock</option>
                                  <option value="D handle">D handle</option>
                                  <option value="Pop-up handle">Pop-up handle</option>
                                </>
                              )
                            }
                            {
                              (item.systemType === 'Casement' || item.systemType === 'Slide N Fold') && (
                                <>
                                  <option value="Mortise Handle with lock">Mortise Handle with lock</option>
                                  <option value="L handle">L handle</option>
                                  <option value="Cremone Handle">Cremone Handle</option>
                                  <option value="Cocksper Handle">Cocksper Handle</option>
                                </>
                              )
                            }
                          </select>
                        </td>
                      <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={item.handleColor}
                            onChange={(e) => updateItem(item.id, 'handleColor', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
                          >
                            <option value="">Select Color</option>
                            <option value="Black">Black</option>
                            <option value="Silver">Silver</option>
                          </select>
                        </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <select
                          value={item.meshPresent}
                          onChange={(e) => updateItem(item.id, 'meshPresent', e.target.value)}
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
                            onChange={(e) => updateItem(item.id, 'meshType', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657] bg-white"
                          >
                            <option value="">Select Mesh</option>
                            <option value="SS Mesh - Black">SS Mesh - Black</option>
                            <option value="SS Mesh - Natural">SS Mesh - Natural</option>
                            <option value="Pleated Mesh">Pleated Mesh</option>
                          </select>
                        </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={item.rate.toFixed(2)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded bg-gray-50"
                          onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
                          min="1"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        {item.refImage && (
                          <img
                            src={item.refImage}
                            alt="Reference"
                            className="w-16 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-[#124657] focus:border-[#124657]"
                          placeholder="Remarks..."
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          disabled={items.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms and Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Terms & Notes</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  value={quotationDetails.terms}
                  onChange={(e) => setQuotationDetails({...quotationDetails, terms: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={quotationDetails.notes}
                  onChange={(e) => setQuotationDetails({...quotationDetails, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                  placeholder="Any additional notes or special instructions..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
