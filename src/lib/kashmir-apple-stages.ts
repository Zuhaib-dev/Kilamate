export interface PhenologicalStage {
  id: string;
  name: string;
  sprayNo: string;
  emoji: string;
  months: number[];
  monthLabel: string;
  beeFriendly: boolean;
  accent: string;
  fertilizer: string[];
  practices: string[];
  insecticide: string[];
  fungicide: string[];
}

export const KASHMIR_APPLE_STAGES: PhenologicalStage[] = [
  {
    id: "delayedDormancy",
    name: "Delayed Dormancy",
    sprayNo: "1st",
    emoji: "🌿",
    months: [1, 2], // Feb/Mar
    monthLabel: "Late Feb - Early Mar",
    beeFriendly: true,
    accent: "#a8a29e",
    fertilizer: ["X"],
    practices: [
      "Ensure Proper Training & pruning.",
      "Ensure orchard sanitation.",
      "Ensure proper drainage in orchards.",
      "Staking of newly planted fruit trees.",
      "Spray urea @ 5% on orchard floor for early decomposition of over wintered fallen leaves."
    ],
    insecticide: [
      "Horticulture Mineral oil (2 lit.) / Oil per 100 litres of water",
      "Do not spray HMO beyond Green Tip Stage"
    ],
    fungicide: ["X"]
  },
  {
    id: "greenTip",
    name: "Green Tip",
    sprayNo: "2nd",
    emoji: "🌱",
    months: [2], // Mar
    monthLabel: "March",
    beeFriendly: true,
    accent: "#4ade80",
    fertilizer: ["Apply recommended dose of well decomposed FYM & fertilizers (1/3rd dose of Urea, full dose of DAP & ½ dose of MOP) as per age of tree"],
    practices: [
      "Monitor plant growth. If any tree fails to produce new leaves, inspect the roots",
      "Use Trichoderma harzianum/viride for new plantations and as drench treatment for established orchards",
      "Maintain the graft union a 6 inch above the soil surface",
      "Avoid injury to collar region of the tree during cultural operations",
      "Provide staking to newly planted fruit trees",
      "Ensure proper drainage & sanitation in orchards"
    ],
    insecticide: ["X"],
    fungicide: [
      "Avoid spraying any fungicide if weather remains dry for next 7 days.",
      "Spray any of the following fungicides before the onset of severe rains:",
      "• Mancozeb 75 WP (300g)",
      "• Captan 50 WP (300g)",
      "• Propineb 70 WP (300g)",
      "• Zineb 75 WP (300g)",
      "• Metiram 70 WG (300g)",
      "• Code 539 (Dithianon 70WG) @ 300g"
    ]
  },
  {
    id: "tightCluster",
    name: "Tight Cluster",
    sprayNo: "3rd",
    emoji: "🥦",
    months: [2, 3], // Mar/Apr
    monthLabel: "Late March - Early April",
    beeFriendly: true,
    accent: "#3b82f6",
    fertilizer: ["X"],
    practices: [
      "Regular inspection of orchard trunks/branches for canker symptoms",
      "Don't spray any fungicides, if weather is dry for next 7 days"
    ],
    insecticide: ["X"],
    fungicide: [
      "Avoid spraying any fungicide if weather remains dry for next 7 days.",
      "In case of rain forecast, spray any before onset of rains:",
      "• Captan 50 WP (300g)",
      "• Propineb 70 WP (300g)",
      "• Zineb 75 WP (300g)",
      "• Metiram 70 WG (300g)"
    ]
  },
  {
    id: "pinkBud",
    name: "Pink Bud",
    sprayNo: "4th",
    emoji: "🌸",
    months: [3], // April
    monthLabel: "April",
    beeFriendly: true,
    accent: "#f472b6",
    fertilizer: ["Need Based: Foliar application of Boron (1-1.5g/ litre)"],
    practices: [
      "Crucial stage for primary scab infection.",
      "Don't allow water stagnation in the orchards.",
      "Keep orchards clean and free from any crop debris.",
      "Introduce 3-4 bee hives per hectare for effective pollination at 5-10 % bloom.",
      "De-weeding of tree basins & mowing."
    ],
    insecticide: [
      "Need Based for Insects:",
      "• If HMO spray is missed: Chlorpyriphos 20 EC (100 ml)",
      "• For Blossom Thrips/Leaf Roller: Thiacloprid 21.7 SC (40 ml)"
    ],
    fungicide: [
      "If dry, try to spray fungicide when majority of flowers are at pink stage:",
      "• Zineb (68%) + Hexaconazole (5%) (125g)",
      "• Metiram (55%) + Pyraclostrobin (5%) 60 WG (100g)",
      "• Dodine 65 WP/40SC"
    ]
  },
  {
    id: "flowering",
    name: "Flowering Stage",
    sprayNo: "5th",
    emoji: "🐝",
    months: [3, 4], // Apr/May
    monthLabel: "7-10 days after Pink Bud",
    beeFriendly: false, // Danger!
    accent: "#facc15",
    fertilizer: ["X"],
    practices: [
      "Introduce 3-4 bee hives per hectare for effective pollination.",
      "Mow weeds to keep bees on the trees.",
      "Avoid washing of trees with sprays.",
      "Try to apply sprays in mist form."
    ],
    insecticide: ["X"],
    fungicide: [
      "Spraying is not advisable during flowering. However, if there is 10 days fungicidal gap and heavy rains are forecasted:",
      "• Mancozeb 75 WP (300g) or Captan 50 WP (300g)"
    ]
  },
  {
    id: "petalFall",
    name: "Petal Fall Stage",
    sprayNo: "6th",
    emoji: "🍃",
    months: [4], // May
    monthLabel: "May",
    beeFriendly: true,
    accent: "#34d399",
    fertilizer: ["Foliar application of Boron (1-1.5g/ litre) if not done at pink bud stage"],
    practices: [
      "Scout orchards, check lower side of leaves.",
      "Remove all the scab infected leaves before onset of rains.",
      "Mulching should be done, wherever needed."
    ],
    insecticide: [
      "Need Based for Insects: Neem oil (1500 ppm) @ 300ml Or Chlorpyriphos 20 EC",
      "Need Based for Mites: Etoxazole/Hexythiazox"
    ],
    fungicide: [
      "Spray any of the following fungicides before rains:",
      "• Difenaconazole 25EC (30ml)",
      "• Flusilazole 40EC (20ml)",
      "• Penconazole 10EC (50ml)"
    ]
  },
  {
    id: "fruitLet",
    name: "Fruit Let Stage",
    sprayNo: "7th",
    emoji: "🍏",
    months: [4, 5], // May/Jun
    monthLabel: "10-14 days after Petal Fall",
    beeFriendly: true,
    accent: "#84cc16",
    fertilizer: ["X"],
    practices: [
      "Thinning of fruit in case of heavy fruit set (NAA @5-10 ppm).",
      "White washing of fruit tree trunks.",
      "Remove young shoots affected with powdery mildew.",
      "Cut orchard grass to reduce humidity."
    ],
    insecticide: [
      "For Insects: Quinalphos 25 EC or Chlorpyriphos 20 EC",
      "Fruit Borer: Mass trapping of adults",
      "For Mites: Hexythiazox 5.45EC"
    ],
    fungicide: [
      "Spray any fungicides before rains:",
      "• Zineb (68%) + Hexaconazole (5%) (125g)",
      "• Dodine 65 WP 60g",
      "• Tebuconazole 38.9% SC (40 ml)"
    ]
  },
  {
    id: "fruitDev1",
    name: "Fruit Development I",
    sprayNo: "8th",
    emoji: "🍎",
    months: [5], // Jun
    monthLabel: "June",
    beeFriendly: true,
    accent: "#ef4444",
    fertilizer: [
      "Application of second dose of fertilizers (1/3 of Urea and remaining ½ dose of MOP)",
      "Foliar spray of calcium chloride 3-4g/litre"
    ],
    practices: [
      "If dry & hot, apply organic mulches to retain soil moisture.",
      "White wash tree trunks to protect them from sunburn.",
      "De-weeding of tree basins."
    ],
    insecticide: [
      "Need Based for Insects: Neem oil (1500 ppm) @ 300ml Or Chlorpyriphos 20 EC",
      "Need Based for Mites (> 10 mites/leaf): Hexythiazox 5.45 EC"
    ],
    fungicide: [
      "If rain forecasted, spray:",
      "• Mancozeb 75 WP (300g)",
      "• Captan 50 WP (300g)",
      "• Zineb 75 WP (300g)"
    ]
  },
  {
    id: "fruitDev2",
    name: "Fruit Development II",
    sprayNo: "9th",
    emoji: "🍎",
    months: [5, 6], // Jun/Jul
    monthLabel: "12-15 days after Fruit Dev I",
    beeFriendly: true,
    accent: "#e11d48",
    fertilizer: ["Second spray of calcium chloride (3-4 g) / litre of water"],
    practices: [
      "Monitor plant growth for disease.",
      "Maintain low mite population for avoiding Alternaria.",
      "Irrigate orchards as per requirement.",
      "De-weeding."
    ],
    insecticide: [
      "For Insects: Chlorpyriphos 20 EC (100 ml) Or Summer Spray Oil (750 ml)",
      "Fruitfly: Install Methyl eugenol traps",
      "For Mites: Hexythiazox 5.45 EC"
    ],
    fungicide: [
      "If rain forecasted, spray:",
      "• Difenaconazole 25EC (30ml)",
      "• Penconazole 10EC (50ml)"
    ]
  },
  {
    id: "fruitDev3",
    name: "Fruit Development III",
    sprayNo: "10th",
    emoji: "🍎",
    months: [6], // Jul
    monthLabel: "12-15 days after Fruit Dev II",
    beeFriendly: true,
    accent: "#be123c",
    fertilizer: [
      "Apply remaining 1/3 of Urea",
      "Third spray of calcium chloride (3-4) g /litre",
      "Need Based: Foliar spray of Potassium sulphate 4-5 g/litre for colour development."
    ],
    practices: [
      "Avoid spraying under wet and hot conditions.",
      "Remove water shoots to reduce Alternaria.",
      "Keep aphids below threshold level.",
      "Staking of heavy fruit laden branches."
    ],
    insecticide: [
      "Need Based for Insects: Chlorpyriphos 20 EC (100 ml)",
      "Fruitfly: Install Methyl eugenol traps",
      "Need Based for Mites: Fenazaquin 10 EC (40 ml)"
    ],
    fungicide: [
      "If rain forecasted, spray before rains:",
      "• Mancozeb 75 WP (300g)",
      "• Ziram 80 WP (200g)",
      "• Chlorothalonil 75 WP (150g)"
    ]
  },
  {
    id: "fruitDev4",
    name: "Fruit Development IV",
    sprayNo: "11th",
    emoji: "🍎",
    months: [7], // Aug
    monthLabel: "August",
    beeFriendly: true,
    accent: "#9f1239",
    fertilizer: ["X"],
    practices: [
      "Cut the orchard grass to reduce humidity.",
      "Avoid spraying immediately after heavy rains.",
      "Orchard sanitation including collection of fallen fruit.",
      "Irrigate orchards as per requirement."
    ],
    insecticide: ["X"],
    fungicide: [
      "If Alternaria Leaf Blotch or Scab, spray:",
      "• Zineb (68%) + Hexaconazole (4%) 72 WP (125g)",
      "• Hexaconazole 5EC (50ml)",
      "For Sooty blotch or Fly speck:",
      "• Ziram 27 SC (600ml) or Propineb 70 WP (300g)"
    ]
  },
  {
    id: "preHarvest",
    name: "Pre-harvest",
    sprayNo: "12th",
    emoji: "🧺",
    months: [7, 8], // Aug/Sep
    monthLabel: "Pre-Harvest",
    beeFriendly: true,
    accent: "#f59e0b",
    fertilizer: [
      "Need Based:",
      "• Naphthalene acetic acid (10ppm) for controlling pre harvest fruit drop",
      "• 2-4 foliar spray of potassium sulphate @ 4-5g /litre for colour development",
      "• Spray calcium chloride @ 3-4 g/litre for increasing storage life"
    ],
    practices: [
      "Cut the orchard grass.",
      "Remove water-shoots to reduce humidity."
    ],
    insecticide: ["X"],
    fungicide: [
      "For long term storage, spray 15-20 days before harvesting:",
      "• Captan 50 WP (300g)",
      "• Propineb 70 WP (300g)",
      "• Ziram 80 WP (200g)"
    ]
  },
  {
    id: "harvesting",
    name: "Harvesting Stage",
    sprayNo: "13th",
    emoji: "📦",
    months: [8, 9], // Sep/Oct
    monthLabel: "Harvest Time",
    beeFriendly: true,
    accent: "#ea580c",
    fertilizer: ["X"],
    practices: [
      "Maturity indices to lookup:",
      "• Starch index test (0- 6.0 scale): 2.5 for CA Storage; 3.5 for table purpose",
      "• Ease of separation of the fruit from spur",
      "• Fruit skin colour >75% Red",
      "• TSS: 12 to 14 Brix",
      "• Seed colour: >75% dark brown"
    ],
    insecticide: ["X"],
    fungicide: ["X"]
  },
  {
    id: "postHarvest",
    name: "Post-Harvest",
    sprayNo: "14th",
    emoji: "🍂",
    months: [9, 10], // Oct/Nov
    monthLabel: "October - November",
    beeFriendly: true,
    accent: "#c2410c",
    fertilizer: [
      "Foliar application of Urea @2-3 % 2 weeks after harvest",
      "Foliar application of Zinc @3g/litre (Need based)"
    ],
    practices: [
      "Ensure collection and destruction of fallen leaves, mummified fruits, pruned snag.",
      "Spray post-harvest 3-4% urea when 50% leaves turn yellow naturally.",
      "Staking/tying of branches to prevent snow damage.",
      "Tightening of trellis wires in HDP."
    ],
    insecticide: [
      "Need Based for Insects: Chlorpyriphos 20 EC (100 ml)",
      "Essential Spray: Quinalphos 25 EC (100 ml) in areas where apple blotch leaf miner is a problem"
    ],
    fungicide: ["X"]
  },
  {
    id: "dormancy",
    name: "Dormancy",
    sprayNo: "15th",
    emoji: "❄️",
    months: [11, 0, 1], // Dec/Jan/Feb
    monthLabel: "Winter",
    beeFriendly: true,
    accent: "#94a3b8",
    fertilizer: ["X"],
    practices: [
      "Prune virus infected plants last.",
      "Rogue infected plants.",
      "Apply fungicidal paint/ paste to pruning wounds.",
      "If urea spray was missed, spray Urea @ 5% on orchard floor for early decomposition of fallen leaves."
    ],
    insecticide: ["X"],
    fungicide: ["X"]
  }
];
