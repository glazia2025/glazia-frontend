import { loadGlobalConfig } from "@/utils/globalConfig";
import { createPdfFrame } from "@/utils/pdfFrame";

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

interface QuotationItemBase {
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

interface QuotationSubItem extends QuotationItemBase {}

interface QuotationItem extends QuotationItemBase {
  subItems?: QuotationSubItem[];
}

interface QuotationData {
  id: string;
  quotationNumber?: string;
  generatedId?: string;
  createdAt?: string;
  globalConfig?: {
    logo?: string;
    logoUrl?: string;
    prerequisites?: string;
    terms?: string;
    additionalCosts?: {
      installation?: number;
      transport?: number;
      loadingUnloading?: number;
      discountPercent?: number;
    };
  };
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


export const createQuotationHTML = async (quotation: QuotationData): Promise<string> => {
  const user = window.localStorage.getItem('glazia-user');
  let userData: { name?: string; email?: string; phone?: string } = {};

  if (user) {
    userData = JSON.parse(user);
  }

  const globalConfig = quotation.globalConfig || (await loadGlobalConfig());

  const nl2br = (str: string) => {
    if (!str) return "";
    return str.replace(/\n/g, "<br>");
  };

  const profitMultiplier =
    (quotation as unknown as { profitPercentage?: number })?.profitPercentage
      ? 1 + ((quotation as unknown as { profitPercentage?: number }).profitPercentage || 0) / 100
      : 1;

  const COMBINATION_SYSTEM = "Combination";
  const indexToAlpha = (index: number): string => {
    let n = index;
    let result = "";
    while (n >= 0) {
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26) - 1;
    }
    return result;
  };
  const buildSubLabel = (count: number): string =>
    Array.from({ length: count }, (_, i) => indexToAlpha(i)).join("+");

  const applyProfit = <T extends QuotationItemBase>(item: T): T => ({
    ...item,
    rate: (item.rate || 0) * profitMultiplier,
    amount: (item.amount || 0) * profitMultiplier,
  });

  type DisplayItem = QuotationItemBase & {
    __isSubRow?: boolean;
    __rowNumber?: number | string;
    __subLabel?: string;
  };

  const effectiveItems = (quotation.items || []).flatMap((item) => {
    if (item.systemType === COMBINATION_SYSTEM && item.subItems?.length) {
      return item.subItems;
    }
    return [item];
  });

  const displayItems: DisplayItem[] = (quotation.items || []).flatMap((item) => {
    if (item.systemType === COMBINATION_SYSTEM && item.subItems?.length) {
      return [
        { ...item, __isSubRow: false, __subLabel: buildSubLabel(item.subItems.length) },
        ...item.subItems.map((sub) => ({ ...sub, __isSubRow: true })),
      ];
    }
    return [{ ...item, __isSubRow: false }];
  });

  let rowCounter = 0;
  const numberedDisplayItems = displayItems.map((item) => ({
    ...item,
    __rowNumber: item.__isSubRow ? "" : ++rowCounter,
  }));

  const adjustedEffectiveItems = effectiveItems.map(applyProfit);
  const adjustedDisplayItems = numberedDisplayItems.map(applyProfit);

  const rawTotal =
    quotation.totalAmount ??
    adjustedEffectiveItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const baseTotal = rawTotal;
  const transport = globalConfig?.additionalCosts?.transport || 0;
  const installation = globalConfig?.additionalCosts?.installation || 0;
  const loadingUnloading = globalConfig?.additionalCosts?.loadingUnloading || 0;
  const discount = ((globalConfig?.additionalCosts?.discountPercent || 0) / 100) * (baseTotal + transport + installation + loadingUnloading);
  const totalProjectCost = baseTotal + transport + installation + loadingUnloading - discount;
  const gstValue = totalProjectCost * 0.18;
  const grandTotal = totalProjectCost + gstValue;
  const totalArea = effectiveItems.reduce(
    (sum, item) => sum + (item.area || 0) * (item.quantity || 1),
    0
  );
  const totalQty = effectiveItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const avgWithoutGst = totalArea ? totalProjectCost / totalArea : 0;
  const avgWithGst = totalArea ? avgWithoutGst * 1.18 : 0;

  console.log(quotation, 'quotation>>>>');

  const quotationDate =
    quotation.quotationDetails?.date ||
    quotation.createdAt ||
    new Date().toISOString();
  const quotationTerms = globalConfig?.terms || "";
  const prequisites = globalConfig?.prerequisites || "";
  const logoSrc = globalConfig?.logoUrl || globalConfig?.logo;
  const customer = quotation.customerDetails || {};

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quotation ${quotation.id}</title>
      <style>
        @page {
          size: A3 landscape;
          margin: 8mm; /* or whatever you want */
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 100%;
        }
        body {
          font-family: 'Arial', sans-serif;
          font-size: 10px;
          color: #2b2b2b;
          background: #ffffff;
        }
        .container {
           width: 100%;
          margin: 0;
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

        .logo-img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
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
        .sub-row td {
          background: #f7f7f7;
        }
        thead {
          background: #f7f7f7;
          text-align: center;
        }
        .head-top th {
          background: #FFF;
          color: #222;
          font-size: 10px;
          padding: 5px;
          border: 1px solid #e0e0e0;
          text-align: center;
          font-weight: 700;
        }
        .head-sub th {
          background: #FFF;
          color: #222;
          font-size: 9px;
          padding: 4px 3px;
          border: 1px solid #e0e0e0;
          text-align: center;
          font-weight: 700;
        }
        tbody td {
          border: 1px solid #e0e0e0;
          padding: 4px 3px;
          font-size: 10px;
          text-align: center;
          line-height: 1.35;
        }
        tbody tr:nth-child(even) {
          background: #fafafa;
        }
        tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .main-row {
          height: 32mm;
        }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .no-image {
          font-size: 7px;
          color: #999;
        }
        .combo-label {
          display: inline-block;
          font-weight: 600;
          font-size: 9px;
          letter-spacing: 0.5px;
        }
        .ref-image {
          width: 32mm;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }
        .sub-row-image {
          width: 22mm;
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
          padding-top: 4px;
          padding-bottom: 12px; 
          border-bottom: 1px solid #000; 
        }
        .total-row span {
          display: block;
          line-height: 1.5;
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
        .avoid-break {
          page-break-inside: avoid;
          break-inside: avoid;
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
          ${logoSrc ? `<img class='logo-img' src="${logoSrc}" alt="User Logo" />` : `<div class='user-logo'>${getInitials(userData.name)}</div>`}
          <div class="quotation-label">QUOTATION</div>
          <div class="logo">GLAZIA</div>
        </div>

        <div class="navy-bar">${userData.name}</div>

        <div class="info-container avoid-break">

        <div class="info-grid">
          <div class="info-card">
            <div class="info-title">To:</div>
            <div class="info-line"><strong>${customer.name || "-"}</strong></div>
            ${customer.company ? `<div class="info-line">${customer.company}</div>` : ""}
            ${customer.address ? `<div class="info-line">${customer.address}</div>` : ""}
            <div class="info-line">${[customer.city, customer.state, customer.pincode].filter(Boolean).join(", ")}</div>
            <div class="info-line">Phone: ${customer.phone || "-"}</div>
            <div class="info-line">Email: ${customer.email || "-"}</div>
          </div>
          <div class="info-card">
            <div class="info-title">From:</div>
            <div class="info-line"><strong>${userData.name}</strong></div>
            <div class="info-line">${userData.completeAddress}</div>
            <div class="info-line">${userData.city}, ${userData.state} - ${userData.pincode}</div>
            <div class="info-line">India</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Quotation no.:</div><div class="meta-value">${quotation.generatedId}</div>
            <div class="meta-label">Quote Generated on:</div><div class="meta-value">${new Date(quotationDate).toLocaleDateString("en-IN")}</div>
          </div>
        </div>

        <div>Contact: ${userData.phone} | ${userData.email}</div>
        <div style="font-size: 10px; font-weight: 600;">We are pleased to submit our quotation of price of products as following :-</div>

        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr class="head-top">
                <th rowspan="2">S.No.</th>
                <th rowspan="2">Ref</th>
                <th rowspan="2">Product</th>
                <th rowspan="2">Series</th>
                <th rowspan="2">Width\n(mm)</th>
                <th rowspan="2">Height\n(mm)</th>
                <th rowspan="2">Area\n(sqft)</th>
                <th rowspan="2">Color</th>
                <th rowspan="2">Location</th>
                <th rowspan="2">Description</th>
                <th rowspan="2">Glass Spec</th>
                <th colspan="2">Handle</th>
                <th colspan="2">Mesh</th>
                <th rowspan="2">Rate\n(₹/sqft)</th>
                <th rowspan="2">Qty</th>
                <th rowspan="2">Amount\n(₹)</th>
                <th rowspan="2">Image</th>
              </tr>
              <tr class="head-sub">
                <th>Type</th>
                <th>Color</th>
                <th>Present</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${adjustedDisplayItems.map((item) => `
                <tr class="${item.__isSubRow ? "sub-row" : "main-row"}">
                  <td>${item.__rowNumber || ""}</td>
                  <td>${item.refCode || "-"}</td>
                  <td>${item.systemType || "-"}</td>
                  <td>${item.series || "-"}</td>
                  <td>${item.width || "-"}</td>
                  <td>${item.height || "-"}</td>
                  <td>${item.area?.toFixed(2) || "-"}</td>
                  <td>${item.colorFinish || "-"}</td>
                  <td>${item.location || "-"}</td>
                  <td>${item.description || "-"}</td>
                  <td>${item.glassSpec || "-"}</td>
                  <td>${item.handleType || "-"}</td>
                  <td>${item.handleColor || "-"}</td>
                  <td>${item.meshPresent || "-"}</td>
                  <td>${item.meshType || "-"}</td>
                  <td>${item.rate.toLocaleString("en-IN")}</td>
                  <td>${item.quantity}</td>
                  <td>${(item.rate * item.quantity * item.area).toLocaleString("en-IN")}</td>
                  <td>
                    ${item.__subLabel
                      ? `<span class="combo-label">${item.__subLabel}</span>`
                      : item.refImage
                        ? `<img class="${item.__isSubRow ? "sub-row-image" : "ref-image"}" src="${item.refImage}" alt="Reference image">`
                        : `<span class="no-image">No image</span>`}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="summary avoid-break">
          <div class="total-card">
            <div class="total-heading">Quote Total</div>
            <div class="total-row"><span>No. of Components</span><span class="text-right">${totalQty}</span></div>
            <div class="total-row"><span>Total Area</span><span class="text-right">${totalArea.toFixed(2)}</span></div>
            <div class="total-row"><span><strong>Basic Value</strong></span><span class="text-right"><strong>${baseTotal.toLocaleString("en-IN")}</strong></span></div>
            ${transport > 0 ? `<div class="total-row"><span>Transport</span><span class="text-right">${transport.toLocaleString("en-IN")}</span></div>` : "" }
            ${installation > 0 ? `<div class="total-row"><span>Installation</span><span class="text-right">${installation.toLocaleString("en-IN")}</span></div>` : "" }
            ${loadingUnloading > 0 ? `<div class="total-row"><span>Loading & Unloading</span><span class="text-right">${loadingUnloading.toLocaleString("en-IN")}</span></div>` : "" }
            ${discount > 0 ? `<div class="total-row"><span>Discount</span><span class="text-right">${discount.toLocaleString("en-IN")}</span></div>` : "" }
            <div class="total-row"><span>Total Project Cost</span><span class="text-right">${totalProjectCost.toLocaleString("en-IN")}</span></div>
            <div class="total-row"><span>GST 18%</span><span class="text-right">${gstValue.toLocaleString("en-IN")}</span></div>
            <div class="total-row"><span><strong>Grand Total</strong></span><span class="text-right"><strong>${grandTotal.toLocaleString("en-IN")}</strong></span></div>
            <div class="total-row"><span>Avg. Price Per Sq. Ft. Without GST</span><span class="text-right">${avgWithoutGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
            <div class="total-row"><span>Avg. Price Per Sq. Ft.</span><span class="text-right">${avgWithGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
          </div>
        </div>

        <div class="lists">
          <div class="list-card avoid-break">
            <div class="list-title">Terms & Conditions</div>
            <div class="list-body">${quotationTerms ? nl2br(quotationTerms) : "N/A"}</div>
          </div>
          <div class="list-card avoid-break">
            <div class="list-title">Pre-requisites for Installation of Windows</div>
            <div class="list-body">${prequisites ? nl2br(prequisites) : "N/A"}</div>
          </div>
        </div>

        <div class="signature-row avoid-break">
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
    (quotation.items || []).map(async (item) => ({
      ...item,
      refImage: item.refImage ? await imageToBase64(item.refImage) : "",
      subItems: item.subItems
        ? await Promise.all(
            item.subItems.map(async (sub) => ({
              ...sub,
              refImage: sub.refImage ? await imageToBase64(sub.refImage) : "",
            }))
          )
        : undefined,
    }))
  );

  // Create quotation with base64 images
  const quotationWithImages = {
    ...quotation,
    items: itemsWithBase64Images
  };

  // Dynamic import to avoid SSR issues
  const html2pdf = (await import('html2pdf.js')).default;

  const html = await createQuotationHTML(quotationWithImages);
  const { body, cleanup, doc } = await createPdfFrame(html);

  console.log(quotation);

  // Configure html2pdf options
  const options = {
    margin: [1, 1, 1, 1] as [number, number, number, number],
    filename: `${quotation.generatedId}_${quotation.customerDetails?.name}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      onclone: (clonedDoc: Document) => {
        if (doc.head && clonedDoc.head) {
          clonedDoc.head.innerHTML = "";
          clonedDoc.head.appendChild(doc.head.cloneNode(true));
        }
      }
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'] as Array<'avoid-all' | 'css' | 'legacy'>,
      avoid: ['img', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'tr', '.avoid-break']
    },
    jsPDF: {
      unit: 'mm',
      format: 'a3',
      orientation: 'portrait' as const // Use landscape for better table fit
    }
  };

  try {
    // Generate and download the PDF
    await html2pdf().set(options).from(body).save();
  } finally {
    cleanup();
  }
};
