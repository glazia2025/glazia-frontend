"use client";
import { useState } from 'react';
import { useCartState } from '@/contexts/AppContext';
import LegacyOrderPlacement from './LegacyOrderPlacement';
import { PaysharpCheckout } from './PaysharpCheckout';
interface OrderPlacementItem { id: string; name: string; quantity: number; price: number }
interface Props { onOrderSuccess: () => void; onCancel: () => void; items?: OrderPlacementItem[]; totalAmountOverride?: number; sourceOrderId?: string }
export default function OrderPlacement({ onOrderSuccess, onCancel, items, totalAmountOverride, sourceOrderId }: Props) {
  const { cart, clearCart } = useCartState();
  const [checkout] = useState(() => sourceOrderId ? { sourceOrderId } : { products: (items ?? cart.items).map(item => ({ productId: String(item.id), quantity: item.quantity })) });
  return <PaysharpCheckout checkout={checkout}
    renderLegacy={(paymentQuote, checkoutKey, onDone, onResumePaysharp) => <LegacyOrderPlacement
      items={items} totalAmountOverride={totalAmountOverride} sourceOrderId={sourceOrderId}
      paymentQuote={paymentQuote} checkoutKey={checkoutKey} onResumePaysharp={onResumePaysharp}
      onCancel={onCancel} onOrderSuccess={onDone} />}
 onCancel={onCancel} onDone={() => { if (!items) clearCart(); onOrderSuccess(); }} />;
}
