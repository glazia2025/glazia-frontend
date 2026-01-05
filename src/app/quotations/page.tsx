"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Calendar } from "lucide-react";
import { generateQuotationPDF } from "@/utils/pdfGenerator";
import PDFViewerModal from "@/components/PDFViewerModal";

interface QuotationItem {
  id?: string;
  refCode?: string;
  location?: string;
  width?: number;
  height?: number;
  area?: number;
  systemType?: string;
  series?: string;
  description?: string;
  colorFinish?: string;
  glassSpec?: string;
  handleType?: string;
  handleColor?: string;
  handleCount?: number;
  meshPresent?: boolean | string;
  meshType?: string;
  rate?: number;
  quantity?: number;
  amount?: number;
  refImage?: string;
  remarks?: string;
}

interface Quotation {
  id: string;
  quotationNumber?: string;
  createdAt?: string;
  quotationDetails?: {
    id?: string;
    date?: string;
    opportunity?: string;
    terms?: string;
    notes?: string;
  };
  customerDetails?: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
  };
  items?: QuotationItem[];
  breakdown?: {
    baseRate?: number;
    areaSlabIndex?: number;
  };
  validUntil?: string;
  totalAmount?: number;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getQuotations = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.glazia.in"}/api/quotations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch quotations (${response.status})`);
        }
        const data = await response.json();
        const list: Quotation[] = Array.isArray(data) ? data : Array.isArray(data?.quotations) ? data.quotations : [];
        setQuotations(list);
      } catch (err: unknown) {
        console.error("Error loading quotations", err);
        setError(err instanceof Error ? err.message : "Failed to load quotations");
      } finally {
        setLoading(false);
      }
    };
    getQuotations();
  }, []);

  const enrichedQuotations = useMemo(() => {
    return quotations.map((q) => {
      const items = q.items ?? [];
      const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const validUntil = q.validUntil || "";
      const quotationNumber = q.quotationNumber || q.quotationDetails?.id || (q as { _id?: string })._id || "";
      const date = q.quotationDetails?.date || (q as { date?: string }).date || q.createdAt || "";
      return {
        ...q,
        quotationNumber,
        totalAmount,
        validUntil,
        date,
      };
    });
  }, [quotations]);

  const sortedQuotations = useMemo(() => {
    const list = [...enrichedQuotations];
    list.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime();
      }
      if (sortBy === "amount") {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      }
      if (sortBy === "customer") {
        return (a.customerDetails?.name || "").localeCompare(b.customerDetails?.name || "");
      }
      return 0;
    });
    return list;
  }, [enrichedQuotations, sortBy]);

  const deleteQuotation = (id: string) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      const updatedQuotations = quotations.filter(q => {
        const backendId = (q as { _id?: string })._id;
        return backendId !== id && q.id !== id;
      });
      setQuotations(updatedQuotations);
    }
  };

  const downloadQuotationPDF = (quotation: Quotation) => {
    try {
      generateQuotationPDF(quotation);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const fetchQuotationDetails = async (quotationId: string) => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.glazia.in"}/api/quotations/${quotationId}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch quotation (${response.status})`);
    }
    const data = await response.json();
    return data.quotation ?? data;
  };

  const viewQuotation = async (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsModalOpen(true);

    const id = quotation.id || (quotation as { _id?: string })._id;
    if (!id || quotation.items?.length) {
      return;
    }

    try {
      const fullQuotation = await fetchQuotationDetails(id);
      setSelectedQuotation((prev) => ({
        ...prev,
        ...fullQuotation,
        id: id,
      }));
    } catch (error) {
      console.error("Error loading quotation", error);
      setError("Failed to load quotation");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuotation(null);
  };

  const getStatusBadge = (quotation: Quotation) => {
    const today = new Date();
    const validUntil = new Date(quotation.validUntil);
    const isExpired = validUntil < today;

    if (isExpired) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Expired</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Valid</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <nav className="text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-[#124657] transition-colors">
                Back to Home
              </Link>
            </nav>
            <Link
              href="/quotations/settings"
              className="text-sm font-medium text-[#124657] hover:underline"
            >
              Quotation Settings
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Loading quotations...
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
            <p className="text-gray-600 mt-2">Manage your quotations and proposals</p>
          </div>
          <Link
            href="/quotations/create"
            className="mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-3 bg-[#124657] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Quotation</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search quotations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="valid">Valid</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="customer">Sort by Customer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quotations</p>
                <p className="text-2xl font-bold text-gray-900">{quotations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">📄</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{quotations.reduce((sum, q) => sum + q.breakdown.totalAmount, 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotations.filter(q => {
                    const quotationDate = new Date(q.createdAt);
                    const now = new Date();
                    return quotationDate.getMonth() === now.getMonth() && quotationDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quotations List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {sortedQuotations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-3xl">📄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search criteria' : 'Create your first quotation to get started'}
              </p>
              <Link
                href="/quotations/create"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#124657] text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Quotation</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valid Until
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedQuotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {quotation.generatedId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quotation.items.length} item{quotation.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {quotation.customerDetails.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quotation.customerDetails.company || quotation.customerDetails.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quotation.date ? new Date(quotation.date).toLocaleDateString('en-IN') : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{(quotation.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(quotation)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewQuotation(quotation)}
                            className="text-[#124657] hover:text-blue-700 transition-colors"
                            title="View Quotation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/quotations/edit/${quotation._id}`}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            title="Edit Quotation"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => downloadQuotationPDF(quotation)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteQuotation(quotation.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Quotation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        quotation={selectedQuotation}
      />
    </div>
  );
}
