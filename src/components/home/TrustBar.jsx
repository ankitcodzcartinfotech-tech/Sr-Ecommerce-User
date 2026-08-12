import { Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const features = [
  {
    icon: Sparkles,
    title: "Premium Finish",
    text: "Curated pieces with rich textures, polished fall, and elevated detailing.",
  },
  {
    icon: Leaf,
    title: "Thoughtful Fabrics",
    text: "Silk, cotton, organza, and festive blends selected for comfort and drape.",
  },
  {
    icon: Truck,
    title: "Fast Dispatch",
    text: "Reliable shipping across India with careful packaging that feels gift-ready.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Support",
    text: "Responsive help for orders, styling questions, and post-purchase assistance.",
  },
];

export default function TrustBar() {
  return (
    <section className="bg-[rgba(255,255,255,0.42)] px-6 py-24 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1440px]">
        <SectionHeading
          title="Why Women Choose Keshrag"
          subtitle="A premium storefront experience built around quality, ease, and lasting wardrobe value."
          eyebrow="Why Keshrag"
          className="mb-14"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((item) => (
            <div key={item.title} className="surface-card rounded-[28px] p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--gold-soft) text-stone-900">
                <item.icon size={24} className="stroke-[1.5]" />
              </div>
              <h3 className="mt-6 text-xl text-stone-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-(--muted)">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
