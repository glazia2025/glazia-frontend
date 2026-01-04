'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, ShoppingBag, Trash2, LogIn, FileText } from 'lucide-react';
import { useCartState, useAuth } from '@/contexts/AppContext';
import OrderPlacement from './OrderPlacement';
import ImageModal from '@/components/ImageModal';
import LoginModal from './LoginModal';

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

  // Generate Performa Invoice
  const generatePerformaInvoice = async () => {
    if (!isAuthenticated || !user) {
      setShowLoginModal(true);
      return;
    }

    const formatCurrency = (value: number) =>
      `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const today = new Date();
    const invoiceDateParts = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).split(' ');
    const invoiceDate = `${invoiceDateParts[0]} ${invoiceDateParts[1]}, ${invoiceDateParts[2]}`;
    const referenceNumber = '0023';
    const invoiceNumber = `GW/${today.getFullYear().toString().slice(-2)}/${String(today.getMonth() + 1).padStart(2, '0')}/PI${referenceNumber}`;
    const dispatchMode = 'By Road';
    const destination = [user.city, user.state].filter(Boolean).join(', ') || 'Destination';

    // Prepare cart items for invoice with pricing aligned to cart logic
    const selectedProducts = cart.items.map((item, index) => {
      const adjustedRate = getAdjustedItemPrice(item);
      const isHardware = item.category?.toLowerCase().includes('hardware');
      const baseProfilePrice = (nalcoPrice / 1000) + 75 + adjustedRate;
      const basePrice = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      const lengthInMeters = (parseFloat(String(item.length)) || 0) / 1000;
      const kgm = Number(item.kgm) || 0;

      const rate = isHardware ? basePrice + adjustedRate : baseProfilePrice;
      const amount = isHardware
        ? rate * quantity
        : rate * quantity * lengthInMeters * kgm;

      return {
        description: item.name || 'Item',
        series: item.category || 'Series',
        sapCode: item.id || `SAP${String(index + 1).padStart(3, '0')}`,
        quantity: item.quantity,
        rate,
        per: 'Piece',
        amount
      };
    });

    const subtotal = selectedProducts.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gstHalf = subtotal * 0.09;
    const gstTotal = gstHalf * 2;
    const net = subtotal + gstTotal;
    const roundedNet = Math.round(net);
    const totalQuantity = selectedProducts.reduce((sum, p) => sum + Number(p.quantity || 0), 0);

    const rows = selectedProducts.map((p, i) => `
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
            body { margin: 0; font-family: Arial, sans-serif; color: #1a1a1a; }
            .container { width: 100%; max-width: 780px; margin: 0 auto; padding: 28px 30px 36px; background: #fff; }
            .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
            .logo { font-size: 36px; font-weight: 700; letter-spacing: 2px; }
            .title { color: #d92525; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; margin-top: 6px; }
            .muted { color: #404040; line-height: 1.5; font-size: 12px; }
            .label { font-weight: 700; font-size: 12px; color: #111; }
            .divider { border-bottom: 1px solid #b8b8b8; margin: 14px 0 18px; }
            table { width: 100%; border-collapse: collapse; }
            .info-table th { text-align: left; font-size: 12px; font-weight: 700; padding: 4px 8px; }
            .info-table td { font-size: 12px; padding: 4px 8px 10px; color: #404040; }
            .info-table { margin-bottom: 6px; }
            .address-table td { width: 50%; vertical-align: top; padding: 4px 8px 10px; }
            .products thead th {
              font-size: 12px;
              font-weight: 700;
              padding: 10px 8px;
              text-align: left;
              border-bottom: 1px solid #111;
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
              font-size: 12px;
              padding: 10px 8px;
              border-bottom: 1px solid #d8d8d8;
              vertical-align: top;
            }
            .products tbody tr:last-child td { border-bottom: 1px solid #111; }
            .products tbody td:last-child { white-space: nowrap; }
            .totals-table td { font-size: 12px; padding: 6px 0; }
            .totals-table td:last-child { text-align: right; font-weight: 700; }
            .totals-table tr:last-child td { border-top: 1px solid #b8b8b8; padding-top: 10px; }
            .section-title { font-weight: 700; font-size: 12px; margin-bottom: 6px; }
            .payment-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; }
            .signature-row { display: flex; justify-content: space-between; margin-top: 18px; }
            .payment-info { margin-top: 18px; }
            .qr-img { width: 105px; height: 105px; border: 1px solid #cfcfcf; border-radius: 6px; object-fit: contain; background: #f7f7f7; padding: 6px; }
            .terms { font-size: 12px; line-height: 1.6; color: #2a2a2a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="top-row">
              <div class="logo">GLAZIA</div>
              <div class="title">PERFORMA INVOICE</div>
            </div>

            <div class="divider"></div>

            <table class="info-table">
              <tr>
                <td>
                  <div class="label">Glazia Windoors Pvt. Ltd.</div>
                  <div class="muted">Khata No. 361, Rect. No. 21 4/70,<br/>
                  Kherki Dhaula Village Road,<br/>
                  Gurgaon, Haryana - 122001<br/>India</div>
                </td>
                <td style="text-align: right;">
                  <div class="label">Contact</div>
                  <div class="muted">www.glazia.in<br/>+91-9958035708<br/>sales@glazia.com</div>
                </td>
              </tr>
            </table>

            <div class="divider"></div>

            <table class="info-table">
              <tr>
                <th>Invoice #</th>
                <th>Invoice Date</th>
                <th>Reference #</th>
                <th>Dispatch Mode</th>
                <th>Destination</th>
              </tr>
              <tr>
                <td>${invoiceNumber}</td>
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
                  <div class="label">Invoice To:</div>
                  <div class="muted">${user.name || 'Glazia Windoors Pvt. Ltd.'},<br/>
                  ${user.completeAddress || 'Gurgaon, Haryana - 122001'}<br/>
                  ${[user.city, user.state].filter(Boolean).join(', ')}${user.pincode ? ' - ' + user.pincode : ''}</div>
                </td>
                <td>
                  <div class="label">Shipped To:</div>
                  <div class="muted">${user.name || 'Glazia Windoors Pvt. Ltd.'},<br/>
                  ${user.completeAddress || 'Gurgaon, Haryana - 122001'}<br/>
                  ${[user.city, user.state].filter(Boolean).join(', ')}${user.pincode ? ' - ' + user.pincode : ''}</div>
                </td>
              </tr>
            </table>

            <div class="divider"></div>

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
                ${rows}
                <tr>
                  <td></td>
                  <td></td>
                  <td style="font-weight: 700; text-align: center;">Total</td>
                  <td></td>
                  <td style="text-align: center; font-weight: 700;">${totalQuantity}</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 700;">${formatCurrency(subtotal)}</td>
                </tr>
              </tbody>
            </table>

            <div class="divider"></div>

            <div class="payment-grid">
              <div>
                <div class="label">Payment Method</div>
                <div class="muted">${user.paymentMethod || 'Cash'}</div>

                <div style="margin-top: 10px;">
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
                  <tr>
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
                  <tr>
                    <td class="label">Total</td>
                    <td>${formatCurrency(net)}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="signature-row">
              <div>
                <div class="label">Accepted By</div>
                <div class="muted">Glazia Windoors Pvt. Ltd.</div>
              </div>
              <div style="text-align: right;">
                <div class="label">Signature</div>
                <div class="muted">Glazia Windoors Pvt. Ltd.</div>
              </div>
            </div>

            <div class="payment-info">
              <div class="label">Payment Info</div>
              <div class="divider" style="margin: 10px 0 12px;"></div>
              <table class="info-table" style="margin-bottom: 0;">
                <tr>
                  <td style="width: 60%; vertical-align: top;">
                    <div class="muted"><span class="label">Account No: </span>Glazia Windoors Pvt. Ltd.</div>
                    <div class="muted"><span class="label">Account Name: </span>Account Name:</div>
                    <div class="muted"><span class="label">IFSC Code: </span>IFSC Code:</div>
                    <div class="muted"><span class="label">Bank: </span>HDFC Bank</div>
                  </td>
                  <td style="text-align: right; vertical-align: top;">
                    <div style="display: inline-flex; gap: 12px; align-items: flex-start;">
                      <img src="/glazia_qr.png" alt="Glazia UPI QR" class="qr-img" />
                      <div>
                        <div class="muted"><span class="label">Name: </span>${user.name || 'Glazia Windoors Pvt. Ltd.'}</div>
                        <div class="muted"><span class="label">UPI: </span>glazia@okhdfcbank</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <div class="divider" style="margin: 18px 0 12px;"></div>

            <div class="label" style="text-align: center; margin-bottom: 10px;">Terms & Conditions</div>
            <div class="terms">
              1. PI Validity Period<br/>
              &nbsp;&nbsp;a. 15 days from date of issuance irrespective of selling price.<br/>
              &nbsp;&nbsp;b. PI shall be treated as null and void in all respect in absence of advance payment as per PI items.<br/><br/>
              2. Selling Price<br/>
              &nbsp;&nbsp;Selling Price is governed by NALCO Billet price on the date of material dispatch.<br/><br/>
              3. Supply Schedule<br/>
              &nbsp;&nbsp;Supply Schedule will be discussed and finalized after advance payment.<br/><br/>
              4. Advance Payment<br/>
              &nbsp;&nbsp;a. 100% advance for PI having value Rs. >0 ~ => 2,00,000<br/>
              &nbsp;&nbsp;b. 50% advance for PI having value Rs. >0 ~ =< 2,00,000<br/><br/>
              5. Transportation<br/>
              &nbsp;&nbsp;In customer scope, no claim or responsibility in any form related to transportation will be levied.
            </div>
          </div>
        </body>
      </html>
    `;

    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3] as [number, number, number, number],
      filename: `Glazia_Performa_Invoice_${(user.name || 'Customer').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: false
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait' as const,
        compress: true
      }
    };

    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf().set(opt).from(invoiceHTML).save();
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
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
            <h2 className="text-lg font-semibold text-gray-900">
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
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
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
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.category?.toLowerCase().includes("hardware") ? 'pcs' : 'per kg'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {
                            item.category?.toLowerCase().includes("hardware") ? (
                              `₹${(parseFloat(item.price) + getAdjustedItemPrice(item)).toFixed(2)}`
                            ) : (`₹${((nalcoPrice / 1000) + 75 + getAdjustedItemPrice(item)).toFixed(2)}`)
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
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
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
                            // Profiles: ((nalcoPrice/1000 + 75) + dynamic adjustment) × quantity × (length/1000) × kgm
                            const basePrice = (nalcoPrice / 1000) + 75;
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

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">₹{cart.total.toLocaleString()}</span>
              </div>

              {/* Shipping Info */}
              <div className={`text-sm p-3 rounded-lg ${
                shippingInfo.color === 'green' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`font-medium ${
                  shippingInfo.color === 'green' ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {shippingInfo.message}
                </p>

                {shippingInfo.nextTier && (
                  <p className="text-xs text-gray-600 mt-1">
                    Add ₹{(shippingInfo.nextTier.amount - cart.total).toLocaleString()} more to get ₹{shippingInfo.nextTier.discount.toLocaleString()} shipping discount
                  </p>
                )}
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

                {/* Performa Invoice Button */}
                <button
                  onClick={generatePerformaInvoice}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 mb-3"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isAuthenticated ? 'Generate Performa Invoice' : 'Login to Generate Invoice'}</span>
                </button>

                {isAuthenticated ? (
                  <button
                    onClick={handleQuickOrder}
                    className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 hover-primary-bg-dark"
                    style={{ backgroundColor: '#124657' }}
                  >
                    <span>Checkout</span>
                  </button>
                ) : (
                  <button
                    onClick={handleQuickOrder}
                    className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 hover-primary-bg-dark"
                    style={{ backgroundColor: '#124657' }}
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
    </>
  );
};

export default CartSidebar;
