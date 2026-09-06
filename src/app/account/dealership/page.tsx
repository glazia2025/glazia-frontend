'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, PackageCheck, Plus, Users } from 'lucide-react';
import Header from '@/components/Header';
import { API_BASE_URL } from '@/services/api';
import { getAuthToken } from '@/utils/authCookie';
import PartnerAgreement, { AgreementParty } from '@/components/PartnerAgreement/PartnerAgreement';
import StockManager from '@/components/dealership/StockManager';

type Fabricator = { _id: string; name: string; email: string; phoneNumber: string; city: string; state: string };
type DealerOrder = {
  _id: string; orderId: number; createdAt: string; totalAmount: number;
  user: { name: string; city: string; phoneNumber: string };
  products: Array<{ productId: string; description?: string; quantity: number }>;
  fulfillment: { status: string; notes?: string };
  orderChannel?: 'CUSTOMER' | 'DEALER_DIRECT_FULFILLMENT';
  inventoryDisposition?: string;
  deliveryAddress?: { name?: string; city?: string; address?: string; state?: string; pincode?: string };
};
type InventoryItem = { _id: string; productId: string; description: string; quantity: number; updatedAt: string };

const emptyForm = { name: '', email: '', gstNumber: '', pincode: '', city: '', state: '', address: '', phoneNumber: '', authorizedPerson: '', authorizedPersonDesignation: '' };

export default function DealershipPage() {
  const [activeMenu, setActiveMenu] = useState<'fabricators' | 'stock'>('fabricators');
  const [fabricators, setFabricators] = useState<Fabricator[]>([]);
  const [orders, setOrders] = useState<DealerOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [reviewAgreement, setReviewAgreement] = useState(false);
  const [fabricatorAgreement, setFabricatorAgreement] = useState<Blob | null>(null);
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
      setForm(emptyForm); setAgreed(false); setReviewAgreement(false); setFabricatorAgreement(null); setMessage('Fabricator registered and linked to this dealership.'); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Registration failed'); }
  };

  const fulfill = async (orderId: string, strategy: 'DEALER_STOCK' | 'GLAZIA_VIA_DEALER') => {
    try {
      setError(''); setMessage('');
      const data = await request(`/api/dealership/orders/${orderId}/fulfillment`, { method: 'PATCH', body: JSON.stringify({ strategy }) });
      setMessage(data.message); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update fulfillment'); }
  };

  return <><Header /><main className="min-h-screen bg-gray-50 py-8"><div className="mx-auto max-w-7xl px-4">
    <div className="mb-7 flex items-center justify-between gap-4"><div><h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900"><Building2 className="text-[#124657]" /> Manage Dealership</h1><p className="mt-2 text-gray-600">Manage your fabricator network and available inventory.</p></div><Link href="/account/dashboard" className="shrink-0 text-sm font-medium text-[#124657]">Back to dashboard</Link></div>
    {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}{message && <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}
    {loading ? <p className="text-gray-600">Loading dealership…</p> : <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-xl border border-gray-200 bg-white p-3 shadow-sm"><p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Manage dealership</p><nav className="space-y-1">
        <button onClick={() => setActiveMenu('fabricators')} className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${activeMenu === 'fabricators' ? 'bg-[#124657] text-white' : 'text-gray-700 hover:bg-gray-100'}`}><span className="flex items-center gap-3"><Users size={19}/> Fabricators</span><span className={`rounded-full px-2 py-0.5 text-xs ${activeMenu === 'fabricators' ? 'bg-white/20' : 'bg-gray-100'}`}>{fabricators.length}</span></button>
        <button onClick={() => setActiveMenu('stock')} className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${activeMenu === 'stock' ? 'bg-[#124657] text-white' : 'text-gray-700 hover:bg-gray-100'}`}><span className="flex items-center gap-3"><PackageCheck size={19}/> Stock</span><span className={`rounded-full px-2 py-0.5 text-xs ${activeMenu === 'stock' ? 'bg-white/20' : 'bg-gray-100'}`}>{inventory.length}</span></button>
      </nav></aside>
      <div className="min-w-0">
        {activeMenu === 'fabricators' && <div className="space-y-6"><div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <section className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-5 flex items-center gap-2 text-xl font-semibold"><Plus size={20}/> Register fabricator</h2><form onSubmit={register} className="space-y-3">{Object.entries(form).map(([key, value]) => <input key={key} required value={value} onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setReviewAgreement(false); setFabricatorAgreement(null); }} placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />)}{!reviewAgreement ? <button type="button" onClick={() => setReviewAgreement(true)} className="w-full rounded-lg border border-[#124657] px-4 py-2.5 font-medium text-[#124657]">Generate partner agreement</button> : <div className="rounded-lg bg-gray-50 p-3"><p className="text-sm font-medium">Dealership–Fabricator Partner Agreement</p><PartnerAgreement agreementType="DEALERSHIP_FABRICATOR" dealership={dealershipParty} userName={form.name} completeAddress={form.address} gstNumber={form.gstNumber} pincode={form.pincode} city={form.city} state={form.state} phoneNumber={form.phoneNumber} email={form.email} setBlob={setFabricatorAgreement}/></div>}<label className="flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />I confirm the Fabricator has reviewed and accepted the Dealership–Fabricator Partner Agreement.</label><button disabled={!agreed || !fabricatorAgreement} className="w-full rounded-lg bg-[#124657] px-4 py-2.5 font-medium text-white disabled:opacity-50">Register fabricator</button></form></section>
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-xl font-semibold">Registered fabricators</h2>{fabricators.length === 0 ? <p className="text-sm text-gray-500">No fabricators registered yet.</p> : <div className="divide-y">{fabricators.map(f => <div key={f._id} className="flex flex-col justify-between gap-1 py-4 sm:flex-row"><div><p className="font-medium">{f.name}</p><p className="text-sm text-gray-500">{f.email} · {f.phoneNumber}</p></div><span className="text-sm text-gray-500">{f.city}, {f.state}</span></div>)}</div>}</section>
        </div><section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="mb-4 text-xl font-semibold">Fabricator order fulfillment ({orders.length})</h2>{orders.length === 0 ? <p className="text-sm text-gray-500">No routed orders yet.</p> : <div className="space-y-4">{orders.map(order => <article key={order._id} className="rounded-lg border p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">Order #{order.orderId} · {order.orderChannel === 'DEALER_DIRECT_FULFILLMENT' ? order.deliveryAddress?.name : order.user.name}</p><p className="text-sm text-gray-500">{order.products.length} item(s) · ₹{order.totalAmount?.toLocaleString('en-IN')} · {order.deliveryAddress?.city || order.user.city}</p>{order.orderChannel === 'DEALER_DIRECT_FULFILLMENT' && <p className="mt-1 text-xs font-medium text-blue-700">Direct delivery to fabricator — excluded from dealership stock</p>}</div><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">{order.fulfillment?.status?.replaceAll('_', ' ')}</span></div>{order.fulfillment?.status === 'AWAITING_DEALER' && <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => fulfill(order._id, 'DEALER_STOCK')} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white">Dispatch from my stock</button><button onClick={() => fulfill(order._id, 'GLAZIA_VIA_DEALER')} className="rounded-lg bg-[#124657] px-3 py-2 text-sm font-medium text-white">Request from Glazia</button></div>}</article>)}</div>}</section></div>}
        {activeMenu === 'stock' && <StockManager inventory={inventory} onChanged={load}/>} 
      </div>
    </div>}
  </div></main></>;
}
