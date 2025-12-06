// Dynamic import for html2pdf to avoid SSR issues

// Helper function to convert image URL to base64
const imageToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
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

type SystemType = "Casement" | "Sliding" | "Slide N Fold" | "";

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

interface QuotationData {
  id: string;
  quotationNumber: string;
  date: string;
  validUntil: string;
  customerDetails: CustomerDetails;
  items: QuotationItem[];
  total: number;
  baseTotal?: number;
  profitPercentage: number;
  terms: string;
  notes: string;
}

export const createQuotationHTML = (quotation: QuotationData): string => {

  const user = window.localStorage.getItem('glazia-user');
  let userData;

  console.log("quotation", quotation);

  if (user) {
    userData = JSON.parse(user);
    console.log('User data:', userData);
  }

  const nl2br = (str: string) => {
    if (!str) return "";
    return str.replace(/\n/g, "<br>");
  };

  // Calculate profit multiplier for individual items
  const profitMultiplier = 1 + (quotation.profitPercentage || 0) / 100;

  // Adjust item rates and amounts to include profit
  const adjustedItems = quotation.items.map(item => ({
    ...item,
    rate: item.rate * profitMultiplier,
    amount: item.amount * profitMultiplier
  }));

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
      font-size: 11px;
      line-height: 1.3;
      color: #333;
      background: white;
    }

    .container {
      max-width: 297mm;
      margin: 0 auto;
      padding: 10mm;
      background: white;
    }

    .header {
      text-align: center;
      margin-bottom: 15px;
      border-bottom: 2px solid #124657;
      padding-bottom: 10px;
    }

    .company-name {
      font-size: 22px;
      font-weight: bold;
      color: #124657;
      margin-bottom: 3px;
    }

    .company-tagline {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }

    .company-contact {
      font-size: 9px;
      color: #888;
    }

    .quotation-title {
      font-size: 18px;
      font-weight: bold;
      color: #124657;
      text-align: center;
      margin: 15px 0;
    }

    .quotation-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }

    .quotation-info, .customer-info {
      flex: 1;
    }

    .customer-info {
      margin-left: 30px;
    }

    .section-title {
      font-size: 12px;
      font-weight: bold;
      color: #124657;
      margin-bottom: 5px;
    }

    .info-line {
      margin-bottom: 3px;
      font-size: 10px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 8px;
    }

    .items-table th {
      background-color: #124657 !important;
      color: #ffffff !important;
      padding: 6px 3px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #ddd;
      font-size: 8px; /* reduced for PDF fit */
    }


    .items-table td {
      padding: 4px 3px;
      border: 1px solid #ddd;
      text-align: center;
      vertical-align: middle;
      font-size: 7px;
    }

    .items-table th, .items-table td {
        white-space: nowrap;
      }

      .items-table th:nth-child(1) { width: 15px; }
      .items-table th:nth-child(2) { width: 60px; }
      .items-table th:nth-child(3) { width: 70px; }
      .items-table th:nth-child(4) { width: 45px; }
      .items-table th:nth-child(5) { width: 45px; }
      .items-table th:nth-child(6) { width: 70px; }
      .items-table th:nth-child(7) { width: 50px; }
      .items-table th:nth-child(8) { width: 110px; }
      .items-table th:nth-child(9) { width: 60px; }
      .items-table th:nth-child(10) { width: 60px; }
      .items-table th:nth-child(11), .items-table th:nth-child(12) { width: 60px; }
      .items-table th:nth-child(13), .items-table th:nth-child(14) { width: 60px; }
      .items-table th:nth-child(15) { width: 60px; }
      .items-table th:nth-child(16) { width: 40px; }
      .items-table th:nth-child(17) { width: 50px; }
      .items-table th:nth-child(18) { width: 60px; }

    .items-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .text-left { text-align: left !important; }
    .text-right { text-align: right !important; }
    .text-center { text-align: center !important; }

    .image-cell {
      width: 50px !important;
      height: 35px !important;
      padding: 2px !important;
      text-align: center;
    }

    .image-cell img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }


    .no-image {
      font-size: 5px;
      color: #999;
      text-align: center;
    }

    .total-section {
      margin-top: 15px;
      text-align: right;
    }

    .total-amount {
      font-size: 14px;
      font-weight: bold;
      color: #124657;
      margin-top: 8px;
    }

    .terms-section {
      margin-top: 20px;
    }

    .terms-title {
      font-size: 11px;
      font-weight: bold;
      color: #124657;
      margin-bottom: 8px;
    }

    .terms-list {
      font-size: 9px;
      line-height: 1.4;
    }

    .terms-list li {
      margin-bottom: 3px;
    }

    .footer {
      margin-top: 25px;
      text-align: center;
      font-size: 9px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 10px;
    }

    .grouped-header {
      background-color: #0f3a49 !important;
      font-weight: bold;
    }

    @media print {
      .container {
        margin: 0;
        padding: 5mm;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
      </style>
    </head>
    <body>
      <div class="container">

      <img src="/logo_n.png" alt="Logo" style="width: 40px; height: auto; position: fixed; top: 10px; left: 20px;">
       
      <div class="header">
        <div class="company-name">${userData.name}</div>
        <div class="company-contact">Email: ${userData.email} | Phone: +91-${userData.phone}</div>
      </div>


        <div class="quotation-title">QUOTATION</div>

        <!-- Quotation Details -->
        <div class="quotation-details">
          <div class="quotation-info">
            <div class="info-line"><strong>Quotation No:</strong> ${quotation.quotationNumber}</div>
            <div class="info-line"><strong>Date:</strong> ${new Date(quotation.date).toLocaleDateString('en-IN')}</div>
            ${quotation.validUntil ? `<div class="info-line"><strong>Valid Until:</strong> ${new Date(quotation.validUntil).toLocaleDateString('en-IN')}</div>` : ''}
          </div>
          <div class="customer-info">
            <div class="section-title">Bill To:</div>
            <div class="info-line"><strong>${quotation.customerDetails.name}</strong></div>
            ${quotation.customerDetails.company ? `<div class="info-line">${quotation.customerDetails.company}</div>` : ''}
            ${quotation.customerDetails.address ? `<div class="info-line">${quotation.customerDetails.address}</div>` : ''}
            ${quotation.customerDetails.city || quotation.customerDetails.state || quotation.customerDetails.pincode ?
              `<div class="info-line">${[quotation.customerDetails.city, quotation.customerDetails.state, quotation.customerDetails.pincode].filter(Boolean).join(', ')}</div>` : ''}
            <div class="info-line">Phone: ${quotation.customerDetails.phone}</div>
            <div class="info-line">Email: ${quotation.customerDetails.email}</div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr style="background-color:#124657; color:#ffffff;">
              <th style="width: 15px;" rowspan="2">S.No</th>
              <th rowspan="2">Ref Code</th>
              <th rowspan="2">Location</th>
              <th rowspan="2">Width</th>
              <th rowspan="2">Height</th>
              <th rowspan="2">System Type</th>
              <th rowspan="2">Series</th>
              <th rowspan="2">Description</th>
              <th rowspan="2">Color Finish</th>
              <th rowspan="2">Glass Spec</th>
              <th colspan="2">Handle</th>
              <th colspan="2">Mesh</th>
              <th rowspan="2">Rate</th>
              <th rowspan="2">Qty</th>
              <th rowspan="2">Ref Image</th>
              <th rowspan="2">Remarks</th>
            </tr>

            
          </thead>


          <tbody>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th> </th>
              <th></th>
              <th></th>
              <th></th>
              <th> </th>
              <th>Type</th>
              <th>Color</th>
              <th>Present</th>
              <th>Type</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
            ${adjustedItems.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.refCode || '-'}</td>
                <td class="text-left">${item.location || '-'}</td>
                <td>${item.width}×${item.height}</td>
                <td>${item.area.toFixed(2)}</td>
                <td>${item.systemType || '-'}</td>
                <td>${item.series || '-'}</td>
                <td class="text-left">${item.description}</td>
                <td class="text-left">${item.colorFinish || '-'}</td>
                <td class="text-left">${item.glassSpec || '-'}</td>
                <td class="text-left">${item.handleType || '-'}</td>
                <td>${item.handleColor || '-'}</td>
                <td>${item.meshPresent || '-'}</td>
                <td class="text-left">${item.meshType || '-'}</td>
                <td class="text-right">₹${item.rate.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td class="image-cell">
                  ${item.refImage ? `<img src="${item.refImage}" style="width: 40px" alt="${item.description}" />` : '<div class="no-image">No Image</div>'}
                </td>
                <td class="text-right">₹${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Total -->
        <div class="total-section">
          <div class="total-amount">
            Total Amount: ₹${quotation.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <!-- Terms and Conditions -->
        ${quotation.terms ? `
        <div class="terms-section">
          <div class="terms-title">Terms & Conditions:</div>
          <div class="terms-list">${nl2br(quotation.terms)}</div>
        </div>
        ` : ''}

        <!-- Notes -->
        ${quotation.notes ? `
        <div class="terms-section">
          <div class="terms-title">Notes:</div>
          <div class="terms-list">${quotation.notes}</div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <div>Thank you for your business!</div>
          <div>Generated on ${new Date().toLocaleDateString('en-IN')}</div>
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
    margin: [5, 5, 5, 5] as [number, number, number, number],
    filename: `${quotation.quotationNumber}.pdf`,
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
