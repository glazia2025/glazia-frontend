'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, ShoppingBag, Trash2, LogIn, FileText } from 'lucide-react';
import { useCartState, useAuth } from '@/contexts/AppContext';
import OrderPlacement from './OrderPlacement';
import ImageModal from '@/components/ImageModal';
import LoginModal from './LoginModal';
import { createPdfFrame } from '@/utils/pdfFrame';

// Number to words conversion function for Indian currency
const numberToWordsIndian = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertHundreds = (n: number): string => {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  };

  if (num === 0) return 'Zero Rupees Only';

  let result = '';
  let crores = Math.floor(num / 10000000);
  num %= 10000000;
  let lakhs = Math.floor(num / 100000);
  num %= 100000;
  let thousands = Math.floor(num / 1000);
  num %= 1000;

  if (crores > 0) {
    result += convertHundreds(crores) + 'Crore ';
  }
  if (lakhs > 0) {
    result += convertHundreds(lakhs) + 'Lakh ';
  }
  if (thousands > 0) {
    result += convertHundreds(thousands) + 'Thousand ';
  }
  if (num > 0) {
    result += convertHundreds(num);
  }

  return result.trim() + ' Rupees Only';
};

const CartSidebar: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, closeCart, getAdjustedItemPrice } = useCartState();
  const { isAuthenticated, user } = useAuth();
  const [showOrderPlacement, setShowOrderPlacement] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [nalcoPrice, setNalcoPrice] = useState<number>(0);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [pendingProforma, setPendingProforma] = useState<ProformaInvoiceSnapshot | null>(null);
  const proformaStorageKey = 'glazia-proforma-invoices';
  const proformaCounterKey = 'glazia-proforma-counter';

  type ProformaInvoiceSnapshot = {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    createdAt: string;
    totalAmount: number;
    itemCount: number;
    items: typeof cart.items;
    customerName?: string;
    destination?: string;
  };

  const saveProformaInvoice = (invoice: ProformaInvoiceSnapshot) => {
    if (typeof window === 'undefined') return;
    try {
      const existing = JSON.parse(localStorage.getItem(proformaStorageKey) || '[]') as ProformaInvoiceSnapshot[];
      const next = [invoice, ...existing].slice(0, 5);
      localStorage.setItem(proformaStorageKey, JSON.stringify(next));
    } catch (error) {
      console.error('Error saving proforma invoice to localStorage:', error);
    }
  };

  // State for image modal
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageSrc: '',
    imageAlt: '',
    productName: ''
  });

  // Shipping discount calculation based on order value slabs
  const calculateShippingDiscount = (orderValue: number) => {
    if (orderValue >= 2000000) {
      // 20L+ gets 20,000 off
      return 20000;
    } else if (orderValue >= 1000000) {
      // 10L-19.99L gets 10,000 off
      return 10000;
    } else if (orderValue >= 500000) {
      // 5L-9.99L gets 5,000 off
      return 5000;
    } else if (orderValue >= 200000 && orderValue >= 250000) {
      // 2.50L-4.99L gets 2,500 off
      return 2500;
    }
    return 0;
  };

  // Get shipping discount info
  const getShippingInfo = (orderValue: number) => {
    const discount = calculateShippingDiscount(orderValue);

    if (orderValue >= 2000000) {
      return {
        discount,
        message: "🎉 Maximum shipping discount applied!",
        nextTier: null,
        color: "green"
      };
    } else if (orderValue >= 1000000) {
      return {
        discount,
        message: `₹${discount.toLocaleString()} shipping discount applied!`,
        nextTier: { amount: 2000000, discount: 20000 },
        color: "green"
      };
    } else if (orderValue >= 500000) {
      return {
        discount,
        message: `₹${discount.toLocaleString()} shipping discount applied!`,
        nextTier: { amount: 1000000, discount: 10000 },
        color: "green"
      };
    } else if (orderValue >= 250000) {
      return {
        discount,
        message: `₹${discount.toLocaleString()} shipping discount applied!`,
        nextTier: { amount: 500000, discount: 5000 },
        color: "green"
      };
    } else {
      return {
        discount: 0,
        message: "Add items to get shipping discount",
        nextTier: { amount: 250000, discount: 2500 },
        color: "gray"
      };
    }
  };

  const shippingInfo = getShippingInfo(cart.total);

  // Lock body scroll when cart is open
  useEffect(() => {
    console.log(cart);
    if (window.localStorage) {
      const temp = window.localStorage.getItem('nalcoPrice');
      if (temp) {
        setNalcoPrice(parseFloat(temp)); // Use parseFloat to preserve decimal values
      }
    }
    if (cart.isOpen && typeof window !== 'undefined') {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Prevent layout shift

      return () => {
        // Unlock scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [cart.isOpen]);

  // Lock body scroll when order placement modal is open
  useEffect(() => {
    if (showOrderPlacement) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Prevent layout shift

      return () => {
        // Unlock scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [showOrderPlacement]);

  // Generate Proforma Invoice
  const generatePerformaInvoice = async () => {
    if (!isAuthenticated || !user) {
      setShowLoginModal(true);
      return;
    }

    const getNextProformaNumber = () => {
      if (typeof window === 'undefined') return '0001';
      const current = Number(localStorage.getItem(proformaCounterKey) || '0');
      const next = current + 1;
      localStorage.setItem(proformaCounterKey, String(next));
      return String(next).padStart(4, '0');
    };

    const formatCurrency = (value: number) =>
      `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const today = new Date();
    const invoiceDateParts = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).split(' ');
    const invoiceDate = `${invoiceDateParts[0]} ${invoiceDateParts[1]}, ${invoiceDateParts[2]}`;
    const referenceNumber = getNextProformaNumber();
    const invoiceNumber = `GW/${today.getFullYear().toString().slice(-2)}/${String(today.getMonth() + 1).padStart(2, '0')}/PI${referenceNumber}`;
    const dispatchMode = 'By Road';
    const destination = [user.city, user.state].filter(Boolean).join(', ') || 'Destination';

    // Prepare cart items separated by category: Aluminium Profiles and Hardware
    const profileProducts = cart.items
      .filter((item) => !item.category?.toLowerCase().includes('hardware'))
      .map((item) => {
        const adjustedRate = getAdjustedItemPrice(item);
        const baseProfilePrice = (nalcoPrice / 1000) + adjustedRate;
        const quantity = Number(item.quantity) || 0;
        const lengthInMeters = (parseFloat(String(item.length)) || 0) / 1000;
        const kgm = Number(item.kgm) || 0;
        const rate = baseProfilePrice;
        const amount = rate * quantity * lengthInMeters * kgm;

        return {
          description: item.name || 'Aluminium Profile',
          series: item.category || 'Aluminium Profile',
          sapCode: item.id,
          quantity: item.quantity,
          rate,
          per: 'Kg',
          amount
        };
      });

    const hardwareProducts = cart.items
      .filter((item) => item.category?.toLowerCase().includes('hardware'))
      .map((item) => {
        const adjustedRate = getAdjustedItemPrice(item);
        const basePrice = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const rate = basePrice + adjustedRate;
        const amount = rate * quantity;

        return {
          description: item.name || 'Hardware Item',
          series: item.category || 'Hardware',
          sapCode: item.id,
          quantity: item.quantity,
          rate,
          per: 'Piece',
          amount
        };
      });

    const profilesSubtotal = profileProducts.reduce((sum, item) => sum + (item.amount || 0), 0);
    const profilesTotalQuantity = profileProducts.reduce((sum, p) => sum + Number(p.quantity || 0), 0);

    const hardwareSubtotal = hardwareProducts.reduce((sum, item) => sum + (item.amount || 0), 0);
    const hardwareTotalQuantity = hardwareProducts.reduce((sum, p) => sum + Number(p.quantity || 0), 0);

    const subtotal = profilesSubtotal + hardwareSubtotal;
    const gstHalf = subtotal * 0.09;
    const gstTotal = gstHalf * 2;
    const net = subtotal + gstTotal;
    const roundedNet = Math.round(net);
    const totalQuantity = profilesTotalQuantity + hardwareTotalQuantity;

    const profileRows = profileProducts.map((p, i) => `
        <tr>
          <td style="text-align:center;">${i + 1}</td>
          <td>${p.description}</td>
          <td>${p.series}</td>
          <td>${p.sapCode}</td>
          <td style="text-align:center;">${p.quantity}</td>
          <td style="text-align:right;">${formatCurrency(p.rate)}</td>
          <td style="text-align:center;">${p.per || 'Kg'}</td>
          <td style="text-align:right;">${formatCurrency(p.amount)}</td>
        </tr>
    `).join('');

    const hardwareRows = hardwareProducts.map((p, i) => `
        <tr>
          <td style="text-align:center;">${i + 1}</td>
          <td>${p.description}</td>
          <td>${p.series}</td>
          <td>${p.sapCode}</td>
          <td style="text-align:center;">${p.quantity}</td>
          <td style="text-align:right;">${formatCurrency(p.rate)}</td>
          <td style="text-align:center;">${p.per || 'Piece'}</td>
          <td style="text-align:right;">${formatCurrency(p.amount)}</td>
        </tr>
    `).join('');

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; font-size: 12px; }
            .container { width: 100%; max-width: 780px; margin: 0 auto; padding: 24px 28px 30px; background: #fff; }
            .top-row { display: flex; justify-content: space-between; align-items: center; }
            .logo { height: 38px; object-fit: contain; }
            .title { color: #d92525; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
            .muted { color: #4b5563; line-height: 1.5; font-size: 12px; }
            .label { font-weight: 700; font-size: 12px; color: #111827; }
            .divider { border-bottom: 1px solid #d1d5db; margin: 14px 0 16px; }
            table { width: 100%; border-collapse: collapse; }
            .info-table th { text-align: left; font-size: 11.5px; font-weight: 700; padding: 7px 10px; background: #f3f4f6; border-bottom: 1px solid #d1d5db; color: #111; }
            .info-table td { font-size: 12px; padding: 7px 10px; color: #374151; }
            .info-table { margin-bottom: 6px; }
            .address-table td { width: 50%; vertical-align: top; padding: 4px 8px 8px; }
            .section-banner {
              color: #d92525;
              font-size: 13px;
              font-weight: 800;
              line-height: 1.3;
              padding-bottom: 5px;
              margin-top: 20px;
              margin-bottom: 10px;
              border-bottom: 2px solid #d92525;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .products { margin-bottom: 12px; }
            .products thead th {
              font-size: 11px;
              font-weight: 700;
              padding: 8px 8px;
              text-align: left;
              border-bottom: 1.5px solid #111827;
              background: #f3f4f6;
              text-transform: uppercase;
            }
            .products thead th:nth-child(1),
            .products tbody td:nth-child(1),
            .products thead th:nth-child(5),
            .products tbody td:nth-child(5),
            .products thead th:nth-child(7),
            .products tbody td:nth-child(7) { text-align: center; }
            .products thead th:nth-child(6),
            .products tbody td:nth-child(6),
            .products thead th:nth-child(8),
            .products tbody td:nth-child(8) { text-align: right; }
            .products tbody td {
              font-size: 11.5px;
              padding: 8px 8px;
              border-bottom: 1px solid #e5e7eb;
              vertical-align: middle;
            }
            .products tbody tr:last-child td { border-bottom: 1.5px solid #111827; }
            .products tbody td:last-child { white-space: nowrap; }
            .subtotal-row td {
              font-weight: 700;
              font-size: 12px;
              background: #f9fafb;
              border-top: 1.5px solid #111827 !important;
              border-bottom: 1.5px solid #111827 !important;
              padding: 8px 8px !important;
            }
            .totals-table td { font-size: 12px; padding: 4px 0; }
            .totals-table td:last-child { text-align: right; font-weight: 700; }
            .totals-table tr:last-child td { border-top: 1.5px solid #111827; padding-top: 6px; }
            .payment-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 20px; align-items: start; }
            .payment-info-box { margin-top: 14px; }
            .terms-section { margin-top: 12px; }
            .terms-list { font-size: 11.5px; line-height: 1.45; color: #2a2a2a; }
            .term-item { margin-bottom: 6px; }
            .term-title { font-weight: 600; color: #111; margin-bottom: 1px; }
            .term-desc { padding-left: 14px; color: #374151; }

            /* Strict page-break handling to prevent sliced content */
            tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
            .totals-table { page-break-inside: avoid !important; break-inside: avoid !important; }
            .info-table { page-break-inside: avoid !important; break-inside: avoid !important; }
            .address-table { page-break-inside: avoid !important; break-inside: avoid !important; }
            .section-banner { page-break-inside: avoid !important; break-inside: avoid !important; page-break-after: avoid !important; break-after: avoid !important; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="top-row">
              <img src="/Logo.svg" alt="Glazia Logo" class="logo" />
              <div class="title">PROFORMA INVOICE</div>
            </div>

            <div class="divider"></div>

            <table class="info-table">
              <tr>
                <td style="padding: 4px 8px; width: 60%;">
                  <div class="label" style="font-size: 13px;">Glazia Windoors Pvt. Ltd.</div>
                  <div class="muted">
                    Khata No. 361, Rect. No. 21 4/70, Kherki Dhaula Village Road,<br/>
                    Gurgaon, Haryana - 122001, India
                  </div>
                </td>
                <td style="text-align: right; padding: 4px 8px; width: 40%;">
                  <div class="label" style="font-size: 13px;">Contact</div>
                  <div class="muted">www.glazia.in &nbsp;|&nbsp; +91-9958053708 &nbsp;|&nbsp; sales@glazia.in</div>
                </td>
              </tr>
            </table>

            <table class="info-table" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; margin-top: 6px;">
              <tr>
                <th>Invoice #</th>
                <th>Invoice Date</th>
                <th>Reference #</th>
                <th>Dispatch Mode</th>
                <th>Destination</th>
              </tr>
              <tr>
                <td style="font-weight: 700; color: #111; font-size: 12.5px;">${invoiceNumber}</td>
                <td>${invoiceDate}</td>
                <td>${referenceNumber}</td>
                <td>${dispatchMode}</td>
                <td>${destination}</td>
              </tr>
            </table>

            <div class="divider"></div>

            <table class="address-table">
              <tr>
                <td>
                  <div class="label" style="text-transform: uppercase; font-size: 10.5px; color: #6b7280; margin-bottom: 4px;">Invoice To:</div>
                  <div class="muted">
                    <strong style="color: #111; font-size: 13px;">${user.name || 'Glazia Customer'}</strong><br/>
                    ${user.company ? `${user.company}<br/>` : ''}
                    ${user.completeAddress ? `${user.completeAddress}, ` : ''}${[user.city, user.state].filter(Boolean).join(', ')}${user.pincode ? ' - ' + user.pincode : ''}<br/>
                    ${user.phone ? `Phone: ${user.phone}` : ''}${user.email ? ` &nbsp;|&nbsp; Email: ${user.email}` : ''}${user.gstNumber ? `<br/>GSTIN: ${user.gstNumber}` : ''}
                  </div>
                </td>
                <td>
                  <div class="label" style="text-transform: uppercase; font-size: 10.5px; color: #6b7280; margin-bottom: 4px;">Shipped To:</div>
                  <div class="muted">
                    <strong style="color: #111; font-size: 13px;">${user.name || 'Glazia Customer'}</strong><br/>
                    ${user.company ? `${user.company}<br/>` : ''}
                    ${user.completeAddress ? `${user.completeAddress}, ` : ''}${[user.city, user.state].filter(Boolean).join(', ')}${user.pincode ? ' - ' + user.pincode : ''}<br/>
                    ${user.phone ? `Phone: ${user.phone}` : ''}
                  </div>
                </td>
              </tr>
            </table>

            ${profileProducts.length > 0 ? `
            <!-- Section 1: Aluminium Profiles -->
            <div class="section-banner">1. ALUMINIUM PROFILES</div>
            <table class="products">
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 24%;">Description</th>
                  <th style="width: 15%;">Series</th>
                  <th style="width: 15%;">SAP Code</th>
                  <th style="width: 8%;">Qty.</th>
                  <th style="width: 12%;">Rate(₹)</th>
                  <th style="width: 8%;">Per</th>
                  <th style="width: 13%;">Amt. (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${profileRows}
                <tr class="subtotal-row">
                  <td></td>
                  <td colspan="3" style="font-weight: 700;">Subtotal (Aluminium Profiles)</td>
                  <td style="text-align: center; font-weight: 700;">${profilesTotalQuantity}</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 700;">${formatCurrency(profilesSubtotal)}</td>
                </tr>
              </tbody>
            </table>
            ` : ''}

            ${hardwareProducts.length > 0 ? `
            <!-- Section 2: Hardware -->
            <div class="section-banner" style="margin-top: ${profileProducts.length > 0 ? '18px' : '12px'};">${profileProducts.length > 0 ? '2. HARDWARE' : '1. HARDWARE'}</div>
            <table class="products">
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 24%;">Description</th>
                  <th style="width: 15%;">Series</th>
                  <th style="width: 15%;">SAP Code</th>
                  <th style="width: 8%;">Qty.</th>
                  <th style="width: 12%;">Rate(₹)</th>
                  <th style="width: 8%;">Per</th>
                  <th style="width: 13%;">Amt. (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${hardwareRows}
                <tr class="subtotal-row">
                  <td></td>
                  <td colspan="3" style="font-weight: 700;">Subtotal (Hardware)</td>
                  <td style="text-align: center; font-weight: 700;">${hardwareTotalQuantity}</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 700;">${formatCurrency(hardwareSubtotal)}</td>
                </tr>
              </tbody>
            </table>
            ` : ''}

            ${profileProducts.length === 0 && hardwareProducts.length === 0 ? `
            <div style="padding: 24px; text-align: center; color: #666; font-size: 13px;">No items found in invoice</div>
            ` : ''}

            <!-- Summary & Payment Details -->
            <div class="summary-box avoid-break">
              <div class="divider"></div>
              <div class="payment-grid">
                <div>
                  <div>
                    <div class="label">Payment Method</div>
                    <div class="muted">${user.paymentMethod || 'Bank Transfer'}</div>
                  </div>

                  <div style="margin-top: 12px;">
                    <div class="label">Total Quantity</div>
                    <div class="muted">${totalQuantity} items</div>
                  </div>

                  <div style="margin-top: 12px;">
                    <div class="label">Rounded Off Amount</div>
                    <div class="muted">${formatCurrency(roundedNet)}</div>
                  </div>

                  <div style="margin-top: 12px;">
                    <div class="label">In Words</div>
                    <div class="muted">${numberToWordsIndian(Math.round(net))}</div>
                  </div>
                </div>
                <div>
                  <table class="totals-table">
                    ${profileProducts.length > 0 ? `
                    <tr>
                      <td class="muted">Aluminium Profiles Subtotal</td>
                      <td>${formatCurrency(profilesSubtotal)}</td>
                    </tr>
                    ` : ''}
                    ${hardwareProducts.length > 0 ? `
                    <tr>
                      <td class="muted">Hardware Subtotal</td>
                      <td>${formatCurrency(hardwareSubtotal)}</td>
                    </tr>
                    ` : ''}
                    <tr style="${profileProducts.length > 0 && hardwareProducts.length > 0 ? 'border-top: 1px dashed #e5e7eb;' : ''}">
                      <td class="label">Sub Total</td>
                      <td>${formatCurrency(subtotal)}</td>
                    </tr>
                    <tr>
                      <td class="label">SGST@9%</td>
                      <td>${formatCurrency(gstHalf)}</td>
                    </tr>
                    <tr>
                      <td class="label">CGST@9%</td>
                      <td>${formatCurrency(gstHalf)}</td>
                    </tr>
                    <tr style="border-top: 1.5px solid #111827;">
                      <td class="label" style="font-size: 14px; font-weight: 800; padding-top: 6px;">Total</td>
                      <td style="font-size: 14px; font-weight: 800; padding-top: 6px;">${formatCurrency(net)}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>

            <!-- Payment Info Section -->
            <div class="payment-info-box avoid-break" style="margin-top: 16px;">
              <div class="label" style="font-size: 13px; font-weight: 800;">Payment Info</div>
              <div class="divider" style="margin: 6px 0 10px;"></div>
              <div class="muted" style="line-height: 1.55; font-size: 12px;">
                <div><span class="label">Account No:</span> 50200084871361</div>
                <div><span class="label">Account Name:</span> Glazia Windoors Pvt. Ltd.</div>
                <div><span class="label">IFSC Code:</span> HDFC0004809</div>
                <div><span class="label">Bank:</span> HDFC Bank</div>
              </div>
            </div>

            <!-- Terms & Conditions Section -->
            <div class="terms-section">
              <div class="divider" style="margin: 12px 0 8px;"></div>
              <div class="label" style="text-align: center; margin-bottom: 8px; font-size: 12px;">Terms & Conditions</div>
              <div class="terms-list">
                <div class="term-item">
                  <div class="term-title">1. PI Validity Period</div>
                  <div class="term-desc">a. 15 days from date of issuance irrespective of selling price.</div>
                  <div class="term-desc">b. PI shall be treated as null and void in all respect in absence of advance payment as per PI items.</div>
                </div>
                <div class="term-item">
                  <div class="term-title">2. Selling Price</div>
                  <div class="term-desc">Selling Price is governed by NALCO Billet price on the date of material dispatch.</div>
                </div>
                <div class="term-item">
                  <div class="term-title">3. Supply Schedule</div>
                  <div class="term-desc">Supply Schedule will be discussed and finalized after advance payment.</div>
                </div>
                <div class="term-item">
                  <div class="term-title">4. Advance Payment</div>
                  <div class="term-desc">a. 100% advance for PI having value Rs. &gt;0 ~ =&gt; 2,00,000</div>
                  <div class="term-desc">b. 50% advance for PI having value Rs. &gt;0 ~ =&lt; 2,00,000</div>
                </div>
                <div class="term-item">
                  <div class="term-title">5. Transportation</div>
                  <div class="term-desc">In customer scope, no claim or responsibility in any form related to transportation will be levied.</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const opt = {
      margin: [0.35, 0.35, 0.35, 0.35] as [number, number, number, number],
      filename: `Glazia_Proforma_Invoice_${(user.name || 'Customer').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: false,
        scrollY: 0
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait' as const,
        compress: true
      },
      pagebreak: {
        mode: ['css', 'legacy'] as Array<'css' | 'legacy'>,
        avoid: ['tr', '.avoid-break', '.totals-table', '.info-table', '.address-table', '.section-banner']
      }
    };

    let cleanupFrame: (() => void) | null = null;
    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;

      const { body, cleanup, doc } = await createPdfFrame(invoiceHTML);
      cleanupFrame = cleanup;

      const nextOpt = {
        ...opt,
        html2canvas: {
          ...opt.html2canvas,
          onclone: (clonedDoc: Document) => {
            if (doc.head && clonedDoc.head) {
              clonedDoc.head.innerHTML = "";
              clonedDoc.head.appendChild(doc.head.cloneNode(true));
            }
          },
        },
      };

      await html2pdf().set(nextOpt).from(body).save();
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      cleanupFrame?.();
    }

    setPendingProforma({
      id: `pi_${Date.now()}`,
      invoiceNumber,
      invoiceDate: today.toISOString(),
      createdAt: today.toISOString(),
      totalAmount: roundedNet,
      itemCount: totalQuantity,
      items: cart.items,
      customerName: user.name,
      destination
    });
    setShowSavePrompt(true);
  };

  if (!cart.isOpen) return null;

  const handleQuickOrder = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowOrderPlacement(true);
  };

  const handleOrderSuccess = () => {
    setShowOrderPlacement(false);
    closeCart();
  };

  const handleOrderCancel = () => {
    setShowOrderPlacement(false);
  };

  // Handle image click to open modal
  const handleImageClick = (imageSrc: string, productName: string) => {
    setImageModal({
      isOpen: true,
      imageSrc,
      imageAlt: productName,
      productName
    });
  };

  // Close image modal
  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageSrc: '',
      imageAlt: '',
      productName: ''
    });
  };

  console.log(cart, 'cart>>>>')

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-[#00000033] bg-opacity-50 z-[10001]"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[10001] transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-[500] text-gray-900">
              Shopping Cart ({cart.itemCount})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some windoors products to get started</p>
                <Link
                  href="/categories"
                  onClick={closeCart}
                  className="bg-[#124657} hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleImageClick(item.image, item.name)}
                          title="Click to view larger image"
                        />
                      ) : (
                        <span className="text-gray-500 text-xs text-center">{item.category}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[#282828] truncate">{item.name}</h4>
                      <p className="text-[10px] font-[400] text-[#282828]">{item.category?.toLowerCase().includes("hardware") ? 'pcs' : 'per kg'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-[400] text-[#282828] ">
                          {
                            item.category?.toLowerCase().includes("hardware") ? (
                              `₹${(parseFloat(item.price) + getAdjustedItemPrice(item)).toFixed(2)}`
                            ) : (`₹${((nalcoPrice / 1000) + getAdjustedItemPrice(item)).toFixed(2)}`)
                          }
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 0}
                        >
                          <Minus className="w-2 h-2 text-[#282828]" />
                        </button>
                        <span className="text-[12px] text-[#282828] font-[400] w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus className="w-2 h-2 text-[#282828]" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-evenly space-y-6">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{(() => {
                          if (item.category?.toLowerCase().includes('hardware')) {
                            // Hardware: (base price + dynamic adjustment) × quantity
                            const adjustedPrice = parseFloat(item.price) + getAdjustedItemPrice(item);
                            return (adjustedPrice * item.quantity).toLocaleString();
                          } else {
                            // Profiles: ((nalcoPrice/1000) + dynamic adjustment) × quantity × (length/1000) × kgm
                            const basePrice = (nalcoPrice / 1000);
                            const dynamicAdjustment = getAdjustedItemPrice(item);
                            const adjustedPrice = basePrice + dynamicAdjustment;
                            const total = adjustedPrice * item.quantity * (parseFloat(item.length) / 1000) * item.kgm;
                            return total.toLocaleString();
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='p-4'>
            {shippingInfo.nextTier && (
              <p className="text-[12px] text-[#575757] mb-2">
                Add ₹{(shippingInfo.nextTier.amount - cart.total).toLocaleString()} more to get ₹{shippingInfo.nextTier.discount.toLocaleString()} shipping discount
              </p>
            )}
            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="border-t pt-2 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-[18px] font-[500] text-gray-900">Total:</span>
                  <span className="text-[18px] font-[500] text-gray-900">₹{cart.total.toLocaleString()}</span>
                </div>



                {/* Action Buttons */}
                <div className="space-y-2">
                  {!isAuthenticated && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                      <p className="text-sm text-yellow-800 text-center">
                        Please login to complete your order
                      </p>
                    </div>
                  )}

                  {/* Proforma Invoice Button */}
                  <button
                    onClick={generatePerformaInvoice}
                    className="w-full bg-white hover:bg-[#EE1C25] text-black hover:text-white border border-black font-medium py-3 px-4 transition-colors flex items-center justify-center space-x-2 mb-3"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isAuthenticated ? 'Generate Proforma Invoice' : 'Login to Generate Invoice'}</span>
                  </button>

                  {isAuthenticated ? (
                    <button
                      onClick={handleQuickOrder}
                      className="w-full text-white font-medium py-3 px-4 transition-colors flex items-center justify-center space-x-2"
                      style={{ backgroundColor: '#EE1C25' }}
                    >
                      <span>Proceed to Checkout</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleQuickOrder}
                      className="w-full text-white font-medium py-3 px-4 transition-colors flex items-center justify-center space-x-2"
                      style={{ backgroundColor: '#EE1C25' }}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login to Checkout</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Order Placement Modal */}
      {showOrderPlacement && (
        <>
          {/* Modal Overlay */}
          <div className="fixed inset-0 bg-[#00000033] bg-opacity-50 z-[10002]" onClick={handleOrderCancel} />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[10002] flex items-center justify-center md:p-4">
            <div className="bg-white md:rounded-lg shadow-xl w-full md:w-[75vw] h-full md:h-auto md:max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Quick Order</h2>
                  <button
                    onClick={handleOrderCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <OrderPlacement
                  onOrderSuccess={handleOrderSuccess}
                  onCancel={handleOrderCancel}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageSrc={imageModal.imageSrc}
        imageAlt={imageModal.imageAlt}
        productName={imageModal.productName}
      />

      {/* Save Proforma Prompt */}
      {showSavePrompt && (
        <>
          <div
            className="fixed inset-0 bg-[#00000066] z-[10003]"
            onClick={() => setShowSavePrompt(false)}
          />
          <div className="fixed inset-0 z-[10003] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md border border-gray-200 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Proforma Invoice?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Do you want to save this PI for future reference?
                <br />
                Note: Only last 5 saved PI will only be displayed.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowSavePrompt(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    if (pendingProforma) {
                      saveProformaInvoice(pendingProforma);
                    }
                    setPendingProforma(null);
                    setShowSavePrompt(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#EE1C25]"
                >
                  Yes, Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CartSidebar;
