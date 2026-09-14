'use client';

import { FormEvent,Fragment, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ClipboardList, PackageCheck, Plus,Search,Users, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';
import { API_BASE_URL } from '@/services/api';
import { getAuthToken } from '@/utils/authCookie';
import PartnerAgreement, { AgreementParty } from '@/components/PartnerAgreement/PartnerAgreement';
import StockManager from '@/components/dealership/StockManager';
import DynamicPricingManager from '@/components/dealership/DynamicPricingManager';

type Fabricator = { _id: string; name: string; email: string; phoneNumber: string; city: string; state: string };
type DealerOrder = {
  _id: string; orderId: number; createdAt: string; totalAmount: number; deliveryType?: string; isComplete?: boolean;
  user: { name: string; city: string; phoneNumber: string };
  products: Array<{ productId: string; description?: string; quantity: number;amount:number }>;
  payments: Array<{
    isApproved?: boolean;
    proofAdded?: boolean;
    dueDate?: string;
  }>;
  fulfillment: { status: string; notes?: string };
  orderChannel?: 'CUSTOMER' | 'DEALER_DIRECT_FULFILLMENT';
  inventoryDisposition?: string;
  deliveryAddress?: { name?: string; city?: string; address?: string; state?: string; pincode?: string };
};
type InventoryItem = { _id: string; productId: string; description: string; quantity: number; updatedAt: string };

const emptyForm = { name: '', email: '', gstNumber: '', pincode: '', city: '', state: '', address: '', phoneNumber: '', authorizedPerson: '', authorizedPersonDesignation: '' };

export default function DealershipPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<'fabricators' | 'stock' | 'orders'| 'pricing'>('fabricators');
  const [fabricators, setFabricators] = useState<Fabricator[]>([]);
  const [orders, setOrders] = useState<DealerOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'ongoing' | 'completed'>('ongoing');
  const [orderSearchInput, setOrderSearchInput] = useState('');
const [orderSearch, setOrderSearch] = useState('');
  const [reviewAgreement, setReviewAgreement] = useState(false);
  const [fabricatorAgreement, setFabricatorAgreement] = useState<Blob | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [dealershipParty] = useState<AgreementParty>(() => {
    if (typeof window === 'undefined') return { name: '', address: '', gstNumber: '', pincode: '', city: '', state: '', phoneNumber: '', email: '' };
    const user = JSON.parse(localStorage.getItem('glazia-user') || '{}');
    return { name: user.name || '', address: user.completeAddress || '', gstNumber: user.gstNumber || '', pincode: user.pincode || '', city: user.city || '', state: user.state || '', phoneNumber: user.phone || '', email: user.email || '' };
  });
  const [form, setForm] = useState(emptyForm);
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DealerOrder | null>(null);

  const request = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: { ...(!isFormData ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(
        `Dealership API returned ${response.status} from ${API_BASE_URL}. ` +
        'Check that backend-main is running and NEXT_PUBLIC_MAIN_API_BASE_URL points to it.'
      );
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
    return data;
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [fabricatorData, orderData, inventoryData] = await Promise.all([request('/api/dealership/fabricators'), request('/api/dealership/orders'), request('/api/dealership/inventory')]);
      setFabricators(fabricatorData.fabricators);
      setOrders(orderData.orders);
      setInventory(inventoryData.inventory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dealership');
    } finally { setLoading(false); }
  }, [request]);

  useEffect(() => { load(); }, [load]);

  const register = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    if (!fabricatorAgreement) { setError('Generate and review the Dealership–Fabricator agreement first.'); return; }
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append('partnerAgreementAccepted', String(agreed));
      body.append('paPdf', new File([fabricatorAgreement], 'dealership-fabricator-agreement.pdf', { type: 'application/pdf' }));
      await request('/api/dealership/fabricators', { method: 'POST', body });
      setForm(emptyForm); setAgreed(false); setReviewAgreement(false); setFabricatorAgreement(null);setShowRegisterModal(false); setMessage('Fabricator registered and linked to this dealership.'); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Registration failed'); }
  };

  const checkOrderFirstApprovalPending = (order: DealerOrder) => {
  return (
    order &&
    order.payments &&
    order.payments.length === 1 &&
    !order.payments[0].isApproved
  );
};

const checkOrderLatestPaymentPending = (order: DealerOrder) => {
  return (
    order &&
    order.payments &&
    order.payments.length > 0 &&
    !order.payments[order.payments.length - 1].isApproved
  );
};

const checkOrderSecondPaymentPending = (order: DealerOrder) => {
   const dueDate = order.payments?.[1]?.dueDate;
  return (
    order &&
    order.payments &&
    order.payments.length === 2 &&
    !order.payments[1].proofAdded &&
     dueDate &&
    new Date(dueDate).getTime() > new Date().getTime()
  );
};

const checkOrderSecondPaymentOverdue = (order: DealerOrder) => {
   const dueDate = order.payments?.[1]?.dueDate;
  return (
    order &&
    order.payments &&
    order.payments.length === 2 &&
    !order.payments[1].proofAdded &&
     dueDate &&
    new Date(dueDate).getTime() <= new Date().getTime()
  );
};

const checkOrderSecondApprovalPending = (order: DealerOrder) => {
  return (
    order &&
    order.payments &&
    order.payments.length === 2 &&
    order.payments[1].proofAdded &&
    !order.payments[1].isApproved
  );
};

const checkOrderDispatchPending = (order: DealerOrder) => {
  return (
    order &&
    order.payments &&
    order.payments.length === 2 &&
    order.payments[1].proofAdded &&
    order.payments[1].isApproved &&
    !order.isComplete
  );
};

const getOrderStatus = (order: DealerOrder) => {
  if (checkOrderFirstApprovalPending(order)) {
    return 'first_approval_pending';
  }

  if (checkOrderSecondPaymentPending(order)) {
    return 'second_payment_pending';
  }

  if (checkOrderSecondPaymentOverdue(order)) {
    return 'second_payment_overdue';
  }

  if (checkOrderSecondApprovalPending(order)) {
    return 'second_approval_pending';
  }

  if (checkOrderDispatchPending(order)) {
    return 'dispatch_pending';
  }

  return 'completed';
};
const getOrderStatusLabel = (order: DealerOrder) => {
  const status = getOrderStatus(order);

  const labels: Record<string, string> = {
    first_approval_pending: 'Proof Submitted',
    second_payment_pending: 'Final Payment Pending',
    second_payment_overdue: 'Final Payment Overdue',
    second_approval_pending: 'Final Approval Pending',
    dispatch_pending: 'Waiting for Dispatch',
    completed: 'Completed',
  };

  return labels[status] || '-';
};



  const fulfill = async (orderId: string, strategy: 'DEALER_STOCK' | 'GLAZIA_VIA_DEALER') => {
    try {
      setError(''); setMessage('');
      const data = await request(`/api/dealership/orders/${orderId}/fulfillment`, { method: 'PATCH', body: JSON.stringify({ strategy }) });
      setMessage(data.message); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update fulfillment'); }
  };
  const filteredOrders = orders.filter((order) => {
  let matchesFilter = true;

  if (orderFilter === 'completed') {
  matchesFilter = getOrderStatus(order) === 'completed';
} else if (orderFilter === 'ongoing') {
  matchesFilter = getOrderStatus(order) !== 'completed';
}

  const search = orderSearchInput.trim().toLowerCase();

  const matchesSearch =
    !search ||
    String(order.orderId).toLowerCase().includes(search) ||
    order.user?.name?.toLowerCase().includes(search);

  return matchesFilter && matchesSearch;
});

  return <><Header /><main className="min-h-screen bg-gray-50 py-8"><div className="mx-auto max-w-7xl px-4">
    <div className="mb-7 flex items-center justify-between gap-4"><div><h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900"><Building2 className="text-[#124657]" /> Manage Dealership</h1><p className="mt-2 text-gray-600">Manage your fabricator network and available inventory.</p></div><Link href="/account/dashboard" className="shrink-0 text-sm font-medium text-[#EE1C25]">Back to dashboard</Link></div>
    {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}{message && <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}
    {loading ? (
  <div className="flex min-h-[300px] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#EE1C25]" />
      <p className="text-sm font-medium text-gray-600">
        Loading dealership...
      </p>
    </div>
  </div>
) : (
  <div className="space-y-6"> 
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
  <nav className="flex flex-wrap gap-2">
    <button
      onClick={() => setActiveMenu('fabricators')}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
        activeMenu === 'fabricators'
          ? 'bg-[#EE1C25] text-white'
          : 'text-gray-700 hover:bg-[#EE1C25] hover:text-white'
      }`}
    >
      <Users size={19} />
      <span>Fabricators</span>

      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          activeMenu === 'fabricators'
            ? 'bg-white/20  text-white'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {fabricators.length}
      </span>
    </button>

    <button
      onClick={() => setActiveMenu('stock')}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
        activeMenu === 'stock'
          ? 'bg-[#EE1C25] text-white'
          : 'text-gray-700 hover:bg-[#EE1C25] hover:text-white'
      }`}
    >
      <PackageCheck size={19} />
      <span>Stock</span>

      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          activeMenu === 'stock'
            ? 'bg-white/20 text-white'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {inventory.length}
      </span>
    </button>

    <button
      onClick={() => setActiveMenu('orders')}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
        activeMenu === 'orders'
          ? 'bg-[#EE1C25] text-white'
          : 'text-gray-700 hover:bg-[#EE1C25] hover:text-white'
      }`}
    >
      <ClipboardList size={19} />
      <span>Orders</span>

      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          activeMenu === 'orders'
            ? 'bg-white/20 text-white'
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        {orders.length}
      </span>
    </button>

  </nav>
</div>


      <div className="min-w-0">
         {activeMenu === 'orders' && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
<div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-5">

  <div className="flex flex-1 items-center gap-2">
    <div className="relative w-full max-w-sm">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={orderSearchInput}
        onChange={(e) =>{setOrderSearchInput(e.target.value); setOrderSearch(e.target.value);}}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setOrderSearch(orderSearchInput);
          }
        }}
        placeholder="Search by Order ID or User Name"
        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#0F172A]"
      />
    </div>

    <button
      type="button"
      onClick={() => setOrderSearch(orderSearchInput)}
      className="flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
    >
      <Search size={16} />
      Search
    </button>
  </div>

 
  <div className="flex shrink-0 gap-1 rounded-lg bg-gray-100 p-1">

    <button
      type="button"
      onClick={() => setOrderFilter('all')}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        orderFilter === 'all'
          ? 'bg-[#0F172A] text-white shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      All Orders
    </button>
    <button
      type="button"
      onClick={() => setOrderFilter('ongoing')}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        orderFilter === 'ongoing'
          ? 'bg-[#0F172A] text-white shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      Ongoing
    </button>
    <button
      type="button"
      onClick={() => setOrderFilter('completed')}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        orderFilter === 'completed'
          ? 'bg-[#0F172A] text-white shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      Completed
    </button>

  </div>
</div>
    <div className="border-b border-gray-200 px-6 py-5">
      <h2 className="text-xl font-semibold text-gray-900">
        Fabricator Order Fulfillment ({filteredOrders.length})
      </h2>
    </div>

          {filteredOrders.length === 0 ? (
            <p className="text-sm text-gray-500">
              No routed orders yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
  <table className="w-full min-w-[1000px] text-left">
    
    <thead>
      <tr className="border-b border-gray-200 bg-gray-50">
        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
          Order ID
        </th>

        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
          User Name
        </th>

        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
          Items
        </th>

        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
          Delivery Type
        </th>

        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
          Status
        </th>

        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
          Order Date
        </th>

        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
          Order Amount
        </th>

        <th className="px-4 py-4 text-sm font-semibold text-gray-700">
          Actions
        </th>
      </tr>
    </thead>

    <tbody>
      {filteredOrders.map((order) => (
        <Fragment key={order._id}>

          <tr className="border-b border-gray-100 hover:bg-gray-50">

            <td className="px-4 py-4 text-sm font-medium text-gray-700">
              #{order.orderId}
            </td>
            <td className="px-4 py-4 text-sm text-gray-700">
              {order.orderChannel === 'DEALER_DIRECT_FULFILLMENT'
                ? order.deliveryAddress?.name || '-'
                : order.user?.name || '-'}
            </td>
<td className="px-4 py-4 text-sm text-gray-700">
  {order.products?.length ? (
    <div>
      <div className="font-medium text-gray-800">
        {order.products[0].description || order.products[0].productId}
      </div>

      {order.products.length > 1 && (
        <button
          type="button"
          onClick={() => setSelectedOrder(order)}
          className="mt-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          +{order.products.length - 1} more items
        </button>
      )}
    </div>
  ) : (
    '-'
  )}
</td>

            <td className="px-4 py-4 text-sm text-gray-700">
              {order.deliveryType === 'SELF'
                ? 'Self Pickup'
                : order.deliveryType || '-'}
            </td>
            <td className="px-4 py-4">
             <span
  className={`rounded-full px-3 py-1 text-xs font-medium ${
    getOrderStatus(order) === 'first_approval_pending'
      ? 'bg-yellow-500 text-white'
      : getOrderStatus(order) === 'second_payment_pending'
      ? 'bg-green-600 text-white'
      : getOrderStatus(order) === 'second_payment_overdue'
      ? 'bg-yellow-500 text-white'
      : getOrderStatus(order) === 'second_approval_pending'
      ? 'bg-yellow-500 text-white'
      : getOrderStatus(order) === 'dispatch_pending'
      ? 'bg-green-600 text-white'
      : getOrderStatus(order) === 'completed'
      ? 'bg-blue-600 text-white'
      : 'bg-gray-200 text-gray-700'
  }`}
>
  {getOrderStatusLabel(order)}
</span>
            </td>
            <td className="px-4 py-4 text-sm text-gray-700">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-'}
            </td>
            <td className="px-4 py-4 text-sm font-medium text-gray-800">
              ₹{order.totalAmount?.toLocaleString('en-IN') || '0'}
            </td>
            <td className="px-4 py-4">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() =>
    router.push(`/account/dealership/orders/${order.orderId}`)
  }
                  className="rounded-lg bg-[#EE1C25] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  VIEW
                </button>
              </div>
            </td>

          </tr>
          {order.orderChannel === 'DEALER_DIRECT_FULFILLMENT' && (
            <tr className="border-b border-gray-100">
              <td
                colSpan={8}
                className="px-4 py-2 text-xs font-medium text-blue-700"
              >
                Direct delivery to fabricator — excluded from dealership stock
              </td>
            </tr>
          )}

        </Fragment>
      ))}
    </tbody>

  </table>
</div>
          )}
        </section>
      )}
        {activeMenu === 'fabricators' && <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

  <div className="mb-4 flex items-center justify-between gap-4">
    <h2 className="text-xl font-semibold">
      Registered fabricators
    </h2>

    <button
      type="button"
      onClick={() => setShowRegisterModal(true)}
      className="flex items-center gap-2 rounded-lg bg-[#EE1C25] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
    >
      <Plus size={18} />
      Register fabricator
    </button>
  </div>

  {fabricators.length === 0 ? (
    <p className="text-sm text-gray-500">
      No fabricators registered yet.
    </p>
  ) : (
    <div className="divide-y">
      {fabricators.map(f => (
        <div
          key={f._id}
          className="flex flex-col justify-between gap-1 py-4 sm:flex-row"
        >
          <div>
            <p className="font-medium">{f.name}</p>
            <p className="text-sm text-gray-500">
              {f.email} · {f.phoneNumber}
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {f.city}, {f.state}
          </span>
        </div>
      ))}
    </div>
  )}

</section>
        </div>
        }
        {showRegisterModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pt-28">
    <div className=" w-full max-w-xl max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Plus size={20} />
          Register fabricator
        </h2>

        <button
          type="button"
          onClick={() => setShowRegisterModal(false)}
          className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100"
        >
          ×
        </button>
      </div>

      <form onSubmit={register} className="space-y-3">

        {Object.entries(form).map(([key, value]) => (
          <input
            key={key}
            required
            value={value}
            onChange={(e) => {
              setForm({ ...form, [key]: e.target.value });
              setReviewAgreement(false);
              setFabricatorAgreement(null);
            }}
            placeholder={key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, c => c.toUpperCase())}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        ))}

        {!reviewAgreement ? (
          <button
            type="button"
            onClick={() => setReviewAgreement(true)}
            className="w-full rounded-lg border border-[#124657] px-4 py-2.5 font-medium text-[#124657]"
          >
            Generate partner agreement
          </button>
        ) : (
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium">
              Dealership–Fabricator Partner Agreement
            </p>

            <PartnerAgreement
              agreementType="DEALERSHIP_FABRICATOR"
              dealership={dealershipParty}
              userName={form.name}
              completeAddress={form.address}
              gstNumber={form.gstNumber}
              pincode={form.pincode}
              city={form.city}
              state={form.state}
              phoneNumber={form.phoneNumber}
              email={form.email}
              setBlob={setFabricatorAgreement}
            />
          </div>
        )}

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />

          I confirm the Fabricator has reviewed and accepted the
          Dealership–Fabricator Partner Agreement.
        </label>

        <button
          type="submit"
          disabled={!agreed || !fabricatorAgreement}
          className="w-full rounded-lg bg-[#EE1C25] px-4 py-2.5 font-medium text-white disabled:opacity-50"
        >
          Register fabricator
        </button>

      </form>
    </div>
  </div>
)}
        {activeMenu === 'stock' && <StockManager inventory={inventory} onChanged={load}/>} 
        {activeMenu === 'pricing' && <DynamicPricingManager fabricators={fabricators} request={request} onMessage={setMessage} onError={setError}/>}
      </div>
    </div>)}
  </div>
{selectedOrder && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    onClick={() => setSelectedOrder(null)}
  >
    <div
      className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Order Items ({selectedOrder.products?.length || 0})
        </h3>

        <button
          type="button"
          onClick={() => setSelectedOrder(null)}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
        <div className="space-y-3">
          {selectedOrder.products?.map((product, index) => (
            <div
              key={`${product.productId}-${index}`}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                {index + 1}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {product.description || product.productId}
                </p>

              <p className="mt-1 text-xs text-gray-500">
  ₹{Number(product.amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}
  
  </main></>;
}
