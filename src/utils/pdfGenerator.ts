// Dynamic import for html2pdf to avoid SSR issues

// Helper function to convert image URL to base64
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataURL);
        } catch (error) {
          console.warn('Failed to convert image to base64:', error);
          resolve('');
        }
      } else {
        resolve('');
      }
    };

    img.onerror = () => {
      console.warn('Failed to load image:', url);
      resolve('');
    };

    // Handle relative URLs
    if (url.startsWith('/')) {
      img.src = window.location.origin + url;
    } else {
      img.src = url;
    }
  });
};

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

interface QuotationData {
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

export function getInitials(name?: string): string {
  if (!name) return "??";

  // Remove domain parts and special characters
  const cleanName = name
    .replace(/\.in|\.com|\.org|\.net/gi, "")
    .replace(/[^a-zA-Z ]/g, "")
    .trim();

  const parts = cleanName.split(" ").filter(Boolean);

  // Case 1: Multi-word name → first letter of first two words
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Case 2: Single word → first two letters
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return "??";
}


export const createQuotationHTML = (quotation: QuotationData): string => {
  const user = window.localStorage.getItem('glazia-user');
  let userData: { name?: string; email?: string; phone?: string } = {};

  if (user) {
    userData = JSON.parse(user);
  }

  const nl2br = (str: string) => {
    if (!str) return "";
    return str.replace(/\n/g, "<br>");
  };

  const profitMultiplier =
    (quotation as unknown as { profitPercentage?: number })?.profitPercentage
      ? 1 + ((quotation as unknown as { profitPercentage?: number }).profitPercentage || 0) / 100
      : 1;

  // Adjust item rates and amounts to include profit
  const adjustedItems = (quotation.items || []).map((item) => ({
    ...item,
    rate: (item.rate || 0) * profitMultiplier,
    amount: (item.amount || 0) * profitMultiplier,
  }));

  const rawTotal = quotation.totalAmount ?? adjustedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const baseTotal = rawTotal;
  const gstValue = baseTotal * 0.18;
  const grandTotal = baseTotal + gstValue;
  const totalArea = adjustedItems.reduce((sum, item) => sum + (item.area || 0) * (item.quantity || 1), 0);
  const totalQty = adjustedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const avgWithGst = totalArea ? grandTotal / totalArea : 0;
  const avgWithoutGst = totalArea ? baseTotal / totalArea : 0;

  const quotationNumber =
    quotation.quotationNumber || quotation.quotationDetails?.id || quotation.id || "";
  const quotationDate =
    quotation.quotationDetails?.date ||
    quotation.createdAt ||
    new Date().toISOString();
  const quotationTerms =
    quotation.quotationDetails?.terms || "";
  const customer = quotation.customerDetails || {};

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quotation ${quotation.quotationNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          font-size: 10px;
          color: #2b2b2b;
          background: #ffffff;
        }
        .container {
          width: 100%;
          margin: 0 auto;
          padding: 4mm 3mm;
          background: #ffffff;
        }
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8mm;
        }
        .user-logo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          color: #ffffff;
          background-color: #6b7280; /* fallback */
          overflow: hidden;
          user-select: none;
        }
        .logo {
          font-size: 36px;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        .quotation-label {
          color: #E10E0E;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .contact {
          text-align: right;
          font-size: 12px;
          line-height: 1.4;
        }
        .navy-bar {
          background: #2F3A4F;
          color: #fff;
          padding: 8px;
          text-align: center;
          font-size: 24px;
          font-weight: 500;
        }

        .info-container {
          border: 1px solid #000;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        
        .info-grid {
          
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6mm;
        }
        .info-card {
         
        }
        .info-title {
          font-size: 10px;
          font-weight: 700;
          color: #2b2b2b;
          margin-bottom: 4px;
        }
        .info-line {
          font-size: 10px;
          color: #2f2f2f;
          line-height: 1.4;
        }
        .meta-card {
          border-left: 1px solid #d8d8d8;
          padding: 8px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 8px;
          font-size: 10px;
        }
        .meta-label {
          color: #444;
        }
        .meta-value {
          font-weight: 600;
          color: #000;
          text-align: right;
        }
        .table-wrapper {
          border: 1px solid #000;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 6mm;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: center;
        }
        thead {
          background: #f7f7f7;
          text-align: center;
        }
        .head-top th {
          background: #FFF;
          color: #222;
          font-size: 8px;
          padding: 5px;
          border: 1px solid #e0e0e0;
          text-align: center;
          font-weight: 700;
        }
        .head-sub th {
          background: #FFF;
          color: #222;
          font-size: 8px;
          padding: 4px 3px;
          border: 1px solid #e0e0e0;
          text-align: center;
          font-weight: 700;
        }
        tbody td {
          border: 1px solid #e0e0e0;
          padding: 4px 3px;
          font-size: 8px;
          text-align: center;
          line-height: 1.35;
        }
        tbody tr:nth-child(even) {
          background: #fafafa;
        }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .no-image {
          font-size: 7px;
          color: #999;
        }
        .ref-image {
          max-width: 28mm;
          max-height: 18mm;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }
        .summary {
          display: flex;
          justify-content: left;
          margin: 6mm 0;
        }
        .total-card {
          padding: 10px 12px;
          width: 50%;
        }
        .total-heading {
          color: #d5272b;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .total-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-size: 9px;
          padding: 4px 0;
          border-bottom: 1px solid #000; 
        }
        .total-row strong {
          font-size: 10px;
        }
        .lists {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6mm;
          margin-top: 4mm;
        }
        .page-break {
          page-break-before: always;
          break-before: page;
        }
        .list-card {
          border: 1px solid #d8d8d8;
          padding: 10px 12px;
        }
        .list-title {
          color: #d5272b;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .list-body {
          font-size: 9px;
          line-height: 1.5;
        }
        .signature-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20mm;
          margin-top: 10mm;
          font-size: 9px;
        }
        .sig-line {
          border-top: 1px solid #000;
          padding-top: 6px;
          text-align: center;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="top-bar">
          ${userData.logo ? `<img src="${userData.logo}" alt="User Logo" />` : `<div class='user-logo'>${getInitials(userData.name)}</div>`}
          <div class="quotation-label">QUOTATION</div>
          <div class="logo">GLAZIA</div>
        </div>

        <div class="navy-bar">Glazia Windoors Private Limited</div>

        <div class="info-container">

        <div class="info-grid">
          <div class="info-card">
            <div class="info-title">Bill To:</div>
            <div class="info-line"><strong>${customer.name || "-"}</strong></div>
            ${customer.company ? `<div class="info-line">${customer.company}</div>` : ""}
            ${customer.address ? `<div class="info-line">${customer.address}</div>` : ""}
            <div class="info-line">${[customer.city, customer.state, customer.pincode].filter(Boolean).join(", ")}</div>
            <div class="info-line">Phone: ${customer.phone || "-"}</div>
            <div class="info-line">Email: ${customer.email || "-"}</div>
          </div>
          <div class="info-card">
            <div class="info-title">Bill From:</div>
            <div class="info-line"><strong>${userData.name}</strong></div>
            <div class="info-line">${userData.completeAddress}</div>
            <div class="info-line">${userData.city}, ${userData.state} - ${userData.pincode}</div>
            <div class="info-line">India</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Quotation no.:</div><div class="meta-value">${quotation._id}</div>
            <div class="meta-label">Quote Generated on:</div><div class="meta-value">${new Date(quotationDate).toLocaleDateString("en-IN")}</div>
            <div class="meta-label">Valid On:</div><div class="meta-value">${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString("en-IN") : "N/A"}</div>
          </div>
        </div>

        <div>Contact: ${userData.phone} | ${userData.email}</div>
        <div style="font-size: 8px;">We are pleased to submit our quotation of price of products as following :-</div>

        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr class="head-top">
                <th rowspan="2">S.No.</th>
                <th rowspan="2">Ref</th>
                <th rowspan="2">Series</th>
                <th rowspan="2">Color</th>
                <th rowspan="2">Product</th>
                <th rowspan="2">Location</th>
                <th rowspan="2">Description</th>
                <th rowspan="2">Glass Spec</th>
                <th colspan="2">Handle</th>
                <th colspan="2">Mesh</th>
                <th rowspan="2">Unit Price</th>
                <th rowspan="2">Qty</th>
                <th rowspan="2">AMOUNT</th>
                <th rowspan="2">IMAGE</th>
              </tr>
              <tr class="head-sub">
                <th>Type</th>
                <th>Color</th>
                <th>Present</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${adjustedItems.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.refCode || "-"}</td>
                  <td>${item.series || "-"}</td>
                  <td>${item.colorFinish || "-"}</td>
                  <td>${item.systemType || "-"}</td>
                  <td>${item.location || "-"}</td>
                  <td>${item.description || "-"}</td>
                  <td>${item.glassSpec || "-"}</td>
                  <td>${item.handleType || "-"}</td>
                  <td>${item.handleColor || "-"}</td>
                  <td>${item.meshPresent || "-"}</td>
                  <td>${item.meshType || "-"}</td>
                  <td>${item.rate.toLocaleString("en-IN")}</td>
                  <td>${item.quantity}</td>
                  <td>${(item.rate * item.quantity).toLocaleString("en-IN")}</td>
                  <td>
                    ${item.refImage
                      ? `<img class="ref-image" src="${item.refImage}" alt="Reference image">`
                      : `<span class="no-image">No image</span>`}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="summary">
          <div class="total-card">
            <div class="total-heading">Quote Total</div>
            <div class="total-row"><span>No. of Components</span><span class="text-right">${totalQty}</span></div>
            <div class="total-row"><span>Total Area</span><span class="text-right">${totalArea.toFixed(2)}</span></div>
            <div class="total-row"><span><strong>Basic Value</strong></span><span class="text-right"><strong>${baseTotal.toLocaleString("en-IN")}</strong></span></div>
            <div class="total-row"><span>Total Project Cost</span><span class="text-right">${quotation.breakdown?.totalAmount.toLocaleString("en-IN")}</span></div>
            <div class="total-row"><span>GST 18%</span><span class="text-right">${gstValue.toLocaleString("en-IN")}</span></div>
            <div class="total-row"><span><strong>Grand Total</strong></span><span class="text-right"><strong>${grandTotal.toLocaleString("en-IN")}</strong></span></div>
            <div class="total-row"><span>Avg. Price Per Sq. Ft. Without GST</span><span class="text-right">${avgWithoutGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
            <div class="total-row"><span>Avg. Price Per Sq. Ft.</span><span class="text-right">${avgWithGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
          </div>
        </div>

        <div class="lists page-break">
          <div class="list-card">
            <div class="list-title">Terms & Conditions</div>
            <div class="list-body">${quotationTerms ? nl2br(quotationTerms) : "N/A"}</div>
          </div>
          <div class="list-card">
            <div class="list-title">Pre-requisites for Installation of Windows</div>
            <div class="list-body">
              1. Walls should be plastered from inside and outside, with inside POP complete.<br>
              2. All jambs, sills and soffits should be plastered.<br>
              3. Flooring (where doors have to be installed) should be complete.<br>
              4. Aperture should be smooth.<br>
              5. Base and top of window should be water leveled and sides should be in vertical plumb.<br>
              6. Sill width should be more than the window width.<br>
              7. Opening should be accessible from inside for installation.<br>
              8. Grills: adequate care should be taken if grills have to be installed.<br>
              9. Installation should happen before the last coat of paint.<br>
              10. After installation security tape will be removed by us that should be chargeable per window.
            </div>
          </div>
        </div>

        <div class="signature-row">
          <div class="sig-line">Authorized Signatory</div>
          <div class="sig-line">Signature of Customer</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateQuotationPDF = async (quotation: QuotationData) => {
  // Convert all images to base64 first
  const itemsWithBase64Images = await Promise.all(
    quotation.items.map(async (item) => ({
      ...item,
      refImage: item.refImage ? await imageToBase64(item.refImage) : ''
    }))
  );

  // Create quotation with base64 images
  const quotationWithImages = {
    ...quotation,
    items: itemsWithBase64Images
  };

  // Dynamic import to avoid SSR issues
  const html2pdf = (await import('html2pdf.js')).default;

  const htmlContent = createQuotationHTML(quotationWithImages);

  // Create a temporary element to hold the HTML
  const element = document.createElement('div');
  element.innerHTML = htmlContent;

  // Configure html2pdf options
  const options = {
    margin: [1, 1, 1, 1] as [number, number, number, number],
    filename: `${quotation._id}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'landscape' as const // Use landscape for better table fit
    }
  };

  // Generate and download the PDF
  html2pdf().set(options).from(element).save();
};
