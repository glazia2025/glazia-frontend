'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle, Package, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import Header from '@/components/Header';
import { API_BASE_URL } from '@/services/api';
import { getAuthToken } from '@/utils/authCookie';

type StockItem = { _id: string; productId: string; description: string; quantity: number; updatedAt: string; productType: 'GLAZIA' | 'OTHER'; imageUrl?: string; };
type CatalogItem = { _id: string; sapCode?: string; description?: string; perticular?: string; part?: string };
type Editor = { mode: 'add'; productType: null } |{ mode: 'add'; productType: 'GLAZIA' | 'OTHER' }| { mode: 'edit'; item: StockItem } | { mode: 'delete'; item: StockItem };
const endpoint = '/api/fabricator/inventory';
const codeOf = (item: CatalogItem) => item.sapCode || item._id;
const nameOf = (item: CatalogItem) => item.description || item.perticular || item.part || codeOf(item);
const inputStyle = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#124657] focus:ring-2 focus:ring-[#124657]/15';
const buttonStyle = 'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50';

async function request(path: string, options: RequestInit = {}) {
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
  if (!response.ok) throw new Error(data.message || 'Unable to complete the request. Please try again.');
  return data;
}

export default function FabricatorInventoryPage() {
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogItem[]>([]);
  const [selected, setSelected] = useState<CatalogItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [quantity, setQuantity] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otherSapCode, setOtherSapCode] = useState('');
  const [otherItemName, setOtherItemName] = useState('');
  const [otherImage, setOtherImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await request(endpoint);
      setInventory(data.inventory || []);
      setLoaded(true);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load inventory');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (editor?.mode !== 'add' || selected || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    setResults([]);
    const timer = window.setTimeout(async () => {
      try {
        const data = await request(`/api/user/global-search?search=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        if (!controller.signal.aborted) setResults([...(data.products || []), ...(data.hardware || [])]);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to search products');
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [editor, query, selected]);

  const existingCodes = useMemo(() => new Set(inventory.map(item => item.productId)), [inventory]);
  const visible = useMemo(() => inventory.filter(item => {
    const matches = `${item.productId} ${item.description}`.toLowerCase().includes(search.trim().toLowerCase());
    return matches && (status === 'all' || (status === 'in' ? item.quantity > 0 : item.quantity === 0));
  }), [inventory, search, status]);
  const inStock = inventory.filter(item => item.quantity > 0).length;

  const openEditor = (next: Editor) => {
  setQuery('');
  setSelected(null);
  setResults([]);
  setError('');
  setMessage('');

  setOtherSapCode('');
  setOtherItemName('');
  setOtherImage(null);

  setQuantity(
    next.mode === 'add' ? '0' : String(next.item.quantity)
  );

  setEditor(next);
};

const save = async (event: FormEvent) => {
  event.preventDefault();

  if (!editor || saving) return;

  setError('');

  const amount = Number(quantity);

  if (
    editor.mode !== 'delete' &&
    (!quantity.trim() ||
      !Number.isSafeInteger(amount) ||
      amount < 0)
  ) {
    setError('Enter a whole quantity of zero or more.');
    return;
  }

  if (editor.mode === 'add') {
    if (editor.productType === 'GLAZIA' && !selected) {
      setError('Select a catalogue product.');
      return;
    }

    if (editor.productType === 'OTHER') {
      if (!otherSapCode.trim()) {
        setError('Enter SAP code.');
        return;
      }

      if (!otherItemName.trim()) {
        setError('Enter item name.');
        return;
      }

      if (!otherImage) {
        setError('Select an item image.');
        return;
      }
    }
  }

  setSaving(true);

  try {
    let successMessage = 'Inventory updated';

    if (
      editor.mode === 'add' &&
      editor.productType === 'GLAZIA' &&
      selected
    ) {
      const data = await request(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          productId: codeOf(selected),
          description: nameOf(selected),
          quantity: amount,
          productType: 'GLAZIA',
        }),
      });

      const item: StockItem = data.item;

      setInventory(items =>
        [...items, item].sort((a, b) =>
          a.description.localeCompare(b.description)
        )
      );

      successMessage = data.message;
    } else if (
      editor.mode === 'add' &&
      editor.productType === 'OTHER'
    ) {
      const formData = new FormData();

      formData.append('productId', otherSapCode.trim());
      formData.append('description', otherItemName.trim());
      formData.append('quantity', String(amount));
      formData.append('productType', 'OTHER');

      if (otherImage) {
        formData.append('image', otherImage);
      }

      const data = await request(endpoint, {
        method: 'POST',
        body: formData,
      });

      const item: StockItem = data.item;

      setInventory(items =>
        [...items, item].sort((a, b) =>
          a.description.localeCompare(b.description)
        )
      );

      successMessage = data.message;
    } else if (editor.mode === 'edit') {
  let body: BodyInit;

  if (
    editor.item.productType === 'OTHER' &&
    otherImage
  ) {
    const formData = new FormData();

    formData.append('quantity', String(amount));
    formData.append('image', otherImage);

    body = formData;
  } else {
    body = JSON.stringify({
      quantity: amount,
    });
  }

  const data = await request(
    `${endpoint}/${encodeURIComponent(editor.item.productId)}`,
    {
      method: 'PATCH',
      body,
    }
  );

  const updated: StockItem = data.item;

  setInventory(items =>
    items.map(item =>
      item._id === updated._id ? updated : item
    )
  );

  successMessage = data.message;

    } else if (editor.mode === 'delete') {
      const data = await request(
        `${endpoint}/${encodeURIComponent(editor.item.productId)}`,
        {
          method: 'DELETE',
        }
      );

      setInventory(items =>
        items.filter(item => item._id !== editor.item._id)
      );

      successMessage = data.message;
    }
    setOtherImage(null);
    setOtherSapCode('');
    setOtherItemName('');
    setEditor(null);
    setMessage(successMessage);

  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Unable to save inventory'
    );
  } finally {
    setSaving(false);
  }
};
  

  return <div className="min-h-screen bg-gray-50">
    <Header />
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/account/dashboard" className="text-sm font-medium text-[#124657] hover:underline">Back to dashboard</Link>
      <div className="my-6 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-gray-900">My inventory</h1><p className="mt-1 text-sm text-gray-600">Track the products you have on hand. Update quantities here as your stock changes.</p></div>
        <div className="flex gap-2">
          <button type="button" disabled={loading || saving} onClick={load} className={`${buttonStyle} bg-white`}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Refresh</button>
          <button type="button" disabled={!loaded || loading || !!loadError} onClick={() => openEditor({ mode: 'add', productType: null })} className={`${buttonStyle} border-[#124657] bg-[#124657] text-white`}><Plus size={16} />Add stock item</button>
        </div>
      </div>
      {message && <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
      {loadError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}
      {loaded && <>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[['Tracked products', inventory.length], ['In stock', inStock], ['Out of stock', inventory.length - inStock]].map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-semibold text-[#124657]">{value}</p></div>)}
        </div>
        <section className="overflow-hidden rounded-xl border bg-white shadow-sm" aria-label="Fabricator stock">
          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row">
            <div className="relative flex-1"><Search size={18} className="absolute left-3 top-3 text-gray-400" /><input aria-label="Search inventory" placeholder="Search by product name or code" value={search} onChange={event => setSearch(event.target.value)} className={`${inputStyle} pl-10`} /></div>
            <select aria-label="Stock status" value={status} onChange={event => setStatus(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2"><option value="all">All products</option><option value="in">In stock</option><option value="out">Out of stock</option></select>
          </div>
          {visible.length === 0 ? <div className="p-12 text-center"><Package size={40} className="mx-auto mb-3 text-gray-300" /><p className="font-medium text-gray-700">{inventory.length ? 'No matching products' : 'Start tracking your stock'}</p><p className="mt-1 text-sm text-gray-500">{inventory.length ? 'Try a different search or stock filter.' : 'Add a catalogue product and enter its current quantity.'}</p></div> :
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">Product</th><th className="p-4">Image</th><th className="p-4">Quantity</th><th className="p-4">Status</th><th className="p-4">Last updated</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>
              {visible.map(item => <tr key={item._id} className="border-t">
                <td className="p-4"><p className="font-medium">{item.description}</p><p className="mt-1 text-xs text-gray-500">{item.productId}</p></td>
  
<td className="p-4">
  {item.productType === 'OTHER' && item.imageUrl ? (
    <button
      type="button"
      onClick={() => setPreviewImage(item.imageUrl!)}
      className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-[#124657]"
      aria-label={`Preview image of ${item.description}`}
    >
      <img
        src={item.imageUrl}
        alt={item.description}
        className="h-12 w-12 rounded-lg border object-cover"
      />
    </button>
  ) : (
    <span className="text-gray-400">-</span>
  )}
</td>

                <td className="p-4 font-semibold">{item.quantity}</td><td className="p-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${item.quantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{item.quantity > 0 ? 'In stock' : 'Out of stock'}</span></td><td className="whitespace-nowrap p-4 text-gray-500">{new Date(item.updatedAt).toLocaleDateString('en-IN')}</td><td className="p-4"><div className="flex justify-end gap-2"><button type="button" disabled={loading || !!loadError} onClick={() => openEditor({ mode: 'edit', item })} aria-label={`Edit ${item.description}`} className="rounded-lg border p-2 hover:bg-gray-50 disabled:opacity-50"><Pencil size={16} /></button><button type="button" disabled={loading || !!loadError} onClick={() => openEditor({ mode: 'delete', item })} aria-label={`Delete ${item.description}`} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={16} /></button></div></td></tr>)}
            </tbody></table></div>}
        </section>
      </>}
      {loading && !loaded && <p role="status" className="flex items-center justify-center gap-2 py-16 text-gray-500"><LoaderCircle size={20} className="animate-spin" />Loading inventory...</p>}
    </main>
    {editor && <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-slate-950/55 p-4">
      <form onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="inventory-editor-title" className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b p-5"><h2 id="inventory-editor-title" className="text-lg font-semibold">{editor.mode === 'add' ? 'Add stock item' : editor.mode === 'edit' ? 'Edit stock quantity' : 'Delete stock item?'}</h2><button type="button" disabled={saving} onClick={() => setEditor(null)} aria-label="Close" className="rounded p-2 hover:bg-gray-100"><X size={20} /></button></header>
        <div className="space-y-5 overflow-y-auto p-5">
          {editor.mode === 'add' ? (
  editor.productType === null ? (
    <div className="space-y-4">
      <div>
        <p className="font-medium">Add Stock Item</p>
        <p className="mt-1 text-sm text-gray-500">
          Select the type of product you want to add.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            setEditor({
              mode: 'add',
              productType: 'GLAZIA',
            })
          }
          className="rounded-lg border p-4 text-left hover:bg-gray-50"
        >
          <p className="font-medium">Glazia Product</p>
          <p className="mt-1 text-xs text-gray-500">
            Add from Glazia catalogue
          </p>
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() =>
            setEditor({
              mode: 'add',
              productType: 'OTHER',
            })
          }
          className="rounded-lg border p-4 text-left hover:bg-gray-50"
        >
          <p className="font-medium">Other Product</p>
          <p className="mt-1 text-xs text-gray-500">
            Add your own stock item
          </p>
        </button>
      </div>
    </div>
  ) : editor.productType === 'GLAZIA' ? (
    <div>
      <label
        htmlFor="catalog-search"
        className="mb-2 block text-sm font-medium"
      >
        Product
      </label>

      <input
        id="catalog-search"
        autoFocus
        autoComplete="off"
        disabled={saving}
        value={query}
        onChange={event => {
          setQuery(event.target.value);
          setSelected(null);
          setError('');
        }}
        placeholder="Search catalogue by name or code"
        className={inputStyle}
      />

      {searching && (
        <p role="status" className="mt-2 text-sm text-gray-500">
          Searching...
        </p>
      )}

      {!selected && query.trim().length < 2 && (
        <p className="mt-2 text-xs text-gray-500">
          Type at least 2 characters.
        </p>
      )}

      {!selected &&
        !searching &&
        query.trim().length >= 2 &&
        results.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            No matching catalogue products.
          </p>
        )}

      {!selected && results.length > 0 && (
        <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border">
          {results.map(product => (
            <button
              key={`${product._id}-${codeOf(product)}`}
              type="button"
              disabled={saving || existingCodes.has(codeOf(product))}
              onClick={() => {
                setSelected(product);
                setQuery(`${nameOf(product)} (${codeOf(product)})`);
                setError('');
              }}
              className="block w-full border-b px-3 py-3 text-left last:border-0 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="block text-sm font-medium">
                {nameOf(product)}
              </span>

              <span className="text-xs text-gray-500">
                {codeOf(product)}
                {existingCodes.has(codeOf(product))
                  ? ' · Already tracked'
                  : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  ) : (
    <div className="space-y-4">
  <div>
    <p className="font-medium">Other Product</p>
    <p className="mt-1 text-sm text-gray-500">
      Enter the details of your stock item.
    </p>
  </div>

  <div>
    <label
      htmlFor="other-sap-code"
      className="mb-2 block text-sm font-medium"
    >
      SAP Code
    </label>
    <input
      id="other-sap-code"
      type="text"
      required
      disabled={saving}
      value={otherSapCode}
      onChange={event => {
        setOtherSapCode(event.target.value);
        setError('');
      }}
      placeholder="Enter SAP code"
      className={inputStyle}
    />
  </div>

  <div>
    <label
      htmlFor="other-item-name"
      className="mb-2 block text-sm font-medium"
    >
      Item Name
    </label>
    <input
      id="other-item-name"
      type="text"
      required
      disabled={saving}
      value={otherItemName}
      onChange={event => {
        setOtherItemName(event.target.value);
        setError('');
      }}
      placeholder="Enter item name"
      className={inputStyle}
    />
  </div>

  <div>
  <label className="mb-2 block text-sm font-medium">
    Item Image
  </label>

  <label
    htmlFor="other-image"
    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center hover:border-[#124657] hover:bg-gray-50"
  >
    <div className="mb-2 text-2xl text-gray-400">
      +
    </div>

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
      disabled={saving}
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
) : (
  <div className="space-y-4">
  <div>
    <p className="font-medium">{editor.item.description}</p>
    <p className="text-sm text-gray-500">{editor.item.productId}</p>
  </div>

  {editor.mode === 'edit' &&
    editor.item.productType === 'OTHER' && (
      <div>
        <label className="mb-2 block text-sm font-medium">
          Product Image
        </label>

        {editor.item.imageUrl && (
          <div className="mb-3">
            <img
              src={editor.item.imageUrl}
              alt={editor.item.description}
              className="h-20 w-20 rounded-lg border object-cover"
            />
          </div>
        )}

        <label
          htmlFor="edit-other-image"
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-5 text-center hover:border-[#124657] hover:bg-gray-50"
        >
          <p className="text-sm font-medium text-gray-700">
            {otherImage
              ? otherImage.name
              : 'Choose new product image'}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Leave empty to keep current image
          </p>

          <input
            id="edit-other-image"
            type="file"
            disabled={saving}
            accept="image/jpeg,image/png,image/webp"
            onChange={event => {
              setOtherImage(event.target.files?.[0] || null);
              setError('');
            }}
            className="hidden"
          />
        </label>

        <p className="mt-2 text-xs text-gray-500">
          JPG, PNG or WEBP. Maximum size 5 MB.
        </p>
      </div>
    )}
</div>
)}
          {editor.mode === 'delete' ? (
  <p className="text-sm text-gray-600">
    Remove this product and its recorded quantity of{' '}
    <b>{editor.item.quantity}</b> from your inventory? To keep tracking an
    empty item, edit its quantity to zero.
  </p>
) : editor.mode === 'add' && editor.productType === null ? null : (
  <div>
    <label
      htmlFor="stock-quantity"
      className="mb-2 block text-sm font-medium"
    >
      Current quantity
    </label>

    <input
      id="stock-quantity"
      type="number"
      min="0"
      max={Number.MAX_SAFE_INTEGER}
      step="1"
      required
      disabled={saving}
      value={quantity}
      onChange={event => setQuantity(event.target.value)}
      className={inputStyle}
    />

    <p className="mt-2 text-xs text-gray-500">
      Enter zero to mark this product out of stock.
    </p>
  </div>
)}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>
        <footer className="flex justify-end gap-3 border-t bg-gray-50 p-5">
  <button
    type="button"
    disabled={saving}
    onClick={() => setEditor(null)}
    className={`${buttonStyle} bg-white`}
  >
    Cancel
  </button>

  {!(editor.mode === 'add' && editor.productType === null) && (
    <button
      type="submit"
      disabled={
        saving ||
        (editor.mode === 'add' &&
          editor.productType === 'GLAZIA' &&
          !selected)
      }
      className={`${buttonStyle} text-white ${
        editor.mode === 'delete'
          ? 'border-red-600 bg-red-600'
          : 'border-[#124657] bg-[#124657]'
      }`}
    >
      {saving && <LoaderCircle size={16} className="animate-spin" />}

      {saving
        ? 'Saving...'
        : editor.mode === 'delete'
          ? 'Delete item'
          : 'Save stock'}
    </button>
  )}
</footer>
      </form>
    </div>}
    {previewImage && (
  <div
    className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/70 p-4"
    onClick={() => setPreviewImage(null)}
  >
    <div
      className="relative max-h-[90vh] max-w-4xl rounded-xl bg-white p-3 shadow-xl"
      onClick={event => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setPreviewImage(null)}
        className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow hover:bg-gray-100"
        aria-label="Close image preview"
      >
        <X size={20} />
      </button>

      <img
        src={previewImage}
        alt="Inventory product preview"
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
      />
    </div>
  </div>
)}
  </div>;
}
