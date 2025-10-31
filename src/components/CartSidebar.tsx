'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, ShoppingBag, Trash2, Zap, LogIn, FileText } from 'lucide-react';
import { useCartState, useAuth } from '@/contexts/AppContext';
import OrderPlacement from './OrderPlacement';
import ImageModal from '@/components/ImageModal';

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
  const router = useRouter();
  const [showOrderPlacement, setShowOrderPlacement] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
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
    } else if (orderValue >= 250000) {
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
      setShowLoginPrompt(true);
      return;
    }

    // Prepare cart items for invoice
    const selectedProducts = cart.items.map((item, index) => {
      const adjustedRate = getAdjustedItemPrice(item);
      let finalAmount;

      if (item.category?.toLowerCase().includes('hardware')) {
        // Hardware: adjusted rate × quantity
        finalAmount = item.quantity * adjustedRate;
      } else {
        // Profiles: use the same calculation as cart total
        const basePrice = (nalcoPrice / 1000) + 75;
        const dynamicAdjustment = adjustedRate - parseFloat(item.price);
        const adjustedPrice = basePrice + dynamicAdjustment;
        finalAmount = adjustedPrice * item.quantity * (parseFloat(item.length) / 1000) * item.kgm;
      }

      return {
        description: item.name,
        option: item.category || '',
        powderCoating: {},
        sapCode: item.id || `SAP${String(index + 1).padStart(3, '0')}`,
        quantity: item.quantity,
        rate: adjustedRate,
        per: 'Piece',
        amount: finalAmount
      };
    });

    const subtotal = selectedProducts.reduce((sum, item) => sum + item.amount, 0);
    const gst = subtotal * 0.18;
    const net = subtotal + gst;

    let totalQuantity = 0;
    selectedProducts.forEach((p) => {
      totalQuantity += parseInt(String(p.quantity), 10);
    });

    const rows = selectedProducts.map((p, i) => `
    <tr>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; vertical-align: top;">${i + 1}</td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; word-wrap: break-word; overflow-wrap: break-word; max-width: 120px; vertical-align: top; line-height: 1.2;">
        ${p.description}
      </td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; word-wrap: break-word; overflow-wrap: break-word; max-width: 80px; vertical-align: top; line-height: 1.2;">
        ${p.option ? `(${p.option})` : ""}
        ${p.powderCoating && Object.keys(p.powderCoating).length ? ` - ${JSON.stringify(p.powderCoating)}` : ""}
      </td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; vertical-align: top;">${p.sapCode}</td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; vertical-align: top;">${p.quantity}</td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: right; vertical-align: top;">${Number(p.rate).toFixed(2)}</td>
      <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; vertical-align: top;">${p.per || "Piece"}</td>
      <td style="border-bottom: 1px solid #000; padding: 4px; text-align: right; vertical-align: top;">${Number(p.amount).toFixed(2)}</td>
    </tr>
  `).join("");

    const invoiceHTML = `
      <div style="margin: 0; padding: 10px; font-family: Arial, sans-serif; border: 1px solid #000; max-width: 100%; box-sizing: border-box;">
        <div style="text-align: center; border-bottom: 1px solid #000; font-size: 16px; padding: 8px; font-weight: bold;">
          Glazia Windoors Pvt Ltd.
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; font-size: 10px; padding: 6px; line-height: 1.2;">
          <div style="flex: 1; margin-right: 10px;">Khevat/ Khata No. 361, Rect. No. 21 4/70-18 Kherki Dhaula Village Road, Gurgaon, Harana, 122001</div>
          <div style="flex-shrink: 0; text-align: right;">Phone: 9958053708<br/>Email: sales@glazia.com</div>
        </div>

        <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; font-size: 10px; line-height: 1.3; border-collapse: collapse;">
          <div style="border-right: 1px solid #000; font-weight: bold; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">Consignee (Ship To)</div>
          <div style="border-right: 1px solid #000; font-weight: bold; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">Invoice No.</div>
          <div style="padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">Date</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">${user.name || 'N/A'}</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">GW/25/26/PI/0023</div>
          <div style="padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">${new Date().toLocaleDateString()}</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;">${user.completeAddress || 'N/A'}</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">Delivery Note No.</div>
          <div style="padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">Delivery Note Date</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">${user.city || 'N/A'}, ${user.state || 'N/A'}-${user.pincode || 'N/A'}</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">................................</div>
          <div style="padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">................................</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">${user.gstNumber || 'N/A'}</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">Reference No. : 0023</div>
          <div style="padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">Mode of Payment</div>
          <div style="border-right: 1px solid #000; font-weight: bold; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">Buyer (Bill To)</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">................................</div>
          <div style="padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">................................</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">${user.name || 'N/A'}</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">Dispatch Mode</div>
          <div style="padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">Destination</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word; max-width: 0;">${user.completeAddress || 'N/A'}</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">By Road</div>
          <div style="padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">${user.city || 'N/A'}, ${user.state || 'N/A'}</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word; overflow-wrap: break-word;">${user.city || 'N/A'}, ${user.state || 'N/A'}-${user.pincode || 'N/A'}</div>
          <div style="border-right: 1px solid #000; padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">................................</div>
          <div style="padding: 4px; border-bottom: 1px solid #000; word-wrap: break-word;">................................</div>
        </div>
        <div style="width: 100%; height: 8px; border-bottom: 1px solid #000;"></div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
          <colgroup>
            <col style="width: 8%;">
            <col style="width: 25%;">
            <col style="width: 15%;">
            <col style="width: 12%;">
            <col style="width: 8%;">
            <col style="width: 12%;">
            <col style="width: 8%;">
            <col style="width: 12%;">
          </colgroup>
          <thead>
            <tr>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">S.No</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">Description</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">Series</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">SAP Code</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">Qty</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">Rate</th>
              <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">Per</th>
              <th style="border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-bottom: 1px solid #000; padding: 4px; height: 20px;"></td>
            </tr>
            <tr>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px; text-align: center; font-weight: bold;">Total</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px; text-align: center; font-weight: bold;">${totalQuantity}</td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; height: 20px;"> </td>
              <td style="border-bottom: 1px solid #000; padding: 4px; height: 20px; text-align: right; font-weight: bold;">${subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
          <tr>
            <td colspan="7" style="width: 87.5%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">
              SGST@9%
            </td>
            <td style="width: 12.5%; border-bottom: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">
              ${(gst / 2).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td colspan="7" style="width: 87.5%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">
              CGST@9%
            </td>
            <td style="width: 12.5%; border-bottom: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">
              ${(gst / 2).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td colspan="7" style="width: 87.5%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f0f0f0;">
              Total
            </td>
            <td style="width: 12.5%; border-bottom: 1px solid #000; padding: 4px; text-align: right; font-weight: bold; background-color: #f0f0f0;">
              ${net.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td colspan="7" style="width: 87.5%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">
              Rounded Off
            </td>
            <td style="width: 12.5%; border-bottom: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">
              ${Math.round(net)}
            </td>
          </tr>
        </table>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
          <tr>
            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; width: 30%;">
              Amount Chargeable in Words
            </td>
            <td style="border-bottom: 1px solid #000; padding: 4px; word-wrap: break-word; overflow-wrap: break-word; width: 70%;">
              ${numberToWordsIndian(Math.round(net))}
            </td>
          </tr>
          <tr>
            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-weight: bold;">
              Bank Detail:
            </td>
            <td style="border-bottom: 1px solid #000; padding: 4px; font-weight: bold;">
              Company Detail:
            </td>
          </tr>
          <tr>
            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; line-height: 1.3;">
              Bank Name: HDFC Bank
            </td>
            <td style="border-bottom: 1px solid #000; padding: 4px; line-height: 1.3;">
              Glazia Windoors Pvt. Ltd.
            </td>
          </tr>
          <tr>
            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; line-height: 1.3;">
              A/c No: 50200084871361
            </td>
            <td style="border-bottom: 1px solid #000; padding: 4px; line-height: 1.3; word-wrap: break-word;">
              Kherki Dhaula Village Road, Gurgaon, Harana, 122001
            </td>
          </tr>
          <tr>
            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; line-height: 1.3;">
              RTGS/NEFT/IFSC Code: HDFC0004809
            </td>
            <td style="border-bottom: 1px solid #000; padding: 4px; line-height: 1.3;">
              06AAKCG7530J1ZE
            </td>
          </tr>
        </table>
        <div style="text-align: center; border-bottom: 1px solid #000; font-size: 14px; padding: 6px; font-weight: bold;">
          Terms & Conditions
        </div>
        <div style="border-bottom: 1px solid #000; font-size: 9px; padding: 4px; line-height: 1.4;">
          <div style="margin-bottom: 2px;"><strong>1. PI Validity Period</strong></div>
          <div style="margin-left: 12px;">
            <div>a. 15 days from date of issuance irrespective of selling price</div>
            <div>b. PI shall be treated as null & void in all respect in absence of advance payment as per PI terms</div>
          </div>
        </div>
        <div style="border-bottom: 1px solid #000; font-size: 9px; padding: 4px; line-height: 1.4;">
          <strong>2. Selling Price:</strong> Selling Price is governed by NALCO Billet price on the date of material dispatch.
        </div>
        <div style="border-bottom: 1px solid #000; font-size: 9px; padding: 4px; line-height: 1.4;">
          <strong>3. Supply Schedule:</strong> Supply schedule will be discussed & finalized after advance payment.
        </div>
        <div style="border-bottom: 1px solid #000; font-size: 9px; padding: 4px; line-height: 1.4;">
          <div style="margin-bottom: 2px;"><strong>4. Advance Payment:</strong> Advance payment will be governed as per below schedule</div>
          <div style="margin-left: 12px;">
            <div>a. 100% advance for PI having value Rs. >0 ~ => 2,00,000</div>
            <div>b. 50% advance for PI having value Rs. >0 ~ =< 2,00,000</div>
          </div>
        </div>
        <div style="border-bottom: 1px solid #000; font-size: 9px; padding: 4px; line-height: 1.4;">
          <strong>5. Transportation:</strong> In customer scope, No claim or responsibility in any form related to transportation will be levied.
        </div>
      </div>
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
      closeCart();
      router.push('/auth/login');
      return;
    }
    setShowOrderPlacement(true);
  };


  const handleLoginRedirect = () => {
    closeCart();
    router.push('/auth/login');
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
                      <p className="text-xs text-gray-500">{item.brand}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{getAdjustedItemPrice(item).toFixed(2)}
                          {getAdjustedItemPrice(item) !== parseFloat(item.price) && (
                            <span className="text-xs text-gray-500 line-through ml-1">₹{item.price}</span>
                          )}
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
                            const adjustedPrice = getAdjustedItemPrice(item);
                            return (adjustedPrice * item.quantity).toLocaleString();
                          } else {
                            // Profiles: ((nalcoPrice/1000 + 75) + dynamic adjustment) × quantity × (length/1000) × kgm
                            const basePrice = (nalcoPrice / 1000) + 75;
                            const dynamicAdjustment = getAdjustedItemPrice(item) - parseFloat(item.price);
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

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <>
          {/* Modal Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[10002]" onClick={() => setShowLoginPrompt(false)} />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <div
                  className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
                  style={{ backgroundColor: '#E6F0FF' }}
                >
                  <LogIn className="h-6 w-6" style={{ color: '#124657' }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Please login to your account to continue with checkout and place your order.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleLoginRedirect}
                    className="flex-1 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 hover-primary-bg-dark"
                    style={{ backgroundColor: '#124657' }}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Placement Modal */}
      {showOrderPlacement && (
        <>
          {/* Modal Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[10002]" onClick={handleOrderCancel} />

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
