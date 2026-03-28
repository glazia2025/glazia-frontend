"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import {
  generateQuotationPDF,
  generateQuotationPDFBlob,
} from "@/utils/pdfGenerator";

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: any;
}

export default function PDFViewerModal({ isOpen, onClose, quotation }: PDFViewerModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && quotation) {
      generatePDFBlob();
    }

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [isOpen, quotation]);

  const generatePDFBlob = async () => {
    setIsLoading(true);
    setError("");
    try {
      if (!quotation) {
        return;
      }
      const pdfBlob = await generateQuotationPDFBlob(quotation);
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to generate PDF preview: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (quotation) generateQuotationPDF(quotation);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            PDF Preview – {quotation?.generatedId}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-3 py-2 bg-[#124657] text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#124657] mx-auto mb-4"></div>
                <p className="text-gray-600">Generating PDF preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={generatePDFBlob}
                  className="px-4 py-2 bg-[#124657] text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
               src={pdfUrl}
              className="w-full h-full border border-gray-300 rounded-lg"
              title="PDF Preview"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
