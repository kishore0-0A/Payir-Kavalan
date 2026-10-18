// Comprehensive Agronomic Medicine, Prevention, Action Plan, and Future Prognosis Knowledge Base
// Specially tailored for Indian & Global farmers with commercial & organic medicine recommendations, dosage, prevention schedules, and future timeline forecasts.

export const DISEASE_ACTION_GUIDES = {
  // Tomato Bacterial Spot
  "Tomato - Bacterial Spot (Xanthomonas perforans)": {
    medicines: [
      {
        name: "Copper Oxychloride 50% WP (e.g., Blitox / Blue Copper)",
        type: "Chemical Bactericide / Fungicide",
        dosage: "2.5 g to 3.0 g per 1 Litre of water (approx. 40-50 g per 15L backpack pump)",
        timing: "Early morning (6:00 AM - 8:30 AM) or cool late evening",
        preHarvestInterval: "3 to 5 days before harvesting",
        instructions: "Ensure uniform misting across leaf undersides. Do not mix with acidic foliar fertilizers."
      },
      {
        name: "Streptocycline (Streptomycin sulphate + Tetracycline)",
        type: "Antibacterial formulation",
        dosage: "1 g in 10 Litres of water mixed with Copper Oxychloride",
        timing: "Spray at first signs of watersoaked lesions",
        preHarvestInterval: "7 days",
        instructions: "Curative application. Limit to max 2 sprays per season to avoid bacterial resistance."
      },
      {
        name: "Pseudomonas fluorescens 1% WP (Bio-bactericide)",
        type: "Organic / Biological Control",
        dosage: "5 g per 1 Litre of water (or 1 kg per acre via drenching/foliar)",
        timing: "Every 10-14 days as preventative & mild curative spray",
        preHarvestInterval: "0 days (Eco-safe, residue free)",
        instructions: "Apply during cloud cover or late afternoon. Compatible with organic farming."
      }
    ],
    immediateActions: [
      "Prune and safely bag all severely infected lower leaves; do not drop leaves on field soil.",
      "Immediately pause overhead sprinkler irrigation; switch strictly to drip or furrows to stop bacterial splash.",
      "Disinfect all pruning shears with 70% isopropyl alcohol or 10% household bleach between rows."
    ],
    preventionStrategy: [
      "Use certified disease-free hot-water treated seeds or bactericide-treated nursery seedlings.",
      "Strict 2-year crop rotation with non-solanaceous crops (e.g., maize, beans, marigold, millets).",
      "Mulch soil around plants with dry paddy straw or silver-black plastic mulch to block soil splashing.",
      "Maintain wide spacing (minimum 60 cm between plants) for rapid canopy drying after morning dew."
    ],
    futurePossibilities: {
      prognosis: "Favorable if caught early; high risk of fruit defoliation and sunken fruit lesions if untreated under warm humid conditions.",
      day3to5: "Active lesions cease expanding and begin drying into crusty papery spots; no new yellow halos should appear on upper shoots.",
      day7to14: "New emerging foliage remains clean and green; plant initiates normal flowering if secondary infection is halted.",
      warningSign: "If lesions spread to tomato green fruits or cause premature flower dropping, request an expert agronomic visit."
    }
  },

  // Tomato Early Blight
  "Tomato - Early Blight (Alternaria solani)": {
    medicines: [
      {
        name: "Mancozeb 75% WP (e.g., Dithane M-45 / Indofil M-45)",
        type: "Contact Protectant Fungicide",
        dosage: "2.0 g to 2.5 g per 1 Litre of water",
        timing: "Spray immediately upon spotting bullseye spots; repeat every 7-10 days",
        preHarvestInterval: "5 days",
        instructions: "Forms a multi-site protective shield over leaf cuticle. Excellent preventer of spore germination."
      },
      {
        name: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (e.g., Amistar Top)",
        type: "Systemic Curative Fungicide",
        dosage: "1.0 ml per 1 Litre of water (15 ml per 15L pump)",
        timing: "Curative spray when concentric ring lesions are expanding",
        preHarvestInterval: "3 days",
        instructions: "Systemic translaminar action penetrates deep into infected leaf tissue to stop mycelium growth."
      },
      {
        name: "Trichoderma viride / harzianum 1% WP (Bio-fungicide)",
        type: "Organic / Biological Control",
        dosage: "5 g per 1 Litre of water foliar spray or 2 kg/acre mixed in FYM",
        timing: "Preventative before rainy spell or early vegetative stage",
        preHarvestInterval: "0 days",
        instructions: "Colonizes plant surface and outcompetes Alternaria spores naturally."
      }
    ],
    immediateActions: [
      "Strip off the lowest 3 to 4 branches/leaves that touch the soil or show concentric brown rings.",
      "Clear fallen leaf debris from beneath the plants and incinerate or bury outside the farm boundary.",
      "Stake and tie tomato vines upright to promote maximum air circulation."
    ],
    preventionStrategy: [
      "Apply 3 to 4 inches of organic mulch (straw or shredded bark) around the base to prevent rain-splashes.",
      "Ensure balanced potassium (K) nutrition; high nitrogen with low potassium makes leaves highly vulnerable.",
      "Water exclusively at soil level early in the day so foliage remains dry through the night."
    ],
    futurePossibilities: {
      prognosis: "Very manageable with systemic-contact rotation; plant recovery rate > 90% when treated early.",
      day3to5: "Concentric target lesions turn dark, dry, and brittle without yellowish halo expansion.",
      day7to14: "Foliage recovery evident; canopy density stabilizes; fruit yield protected from sunscald.",
      warningSign: "Stems developing dark collar-rot girdles near the soil line indicates severe systemic decline."
    }
  },

  // Tomato Late Blight
  "Tomato - Late Blight (Phytophthora infestans)": {
    medicines: [
      {
        name: "Metalaxyl 8% + Mancozeb 64% WP (e.g., Ridomil Gold)",
        type: "Systemic + Contact Oomycete Fungicide",
        dosage: "2.5 g per 1 Litre of water (approx. 35-40 g per 15L pump)",
        timing: "Spray immediately! Do not delay when cool humid weather prevails",
        preHarvestInterval: "7 days",
        instructions: "Curative & translaminar. Rapidly absorbed into vascular tissues within 30 minutes."
      },
      {
        name: "Cymoxanil 8% + Mancozeb 64% WP (e.g., Curzate)",
        type: "Fast Knockdown Curative Fungicide",
        dosage: "2.0 g to 2.5 g per 1 Litre of water",
        timing: "Follow up 5 to 7 days after first systemic spray to prevent fungal resistance",
        preHarvestInterval: "7 days",
        instructions: "Penetrates plant tissue to halt active sporulation within 48 hours."
      },
      {
        name: "Copper Hydroxide 53.8% DF (e.g., Kocide)",
        type: "Protective Surface Barrier",
        dosage: "2.0 g per 1 Litre of water",
        timing: "Protective spray across neighboring healthy blocks",
        preHarvestInterval: "3 days",
        instructions: "Forms dense copper ion coverage preventing new spore penetration."
      }
    ],
    immediateActions: [
      "EMERGENCY ACTION: Late blight is fast-moving. Inspect the entire field immediately.",
      "Uproot and double-bag completely collapsed plants; never compost them, as oospores survive in piles.",
      "Cease all sprinkler or overhead irrigation immediately; keep row valleys drained."
    ],
    preventionStrategy: [
      "Select Phytophthora-tolerant varieties (e.g., Mountain Magic, Defiant, or regional resistant hybrids).",
      "Monitor local weather radar: relative humidity >90% with temps 15-22°C triggers aggressive sporulation.",
      "Eradicate volunteer potatoes, nightshade weeds, and tomato cull piles within 500 meters of the field."
    ],
    futurePossibilities: {
      prognosis: "Critical risk. Can destroy an entire acre within 7-10 days if left untreated under rainy weather; timely fungicides arrest it within 48 hours.",
      day3to5: "Water-soaked patches dry out and turn ash-grey; white downy mildew underneath leaves vanishes.",
      day7to14: "Surviving vines push healthy shoots; stems stay firm; fruit rot risk drops significantly.",
      warningSign: "Greasy brown mottled rot spreading to green fruits or stem cankers turning black and soft."
    }
  },

  // Tomato Leaf Mold
  "Tomato - Leaf Mold (Passalora fulva)": {
    medicines: [
      {
        name: "Difenoconazole 25% EC (e.g., Score)",
        type: "Triazole Systemic Fungicide",
        dosage: "0.5 ml to 1 ml per 1 Litre of water",
        timing: "Spray on foliage undersides where olive-green spores reside",
        preHarvestInterval: "7 days",
        instructions: "Curative systemic control. Halts spore germination."
      },
      {
        name: "Wettable Sulfur 80% WDG (e.g., Sulfex)",
        type: "Broad-spectrum Contact Fungicide & Acaricide",
        dosage: "2.5 g per 1 Litre of water",
        timing: "Preventative spray during high humidity",
        preHarvestInterval: "3 days",
        instructions: "Do not apply if ambient temperature exceeds 32°C or within 14 days of oil sprays."
      },
      {
        name: "Bacillus subtilis strain QST 713 (e.g., Serenade ASO)",
        type: "Biological / Organic Bio-fungicide",
        dosage: "3 to 4 ml per 1 Litre of water",
        timing: "Weekly preventative application in greenhouses/tunnels",
        preHarvestInterval: "0 days (residue free)",
        instructions: "Safe for pollinators; produces lipopeptides that rupture fungal cell membranes."
      }
    ],
    immediateActions: [
      "Open all side vents, exhaust fans, and polyhouse curtains to lower humidity below 80%.",
      "Prune dense inner foliage to allow bright sunlight and breezes into the center of the canopy.",
      "Remove severely yellowed lower leaves showing heavy velvety spore backing."
    ],
    preventionStrategy: [
      "Maintain wide plant spacing (minimum 50-60 cm) in greenhouses and polytunnels.",
      "Avoid overhead wetting during evening hours; always irrigate during morning daylight.",
      "Sanitize greenhouse structure and trellising wires with sanitizing spray between cropping cycles."
    ],
    futurePossibilities: {
      prognosis: "High recovery rate. Disease is mostly foliar and rarely attacks green fruit directly.",
      day3to5: "Velvety olive-green spore carpets underneath leaves shrivel and lose dusty viability.",
      day7to14: "Upper canopy maintains normal photosynthesis; plant maintains expected harvest weight.",
      warningSign: "Premature total defoliation exposing developing tomatoes to direct sunlight scald."
    }
  },

  // Tomato Septoria Leaf Spot
  "Tomato - Septoria Leaf Spot (Septoria lycopersici)": {
    medicines: [
      {
        name: "Chlorothalonil 75% WP (e.g., Kavach / Bravo)",
        type: "Broad Spectrum Protectant Fungicide",
        dosage: "2.0 g per 1 Litre of water",
        timing: "Spray at first appearance of circular spots with dark margins",
        preHarvestInterval: "7 days",
        instructions: "Adheres strongly to foliage, resisting wash-off from light rain."
      },
      {
        name: "Copper Oxychloride + Mancozeb (Tank mix)",
        type: "Multi-site Contact Shield",
        dosage: "2 g Copper Oxychloride + 2 g Mancozeb per 1 Litre of water",
        timing: "Every 7 to 10 days during warm, humid spells",
        preHarvestInterval: "5 days",
        instructions: "Provides synergistic protection against both Septoria and secondary bacterial spots."
      },
      {
        name: "Neem Oil 10,000 PPM (Cold-pressed Azadirachtin)",
        type: "Organic Plant Extract",
        dosage: "3 ml per 1 Litre of water with 1 ml organic liquid soap",
        timing: "Early morning preventative spray every 7 days",
        preHarvestInterval: "0 days",
        instructions: "Suppresses fungal hyphae growth and coats leaf cuticle."
      }
    ],
    immediateActions: [
      "Clip off infected lower leaves with small dark-rimmed spots and dispose in a covered pit.",
      "Never harvest or cultivate while the foliage is wet with rain or heavy dew.",
      "Lay organic or plastic ground cover to eliminate splashback from contaminated soil."
    ],
    preventionStrategy: [
      "Enforce 3-year crop rotation without tomatoes, potatoes, eggplants, or peppers.",
      "Deep plowing (tillage) after season ends to bury infected crop residues 8+ inches deep.",
      "Sterilize tomato stakes, twine, and cages with 10% bleach before reusing."
    ],
    futurePossibilities: {
      prognosis: "Manageable; does not directly infect fruit but defoliation reduces fruit size if unmanaged.",
      day3to5: "Spots stop multiplying on mid-tier leaves; lesion centers dry into pale tan spots.",
      day7to14: "Upper vegetative canopy continues vigorous flower setting without leaf drop.",
      warningSign: "Upward progression of leaf death reaching top 25% of canopy."
    }
  },

  // Tomato Two-Spotted Spider Mites
  "Tomato - Two-Spotted Spider Mite (Tetranychus urticae)": {
    medicines: [
      {
        name: "Abamectin 1.9% EC (e.g., Vertimec)",
        type: "Acaricide / Miticide",
        dosage: "0.75 ml to 1 ml per 1 Litre of water (12-15 ml per 15L pump)",
        timing: "Spray on leaf undersides where mites feed and spin webs",
        preHarvestInterval: "3 days",
        instructions: "Translaminar action kills active nymphs and adult mites inside leaf tissue."
      },
      {
        name: "Spiromesifen 22.9% SC (e.g., Oberon)",
        type: "Lipid Biosynthesis Inhibitor (Miticide)",
        dosage: "1.0 ml per 1 Litre of water",
        timing: "Spray targeting mite eggs and juvenile stages",
        preHarvestInterval: "5 days",
        instructions: "Provides long-lasting ovicidal protection for up to 3 weeks."
      },
      {
        name: "Neem Oil 1500 PPM or Potassium Salts of Fatty Acids (Insecticidal Soap)",
        type: "Organic Contact Soft Insecticide",
        dosage: "5 ml per 1 Litre of water",
        timing: "Spray every 4-5 days covering full canopy thoroughly",
        preHarvestInterval: "0 days",
        instructions: "Smothers adult mites and dissolves soft protective insect cuticle."
      }
    ],
    immediateActions: [
      "Spray undersides of leaves with a forceful jet of water to knock down webbing and mite colonies.",
      "Eliminate dusty road edges near the field border by sprinkling water on walkways.",
      "Prune and burn heavily webbed branches showing bronze, crisp leaves."
    ],
    preventionStrategy: [
      "Maintain adequate soil hydration; drought-stressed tomatoes attract massive mite outbreaks.",
      "Conserve or release predatory mites (Phytoseiulus persimilis or Neoseiulus californicus).",
      "Avoid indiscriminate use of broad-spectrum synthetic pyrethroids which kill natural mite predators."
    ],
    futurePossibilities: {
      prognosis: "Excellent recovery once mites are suppressed; new shoots emerge bright green within 7 days.",
      day3to5: "Fine webbing collapses; yellow stippling ceases spreading to newly emerged leaf tips.",
      day7to14: "Fresh green leaf expansion resumes; flower clusters set fruit normally.",
      warningSign: "Extensive silky webbing covering entire flower clusters and growing tips."
    }
  },

  // Tomato Target Spot
  "Tomato - Target Spot (Corynespora cassiicola)": {
    medicines: [
      {
        name: "Pyraclostrobin 20% WG (e.g., Cabrio) or Boscalid + Pyraclostrobin (e.g., Pristine)",
        type: "Strobilurin Curative Fungicide",
        dosage: "1.0 g per 1 Litre of water",
        timing: "Spray thoroughly at first signs of target spots",
        preHarvestInterval: "4 days",
        instructions: "Broad-spectrum systemic protection stopping cellular respiration in fungi."
      },
      {
        name: "Azoxystrobin 23% SC",
        type: "Systemic translaminar",
        dosage: "1.0 ml per 1 Litre of water",
        timing: "Alternate with multi-site contact fungicide",
        preHarvestInterval: "3 days",
        instructions: "Rotational partner to prevent fungal resistance."
      },
      {
        name: "Mancozeb 75% WP",
        type: "Contact Protectant",
        dosage: "2.5 g per 1 Litre of water",
        timing: "Tank-mix or preventative spray",
        preHarvestInterval: "5 days",
        instructions: "Inexpensive protective barrier."
      }
    ],
    immediateActions: [
      "Prune affected lower leaves and maintain dry canopy through early morning watering.",
      "Avoid excessive nitrogen fertilization which produces excessively soft, vulnerable foliage.",
      "Ensure staking wires keep vines upright and away from humid soil contact."
    ],
    preventionStrategy: [
      "Maintain balanced N-P-K-Ca fertilization to strengthen cell walls.",
      "Rotate with non-host crops like sweet corn or sorghum for at least 2 seasons.",
      "Clean crop debris completely after harvest."
    ],
    futurePossibilities: {
      prognosis: "Good with 2 rotational sprays; fruit lesion risk drops significantly.",
      day3to5: "Target spot lesions turn hard, dark, and inactive.",
      day7to14: "Clean shoots form without secondary circular lesions.",
      warningSign: "Spots developing on stems and circular sunken craters appearing on green tomatoes."
    }
  },

  // Tomato Yellow Leaf Curl Virus
  "Tomato - Yellow Leaf Curl Virus (TYLCV)": {
    medicines: [
      {
        name: "Imidacloprid 17.8% SL (e.g., Confidor)",
        type: "Systemic Vector-Control Insecticide (Against Whiteflies)",
        dosage: "0.5 ml per 1 Litre of water (7-8 ml per 15L pump) or root drench",
        timing: "Spray early morning when whiteflies are stationary",
        preHarvestInterval: "7 days",
        instructions: "Kills the Bemisia tabaci whitefly vector carrying the virus. Note: No chemical cures the virus itself."
      },
      {
        name: "Diafenthiuron 50% WP (e.g., Pegasus)",
        type: "Insecticide / Miticide",
        dosage: "1.2 g per 1 Litre of water",
        timing: "Follow up if whitefly nymph pressure is severe",
        preHarvestInterval: "7 days",
        instructions: "Vapor action controls whitefly adults and nymphs sheltering under leaves."
      },
      {
        name: "Yellow Sticky Traps + Neem Oil 10,000 PPM",
        type: "Integrated Pest Management (Organic)",
        dosage: "Install 15-20 yellow sticky traps per acre; spray Neem Oil 3-4 ml/L",
        timing: "Maintain traps throughout entire growing season",
        preHarvestInterval: "0 days",
        instructions: "Catches thousands of migrating whiteflies before they feed and transmit virus."
      }
    ],
    immediateActions: [
      "CRITICAL: Systemic plant viruses cannot be cured once inside the vascular system.",
      "Rogue out (uproot) severely stunted, upward-cupped plants immediately; seal them in plastic bags and remove from the farm.",
      "Immediately install yellow sticky traps around nursery and field borders to trap whiteflies."
    ],
    preventionStrategy: [
      "Always plant certified TYLCV-resistant hybrids (look for 'Ty-1' or 'Ty-3' gene resistance on seed packet).",
      "Erect 50-mesh fine insect-proof nylon netting over nursery seedling beds for the first 30 days.",
      "Eliminate alternative weed hosts such as Datura, Malva, Solanum nigrum, and wild nightshades."
    ],
    futurePossibilities: {
      prognosis: "Infected plants remain stunted and bear very little yield. Focus must be 100% on protecting adjacent healthy plants from whitefly transmission.",
      day3to5: "Whitefly vector population on leaf undersides drops by >85% with targeted vector spray.",
      day7to14: "Surrounding uninfected plants maintain healthy flat leaves and normal blossom setting.",
      warningSign: "Upward curling and severe yellowing spreading to neighboring rows indicates active vector movement."
    }
  },

  // Tomato Mosaic Virus
  "Tomato - Mosaic Virus (ToMV)": {
    medicines: [
      {
        name: "Skimmed Milk Solution (10% Reconstituted Milk)",
        type: "Antiviral Barrier / Protein Inactivator",
        dosage: "100 g skimmed milk powder in 1 Litre of water (or 10% fresh skim milk)",
        timing: "Dip hands and tools during pruning and tying vines",
        preHarvestInterval: "0 days",
        instructions: "Milk proteins bind and denature virion particles, preventing mechanical transmission."
      },
      {
        name: "Trisodium Phosphate (TSP) 10% Solution",
        type: "Disinfectant for Tools & Trellis Wire",
        dosage: "100 g TSP per 1 Litre of water",
        timing: "Use to soak knives, shears, stakes, and crates between rows",
        preHarvestInterval: "N/A (Tool disinfectant only)",
        instructions: "Effectively inactivates stable tobamovirus particles on non-living surfaces."
      },
      {
        name: "Chitosan / Organic Bio-stimulant spray",
        type: "Plant Immunity Booster",
        dosage: "2 ml per 1 Litre of water",
        timing: "Foliar spray across healthy adjacent rows",
        preHarvestInterval: "0 days",
        instructions: "Stimulates systemic acquired resistance (SAR) in uninfected plants."
      }
    ],
    immediateActions: [
      "Uproot and burn or deeply bury infected plants showing mosaic mottling and leaf distortion.",
      "Strict hygiene: Workers must never smoke or handle tobacco products near tomato crops.",
      "Wash hands with soap and water or 10% milk solution before touching any healthy tomato vine."
    ],
    preventionStrategy: [
      "Use certified virus-free seeds treated with heat (70°C for 3 days) or 10% TSP.",
      "Select resistant tomato cultivars marked with 'ToMV' resistance on certified seed labels.",
      "Avoid mechanical damage during weeding or stringing vines."
    ],
    futurePossibilities: {
      prognosis: "Tobamoviruses are extremely stable on farm tools and hands. Strict sanitation contains spread successfully.",
      day3to5: "Infected plants removed; mechanical spread completely arrested.",
      day7to14: "Healthy crop blocks continue normal fruit swelling without mosaic patterning on fruit skin.",
      warningSign: "Shoestring leaf narrowing or internal browning (blotchy ripening) inside fruits."
    }
  },

  // Tomato Healthy
  "Tomato - Healthy Foliage": {
    medicines: [
      {
        name: "19:19:19 (N-P-K) Water Soluble Balanced Fertilizer",
        type: "Foliar Nutrient Supplement",
        dosage: "4.0 g to 5.0 g per 1 Litre of water (or fertigation per crop schedule)",
        timing: "Every 12-15 days during active vegetative & flowering stage",
        preHarvestInterval: "0 days",
        instructions: "Provides balanced macronutrients for dark green foliage and vigorous branching."
      },
      {
        name: "Chelated Micronutrient Mixture (Zn, Fe, B, Mn, Cu, Mo)",
        type: "Micronutrient Tonic",
        dosage: "1.0 g to 1.5 g per 1 Litre of water",
        timing: "Pre-flowering and fruit-set stages",
        preHarvestInterval: "0 days",
        instructions: "Prevents blossom end rot and ensures uniform fruit size and glossy skin."
      },
      {
        name: "Neem Oil 3000 PPM (Preventative Guardian)",
        type: "Organic Prophylactic Spray",
        dosage: "3 ml per 1 Litre of water",
        timing: "Every 14 days in early morning",
        preHarvestInterval: "0 days",
        instructions: "Repels sucking pests and prevents early spore establishment."
      }
    ],
    immediateActions: [
      "Continue regular irrigation and balanced fertilizer schedule.",
      "Conduct routine scouting of lower leaf undersides once a week.",
      "Maintain support stakes and trellis ties as fruit clusters get heavier."
    ],
    preventionStrategy: [
      "Avoid water stress or sudden waterlogging which cracks developing fruit.",
      "Keep soil mulched and maintain clean farm borders free of weeds.",
      "Rotate crops annually with legumes or millets to keep soil biota rich."
    ],
    futurePossibilities: {
      prognosis: "Optimal plant vigor! Full yield potential expected under current care.",
      day3to5: "Continuous vegetative growth and healthy dark emerald green leaf luster.",
      day7to14: "Abundant flower cluster setting and healthy green fruit sizing.",
      warningSign: "Watch out for sudden weather shifts (heavy downpours or sudden high humidity) and apply preventative bio-fungicides."
    }
  },

  // Potato Early Blight
  "Potato - Early Blight (Alternaria solani)": {
    medicines: [
      {
        name: "Indofil M-45 (Mancozeb 75% WP)",
        type: "Contact Protectant",
        dosage: "2.5 g per 1 Litre of water",
        timing: "Spray at first signs of target lesions; repeat every 10 days",
        preHarvestInterval: "7 days",
        instructions: "Complete coverage of canopy including lower foliage."
      },
      {
        name: "Score 25% EC (Difenoconazole)",
        type: "Curative Systemic Fungicide",
        dosage: "0.5 ml per 1 Litre of water",
        timing: "When concentric lesions exceed 5% leaf area",
        preHarvestInterval: "7 days",
        instructions: "Absorbs into plant tissues within 2 hours to halt active fungal mycelium."
      }
    ],
    immediateActions: [
      "Ensure soil ridges are heaped high (earthing up) to protect potato tubers from fungal spores washing down.",
      "Prune affected lower leaves and dispose away from the field.",
      "Avoid overhead sprinkler irrigation late in the evening."
    ],
    preventionStrategy: [
      "Use certified disease-free seed tubers.",
      "Apply balanced potash (MOP) to enhance tuber skin toughness and foliage resilience.",
      "Dehaulm (cut foliage) 10-12 days prior to potato harvest to allow tuber skins to harden."
    ],
    futurePossibilities: {
      prognosis: "Good recovery with systemic fungicide; protect tubers from underground rot.",
      day3to5: "Concentric target lesions dry out without spreading.",
      day7to14: "Tubers swell normally under soil ridges.",
      warningSign: "Sunken dark corky rot appearing on harvested seed tubers."
    }
  },

  // Potato Late Blight
  "Potato - Late Blight (Phytophthora infestans)": {
    medicines: [
      {
        name: "Cymoxanil 8% + Mancozeb 64% WP (Curzate)",
        type: "Curative Knockdown Fungicide",
        dosage: "2.5 g per 1 Litre of water",
        timing: "Immediate spray at onset of water-soaked black spots",
        preHarvestInterval: "7 days",
        instructions: "Fast translaminar action stops sporulation."
      },
      {
        name: "Dimethomorph 50% WP (e.g., Acrobat) + Mancozeb",
        type: "Oomycete Cell Wall Disruptor",
        dosage: "1.0 g Acrobat + 2.0 g Mancozeb per 1 Litre of water",
        timing: "Spray 5 days after initial treatment during cloudy weather",
        preHarvestInterval: "7 days",
        instructions: "Destroys fungal sporangia and zoospores."
      }
    ],
    immediateActions: [
      "EMERGENCY: Late blight can decimate a potato crop in 4-6 days under fog/dew conditions.",
      "Earth up potato ridges generously to create a thick soil barrier so spores do not wash onto tubers.",
      "If disease is late in the season (>75 days), immediately dehaulm (cut and remove all vines) to save the underground potatoes."
    ],
    preventionStrategy: [
      "Never plant seed tubers from blight-infected fields.",
      "Eliminate cull potato piles; do not leave discarded potatoes on field borders.",
      "Spray prophylactic Mancozeb before the onset of winter fog or persistent cold rains."
    ],
    futurePossibilities: {
      prognosis: "High danger; fast action saves 80-90% of tuber crop; inaction causes 100% field loss.",
      day3to5: "Water-soaked margins dry up into brown papery areas; no white fungus on undersides.",
      day7to14: "Tuber formation continues safely if soil cover is intact.",
      warningSign: "Foul rotting odor in field or soft brown rot inside harvested tubers."
    }
  },

  // Potato Healthy
  "Potato - Healthy Foliage": {
    medicines: [
      {
        name: "Soluble Potassium Sulfate (00:00:50) + Boron",
        type: "Tuber Bulking & Quality Tonic",
        dosage: "4.0 g 00:00:50 + 1.0 g Boron 20% per 1 Litre of water",
        timing: "45-60 days after planting (tuber initiation stage)",
        preHarvestInterval: "0 days",
        instructions: "Translocates sugars to developing tubers, increasing size and starch content."
      },
      {
        name: "Pseudomonas fluorescens 1% WP",
        type: "Protective Bio-inoculant",
        dosage: "5 g per 1 Litre foliar / drench",
        timing: "Every 15 days",
        preHarvestInterval: "0 days",
        instructions: "Protects root rhizosphere and foliage naturally."
      }
    ],
    immediateActions: [
      "Maintain regular ridge earthing up to prevent greening of tubers by sunlight.",
      "Keep soil moist but never waterlogged.",
      "Inspect rows weekly for early aphid or blight indicators."
    ],
    preventionStrategy: [
      "Follow crop rotation with legumes or green manure.",
      "Ensure proper cold storage of harvested produce.",
      "Avoid harvesting in wet muddy conditions."
    ],
    futurePossibilities: {
      prognosis: "Excellent tuber bulking and high market yield expected.",
      day3to5: "Healthy vigorous canopy maintained.",
      day7to14: "Substantial underground tuber expansion.",
      warningSign: "Sudden yellowing of leaf tips or aphid clusters on shoot tips."
    }
  }
};

// Generic fallback guide for crops/diseases not explicitly in the tomato/potato primary index
export const GENERAL_DISEASE_ACTION_GUIDE = {
  mild: {
    medicines: [
      {
        name: "Neem Oil 10,000 PPM or Karanja Oil",
        type: "Organic Broad-Spectrum Protector",
        dosage: "3 to 4 ml per 1 Litre of water with mild organic surfactant",
        timing: "Early morning or late afternoon",
        preHarvestInterval: "0 days",
        instructions: "Spray thoroughly covering both upper and lower leaf surfaces."
      },
      {
        name: "Copper Oxychloride 50% WP (Blitox)",
        type: "Mild Contact Fungicide",
        dosage: "2.0 g per 1 Litre of water",
        timing: "At first sign of leaf spot or discoloration",
        preHarvestInterval: "5 days",
        instructions: "Prevents spore germination and bacterial leaf colonization."
      }
    ],
    immediateActions: [
      "Prune affected leaves and dispose of them away from the field.",
      "Avoid splashing water onto leaves; water directly at the base or root zone.",
      "Check irrigation schedule to ensure plants are not waterlogged."
    ],
    preventionStrategy: [
      "Maintain proper row spacing to ensure adequate sun and airflow.",
      "Practice multi-season crop rotation with non-host crops.",
      "Sanitize pruning shears between different beds."
    ],
    futurePossibilities: {
      prognosis: "Favorable. Early intervention halts progression within a few days.",
      day3to5: "Active spots stop spreading; margins dry out.",
      day7to14: "New foliage emerges healthy and vibrant.",
      warningSign: "Rapid expansion of spots or yellowing progressing up the stem."
    }
  },
  moderate: {
    medicines: [
      {
        name: "Mancozeb 75% WP + Systemic Partner (Azoxystrobin or Carbendazim)",
        type: "Contact + Systemic Combination",
        dosage: "2.0 g Mancozeb + 1.0 ml Systemic partner per 1 Litre of water",
        timing: "Apply promptly; repeat in 10 days if symptoms persist",
        preHarvestInterval: "7 days",
        instructions: "Curative translaminar protection coupled with surface contact shield."
      },
      {
        name: "Bio-fungicide (Trichoderma viride + Pseudomonas fluorescens)",
        type: "Biological / Organic Remedy",
        dosage: "5 g each per 1 Litre of water",
        timing: "Alternate with chemical sprays for eco-safe control",
        preHarvestInterval: "0 days",
        instructions: "Multiplies on leaf tissue and controls pathogens naturally."
      }
    ],
    immediateActions: [
      "Immediately isolate infected plants or prune diseased branches.",
      "Pause any nitrogen-heavy fertilizers which fuel disease spread.",
      "Improve drainage in low-lying rows to lower humidity around roots."
    ],
    preventionStrategy: [
      "Apply organic straw mulch to stop fungal spores from rain-splashing.",
      "Test soil pH and replenish potassium and zinc to boost plant immunity.",
      "Use certified disease-resistant seed varieties in the next cycle."
    ],
    futurePossibilities: {
      prognosis: "Controlled with two rotational applications; protects crop yield.",
      day3to5: "Lesions lose yellowish halo; spore production stops.",
      day7to14: "Plant stabilization; recovery of vegetative growth.",
      warningSign: "Stem girdling or lesions moving into developing fruit or grain."
    }
  },
  severe: {
    medicines: [
      {
        name: "Targeted Curative Systemic (Metalaxyl-M, Difenoconazole, or Azoxystrobin)",
        type: "High-Potency Curative Agricultural Fungicide",
        dosage: "As per registered chemical label (typically 1.5 g - 2.5 g per Litre)",
        timing: "Apply immediately; calibrate backpack sprayer for fine mist",
        preHarvestInterval: "Strictly observe 7-14 day interval before harvest",
        instructions: "Wear full protective equipment (gloves, respirator, goggles)."
      },
      {
        name: "Agricultural Streptomycin / Copper Hydroxide mix",
        type: "Broad spectrum curative rescue",
        dosage: "Dilute strictly per agronomic extension guidelines",
        timing: "Immediate field application",
        preHarvestInterval: "14 days",
        instructions: "Do not exceed maximum seasonal spray limits."
      }
    ],
    immediateActions: [
      "EMERGENCY PROTOCOL: Quarantine affected rows and restrict farm vehicle movement.",
      "Uproot and burn or bury severely collapsed plants immediately to stop fieldwide blight.",
      "Contact an agronomist or local agricultural extension officer for on-site verification."
    ],
    preventionStrategy: [
      "Deep plowing and soil solarization before the next planting season.",
      "Strict minimum 3-year crop rotation with non-susceptible plant families.",
      "Total cleanup and sanitization of stakes, drip lines, and seedling trays."
    ],
    futurePossibilities: {
      prognosis: "Urgent action required. Timely intervention can rescue 60-80% of adjacent healthy crops.",
      day3to5: "Spread stops; existing active blight turns to dry inactive crust.",
      day7to14: "Surviving crop recovers foliage and fruit production.",
      warningSign: "Vascular wilting or fieldwide leaf collapse within 72 hours."
    }
  }
};

/**
 * Returns comprehensive medicine suggestions, farmer prevention checklist,
 * and future prognosis timeline for a given disease name and severity.
 */
export function getAgronomicPrescription(diseaseName, severity = 'moderate') {
  if (!diseaseName) {
    return GENERAL_DISEASE_ACTION_GUIDE[severity] || GENERAL_DISEASE_ACTION_GUIDE.moderate;
  }

  // Exact match
  if (DISEASE_ACTION_GUIDES[diseaseName]) {
    return DISEASE_ACTION_GUIDES[diseaseName];
  }

  // Fuzzy match by disease keyword
  const lower = diseaseName.toLowerCase();
  for (const [key, value] of Object.entries(DISEASE_ACTION_GUIDES)) {
    const keyLower = key.toLowerCase();
    if (
      (lower.includes('bacterial spot') && keyLower.includes('bacterial spot')) ||
      (lower.includes('early blight') && keyLower.includes('early blight')) ||
      (lower.includes('late blight') && keyLower.includes('late blight')) ||
      (lower.includes('leaf mold') && keyLower.includes('leaf mold')) ||
      (lower.includes('septoria') && keyLower.includes('septoria')) ||
      (lower.includes('spider mite') && keyLower.includes('spider mite')) ||
      (lower.includes('target spot') && keyLower.includes('target spot')) ||
      (lower.includes('yellow leaf curl') && keyLower.includes('yellow leaf curl')) ||
      (lower.includes('mosaic') && keyLower.includes('mosaic')) ||
      (lower.includes('healthy') && keyLower.includes('healthy'))
    ) {
      return value;
    }
  }

  // Fallback to severity-based generic guide
  const sevKey = (severity || 'moderate').toLowerCase();
  return GENERAL_DISEASE_ACTION_GUIDE[sevKey] || GENERAL_DISEASE_ACTION_GUIDE.moderate;
}
