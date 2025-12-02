"use client";

import { useState, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { generateQuotationPDF } from "@/utils/pdfGenerator";

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
      console.log('Modal opened with quotation:', quotation);
      generatePDFBlob();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, quotation]);

  const generatePDFBlob = async () => {
    console.log('Starting PDF generation...');
    setIsLoading(true);
    setError("");

    try {
      // Import html2pdf dynamically
      console.log('Importing html2pdf...');
      const html2pdf = (await import('html2pdf.js')).default;
      console.log('html2pdf imported successfully');

      // Create HTML content for PDF
      console.log('Creating HTML content...');
      const htmlContent = createQuotationHTML(quotation);
      console.log('HTML content created, length:', htmlContent.length);

      // Create a temporary div
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '297mm';
      tempDiv.style.minHeight = '210mm';
      document.body.appendChild(tempDiv);
      console.log('Temporary div created and added to DOM');

      // Configure html2pdf options
      const options = {
        margin: [10, 10, 10, 10],
        filename: `${quotation.quotationNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          width: 1122, // A4 landscape width in pixels at 96 DPI
          height: 794   // A4 landscape height in pixels at 96 DPI
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'landscape',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      console.log('Generating PDF blob...');
      // Generate PDF blob
      const pdfBlob = await html2pdf().set(options).from(tempDiv).outputPdf('blob');
      console.log('PDF blob generated, size:', pdfBlob.size);

      // Clean up
      document.body.removeChild(tempDiv);
      console.log('Temporary div removed from DOM');

      // Create URL for the blob
      const url = URL.createObjectURL(pdfBlob);
      console.log('PDF URL created:', url);
      setPdfUrl(url);

    } catch (err) {
      console.error('Error generating PDF:', err);
      setError(`Failed to generate PDF preview: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createQuotationHTML = (quotation: any): string => {
    console.log('Creating PDF HTML for quotation:', quotation);

    if (!quotation) {
      return '<html><body><h1>No quotation data available</h1></body></html>';
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
          }

          .container {
            width: 100%;
            max-width: 297mm;
            margin: 0 auto;
            padding: 10mm;
            background: white;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #124657;
          }

          .company-info h1 {
            color: #124657;
            font-size: 24px;
            margin: 0 0 5px 0;
            font-weight: bold;
          }

          .company-info p {
            margin: 2px 0;
            font-size: 10px;
            color: #666;
          }

          .quotation-info {
            text-align: right;
          }

          .quotation-info h2 {
            color: #124657;
            font-size: 20px;
            margin: 0 0 10px 0;
          }

          .quotation-info p {
            margin: 2px 0;
            font-size: 10px;
          }

          .customer-section {
            margin: 15px 0;
          }

          .customer-section h3 {
            color: #124657;
            font-size: 12px;
            margin-bottom: 8px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
          }

          .customer-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 9px;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 8px;
          }

          .items-table th {
            background-color: #124657;
            color: white;
            padding: 6px 3px;
            text-align: center;
            border: 1px solid #124657;
            font-weight: bold;
          }

          .items-table td {
            padding: 4px 3px;
            border: 1px solid #ddd;
            text-align: center;
            vertical-align: middle;
          }

          .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }

          .total-section {
            margin-top: 15px;
            text-align: right;
          }

          .total-amount {
            font-size: 14px;
            font-weight: bold;
            color: #124657;
            background-color: #f0f8ff;
            padding: 8px 12px;
            border-radius: 5px;
            display: inline-block;
          }

          .terms-section {
            margin-top: 20px;
            font-size: 9px;
          }

          .terms-section h4 {
            color: #124657;
            font-size: 11px;
            margin-bottom: 8px;
          }

          .terms-content {
            line-height: 1.4;
            white-space: pre-line;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-info">
              <h1>GLAZIA</h1>
              <p>Premium Aluminium Solutions</p>
              <p>📧 info@glazia.com | 📞 +91 98765 43210</p>
              <p>🏢 123 Business Park, Mumbai, Maharashtra 400001</p>
            </div>
            <div class="quotation-info">
              <h2>QUOTATION</h2>
              <p><strong>Number:</strong> ${quotation.quotationNumber || 'N/A'}</p>
              <p><strong>Date:</strong> ${quotation.date ? new Date(quotation.date).toLocaleDateString('en-IN') : 'N/A'}</p>
              <p><strong>Valid Until:</strong> ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-IN') : 'N/A'}</p>
            </div>
          </div>

          <div class="customer-section">
            <h3>Customer Details</h3>
            <div class="customer-details">
              <div>
                <strong>Name:</strong> ${quotation.customerDetails?.name || 'N/A'}<br>
                <strong>Company:</strong> ${quotation.customerDetails?.company || 'N/A'}
              </div>
              <div>
                <strong>Email:</strong> ${quotation.customerDetails?.email || 'N/A'}<br>
                <strong>Phone:</strong> ${quotation.customerDetails?.phone || 'N/A'}
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th rowspan="2">S.No</th>
                <th rowspan="2">Ref Code</th>
                <th rowspan="2">Location</th>
                <th rowspan="2">WXH</th>
                <th rowspan="2">Area (sq ft)</th>
                <th colspan="3">System Details</th>
                <th colspan="2">Glass & Hardware</th>
                <th colspan="2">Mesh Details</th>
                <th rowspan="2">Rate</th>
                <th rowspan="2">Qty</th>
                <th rowspan="2">Amount</th>
                <th rowspan="2">Remarks</th>
              </tr>
              <tr>
                <th>Type</th>
                <th>Series</th>
                <th>Description</th>
                <th>Glass Spec</th>
                <th>Handle</th>
                <th>Present</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${quotation.items && quotation.items.length > 0 ? quotation.items.map((item: any, index: number) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.refCode || ''}</td>
                  <td>${item.location || ''}</td>
                  <td>${item.width || 0}×${item.height || 0}</td>
                  <td>${item.area ? item.area.toFixed(2) : '0.00'}</td>
                  <td>${item.systemType || ''}</td>
                  <td>${item.series || ''}</td>
                  <td>${item.description || ''}</td>
                  <td>${item.glassSpec || ''}</td>
                  <td>${item.handleType || ''} ${item.handleColor ? '(' + item.handleColor + ')' : ''}</td>
                  <td>${item.meshPresent || ''}</td>
                  <td>${item.meshType || ''}</td>
                  <td>₹${item.rate ? item.rate.toFixed(2) : '0.00'}</td>
                  <td>${item.quantity || 0}</td>
                  <td>₹${item.amount ? item.amount.toLocaleString('en-IN') : '0'}</td>
                  <td>${item.remarks || ''}</td>
                </tr>
              `).join('') : '<tr><td colspan="16">No items found</td></tr>'}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-amount">
              Total Amount: ₹${quotation.total ? quotation.total.toLocaleString('en-IN') : '0'}
            </div>
          </div>

          <div class="terms-section">
            <h4>Terms & Conditions</h4>
            <div class="terms-content">${quotation.terms || 'No terms specified'}</div>

            ${quotation.notes ? `
              <h4 style="margin-top: 15px;">Additional Notes</h4>
              <div class="terms-content">${quotation.notes}</div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownload = () => {
    if (quotation) {
      generateQuotationPDF(quotation);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            PDF Preview - {quotation?.quotationNumber}
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
