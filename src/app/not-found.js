import PageHero from "@/components/common/PageHero";

export default function NotFound() {
  return (
    <div className="page-shell pb-20">
      <PageHero
        eyebrow="Page Not Found"
        title="We could not find the page you were looking for."
        description="The link may have changed, or the page may still be on its way. You can continue browsing the collection or head back to the home page."
        primaryAction={{ href: "/shop", label: "Browse the Shop" }}
        secondaryAction={{ href: "/", label: "Back Home" }}
      />
    </div>
  );
}
