// import { Logo } from "#/ui/icons";
import {
  RiBarChartBoxLine,
  RiBuilding4Line,
  RiBuildingLine,
  RiFileChartLine,
  RiSettings4Line,
  RiTeamLine,
} from "@remixicon/react";
import { allHelpPosts } from "content-collections";

export const BLOG_CATEGORIES = [
  {
    title: "Om Advanti",
    slug: "company",
    description:
      "Hold deg oppdatert med de siste nyhetene og innsiktene fra Advanti. Bli kjent med vårt firma, våre verdier, og teamet av eksperter i Nord-Norge.",
  },
  {
    title: "Verdivurdering",
    slug: "valuation",
    description:
      "Metoder og innsikt for verdivurdering av næringseiendom, inkludert DCF-modeller og sensitivitetsanalyse.",
  },
  {
    title: "Markedsanalyse",
    slug: "market-analysis",
    description:
      "Dyptgående markedsanalyser og trender i det norske næringseiendomsmarkedet, med fokus på Nord-Norge.",
  },
  {
    title: "Kundehistorier",
    slug: "casestudies",
    description:
      "Suksesshistorier fra våre kunder – eiendomsbesittere, investorer og utviklere som har jobbet med Advanti.",
  },
];

export const POPULAR_ARTICLES = [
  "hva-er-advanti",
  "hva-er-yield",
  "netto-leieinntekter",
  "sensitivitetsanalyse",
];

export const HELP_CATEGORIES: {
  title: string;
  slug:
    | "overview"
    | "getting-started"
    | "terms"
    | "for-investors"
    | "analysis"
    | "valuation";
  description: string;
  icon: JSX.Element;
}[] = [
  {
    title: "Om Advanti",
    slug: "overview",
    description:
      "Advanti er din ekspertpartner for rådgivning innen næringseiendom i Nord-Norge.",
    icon: <RiBuilding4Line className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Kom i gang",
    slug: "getting-started",
    description:
      "Ny hos Advanti? Her finner du alt du trenger for å komme i gang med våre tjenester: verdivurdering, salg, utleie og strategisk rådgivning.",
    icon: <RiBarChartBoxLine className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Begreper",
    slug: "terms",
    description:
      "Forstå nøkkelbegreper og fagterminologi innen næringseiendom. Vår guide dekker alt fra verdivurdering til markedsanalyse for bedre innsikt.",
    icon: <RiBuildingLine className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "For Investorer",
    slug: "for-investors",
    description:
      "Invester i Nord-Norges næringseiendom med Advanti. Få spesialisert rådgivning, markedsanalyse og strategier for din portefølje og investeringsbeslutninger.",
    icon: <RiFileChartLine className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Markedsanalyse",
    slug: "analysis",
    description:
      "Utforsk hvordan Advanti analyserer markedsdata og trender i Nord-Norges næringseiendom. Få innsikt som styrker dine eiendomsbeslutninger.",
    icon: <RiTeamLine className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Verdivurdering",
    slug: "valuation",
    description:
      "Dypdykk i metoder for verdivurdering av næringseiendom. Lær om DCF-modeller, yield-beregning og hvordan Advanti sikrer presise verdivurderinger.",
    icon: <RiSettings4Line className="h-6 w-6 text-gray-500" />,
  },
];

export const getPopularArticles = () => {
  const popularArticles = POPULAR_ARTICLES.map((slug) => {
    const post = allHelpPosts.find((post) => post.slug === slug);
    if (!post) {
      console.warn(`Popular article with slug "${slug}" not found`);
    }
    return post;
  }).filter((post) => post != null);

  return popularArticles;
};
