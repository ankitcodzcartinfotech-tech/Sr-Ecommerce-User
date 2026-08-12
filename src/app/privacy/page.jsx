import PageHero from "@/components/common/PageHero";

export default function PrivacyPage() {
  return (
    <div className="page-shell pb-20">
      <PageHero
        eyebrow="Privacy"
        title="Your privacy matters while you browse and shop with Keshrag."
        description="This placeholder policy page keeps footer navigation working cleanly. You can replace this copy with your formal privacy notice whenever you are ready."
        primaryAction={{ href: "/contact", label: "Contact Support" }}
        secondaryAction={{ href: "/", label: "Return Home", variant: "outline" }}
      />
    </div>
  );
}
