"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { generateQuotationPDF, createQuotationHTML } from "@/utils/pdfGenerator";
import { createPdfFrame } from "@/utils/pdfFrame";

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

  // Convert image → base64
  const imageToBase64 = (url: string): Promise<string> =>
    new Promise((resolve) => {
      if (!url) return resolve("");

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            resolve(canvas.toDataURL("image/jpeg", 0.8));
          } catch {
            resolve("");
          }
        } else {
          resolve("");
        }
      };

      img.onerror = () => resolve("");

      img.src = url.startsWith("/") ? window.location.origin + url : url;
    });

  const generatePDFBlob = async () => {
    setIsLoading(true);
    setError("");

    let cleanupFrame: (() => void) | null = null;
    try {
      if (!quotation) {
        return;
      }
      const html2pdf = (await import("html2pdf.js")).default;

      // Convert images → base64
      const items = quotation.items ?? [];
      const itemsWithImages = await Promise.all(
        items.map(async (item: any) => ({
          ...item,
          refImage: item.refImage ? await imageToBase64(item.refImage) : "",
          subItems: item.subItems
            ? await Promise.all(
                item.subItems.map(async (sub: any) => ({
                  ...sub,
                  refImage: sub.refImage ? await imageToBase64(sub.refImage) : "",
                }))
              )
            : undefined,
        }))
      );

      const quotationWithImages = {
        ...quotation,
        items: itemsWithImages,
      };

      // Generate HTML for PDF
      const htmlContent = await createQuotationHTML(quotationWithImages);

      const { body, cleanup, doc } = await createPdfFrame(htmlContent);
      cleanupFrame = cleanup;

      const options = {
        margin: [5, 5, 5, 5] as [number, number, number, number],
        filename: `${quotation.quotationNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          onclone: (clonedDoc: Document) => {
            if (doc.head && clonedDoc.head) {
              clonedDoc.head.innerHTML = "";
              clonedDoc.head.appendChild(doc.head.cloneNode(true));
            }
          },
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"] as Array<"avoid-all" | "css" | "legacy">,
          avoid: ["img", "p", "h1", "h2", "h3", "h4", "h5", "h6", "table", "tr", ".avoid-break"],
        },
      };

      // FIX: Proper PDF Worker
      const worker = html2pdf().set(options).from(body);

      await worker.toPdf();
      const pdfBlob = await worker.output("blob");

      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to generate PDF preview: ${err.message}`);
    } finally {
      cleanupFrame?.();
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
