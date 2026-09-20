'use client';

import { FormEvent, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { LoaderCircle, PackageCheck, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { API_BASE_URL } from '@/services/api';
import { getAuthToken } from '@/utils/authCookie';

export type InventoryItem = { _id: string; productId: string; description: string; quantity: number; updatedAt: string; productType: 'GLAZIA' | 'OTHER'; imageUrl?: string; };
type CatalogProduct = { _id: string; sapCode?: string; part?: string; description?: string; perticular?: string; subCategory?: string };
type ModalState = { mode: 'add'; productType: null | 'GLAZIA' | 'OTHER' } | { mode: 'edit'; item: InventoryItem } | null;
type AdjustmentRequest = { _id: string; operation: 'ADD' | 'EDIT' | 'DELETE'; productId: string; description: string; currentQuantity: number; requestedQuantity: number; status: 'PENDING' | 'APPROVED' | 'REJECTED'; reviewReason?: string; createdAt: string };

const iconButton = 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#124657]/30';

export default function StockManager({ inventory, onChanged }: { inventory: InventoryItem[]; onChanged: () => Promise<void> }) {
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [previewImage, setPreviewImage] = useState<InventoryItem | null>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const [quantity, setQuantity] = useState<number | ''>(0);
  const [busy, setBusy] = useState(false);
  const [otherSapCode, setOtherSapCode] = useState('');
  const [otherItemName, setOtherItemName] = useState('');
  const [otherImage, setOtherImage] = useState<File | null>(null);

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requests, setRequests] = useState<AdjustmentRequest[]>([]);
  const searchCache = useRef(new Map<string, CatalogProduct[]>());
  const requestNumber = useRef(0);
  const existingCodes = useMemo(() => new Set(inventory.map(item => item.productId)), [inventory]);

  const loadRequests = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/dealership/stock-adjustment-requests`, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await response.json().catch(() => ({}));
      if (response.ok) setRequests(data.requests || []);
    } catch { /* The inventory remains usable if request history cannot refresh. */ }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const api = async (path: string, options: RequestInit = {}) => {
    const token = getAuthToken();

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  };

  useEffect(() => {
    if (modal?.mode !== 'add' || selected) return;
    if (deferredQuery.length < 2) { setResults([]); setSearching(false); return; }
    const normalizedQuery = deferredQuery.toLowerCase();
    const cached = searchCache.current.get(normalizedQuery);
    if (cached) { setResults(cached); setSearching(false); return; }

    const controller = new AbortController();
    const currentRequest = ++requestNumber.current;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/user/global-search?search=${encodeURIComponent(deferredQuery)}`, {
          credentials: 'include', signal: controller.signal, headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Search failed');
        const nextResults = [...(data.products || []), ...(data.hardware || [])];
        searchCache.current.set(normalizedQuery, nextResults);
        if (currentRequest === requestNumber.current) setResults(nextResults);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        if (!controller.signal.aborted && currentRequest === requestNumber.current) setSearching(false);
      }
    }, 450);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [deferredQuery, modal, selected]);

  const closeEditor = () => {
    setModal(null); setQuery(''); setResults([]); setSelected(null); setQuantity(0); setOtherSapCode(''); setOtherItemName(''); setOtherImage(null); setError(''); setSearching(false);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    if (quantity === '' || !Number.isInteger(quantity) || quantity < 0) return setError('Enter a whole quantity of zero or more.');
    try {
      setBusy(true);
      if (modal?.mode === 'add') {
        if (modal.productType === 'GLAZIA') {
          if (!selected) {
            return setError('Select a product from the search results.');
          }

          const productId = selected.sapCode || selected._id;

          const description =
            selected.description ||
            selected.perticular ||
            selected.part ||
            productId;

          await api('/api/dealership/inventory', {
            method: 'POST',
            body: JSON.stringify({
              productId,
              description,
              quantity,
              productType: 'GLAZIA',
              notes: 'Stock item added manually'
            })
          });
        }
        if (modal.productType === 'OTHER') {
          if (!otherSapCode.trim()) {
            return setError('Enter SAP code.');
          }

          if (!otherItemName.trim()) {
            return setError('Enter item name.');
          }

          if (!otherImage) {
            return setError('Select an item image.');
          }

          const formData = new FormData();

          formData.append('productId', otherSapCode.trim());
          formData.append('description', otherItemName.trim());
          formData.append('quantity', String(quantity));
          formData.append('productType', 'OTHER');
          formData.append('image', otherImage);

          await api('/api/dealership/inventory', {
            method: 'POST',
            body: formData,
          });
        }


      }

      else if (modal?.mode === 'edit') {
        const formData = new FormData();

        formData.append('quantity', String(quantity));
        formData.append('notes', 'Manual stock correction');

        if (otherImage) {
          formData.append('image', otherImage);
        }

        await api(`/api/dealership/inventory/${encodeURIComponent(modal.item.productId)}`, {
          method: 'PATCH',
          body: formData,
        });
      }
      if (modal && modal.mode === 'add' && modal.productType === 'OTHER') {
        closeEditor();
        setSuccess('Other stock item added successfully.');
        await onChanged();
      } else if (modal && modal.mode === 'edit' && modal.item.productType === 'OTHER') {
        closeEditor();
        setSuccess('Other stock item updated successfully.');
        await onChanged();
      } else {
        closeEditor();
        setSuccess('Request submitted to Glazia for approval.');
        await loadRequests();
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save stock'); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleteItem) return;
    try {
      setBusy(true); setError('');
      await api(`/api/dealership/inventory/${encodeURIComponent(deleteItem.productId)}`, {
        method: 'DELETE',
        body: JSON.stringify({ notes: 'Stock item deleted manually' })
      });

      if (deleteItem.productType === 'OTHER') {
        setDeleteItem(null);
        setSuccess('Other stock item deleted successfully.');
        await onChanged();
      } else {
        setDeleteItem(null);
        setSuccess('Delete request submitted to Glazia for approval.');
        await loadRequests();
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete stock'); }
    finally { setBusy(false); }
  };

  return <>
    {success && <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"><span>{success}</span><button onClick={() => setSuccess('')} className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-green-100"><X size={15} /></button></div>}
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 p-6">
        <div><h2 className="text-xl font-semibold text-gray-900">Dealership stock</h2>
          <p className="mt-1 text-sm text-gray-500">
            Glazia products require approval. Other products can be managed directly.
          </p>
        </div>
        <button
          onClick={() => {
            setModal({ mode: 'add', productType: null });
            setQuantity(0);
            setOtherSapCode('');
            setOtherItemName('');
            setOtherImage(null);
            setQuery('');
            setSelected(null);
            setResults([]);
            setError('');
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#EE1C25] px-4 text-sm font-medium text-white transition-colors hover:bg-[#EE1C25]"><Plus size={17} />Add stock item</button>
      </div>
      {inventory.length === 0 ? <div className="p-12 text-center"><PackageCheck className="mx-auto mb-3 text-gray-300" size={44} /><p className="font-medium">No stock available</p><p className="mt-1 text-sm text-gray-500">Add your first product from the Glazia catalogue.</p></div> :
        <div className="overflow-x-auto p-6"><table className="w-full text-left text-sm"><thead><tr className="border-b text-gray-500"><th className="pb-3">Product</th><th className="pb-3">Image</th><th className="pb-3">Product code</th><th className="pb-3">Last updated</th><th className="pb-3 text-right">Quantity</th><th className="pb-3 text-right">Actions</th></tr></thead><tbody>{inventory.map(item => <tr key={item._id} className="border-b last:border-0"><td className="py-4 font-medium">{item.description || item.productId}</td>

          <td className="py-4">
            {item.productType === 'OTHER' && item.imageUrl ? (
              <button
                type="button"
                onClick={() => setPreviewImage(item)}
                className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124657]/30"
                title="Preview image"
              >
                <img
                  src={item.imageUrl}
                  alt={item.description || 'Product'}
                  className="h-12 w-12 rounded-lg border object-cover transition hover:scale-105"
                />
              </button>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>


          <td className="py-4 text-gray-500">{item.productId}</td><td className="py-4 text-gray-500">{new Date(item.updatedAt).toLocaleDateString('en-IN')}</td><td className="py-4 text-right text-lg font-semibold text-[#124657]">{item.quantity}</td><td className="py-4"><div className="flex justify-end gap-2"><button onClick={() => { setModal({ mode: 'edit', item }); setQuantity(item.quantity); setOtherImage(null); setError(''); }} className={`${iconButton} text-gray-600 hover:bg-gray-50`} title="Edit stock"><Pencil size={16} />
          </button>
            <button
              onClick={() => {
                setError('');
                setDeleteItem(item);
              }}
              disabled={busy}
              className={`${iconButton} border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50`}
              title="Delete stock"
            >
              <Trash2 size={16} />
            </button>
          </div></td></tr>)}</tbody></table></div>}
    </section>
    <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b p-5"><div><h3 className="font-semibold text-gray-900">Stock change requests</h3><p className="mt-1 text-sm text-gray-500">Manual changes apply only after Glazia approval.</p></div><button onClick={async () => { await Promise.all([loadRequests(), onChanged()]); }} className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">Refresh</button></div>{requests.length === 0 ? <p className="p-6 text-sm text-gray-500">No stock change requests yet.</p> : <div className="divide-y">{requests.map(request => <div key={request._id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{request.description}</span><span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold">{request.operation}</span></div><p className="mt-1 text-sm text-gray-500">{request.productId} · {request.operation === 'DELETE' ? `Remove ${request.currentQuantity}` : `${request.currentQuantity} → ${request.requestedQuantity}`}</p>{request.reviewReason && <p className={`mt-2 rounded-lg px-3 py-2 text-sm ${request.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}><b>{request.status === 'REJECTED' ? 'Rejection reason:' : 'Admin note:'}</b> {request.reviewReason}</p>}</div><div className="sm:text-right"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${request.status === 'APPROVED' ? 'bg-green-100 text-green-700' : request.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{request.status}</span><p className="mt-1 text-xs text-gray-400">{new Date(request.createdAt).toLocaleDateString('en-IN')}</p></div></div>)}</div>}</section>

    {modal && <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[1px]" role="dialog" aria-modal="true">
      <form onSubmit={save} className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5"><div><h3 className="text-xl font-semibold text-gray-900">

          {modal.mode === 'add'
            ? 'Add stock item'
            : modal.item.productType === 'OTHER'
              ? 'Edit stock item'
              : 'Edit stock quantity'}
        </h3><p className="mt-1 text-sm text-gray-500">{modal.mode === 'add' ? 'Search and select a catalogue product.' : `${modal.item.description} · ${modal.item.productId}`}</p></div><button type="button" onClick={closeEditor} className={`${iconButton} border-transparent text-gray-500 hover:bg-gray-100`} aria-label="Close"><X size={19} /></button></header>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {modal.mode === 'add' && (
            modal.productType === null ? (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">Add Stock Item</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Select the type of product you want to add.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setModal({ mode: 'add', productType: 'GLAZIA' })
                    }
                    className="rounded-xl border border-gray-200 p-5 text-left transition hover:border-[#124657] hover:bg-gray-50 disabled:opacity-50"
                  >
                    <p className="font-semibold text-gray-900">
                      Glazia Product
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Add a product from the Glazia catalogue.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setModal({ mode: 'add', productType: 'OTHER' })
                    }
                    className="rounded-xl border border-gray-200 p-5 text-left transition hover:border-[#124657] hover:bg-gray-50 disabled:opacity-50"
                  >
                    <p className="font-semibold text-gray-900">
                      Other Product
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Add a product that is not in the Glazia catalogue.
                    </p>
                  </button>
                </div>
              </div>
            ) : modal.productType === 'GLAZIA' ? (
              <div>
                <label
                  htmlFor="stock-product-search"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Product
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search size={18} />
                  </span>

                  <input
                    id="stock-product-search"
                    autoFocus
                    value={query}
                    onChange={event => {
                      setQuery(event.target.value);
                      setSelected(null);
                      setError('');
                    }}
                    placeholder="Search by name or SAP code"
                    className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-11 outline-none transition focus:border-[#124657] focus:ring-2 focus:ring-[#124657]/15"
                  />

                  {searching && (
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#124657]">
                      <LoaderCircle className="animate-spin" size={18} />
                    </span>
                  )}
                </div>

                {!selected && deferredQuery.length === 1 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Type at least 2 characters.
                  </p>
                )}

                {!selected &&
                  deferredQuery.length >= 2 &&
                  !searching &&
                  results.length === 0 && (
                    <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                      No matching products found.
                    </p>
                  )}

                {results.length > 0 && !selected && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    {results.map(product => {
                      const code = product.sapCode || product._id;
                      const unavailable = existingCodes.has(code);

                      return (
                        <button
                          type="button"
                          key={`${product._id}-${code}`}
                          disabled={unavailable}
                          onClick={() => {
                            setSelected(product);
                            setQuery(
                              `${product.description || product.perticular || product.part || code} (${code})`
                            );
                            setResults([]);
                          }}
                          className="flex w-full items-center justify-between gap-4 border-b px-4 py-3 text-left transition last:border-0 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {product.description ||
                                product.perticular ||
                                product.part ||
                                code}
                            </span>

                            <span className="block text-xs text-gray-500">
                              {code}
                              {product.subCategory
                                ? ` · ${product.subCategory}`
                                : ''}
                            </span>
                          </span>

                          {unavailable && (
                            <span className="shrink-0 rounded-full bg-gray-200 px-2 py-1 text-[11px]">
                              In stock
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">Other Product</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a product that is not available in the Glazia catalogue.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="other-sap-code"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    SAP Code
                  </label>

                  <input
                    id="other-sap-code"
                    type="text"
                    value={otherSapCode}
                    onChange={event => {
                      setOtherSapCode(event.target.value);
                      setError('');
                    }}
                    placeholder="Enter SAP code"
                    className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none transition focus:border-[#124657] focus:ring-2 focus:ring-[#124657]/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="other-item-name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Item Name
                  </label>

                  <input
                    id="other-item-name"
                    type="text"
                    value={otherItemName}
                    onChange={event => {
                      setOtherItemName(event.target.value);
                      setError('');
                    }}
                    placeholder="Enter item name"
                    className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none transition focus:border-[#124657] focus:ring-2 focus:ring-[#124657]/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="other-image"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Item Image
                  </label>

                  <label
                    htmlFor="other-image"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center hover:border-[#124657] hover:bg-gray-50"
                  >
                    <div className="mb-2 text-2xl text-gray-400">+</div>

                    <p className="text-sm font-medium text-gray-700">
                      {otherImage
                        ? otherImage.name
                        : 'Choose product image'}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Click to upload JPG, PNG or WEBP
                    </p>

                    <input
                      id="other-image"
                      type="file"
                      required
                      disabled={busy}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={event => {
                        setOtherImage(event.target.files?.[0] || null);
                        setError('');
                      }}
                      className="hidden"
                    />
                  </label>

                  <p className="mt-2 text-xs text-gray-500">
                    Maximum image size: 5 MB
                  </p>
                </div>
              </div>
            )

          )}

          {modal.mode === 'edit' && modal.item.productType === 'OTHER' && (
            <div>
              <label
                htmlFor="edit-other-image"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Item Image
              </label>

              <label
                htmlFor="edit-other-image"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center hover:border-[#124657] hover:bg-gray-50"
              >
                <div className="mb-2 text-2xl text-gray-400">+</div>

                <p className="text-sm font-medium text-gray-700">
                  {otherImage ? otherImage.name : 'Choose new product image'}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Upload only if you want to replace the current image
                </p>

                <input
                  id="edit-other-image"
                  type="file"
                  disabled={busy}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={event => {
                    setOtherImage(event.target.files?.[0] || null);
                    setError('');
                  }}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-xs text-gray-500">
                Maximum image size: 5 MB
              </p>
            </div>
          )}

          {(modal.mode === 'edit' || (modal.mode === 'add' && modal.productType !== null)) && (
            <div>
              <label
                htmlFor="stock-quantity"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Quantity
              </label>

              <input
                id="stock-quantity"
                required
                type="number"
                min="0"
                step="1"
                value={quantity}
                onChange={event => {
                  const value = event.target.value;

                  if (value === '') {
                    setQuantity('');
                    return;
                  }

                  setQuantity(Number(value));
                }}
                className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none transition focus:border-[#124657] focus:ring-2 focus:ring-[#124657]/15"
              />
            </div>
          )}
          {error && <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
        {!(modal.mode === 'add' && modal.productType === null) && (
          <footer className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4"><button type="button" onClick={closeEditor} className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>

            <button
              disabled={
                busy ||
                (
                  modal.mode === 'add' &&
                  modal.productType === 'GLAZIA' &&
                  !selected
                )
              }
              className="inline-flex h-10 min-w-28 items-center justify-center rounded-lg bg-[#124657] px-5 text-sm font-medium text-white disabled:opacity-50"
            >
              {busy && (
                <LoaderCircle
                  className="mr-2 animate-spin"
                  size={16}
                />
              )}

              {busy
                ? (
                  modal.mode === 'add' && modal.productType === 'OTHER'
                    ? 'Saving...'
                    : modal.mode === 'edit' && modal.item.productType === 'OTHER'
                      ? 'Saving...'
                      : 'Submitting...'
                )
                : (
                  modal.mode === 'add' && modal.productType === 'OTHER'
                    ? 'Save stock'
                    : modal.mode === 'edit' && modal.item.productType === 'OTHER'
                      ? 'Save changes'
                      : 'Submit request'
                )}
            </button>
          </footer>
        )}
      </form>
    </div>}

    {deleteItem && <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[1px]" role="alertdialog" aria-modal="true"><div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="p-6"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600"><Trash2 size={21} /></div>

      <h3 className="text-xl font-semibold text-gray-900">
        {deleteItem.productType === 'OTHER'
          ? 'Delete stock item?'
          : 'Request stock deletion?'}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {deleteItem.productType === 'OTHER' ? (
          <>
            Are you sure you want to delete{' '}
            <b>{deleteItem.description || deleteItem.productId}</b> with quantity{' '}
            <b>{deleteItem.quantity}</b>? This action will remove the item from
            your inventory.
          </>
        ) : (
          <>
            A request to remove{' '}
            <b>{deleteItem.description || deleteItem.productId}</b> and its
            quantity of <b>{deleteItem.quantity}</b> will be sent to Glazia.
            Stock will remain unchanged until approved.
          </>
        )}
      </p>
      {error && <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}</div><div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4"><button onClick={() => { setDeleteItem(null); setError(''); }} className="inline-flex h-10 items-center justify-center rounded-lg border bg-white px-4 text-sm font-medium">Cancel</button><button disabled={busy} onClick={remove} className="inline-flex h-10 min-w-28 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white disabled:opacity-50">{busy && <LoaderCircle className="mr-2 animate-spin" size={16} />}

        {busy
          ? deleteItem.productType === 'OTHER'
            ? 'Deleting...'
            : 'Submitting'
          : deleteItem.productType === 'OTHER'
            ? 'Delete'
            : 'Submit deletion'}
      </button></div></div></div>}
    {previewImage && (
      <div
        className="fixed inset-0 z-[12000] flex items-center justify-center bg-slate-950/70 p-4"
        role="dialog"
        aria-modal="true"
        onClick={() => setPreviewImage(null)}
      >
        <div
          className="relative max-h-[90vh] max-w-3xl rounded-2xl bg-white p-3 shadow-2xl"
          onClick={event => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
            aria-label="Close image preview"
          >
            <X size={18} />
          </button>

          <img
            src={previewImage.imageUrl}
            alt={previewImage.description || 'Product'}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
          />
        </div>
      </div>
    )}
  </>;
}
