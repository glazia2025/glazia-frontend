'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, Search, SlidersHorizontal, UserRound } from 'lucide-react';

type Fabricator = { _id: string; name: string; email: string; phoneNumber: string; city: string; state: string };
type Pricing = { hardware: Record<string, number>; profiles: Record<string, number> };
type Request = (path: string, options?: RequestInit) => Promise<any>;

const emptyPricing: Pricing = { hardware: {}, profiles: {} };

export default function DynamicPricingManager({ fabricators, request, onMessage, onError }: {
  fabricators: Fabricator[];
  request: Request;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [selectedId, setSelectedId] = useState('');
  const [pricing, setPricing] = useState<Pricing>(emptyPricing);
  const [search, setSearch] = useState('');
  const [rateSearch, setRateSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredFabricators = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? fabricators.filter((item) => `${item.name} ${item.email} ${item.phoneNumber}`.toLowerCase().includes(query)) : fabricators;
  }, [fabricators, search]);
  const selected = fabricators.find((item) => item._id === selectedId);

  useEffect(() => {
    if (selectedId || !fabricators.length) return;
    setSelectedId(fabricators[0]._id);
  }, [fabricators, selectedId]);

  useEffect(() => {
    if (!selectedId) { setPricing(emptyPricing); return; }
    let active = true;
    setLoading(true);
    onError('');
    request(`/api/dealership/fabricators/${selectedId}/dynamic-pricing`)
      .then((data) => { if (active) setPricing(data.dynamicPricing || emptyPricing); })
      .catch((error) => { if (active) onError(error instanceof Error ? error.message : 'Unable to load dynamic pricing'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedId, request, onError]);

  const updateRate = (section: keyof Pricing, key: string, value: string) => {
    const number = Number(value);
    setPricing((current) => ({ ...current, [section]: { ...current[section], [key]: Number.isFinite(number) ? number : 0 } }));
  };

  const save = async () => {
    if (!selectedId) return;
    setSaving(true); onError(''); onMessage('');
    try {
      const data = await request(`/api/dealership/fabricators/${selectedId}/dynamic-pricing`, { method: 'PUT', body: JSON.stringify({ profiles: pricing.profiles }) });
      setPricing(data.dynamicPricing || pricing);
      onMessage(data.message || 'Dynamic pricing saved.');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unable to save dynamic pricing');
    } finally { setSaving(false); }
  };

  const pricingTable = (title: string, section: keyof Pricing) => {
    const query = rateSearch.trim().toLowerCase();
    const rows = Object.entries(pricing[section] || {}).filter(([key]) => !query || key.toLowerCase().includes(query));
    return <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4"><div><h3 className="font-semibold text-gray-900">{title}</h3><p className="text-xs text-gray-500">{rows.length} pricing rules</p></div><SlidersHorizontal size={19} className="text-[#124657]" /></div>
      <div className="max-h-[460px] overflow-auto"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-white text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3">Category / item</th><th className="w-44 px-5 py-3">Adjustment (₹/kg)</th></tr></thead><tbody className="divide-y divide-gray-100">{rows.map(([key, value]) => <tr key={key}><td className="px-5 py-3 font-medium text-gray-800">{key}</td><td className="px-5 py-2"><div className="flex items-center rounded-lg border border-gray-300 bg-white focus-within:border-[#124657]"><input type="number" step="0.01" value={value} onChange={(event) => updateRate(section, key, event.target.value)} className="min-w-0 flex-1 rounded-lg px-3 py-2 outline-none"/><span className="pr-3 text-gray-400">₹/kg</span></div></td></tr>)}{!rows.length && <tr><td colSpan={2} className="px-5 py-10 text-center text-gray-500">No matching pricing rules.</td></tr>}</tbody></table></div>
    </section>;
  };

  if (!fabricators.length) return <div className="rounded-xl border border-gray-200 bg-white p-10 text-center"><UserRound className="mx-auto mb-3 text-gray-400"/><h2 className="font-semibold">No registered fabricators</h2><p className="mt-1 text-sm text-gray-500">Register a fabricator before configuring dynamic pricing.</p></div>;

  return <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
    <aside className="h-fit overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="border-b p-4"><h2 className="font-semibold">Fabricators</h2><div className="mt-3 flex items-center gap-2 rounded-lg border px-3"><Search size={16} className="text-gray-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search fabricators" className="min-w-0 flex-1 py-2.5 text-sm outline-none"/></div></div><div className="max-h-[620px] overflow-auto p-2">{filteredFabricators.map((item) => <button key={item._id} onClick={() => setSelectedId(item._id)} className={`mb-1 w-full rounded-lg px-3 py-3 text-left ${selectedId === item._id ? 'bg-[#124657] text-white' : 'hover:bg-gray-100'}`}><p className="truncate text-sm font-semibold">{item.name}</p><p className={`truncate text-xs ${selectedId === item._id ? 'text-white/70' : 'text-gray-500'}`}>{item.phoneNumber}</p></button>)}</div></aside>
    <div>{selected && <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#124657]">Dynamic pricing for</p><h2 className="mt-1 text-xl font-bold text-gray-900">{selected.name}</h2><p className="text-sm text-gray-500">{selected.email} · {selected.phoneNumber}</p></div><button onClick={save} disabled={saving || loading} className="inline-flex items-center gap-2 rounded-lg bg-[#124657] px-5 py-2.5 font-medium text-white disabled:opacity-50"><Save size={17}/>{saving ? 'Saving…' : 'Save pricing'}</button></div>}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 shadow-sm"><Search size={17} className="text-gray-400"/><input value={rateSearch} onChange={(event) => setRateSearch(event.target.value)} placeholder="Search profile category or size" className="min-w-0 flex-1 py-3 text-sm outline-none"/></div>
      {loading ? <div className="rounded-xl border bg-white p-10 text-center text-gray-500">Loading pricing…</div> : <div className="grid gap-5 2xl:grid-cols-2">{pricingTable('Profile Dynamic Pricing', 'profiles')}</div>}
      <p className="mt-4 text-xs text-gray-500">Adjustments apply only to profiles, in ₹/kg. Zero or missing values use ₹100/kg. Hardware uses its catalog rate.</p>
    </div>
  </div>;
}
