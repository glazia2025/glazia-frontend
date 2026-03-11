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
          const dataURL = canvas.toDataURL('image/jpeg',0.8);
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

interface QuotationSubItem extends QuotationItemBase { }

interface QuotationItem extends QuotationItemBase {
  subItems?: QuotationSubItem[];
}

const getPresetImagePath = (description?: string): string => {
  if (!description) return "";
  if (description === "Fix") return "/Quotations/Fix.png";
  if (description === "French Door" || description === "French Window")
    return "/Quotations/French Door-Window.jpg";
  if (description === "Left Openable Window" || description === "Left Openable Door")
    return "/Quotations/Left Openable Door-Window.jpg";
  if (description === "Right Openable Window" || description === "Right Openable Door")
    return "/Quotations/Right Openable Door-Window.jpg";
  return `/Quotations/${description}.jpg`;
};

interface QuotationData {
  id: string;
  quotationNumber?: string;
  generatedId?: string;
  createdAt?: string;
  contactPhone?: string;
  globalConfig?: {
    logo?: string;
    logoUrl?: string;
    website?: string;
    prerequisites?: string;
    terms?: string;
    additionalCosts?: {
      installation?: number;
      transport?: number;
      loadingUnloading?: number;
      discountPercent?: number;
      showInstallation?: boolean;
      showTransport?: boolean;
      showLoadingUnloading?: boolean;
      showDiscount?: boolean;
    };
  };
  quotationDetails?: {
    id?: string;
    date?: string;
    opportunity?: string;
    terms?: string;
    notes?: string;
    contactPhone?: string;
  };
  customerDetails?: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
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
  let userData: { name?: string; email?: string; phone?: string; gstNumber?: string } = {};

  if (user) {
    userData = JSON.parse(user);
  }

  const globalConfig = quotation.globalConfig || (await loadGlobalConfig());
  const contactPhone =
    quotation.quotationDetails?.contactPhone ||
    quotation.contactPhone ||
    userData.phone ||
    "";
  const website = globalConfig?.website || "";
  const gstNumber = userData.gstNumber || "";

  const nl2br = (str: string) => {
    if (!str) return "";
    return str.replace(/\n/g, "<br>");
  };

  const roundToTwo = (value: number) => Number(value.toFixed(2));
  const formatCurrency = (value: number) =>
    value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const profitMultiplier =
    (quotation as unknown as { profitPercentage?: number })?.profitPercentage
      ? 1 + ((quotation as unknown as { profitPercentage?: number }).profitPercentage || 0) / 100
      : 1;


  const COMBINATION_SYSTEM = "Combination";
  const applyProfit = <T extends QuotationItemBase>(item: T): T => {
    const quantity = item.quantity || 0;
    const area = item.area || 0;
    const rate = roundToTwo((item.rate || 0) * profitMultiplier);
    const amount = roundToTwo(rate * quantity * area);
    return {
      ...item,
      rate,
      amount,
    };
  };

  const syncCombinationValues = (item: QuotationItem, subItems: QuotationSubItem[]): QuotationItem => {
    if (subItems.length === 0) {
      return {
        ...item,
        width: 0,
        height: 0,
        area: 0,
        rate: 0,
        amount: 0,
        quantity: 0,
        subItems,
      };
    }

    const totals = subItems.reduce(
      (acc, sub) => {
        acc.width += sub.width || 0;
        acc.height += sub.height || 0;
        acc.area += (sub.area || 0) * (sub.quantity || 0);
        acc.amount += sub.amount || 0;
        acc.quantity += sub.quantity || 0;
        return acc;
      },
      { width: 0, height: 0, area: 0, amount: 0, quantity: 0 }
    );

    const rate = totals.area ? totals.amount / totals.area : 0;

    return {
      ...item,
      width: totals.width,
      height: totals.height,
      area: totals.area,
      rate: roundToTwo(rate),
      amount: roundToTwo(totals.amount),
      quantity: totals.quantity,
      subItems,
    };
  };

  type DisplayItem = QuotationItemBase & {
    __isSubRow?: boolean;
    __rowNumber?: number | string;
  };

  let itemsWithProfit: QuotationItem[] = (quotation.items || []).map((item) => {
    if (item.systemType === COMBINATION_SYSTEM && item.subItems?.length) {
      const subItems = item.subItems.map(applyProfit);
      return syncCombinationValues(item, subItems);
    }
    return applyProfit(item);
  });

  const getEffectiveItems = (items: QuotationItem[]) =>
    items.flatMap((item) => {
      if (item.systemType === COMBINATION_SYSTEM && item.subItems?.length) {
        return item.subItems;
      }
      return [item];
    });

  let effectiveItems = getEffectiveItems(itemsWithProfit);

  const totalArea = effectiveItems.reduce(
    (sum, item) => sum + (item.area || 0) * (item.quantity || 1),
    0
  );

  const rawTotal =
    quotation.totalAmount ??
    effectiveItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  let baseTotal = roundToTwo(rawTotal);
  const additionalCosts = globalConfig?.additionalCosts || {};
  const transport = additionalCosts.transport || 0;
  const installation = (additionalCosts.installation || 0) * totalArea;
  const loadingUnloading = additionalCosts.loadingUnloading || 0;
  const discount =
    ((additionalCosts.discountPercent || 0) / 100) *
    (baseTotal + transport + installation + loadingUnloading);

  const showTransport = additionalCosts.showTransport ?? true;
  const showInstallation = additionalCosts.showInstallation ?? true;
  const showLoadingUnloading = additionalCosts.showLoadingUnloading ?? true;
  const showDiscount = additionalCosts.showDiscount ?? true;

  const hiddenCostTotal =
    (showTransport ? 0 : transport) +
    (showInstallation ? 0 : installation) +
    (showLoadingUnloading ? 0 : loadingUnloading) -
    (showDiscount ? 0 : discount);

  if (hiddenCostTotal !== 0 && effectiveItems.length > 0) {
    const totalWeight = effectiveItems.reduce(
      (sum, item) => sum + (item.area || 0) * (item.quantity || 1),
      0
    );
    const useEqualWeight = totalWeight === 0;
    const perItemShare = useEqualWeight ? hiddenCostTotal / effectiveItems.length : 0;

    effectiveItems.forEach((item) => {
      const weight = useEqualWeight ? 1 : (item.area || 0) * (item.quantity || 1);
      const share = useEqualWeight ? perItemShare : (hiddenCostTotal * weight) / totalWeight;
      const nextAmount = roundToTwo((item.amount || 0) + share);
      item.amount = nextAmount;
      const denom = (item.area || 0) * (item.quantity || 1);
      if (denom > 0) {
        item.rate = roundToTwo(nextAmount / denom);
      }
    });

    itemsWithProfit = itemsWithProfit.map((item) => {
      if (item.systemType === COMBINATION_SYSTEM && item.subItems?.length) {
        return syncCombinationValues(item, item.subItems);
      }
      return item;
    });
    effectiveItems = getEffectiveItems(itemsWithProfit);
    baseTotal = roundToTwo(
      effectiveItems.reduce((sum, item) => sum + (item.amount || 0), 0)
    );
  }

  const visibleTransport = showTransport ? transport : 0;
  const visibleInstallation = showInstallation ? installation : 0;
  const visibleLoadingUnloading = showLoadingUnloading ? loadingUnloading : 0;
  const visibleDiscount = showDiscount ? discount : 0;

  const totalProjectCost =
    baseTotal + visibleTransport + visibleInstallation + visibleLoadingUnloading - visibleDiscount;
  const gstValue = totalProjectCost * 0.18;
  const grandTotal = totalProjectCost + gstValue;

  const totalQty = effectiveItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const avgWithoutGst = totalArea ? totalProjectCost / totalArea : 0;
  const avgWithGst = totalArea ? avgWithoutGst * 1.18 : 0;

  let rowCounter = 0;
  const displayItems: DisplayItem[] = itemsWithProfit.flatMap((item) => {
    if (item.systemType === COMBINATION_SYSTEM && item.subItems?.length) {
      return [
        { ...item, __isSubRow: false },
        ...item.subItems.map((sub) => ({ ...sub, __isSubRow: true })),
      ];
    }
    return [{ ...item, __isSubRow: false }];
  });

  const adjustedDisplayItems = displayItems.map((item) => ({
    ...item,
    __rowNumber: item.__isSubRow ? "" : ++rowCounter,
  }));


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

*{
margin:0;
padding:0;
box-sizing:border-box;
}
 html, body {
 width: 100%;
}

body{
font-family:Arial, sans-serif;
font-size:10px;
color:#2b2b2b;
background:#fff;
}

.container{
width:100%;
margin:0;
}

.top-bar{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:8mm;
}

.user-logo{
width:40px;
height:40px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:14px;
font-weight:600;
 text-transform: uppercase;
color:#fff;
background:#6b7280;
 overflow: hidden;
user-select: none;
}

.logo-img{
width:80px;
height:80px;
border-radius:50%
}

.logo{
fwidth:60px;
height:60px;
overflow:hidden;
display:flex;
align-items:center;
justify-content:center;
}
.logo img{
width:100%;
height:100%;
object-fit:cover;
}

.quotation-label{
color:#E10E0E;
font-size:16px;
font-weight:600;
 letter-spacing: 1px;
}
.contact {
text-align: right;
font-size: 12px;
line-height: 1.4;
}

.navy-bar{
background:#2F3A4F;
color:#fff;
height:60px;
padding:8px;
display:flex;
text-align:center;
justify-content:center; 
font-size:24px;
 font-weight:500;
}

.info-container{
border:1px solid #000;
padding:12px;
display: flex;
flex-direction: column;
gap: 8px;

}

.info-grid{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:6mm;
}

.info-title{
font-size: 10px;
font-weight: 700;
color: #2b2b2b;
margin-bottom:4px;
}

.info-line{
font-size: 10px;
 color: #2f2f2f;
line-height:1.4;
}

.meta-card{
border-left:1px solid #d8d8d8;
padding:8px;
display:grid;
grid-template-columns:1fr 1fr;
gap:4px 8px;
font-size: 10px;
}

.meta-label {
color: #444;
}

.meta-value{
font-weight:600;
color: #000;
text-align:right;
}

.window-wrapper{
margin:0;
border:none;
}
.main-row{
border-bottom:1px solid #000;
}

.window-block{
border:1px solid #000;
border-bottom:none;

margin:0;
position:relative;
}

.window-header{
width:100%;
border-collapse:collapse;
font-size:10px;
}

.window-header td{
border:1px solid #e0e0e0;
padding: 0px 10px 10px 10px ;
}

.window-header .label{
background:#f7f7f7;
font-weight:700;
width:15%;
}

table{
page-break-inside:auto;
}

.window-body{
display:flex;
gap:0;
padding:0px;
align-items:stretch;
}

.window-image{
width:40%;
height:200px; 
display:flex;
align-items:center;
justify-content:center;
border:1px solid #e0e0e0;
overflow:hidden;
background:none;
margin:0;
}

.window-image img{
height:120%;
width:auto;
object-fit:cover;
display:cover;
}

.computed-values{
width:60%;
padding:0;
border:1px solid #e0e0e0;
}
.computed-values td[colspan="2"]{
text-align:right;
}

.computed-title{
font-weight:700;
background:#f7f7f7;
padding:0px 10px 6px 6px ;
border:1px solid #e0e0e0;
border-top:none;
border-left:none; 
border-bottom:none;
font-size:11px;
}

.computed-values table{
width:100%;
border-collapse:collapse;
font-size:10px;
border:none;
}
.computed-values td{
border:1px solid #e0e0e0;
padding: 0px 10px 10px 10px;
text-align:center;
vertical-align:middle;
}
.computed-values tr{
height:30px;
}

.computed-values td:nth-child(1){

background:#fafafa;
font-weight:600;
}

.computed-values td:nth-child(2){
text-align:right;
}

.computed-values td:nth-child(3){
text-align:left;
color:#444;
}

tr{
page-break-inside: avoid;
break-inside: avoid;
}

.no-image{
font-size:9px;
color:#999;
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
  /* SUB ROW DESIGN */

.sub-row{
margin-top:0px;
width:100%;
background:#fafafa;
border-top:none;
position:relative;
padding:0px;
}

/* subrow table */

.subrow-table{
width:100%;
table-layout:fixed;
border-collapse:collapse;
font-size:9px;
border-bottom:1px solid #000;
border-top:2px dashed #000;

}
.subrow-table tr:first-child td{
border-top:none;
}

.subrow-table td{
border:1px solid #e0e0e0;
padding:6px 6px;
text-align:center;
vertical-align:middle;
}

/* header row */

.subrow-header td{
background:#f5f5f5;
font-weight:600;
text-align:center;
vertical-align:middle;
}

/* image inside table */

.subrow-table img{
height:45px;
object-fit:contain;
}

.summary{
display:flex;
margin:6mm 0;
}

.total-card{
width:320px;
border:1px solid #e5e5e5;
border-radius:6px;
padding:14px;
}

.total-heading{
color:#d5272b;
font-size:14px;
font-weight:600;
margin-bottom:10px;
}

.total-row{
display:grid;
grid-template-columns:1fr auto;
padding:6px 0;
border-bottom:1px solid #eaeaea;
}

.total-row:last-child{
border-bottom:none;
}

.lists{
display:grid;
grid-template-columns:1fr 1fr;
gap:6mm;
margin-top:4mm;
}

.list-card{
border:1px solid #d8d8d8;
padding:10px;
}

.list-title{
color:#d5272b;
font-size:11px;
font-weight:700;
margin-bottom:6px;
}

.signature-row{
display:grid;
grid-template-columns:1fr 1fr;
gap:20mm;
margin-top:10mm;
}

.sig-line{
border-top:1px solid #000;
padding-top:6px;
text-align:center;
}

</style>
</head>

<body>

<div class="container">

<div class="top-bar">
${logoSrc ? `<img class="logo-img" src="${logoSrc}" />` : `<div class="user-logo">${getInitials(userData.name)}</div>`}
<div class="quotation-label">QUOTATION</div>
<div class="logo">
<img src="/new-ui/logo-sm.svg" alt="logo">
</div>
</div>

<div class="navy-bar">${userData.name}</div> 


<div class="info-container">

<div class="info-grid">

<div>
<div class="info-title">To:</div>
<div class="info-line"><strong>${customer.name || "-"}</strong></div>
${customer.company ? `<div class="info-line">${customer.company}</div>` : ""}
${customer.address ? `<div class="info-line">${customer.address}</div>` : ""}
<div class="info-line">${[customer.city, customer.state, customer.pincode].filter(Boolean).join(", ")}</div>
<div class="info-line">Phone: ${customer.phone || "-"}</div>
<div class="info-line">Email: ${customer.email || "-"}</div>
</div>

<div>
<div class="info-title">From:</div>
<div class="info-line"><strong>${userData.name}</strong></div>
<div class="info-line">${userData.completeAddress}</div>
<div class="info-line">${userData.city}, ${userData.state} - ${userData.pincode}</div>
<div class="info-line">India</div>
<div class="info-line">Phone: ${contactPhone || "-"}</div>
<div class="info-line">GST: ${gstNumber || "-"}</div>
${website ? `<div class="info-line">Website: ${website}</div>` : ""}
</div>

<div class="meta-card">
<div>Quotation no.</div>
<div class="meta-value">${quotation.generatedId}</div>
<div>Date</div>
<div class="meta-value">${new Date(quotationDate).toLocaleDateString("en-IN")}</div>
</div>

</div>

<div style="margin-top:8px;font-weight:600;">
We are pleased to submit our quotation of price of products as following :-
</div>

</div>


<div class="window-wrapper">
${adjustedDisplayItems.map((item,index) => {

const isCombinationParent =
!item.__isSubRow && item.systemType === COMBINATION_SYSTEM;

const showRef = item.refCode || "-";
const showSystem = item.systemType || "-";
const showSeries = isCombinationParent ? "-" : item.series || "-";
const showWidth = item.width || "-";
const showHeight = item.height || "-";
const showArea = item.area?.toFixed(2) || "-";
const showColor = isCombinationParent ? "-" : item.colorFinish || "-";
const showLocation = item.location || "-";
const showDescription = isCombinationParent ? "-" : item.description || "-";
const showGlass = isCombinationParent ? "-" : item.glassSpec || "-";
const showHandleType = isCombinationParent ? "-" : item.handleType || "-";
const showHandleColor = isCombinationParent ? "-" : item.handleColor || "-";
const showMeshPresent = isCombinationParent ? "-" : item.meshPresent || "-";
const showMeshType = isCombinationParent ? "-" : item.meshType || "-";
const showQty = item.quantity || "-";
const showAmount = formatCurrency(item.amount || 0);
const showRemarks = item.remarks || "-";
const isFirstSubRow =
item.__isSubRow && adjustedDisplayItems[index - 1]?.__isSubRow !== true;
if(item.__isSubRow){
const isLastSubRow =
item.__isSubRow && adjustedDisplayItems[index + 1]?.__isSubRow !== true;
return `
<div class="window-block sub-row avoid-break">

${isFirstSubRow ? `<table class="subrow-table">` : ""}

${isFirstSubRow?`
<tr class="subrow-header">
<td rowspan="2">Ref</td>
<td rowspan="2">Image</td>
<td rowspan="2">Product</td>
<td rowspan="2">Series</td>
<td rowspan="2">Width (mm)</td>
<td rowspan="2">Height (mm)</td>
<td rowspan="2">Area (Sqft)</td>
<td rowspan="2">Color</td>
<td rowspan="2">Location</td>
<td rowspan="2">Description</td>
<td rowspan="2">Glass</td>
<td colspan="2">Handle</td>
<td colspan="2">Mesh</td>
<td rowspan="2">Rate</td>
<td rowspan="2">Qty</td>
<td rowspan="2">Amount</td>
<td rowspan="2">Remarks</td>
</tr>

<tr class="subrow-header">
<td>Type</td>
<td>Color</td>
<td>Present</td>
<td>Type</td>
</tr>
`:""}

<tr class="subrow-data">
<td>${showRef}</td>
<td>
${item.refImage ? `<img src="${item.refImage}" style="height:40px;">` : "-"}
</td>
<td>${showSystem}</td>
<td>${showSeries}</td>
<td>${showWidth}</td>
<td>${showHeight}</td>
<td>${showArea}</td>
<td>${showColor}</td>
<td>${showLocation}</td>
<td>${showDescription}</td>
<td>${showGlass}</td>
<td>${showHandleType}</td>
<td>${showHandleColor}</td>
<td>${showMeshPresent}</td>
<td>${showMeshType}</td>
<td>${formatCurrency(item.rate || 0)}</td>
<td>${showQty}</td>
<td>${showAmount}</td>
<td>${showRemarks}</td>
</tr>
${isLastSubRow ? `</table>` : ""}
</div>
`;
}

return `

<div class="window-block avoid-break main-row">

<!-- HEADER TABLE -->

<table class="window-header">
<tr>
<td class="label"> Ref-Code :</td>
<td>
${showRef}
</td>
<td class="label">Size :</td>
<td>W = ${showWidth}; H = ${showHeight}</td>
<td class="label">Color :</td>
<td>${showColor}</td
</tr>
<tr>
<td class="label">Product :</td>
<td>${showSystem}</td>

<td class="label">Handle type/color :</td>
<td>${showHandleType} - ${showHandleColor}</td>
<td class="label">Description:</td>
<td>${showDescription}</td>
</tr>
<tr>
<td class="label">Location :</td>
<td>${showLocation}</td>

<td class="label">Glass :</td>
<td>${showGlass}</td>
<td class="label">Mesh type/color:</td>
<td>${showMeshPresent} ${showMeshType}</td>
</tr>
</table>

<!-- BODY -->

<div class="window-body">
<div class="window-image">
${
item.refImage
? `<img src="${item.refImage}" alt="Window Image">`
: `<span class="no-image">No image</span>`
}

</div>
<div class="computed-values">
<div class="computed-title">Computed Values</div>
<table>
<tr>
<td>Series</td>
<td colspan="2" style="text-align:center;">${showSeries}</td>
</tr>

<tr>
<td>Area</td>
<td>${showArea}</td>
<td>Sqft </td>
</tr>

<tr>
<td>Rate per Sqft</td>
<td>${formatCurrency(item.rate || 0)}</td>
<td>INR</td>
</tr>

<tr>
<td>Quantity</td>
<td>${showQty}</td>
<td>pcs</td>
</tr>

<tr>
<td>Amount</td>
<td>${showAmount}</td>
<td>INR</td>
</tr>

<tr>
<td>Remarks</td>
<td colspan="2" style="text-align:center;">${showRemarks}</td>

</tr>
</table>
</div>
</div>
</div>
`;
}).join("")}
</div>

<div class="summary">

<div class="total-card">

<div class="total-heading">Quote Total</div>

<div class="total-row"><span>No. of Components</span><span>${totalQty}</span></div>
<div class="total-row"><span>Total Area(sqft)</span><span>${totalArea.toFixed(2)}</span></div>
<div class="total-row"><span><strong>Basic Value</strong></span><span><strong>${formatCurrency(baseTotal)}</strong></span></div>

<div class="total-row"><span>Total Project Cost</span><span>${formatCurrency(totalProjectCost)}</span></div>
<div class="total-row"><span>GST 18%</span><span>${formatCurrency(gstValue)}</span></div>

<div class="total-row"><span><strong>Grand Total</strong></span><span><strong>${formatCurrency(grandTotal)}</strong></span></div>

</div>

</div>


<div class="lists">

<div class="list-card">
<div class="list-title">Terms & Conditions</div>
<div>${quotationTerms ? nl2br(quotationTerms) : "N/A"}</div>
</div>

<div class="list-card">
<div class="list-title">Pre-requisites for Installation of Windows</div>
<div>${prequisites ? nl2br(prequisites) : "N/A"}</div>
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
    (quotation.items || []).map(async (item) => ({
      ...item,
      refImage: item.refImage ? await imageToBase64(item.refImage) : "",
      
      subItems: item.subItems
        ? await Promise.all(
          item.subItems.map(async (sub) => ({
            ...sub,
            refImage: sub.refImage
              ? await imageToBase64(sub.refImage)
              : await imageToBase64(getPresetImagePath(sub.description)),
            //         
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
      scale: 3,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      logging: false,
      imageTimeout: 15000,
      backgroundColor: "#ffffff",
      windowWidth: document.body.scrollWidth,
      windowHeight: document.body.scrollHeight,

      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc: Document) => {
        if (doc.head && clonedDoc.head) {
          clonedDoc.head.innerHTML = "";
          clonedDoc.head.appendChild(doc.head.cloneNode(true));
        }
      }
    },
    pagebreak: {
      mode: ['css', 'legacy'] as Array<'avoid-all' | 'css' | 'legacy'>,
       avoid: ['img']
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
