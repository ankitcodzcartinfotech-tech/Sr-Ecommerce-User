"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/utils/toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  User, Package, MapPin, Clock, Camera, Check, X,
  Plus, Pencil, Trash2, Phone, Mail,
  LogOut, Bell, ArrowRight, Eye, ChevronRight, Lock
} from "lucide-react";
import {
  getUserProfile, updateUserProfile,
  getOrders, cancelOrder,
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
  getRecentlyViewed, logoutUser,
} from "@/Api/AllApi";
import {
  formatCurrency, resolveMediaSrc, getProductName,
  getProductImagePath, getProductPrice, getProductHref,
} from "@/lib/storefront";
import { playMessage } from "@/utils/notificationSound";
import ValidatedInput from "@/components/common/ValidatedInput";
import { validateField } from "@/utils/validation";

/* ── helpers ─────────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7410";

function avatar(src) {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  const path = src.startsWith("/") ? src : `/${src}`;
  return path;
}

const STATUS_CFG = {
  Pending: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  Confirmed: { text: "text-stone-900", bg: "bg-stone-100", border: "border-stone-200" },
  Processing: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  Shipped: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  Delivered: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  Cancelled: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
};

/* ── Address Dialog ──────────────────────────────────────── */
const EMPTY_ADDR = { fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", addressType: "Home", isDefault: false };

function AddressDialog({ open, onClose, existing, onSave }) {
  const [form, setForm] = useState(existing || EMPTY_ADDR);
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(existing || EMPTY_ADDR);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErr("");
    setTouched({});
  }, [existing, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const touch = (k) => setTouched(t => ({ ...t, [k]: true }));

  async function handleSubmit(e) {
    e.preventDefault();
    const t = { fullName: true, phone: true, addressLine1: true, city: true, state: true, pincode: true };
    setTouched(t);

    const isInvalid = 
      validateField("name", form.fullName) ||
      validateField("mobileNumber", form.phone) ||
      validateField("addressLine1", form.addressLine1) ||
      validateField("city", form.city) ||
      validateField("state", form.state) ||
      validateField("pincode", form.pincode);

    if (isInvalid) {
      setErr("Please fix the validation errors.");
      return;
    }

    setSaving(true);
    setErr("");
    try {
      await onSave(form);
      onClose();
    } catch (ex) { setErr(ex.message || "Could not save address"); }
    finally { setSaving(false); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="surface-card w-full max-w-lg p-7 md:p-9">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold text-[#2D2A26]">{existing ? "Edit Address" : "Add New Address"}</h3>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F3EC] text-[#736B63] hover:bg-black/10 transition-colors cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ValidatedInput variant="account" placeholder="Full Name *" validationType="name" value={form.fullName} onChange={e => set("fullName", e.target.value)} onBlur={() => touch("fullName")} touched={touched.fullName} />
            <ValidatedInput variant="account" placeholder="Phone *" validationType="mobileNumber" value={form.phone} onChange={e => set("phone", e.target.value)} onBlur={() => touch("phone")} touched={touched.phone} />
          </div>
          <ValidatedInput variant="account" placeholder="Address Line 1 *" validationType="addressLine1" value={form.addressLine1} onChange={e => set("addressLine1", e.target.value)} onBlur={() => touch("addressLine1")} touched={touched.addressLine1} />
          <ValidatedInput variant="account" placeholder="Address Line 2" validationType="addressLine2" value={form.addressLine2} onChange={e => set("addressLine2", e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ValidatedInput variant="account" placeholder="City *" validationType="city" value={form.city} onChange={e => set("city", e.target.value)} onBlur={() => touch("city")} touched={touched.city} />
            <ValidatedInput variant="account" placeholder="State *" validationType="state" value={form.state} onChange={e => set("state", e.target.value)} onBlur={() => touch("state")} touched={touched.state} />
            <ValidatedInput variant="account" placeholder="Pincode *" validationType="pincode" value={form.pincode} onChange={e => set("pincode", e.target.value)} onBlur={() => touch("pincode")} touched={touched.pincode} />
          </div>
          <div className="flex items-center gap-5 pt-3">
            {["Home", "Work", "Other"].map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="addrType" value={t} checked={form.addressType === t} onChange={() => set("addressType", t)} className="h-4 w-4 accent-emerald-700" />
                <span className="text-sm font-semibold text-[#736B63]">{t}</span>
              </label>
            ))}
          </div>
          <label className="flex items-center gap-3 cursor-pointer mt-2 pb-2">
            <input type="checkbox" checked={form.isDefault} onChange={e => set("isDefault", e.target.checked)} className="h-4 w-4 accent-emerald-700 rounded" />
            <span className="text-sm font-semibold text-[#736B63]">Set as default address</span>
          </label>
          {err && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">{err}</p>}
          <button type="submit" disabled={saving} className="btn-primary mt-4 w-full py-3.5 text-sm font-bold disabled:opacity-60 cursor-not-allowed">
            {saving ? "Saving…" : "Save Address"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Profile Tab ─────────────────────────────────────────── */
function ProfileTab() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    getUserProfile().then(d => {
      const u = d?.user || d;
      setProfile(u);
      setForm({ name: u?.name || "" });
    }).catch(() => { }).finally(() => setLoading(false));
  }, []);

  function handleImg(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgFile(f);
    setPreviewImg(URL.createObjectURL(f));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast.warning("Name is required"); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (imgFile) fd.append("profileImage", imgFile);
      await updateUserProfile(fd);
      toast.success("Profile updated successfully!");
    } catch (ex) { toast.error(ex.message || "Could not update profile"); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-2xl bg-black/5" />)}</div>;

  const imgSrc = previewImg || avatar(profile?.profileImage);

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-10">
      {/* Avatar */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8">
        <div className="relative shrink-0">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[#F6F3EC] bg-white shadow-sm">
            {imgSrc ? <Image src={imgSrc} alt="Profile" fill sizes="112px" className="object-cover rounded-full" /> : (
              <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-4xl font-serif font-bold text-emerald-700">
                {form.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-white shadow-md hover:bg-emerald-600 transition-all hover-scale cursor-pointer">
            <Camera size={16} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImg} />
        </div>
        <div>
          <p className="font-serif text-2xl font-bold text-[#2D2A26]">{form.name || "Your Name"}</p>
        </div>
      </div>
      <div className="space-y-6">
        {[
          { label: "Full Name", key: "name", type: "text", icon: User, required: true },
        ].map(({ label, key, type, icon: Icon, required, readonly, placeholder }) => (
          <ValidatedInput
            key={key}
            variant="account"
            label={label}
            type={type}
            validationType={key === 'name' ? 'name' : undefined}
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            icon={Icon}
            required={required}
            readOnly={readonly}
            placeholder={placeholder}
          />
        ))}
      </div>
      <div className="pt-2">
        <button type="submit" disabled={saving}
          className="btn-primary flex items-center gap-2 px-8 py-4 text-sm font-bold disabled:opacity-60 shadow-md cursor-not-allowed">
          {saving ? "Saving Changes…" : <><Check size={16} /> Save Changes</>}
        </button>
      </div>
    </form>
  );
}

/* ── Orders Tab ──────────────────────────────────────────── */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then(d => setOrders(d?.orders || d?.data || [])).catch(() => { }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-5">{[1, 2].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-black/5" />)}</div>;

  if (!orders.length) return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-stone-50">
        <Package size={40} className="text-[#A39C93]" />
      </div>
      <p className="font-serif text-2xl font-bold text-[#2D2A26]">No orders yet</p>
      <p className="mt-2 text-sm text-[#736B63]">Your premium orders will appear here once placed.</p>
      <Link href="/shop" className="btn-primary mt-8 px-8 py-3.5 text-sm font-bold shadow-md cursor-pointer">Start Shopping</Link>
    </div>
  );

  return (
    <div className="space-y-5">
      {orders.map(order => {
        const cfg = STATUS_CFG[order.orderStatus] || STATUS_CFG.Pending;
        return (
          <div key={order._id} className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border border-black/5 bg-white p-6 transition-all hover:border-emerald-500/30 hover:shadow-md hover:-translate-y-1">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <p className="order-id-text text-base sm:text-[1.1rem] font-bold text-[#2D2A26] truncate">
                  {order.orderNumber || `ORD-${order._id?.slice(-8).toUpperCase()}`}
                </p>
                <span className={`shrink-0 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-sm font-medium text-[#736B63]">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
              </p>
              <p className="mt-3 text-xl sm:text-2xl font-bold text-emerald-700">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3 border-t border-black/5 pt-4 sm:pt-0 sm:border-0 w-full sm:w-auto">
              <Link href={`/orders/orders-details/${order._id}`} className="btn-secondary flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 text-xs font-bold shadow-sm cursor-pointer">
                <Eye size={16} /> View Details
              </Link>
            </div>
          </div>
        );
      })}
      <div className="pt-6 text-center">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-600 transition-colors cursor-pointer">
          View Detailed Orders Page <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

/* ── Addresses Tab ───────────────────────────────────────── */
function AddressesTab() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function reload() {
    setLoading(true);
    try { const d = await getAddresses(); setAddresses(d?.addresses || []); }
    catch { } finally { setLoading(false); }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { reload(); }, []);

  async function handleSave(form) {
    if (editing) {
      await updateAddress(editing._id, form);
      toast.success("Address updated");
    } else {
      const res = await addAddress(form);
      if (res?.message === 'Address already exists') {
        toast.warning("This address is already saved in your account.");
      } else {
        toast.success("Address added successfully");
      }
    }
    reload();
  }

  async function handleDelete(id) {
    try { await deleteAddress(id); toast.success("Address deleted"); reload(); }
    catch (ex) { toast.error(ex.message || "Could not delete address"); }
  }

  async function handleSetDefault(id) {
    try { await setDefaultAddress(id); toast.success("Default address updated"); reload(); }
    catch (ex) { toast.error(ex.message || "Could not update default address"); }
  }

  if (loading) return <div className="grid gap-5 sm:grid-cols-2">{[1, 2].map(i => <div key={i} className="h-56 animate-pulse rounded-2xl bg-black/5" />)}</div>;

  return (
    <div>
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => { handleDelete(confirmDeleteId); setConfirmDeleteId(null); }}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-6">
        <p className="text-sm font-semibold text-[#736B63] bg-stone-50 px-4 py-2 rounded-full">
          {addresses.length} saved address{addresses.length !== 1 ? "es" : ""}
        </p>
        <button onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-xs font-bold shadow-md cursor-pointer">
          <Plus size={16} /> Add New Address
        </button>
      </div>
      {!addresses.length ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-stone-50">
            <MapPin size={40} className="text-[#A39C93]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#2D2A26]">No saved addresses</p>
          <p className="mt-2 text-sm text-[#736B63]">Add an address to make checkout faster and easier.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {addresses.map(addr => (
            <div key={addr._id} className={`relative flex flex-col rounded-2xl border p-6 transition-all hover-lift ${addr.isDefault ? "border-emerald-600 bg-emerald-50/20 shadow-sm" : "border-black/5 bg-white hover:border-emerald-500/30 hover:bg-white"}`}>
              {addr.isDefault && (
                <span className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  <Check size={10} /> Default
                </span>
              )}
              <div className="mb-5">
                <span className="inline-block rounded-full bg-stone-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#736B63]">{addr.addressType || "Home"}</span>
              </div>
              <p className="text-xl font-bold text-[#2D2A26]">{addr.fullName}</p>
              <p className="mt-1 text-sm font-semibold text-[#736B63]">{addr.phone}</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#736B63]">
                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}<br />
                {addr.city}, {addr.state} – <span className="font-bold text-[#2D2A26]">{addr.pincode}</span>
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 border-t border-black/5 pt-5">
                <button onClick={() => { setEditing(addr); setDialogOpen(true); }}
                  className="flex w-full sm:w-auto flex-1 items-center justify-center gap-1.5 rounded-xl bg-white border border-black/10 px-4 py-2.5 text-xs font-bold text-[#2D2A26] hover:border-emerald-500 hover:text-emerald-700 transition-colors cursor-pointer">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => setConfirmDeleteId(addr._id)}
                  className="flex w-full sm:w-auto flex-1 items-center justify-center gap-1.5 rounded-xl bg-white border border-black/10 px-4 py-2.5 text-xs font-bold text-[#E53935] hover:border-[#E53935] hover:bg-[#E53935]/5 transition-colors cursor-pointer">
                  <Trash2 size={14} /> Delete
                </button>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr._id)}
                    className="flex w-full sm:w-auto flex-1 items-center justify-center rounded-xl bg-white border border-black/10 px-4 py-2.5 text-xs font-bold text-[#736B63] hover:border-emerald-500 hover:text-emerald-700 transition-colors cursor-pointer">
                    Make Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {dialogOpen && <AddressDialog open={dialogOpen} onClose={() => setDialogOpen(false)} existing={editing} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  );
}

/* ── Recently Viewed Tab ─────────────────────────────────── */
function RecentlyViewedTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentlyViewed()
      .then(d => setItems((d?.products || []).map(i => i.product).filter(Boolean)))
      .catch(() => { }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-black/5" />)}
    </div>
  );

  if (!items.length) return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-stone-50">
        <Clock size={40} className="text-[#A39C93]" />
      </div>
      <p className="font-serif text-2xl font-bold text-[#2D2A26]">No recently viewed products</p>
      <p className="mt-2 text-sm text-[#736B63]">Browse our collection and products will appear here.</p>
      <Link href="/shop" className="btn-primary mt-8 px-8 py-3.5 text-sm font-bold shadow-md cursor-pointer">Browse Collection</Link>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
      {items.map((product, i) => {
        const img = resolveMediaSrc(getProductImagePath(product));
        const name = getProductName(product);
        const price = getProductPrice(product);
        const href = getProductHref(product);
        return (
          <div key={product._id || i} className="group flex flex-col rounded-2xl border border-black/5 bg-white p-2 transition-all hover:border-emerald-500/30 hover:bg-white hover:shadow-lg hover:-translate-y-1">
            <Link href={href} className="relative block aspect-square overflow-hidden rounded-xl bg-stone-50 cursor-pointer">
              {img ? <Image src={img} alt={name} fill sizes="200px" className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                : <div className="flex h-full items-center justify-center text-[#A39C93]"><Package size={32} /></div>}
            </Link>
            <div className="p-4 flex flex-col flex-1">
              <p className="line-clamp-2 text-sm font-bold text-[#2D2A26]">{name}</p>
              <p className="mt-2 text-lg font-bold text-emerald-700">{formatCurrency(price)}</p>
              <Link href={href} className="btn-secondary mt-4 mt-auto w-full py-2.5 text-center text-xs font-bold shadow-sm cursor-pointer">
                View Product
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Notifications Tab ───────────────────────────────────── */
function NotificationsTab() {
  const [settings, setSettings] = useState({
    enabled: true,
    volume: 50,
    desktopEnabled: true,
    orderNotifications: true,
    offerNotifications: true,
    promoNotifications: true
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('notificationSettings');
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings(JSON.parse(stored));
      }
    } catch (e) { }
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));

    if (key === 'volume' || (key === 'enabled' && value)) {
      import('@/utils/notificationSound').then(({ playNotification }) => {
        playNotification();
      });
    }

    if (key === 'desktopEnabled' && value) {
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-6">

        {/* Sound Settings */}
        <div>
          <h3 className="font-serif text-xl font-bold text-[#2D2A26] mb-6">Sound Settings</h3>
          <div className="space-y-6 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#2D2A26]">Enable Notification Sound</p>
                <p className="text-xs font-medium text-[#736B63] mt-1">Play a sound when you receive a notification</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" checked={settings.enabled} onChange={(e) => updateSetting('enabled', e.target.checked)} />
                <div className="peer h-7 w-12 rounded-full bg-black/10 after:absolute after:left-[3px] after:top-[3px] after:h-[22px] after:w-[22px] after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-[20px] peer-focus:outline-none"></div>
              </label>
            </div>

            <div className={`transition-opacity ${settings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'} border-t border-black/5 pt-6`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-[#2D2A26]">Volume Level</p>
                <p className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">{settings.volume}%</p>
              </div>
              <input
                type="range" min="0" max="100" value={settings.volume}
                onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                onMouseUp={(e) => updateSetting('volume', parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Desktop Notifications */}
        <div>
          <h3 className="font-serif text-xl font-bold text-[#2D2A26] mb-6 mt-10">System Preferences</h3>
          <div className="rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[#2D2A26]">Enable Desktop Notifications</p>
                <p className="text-xs font-medium text-[#736B63] mt-1">Show rich notifications directly on your device</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" checked={settings.desktopEnabled} onChange={(e) => updateSetting('desktopEnabled', e.target.checked)} />
                <div className="peer h-7 w-12 rounded-full bg-black/10 after:absolute after:left-[3px] after:top-[3px] after:h-[22px] after:w-[22px] after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-[20px] peer-focus:outline-none"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Email Preferences */}
        <div>
          <h3 className="font-serif text-xl font-bold text-[#2D2A26] mb-6 mt-10">Email Subscriptions</h3>
          <div className="space-y-6 rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
            {[
              { id: 'orderNotifications', title: 'Order Updates', desc: 'Real-time status of your orders and deliveries' },
              { id: 'offerNotifications', title: 'Exclusive Offers', desc: 'Special VIP offers, discounts, and price drops' },
              { id: 'promoNotifications', title: 'New Collections', desc: 'Be the first to know about new products' }
            ].map((pref, i) => (
              <div key={pref.id} className={`flex items-center justify-between ${i !== 0 ? 'border-t border-black/5 pt-6' : ''}`}>
                <div>
                  <p className="text-sm font-bold text-[#2D2A26]">{pref.title}</p>
                  <p className="text-xs font-medium text-[#736B63] mt-1">{pref.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" checked={settings[pref.id]} onChange={(e) => updateSetting(pref.id, e.target.checked)} />
                  <div className="peer h-7 w-12 rounded-full bg-black/10 after:absolute after:left-[3px] after:top-[3px] after:h-[22px] after:w-[22px] after:rounded-full after:border after:border-white after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-[20px] peer-focus:outline-none"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Main Account Page ───────────────────────────────────── */
const TABS = [
  { id: "profile", label: "Profile Details", icon: User },
  { id: "orders", label: "Order History", icon: Package },
  { id: "addresses", label: "Saved Addresses", icon: MapPin },
  { id: "recent", label: "Recently Viewed", icon: Clock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("userToken")) {
      router.push("/login?redirect=/account");
    }
  }, [router]);

  async function handleLogout() {
    if (typeof window !== "undefined") {
      try {
        await logoutUser();
      } catch (err) {
        console.error("Logout API failed", err);
      }
      localStorage.removeItem("userToken");
      playMessage();
      toast.success("Signed out successfully");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  }

  return (
    <div className="min-h-screen pb-24 pt-20 page-shell">
      {/* Header */}
      <div className="relative px-6 py-10 md:px-10">
        <div className="mx-auto max-w-[1440px] flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">My Account</p>
            <h1 className="font-serif text-3xl font-bold text-[#2D2A26] md:text-3xl">Account Dashboard</h1>
          </motion.div>
          <button onClick={handleLogout}
            className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 sm:px-5 sm:py-2.5 text-xs font-bold text-[#2D2A26] hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all hover-lift shadow-sm cursor-pointer">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-6 pb-10 md:px-10">
        <div className="flex flex-col gap-8 lg:flex-row">

          {/* Sidebar */}
          <aside className="lg:w-[280px] shrink-0 self-start sticky top-20 lg:top-28 z-30 w-full">
            <div className="bg-white lg:bg-transparent -mx-6 px-6 pt-2 pb-4 lg:mx-0 lg:px-0 lg:pt-0 lg:pb-0">
              <nav className="flex flex-row lg:flex-col gap-3 lg:gap-2 overflow-x-auto overflow-y-auto pb-4 lg:pb-0 max-h-[calc(100vh-120px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`group flex shrink-0 items-center justify-between rounded-full lg:rounded-2xl px-5 py-3 lg:px-6 lg:py-4 text-sm font-bold transition-all ${activeTab === tab.id
                        ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                        : "text-[#736B63] bg-black/5 lg:bg-transparent hover:bg-white hover:text-[#2D2A26] hover:shadow-sm"
                      } cursor-pointer`}>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <tab.icon size={18} className={activeTab === tab.id ? "text-emerald-300" : "text-[#A39C93] group-hover:text-emerald-300"} />
                      {tab.label}
                    </div>
                    {activeTab === tab.id && <ChevronRight size={16} className="hidden lg:block opacity-70" />}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="surface-card min-h-[600px] p-5 sm:p-10 lg:p-12"
            >
              <h2 className="mb-8 lg:mb-10 font-serif text-2xl sm:text-3xl font-bold text-[#2D2A26]">
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
              {activeTab === "profile" && <ProfileTab />}
              {activeTab === "orders" && <OrdersTab />}
              {activeTab === "addresses" && <AddressesTab />}
              {activeTab === "recent" && <RecentlyViewedTab />}
              {activeTab === "notifications" && <NotificationsTab />}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
