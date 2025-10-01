/**
 * QR Code Generator Utility
 * Generates QR codes for UPI payments
 */

export interface UPIPaymentData {
  pa: string; // Payee address (UPI ID)
  pn: string; // Payee name
  am: number; // Amount
  cu: string; // Currency
  tn: string; // Transaction note
}

/**
 * Generate UPI payment URL for QR code
 */
export const generateUPIPaymentURL = (data: UPIPaymentData): string => {
  const params = new URLSearchParams({
    pa: data.pa,
    pn: data.pn,
    am: data.am.toString(),
    cu: data.cu,
    tn: data.tn
  });

  return `upi://pay?${params.toString()}`;
};

/**
 * Generate QR code data URL using a simple QR code generation approach
 * In a production app, you'd use a proper QR code library like 'qrcode'
 */
export const generateQRCodeDataURL = (text: string, size: number = 200): string => {
  // For now, we'll return a placeholder SVG QR code
  // In production, use a library like 'qrcode' to generate actual QR codes
  
  const svgQR = `
    <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      
      <!-- Corner squares -->
      <rect x="10" y="10" width="60" height="60" fill="black"/>
      <rect x="20" y="20" width="40" height="40" fill="white"/>
      <rect x="30" y="30" width="20" height="20" fill="black"/>
      
      <rect x="130" y="10" width="60" height="60" fill="black"/>
      <rect x="140" y="20" width="40" height="40" fill="white"/>
      <rect x="150" y="30" width="20" height="20" fill="black"/>
      
      <rect x="10" y="130" width="60" height="60" fill="black"/>
      <rect x="20" y="140" width="40" height="40" fill="white"/>
      <rect x="30" y="150" width="20" height="20" fill="black"/>
      
      <!-- Data pattern (simplified) -->
      <rect x="90" y="10" width="10" height="10" fill="black"/>
      <rect x="110" y="10" width="10" height="10" fill="black"/>
      <rect x="90" y="30" width="10" height="10" fill="black"/>
      <rect x="110" y="30" width="10" height="10" fill="black"/>
      <rect x="90" y="50" width="10" height="10" fill="black"/>
      <rect x="110" y="50" width="10" height="10" fill="black"/>
      
      <rect x="10" y="90" width="10" height="10" fill="black"/>
      <rect x="30" y="90" width="10" height="10" fill="black"/>
      <rect x="50" y="90" width="10" height="10" fill="black"/>
      <rect x="70" y="90" width="10" height="10" fill="black"/>
      <rect x="90" y="90" width="10" height="10" fill="black"/>
      <rect x="110" y="90" width="10" height="10" fill="black"/>
      <rect x="130" y="90" width="10" height="10" fill="black"/>
      <rect x="150" y="90" width="10" height="10" fill="black"/>
      <rect x="170" y="90" width="10" height="10" fill="black"/>
      
      <rect x="90" y="110" width="10" height="10" fill="black"/>
      <rect x="110" y="110" width="10" height="10" fill="black"/>
      <rect x="130" y="110" width="10" height="10" fill="black"/>
      <rect x="150" y="110" width="10" height="10" fill="black"/>
      <rect x="170" y="110" width="10" height="10" fill="black"/>
      
      <rect x="90" y="130" width="10" height="10" fill="black"/>
      <rect x="110" y="130" width="10" height="10" fill="black"/>
      <rect x="130" y="130" width="10" height="10" fill="black"/>
      <rect x="150" y="130" width="10" height="10" fill="black"/>
      <rect x="170" y="130" width="10" height="10" fill="black"/>
      
      <rect x="90" y="150" width="10" height="10" fill="black"/>
      <rect x="110" y="150" width="10" height="10" fill="black"/>
      <rect x="130" y="150" width="10" height="10" fill="black"/>
      <rect x="150" y="150" width="10" height="10" fill="black"/>
      <rect x="170" y="150" width="10" height="10" fill="black"/>
      
      <rect x="90" y="170" width="10" height="10" fill="black"/>
      <rect x="110" y="170" width="10" height="10" fill="black"/>
      <rect x="130" y="170" width="10" height="10" fill="black"/>
      <rect x="150" y="170" width="10" height="10" fill="black"/>
      <rect x="170" y="170" width="10" height="10" fill="black"/>
      
      <!-- Additional pattern elements -->
      <rect x="70" y="110" width="10" height="10" fill="black"/>
      <rect x="70" y="130" width="10" height="10" fill="black"/>
      <rect x="70" y="150" width="10" height="10" fill="black"/>
      <rect x="70" y="170" width="10" height="10" fill="black"/>
      
      <!-- Text overlay for amount -->
      <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="8" fill="black">₹${text.includes('am=') ? text.split('am=')[1].split('&')[0] : '0'}</text>
    </svg>
  `;

  // Convert SVG to data URL
  const encodedSvg = encodeURIComponent(svgQR);
  return `data:image/svg+xml,${encodedSvg}`;
};

/**
 * Generate payment QR code for Glazia
 */
export const generateGlaziaPaymentQR = (amount: number, orderId?: string): string => {
  const upiData: UPIPaymentData = {
    pa: 'glazia@paytm', // Glazia's UPI ID
    pn: 'Glazia',
    am: amount,
    cu: 'INR',
    tn: orderId ? `Order ${orderId}` : 'Order Payment'
  };

  const upiURL = generateUPIPaymentURL(upiData);
  return generateQRCodeDataURL(upiURL);
};

/**
 * Validate UPI ID format
 */
export const isValidUPIID = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiRegex.test(upiId);
};

/**
 * Format amount for display
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};
