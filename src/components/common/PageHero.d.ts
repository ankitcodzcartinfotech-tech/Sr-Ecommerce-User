declare module "@/components/common/PageHero" {
  interface PageHeroAction {
    href: string;
    label: string;
    variant?: string;
  }

  interface PageHeroProps {
    eyebrow?: string;
    title: string;
    description?: string;
    primaryAction?: PageHeroAction | null;
    secondaryAction?: PageHeroAction | null;
  }

  export default function PageHero(props: PageHeroProps): JSX.Element;
}
