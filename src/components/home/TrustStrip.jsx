import { Truck, Gem, RotateCcw, ShieldCheck } from "lucide-react";

const items = [
  { icon: Truck,       label: "Free Shipping",    sub: "On orders above ₹2,500" },
  { icon: Gem,         label: "Handcrafted",       sub: "Premium artisan quality" },
  { icon: ShieldCheck, label: "Secure Payments",   sub: "100% safe transactions" },
  { icon: RotateCcw,   label: "7 Day Returns",     sub: "Hassle-free returns" },
];

export default function TrustStrip() {
  return (
    <div className="relative z-20 border-y border-stone-100 bg-white py-8 sm:py-10 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-2 gap-y-10 gap-x-4 lg:grid-cols-4 lg:gap-y-0 lg:gap-x-0">
          {items.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={label}
              className={`group flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8 ${
                i !== 3 ? "lg:border-r border-stone-200" : ""
              }`}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FAF9F6] border border-stone-100 transition-all duration-500 group-hover:scale-110 group-hover:border-[#e88436]/30 group-hover:bg-white group-hover:shadow-[0_0_20px_rgba(200,154,90,0.15)]">
                <Icon size={20} className="text-[#e88436] transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-900 transition-colors duration-300 group-hover:text-[#e88436]">
                  {label}
                </p>
                <p className="mt-1.5 text-xs text-stone-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
