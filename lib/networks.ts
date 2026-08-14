export type NetworkSlug = "family" | "wellness" | "commuter";

export type Network = {
  slug: NetworkSlug;
  name: string;
  /** Name broken for the homepage doorway cards. */
  nameLines: [string, string];
  color: string;
  tag: string;
  /** One-line promise, used on cards and detail lead. */
  line: string;
  /** Where the screens sit — used on the networks index. */
  blurb: string;
  desc: string;
  places: string[];
  reach: string[];
  /** Sample slide copy shown on the device mockup. */
  sample: string;
};

export const NETWORKS: Record<NetworkSlug, Network> = {
  family: {
    slug: "family",
    name: "Family & Parent",
    nameLines: ["Family &", "Parent"],
    color: "#D9705E",
    tag: "NETWORK 01",
    line: "Reach families where everyday life happens.",
    blurb: "Pizza nights, karate lobbies, corner markets.",
    desc: "Screens inside the places parents already are — the pizza night spot, the karate studio lobby, the corner market. Household decisions get made in these rooms.",
    places: [
      "Family restaurants & pizzerias",
      "Kids activity & tutoring centers",
      "Community markets & delis",
      "Pediatric & family care waiting rooms",
    ],
    reach: ["Parents 25–45", "Household decision-makers", "Weekly repeat visitors"],
    sample: "Fall swim classes — enroll by Friday",
  },
  wellness: {
    slug: "wellness",
    name: "Health & Wellness",
    nameLines: ["Health &", "Wellness"],
    color: "#3FA98A",
    tag: "NETWORK 02",
    line: "Reach people actively investing in themselves.",
    blurb: "Gyms, studios, salons, care waiting rooms.",
    desc: "Screens in gyms, studios, salons and care settings — moments when people are already thinking about how they look, feel, and spend on themselves.",
    places: [
      "Gyms & fitness studios",
      "Salons & barbershops",
      "Physical therapy & chiropractic",
      "Spas & wellness clinics",
    ],
    reach: ["Health-motivated adults", "Self-care spenders", "Members on recurring visits"],
    sample: "New member month — first class free",
  },
  commuter: {
    slug: "commuter",
    name: "Commuter & Driver",
    nameLines: ["Commuter &", "Driver"],
    color: "#6E9BE8",
    tag: "NETWORK 03",
    line: "Reach people mid-errand, wallet in hand.",
    blurb: "Gas, convenience, coffee, auto service.",
    desc: "Screens at gas stations, convenience stores and auto shops — short dwell, high frequency, and a purchase already underway.",
    places: [
      "Convenience stores",
      "Gas stations",
      "Auto service & car washes",
      "Quick-serve coffee & food",
    ],
    reach: ["Daily drivers & commuters", "Cash-in-hand foot traffic", "High-frequency repeat stops"],
    sample: "2 coffees · $4 before 9am",
  },
};

export const NETWORK_ORDER: NetworkSlug[] = ["family", "wellness", "commuter"];

export const NETWORK_LIST: Network[] = NETWORK_ORDER.map((slug) => NETWORKS[slug]);
