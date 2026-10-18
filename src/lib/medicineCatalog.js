// Master catalog of all 26 verified agricultural medicines with authentic photos and dosages
// Used by experts to quickly pick, inspect, and suggest targeted medicines to farmers.

import { MEDICINE_PHOTOS, getMedicinePhoto } from '@/lib/medicinePhotos';

export const ALL_MEDICINES_CATALOG = [
  {
    id: 'blitox',
    name: 'Copper Oxychloride 50% WP (Blitox / Blue Copper)',
    type: 'Chemical Bactericide / Fungicide',
    category: 'Bactericide / Contact',
    dosage: '2.5 g to 3.0 g per 1 Litre of water',
    timing: 'Early morning (6:00 AM - 8:30 AM) or cool late evening',
    preHarvestInterval: '3 to 5 days before harvest',
    instructions: 'Ensure uniform misting across leaf undersides. Do not mix with acidic foliar fertilizers.',
    recommendedFor: 'Bacterial Spot, Septoria Leaf Spot, Anthracnose, Leaf Blights'
  },
  {
    id: 'streptocycline',
    name: 'Streptocycline (Streptomycin sulphate + Tetracycline)',
    type: 'Antibacterial Formulation',
    category: 'Antibacterial',
    dosage: '1 g in 10 Litres of water mixed with Copper Oxychloride',
    timing: 'Spray at first signs of watersoaked bacterial lesions',
    preHarvestInterval: '7 days',
    instructions: 'Curative application. Limit to max 2 sprays per season to avoid bacterial resistance.',
    recommendedFor: 'Bacterial Spot, Bacterial Blight, Bacterial Canker'
  },
  {
    id: 'mancozeb',
    name: 'Mancozeb 75% WP (Dithane M-45 / Indofil M-45)',
    type: 'Contact Protectant Fungicide',
    category: 'Fungicide / Protectant',
    dosage: '2.0 g to 2.5 g per 1 Litre of water',
    timing: 'Spray immediately upon spotting spots; repeat every 7-10 days',
    preHarvestInterval: '5 days',
    instructions: 'Forms a multi-site protective shield over leaf cuticle. Excellent preventer of spore germination.',
    recommendedFor: 'Early Blight, Late Blight, Septoria, Leaf Spots'
  },
  {
    id: 'amistar-top',
    name: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)',
    type: 'Systemic Curative Fungicide',
    category: 'Fungicide / Systemic',
    dosage: '1.0 ml per 1 Litre of water (15 ml per 15L pump)',
    timing: 'Curative spray when concentric ring lesions are expanding',
    preHarvestInterval: '3 days',
    instructions: 'Systemic translaminar action penetrates deep into infected leaf tissue to stop mycelium growth.',
    recommendedFor: 'Early Blight, Powdery Mildew, Anthracnose, Rust'
  },
  {
    id: 'ridomil-gold',
    name: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold)',
    type: 'Systemic + Contact Oomycete Fungicide',
    category: 'Fungicide / Systemic',
    dosage: '2.5 g per 1 Litre of water (approx. 35-40 g per 15L pump)',
    timing: 'Spray immediately! Do not delay when cool humid weather prevails',
    preHarvestInterval: '7 days',
    instructions: 'Curative & translaminar. Rapidly absorbed into vascular tissues within 30 minutes.',
    recommendedFor: 'Late Blight, Downy Mildew, Phytophthora Root Rot'
  },
  {
    id: 'curzate',
    name: 'Cymoxanil 8% + Mancozeb 64% WP (Curzate)',
    type: 'Fast Knockdown Curative Fungicide',
    category: 'Fungicide / Curative',
    dosage: '2.0 g to 2.5 g per 1 Litre of water',
    timing: 'Follow up 5 to 7 days after first systemic spray to prevent fungal resistance',
    preHarvestInterval: '7 days',
    instructions: 'Penetrates plant tissue to halt active sporulation within 48 hours.',
    recommendedFor: 'Late Blight in Tomato & Potato, Downy Mildew'
  },
  {
    id: 'kocide',
    name: 'Copper Hydroxide 53.8% DF (Kocide)',
    type: 'Protective Surface Barrier',
    category: 'Fungicide / Copper',
    dosage: '2.0 g per 1 Litre of water',
    timing: 'Protective spray across neighboring healthy blocks',
    preHarvestInterval: '3 days',
    instructions: 'Forms dense copper ion coverage preventing new spore penetration.',
    recommendedFor: 'Late Blight barrier protection, Bacterial Blights'
  },
  {
    id: 'score',
    name: 'Difenoconazole 25% EC (Score)',
    type: 'Triazole Systemic Fungicide',
    category: 'Fungicide / Systemic',
    dosage: '0.5 ml to 1 ml per 1 Litre of water',
    timing: 'Spray on foliage undersides where olive-green spores reside',
    preHarvestInterval: '7 days',
    instructions: 'Curative systemic control. Halts spore germination.',
    recommendedFor: 'Leaf Mold, Early Blight, Powdery Mildew, Scab'
  },
  {
    id: 'sulfex',
    name: 'Wettable Sulfur 80% WDG (Sulfex)',
    type: 'Broad-spectrum Contact Fungicide & Acaricide',
    category: 'Fungicide / Sulfur',
    dosage: '2.5 g per 1 Litre of water',
    timing: 'Preventative spray during high humidity',
    preHarvestInterval: '3 days',
    instructions: 'Do not apply if ambient temperature exceeds 32°C or within 14 days of oil sprays.',
    recommendedFor: 'Leaf Mold, Powdery Mildew, Mites'
  },
  {
    id: 'kavach',
    name: 'Chlorothalonil 75% WP (Kavach / Bravo)',
    type: 'Broad Spectrum Protectant Fungicide',
    category: 'Fungicide / Protectant',
    dosage: '2.0 g per 1 Litre of water',
    timing: 'Spray at first appearance of circular spots with dark margins',
    preHarvestInterval: '7 days',
    instructions: 'Adheres strongly to foliage, resisting wash-off from light rain.',
    recommendedFor: 'Septoria Leaf Spot, Anthracnose, Early Blight'
  },
  {
    id: 'cabrio',
    name: 'Pyraclostrobin 20% WG / Boscalid (Cabrio / Pristine)',
    type: 'Strobilurin Curative Fungicide',
    category: 'Fungicide / Strobilurin',
    dosage: '1.0 g per 1 Litre of water',
    timing: 'Spray thoroughly at first signs of target spots',
    preHarvestInterval: '4 days',
    instructions: 'Broad-spectrum systemic protection stopping cellular respiration in fungi.',
    recommendedFor: 'Target Spot (Corynespora), Early Blight'
  },
  {
    id: 'acrobat',
    name: 'Dimethomorph 50% WP (Acrobat)',
    type: 'Oomycete Cell Wall Disruptor',
    category: 'Fungicide / Oomycete',
    dosage: '1.0 g Acrobat + 2.0 g Mancozeb per 1 Litre of water',
    timing: 'Spray 5 days after initial treatment during cloudy weather',
    preHarvestInterval: '7 days',
    instructions: 'Destroys fungal sporangia and zoospores.',
    recommendedFor: 'Late Blight in Potato & Tomato'
  },
  {
    id: 'confidor',
    name: 'Imidacloprid 17.8% SL (Confidor)',
    type: 'Systemic Vector-Control Insecticide (Against Whiteflies)',
    category: 'Insecticide / Systemic',
    dosage: '0.5 ml per 1 Litre of water (7-8 ml per 15L pump) or root drench',
    timing: 'Spray early morning when whiteflies are stationary',
    preHarvestInterval: '7 days',
    instructions: 'Kills the Bemisia tabaci whitefly vector carrying Yellow Leaf Curl Virus.',
    recommendedFor: 'Whiteflies, Aphids, Jassids, Leaf Curl Vector'
  },
  {
    id: 'pegasus',
    name: 'Diafenthiuron 50% WP (Pegasus)',
    type: 'Insecticide / Miticide with Vapor Action',
    category: 'Insecticide / Miticide',
    dosage: '1.2 g per 1 Litre of water',
    timing: 'Follow up if whitefly nymph pressure or mite colonies are severe',
    preHarvestInterval: '7 days',
    instructions: 'Vapor action controls whitefly adults and nymphs sheltering under leaves.',
    recommendedFor: 'Whitefly nymphs, Spider Mites, Thrips'
  },
  {
    id: 'vertimec',
    name: 'Abamectin 1.9% EC (Vertimec)',
    type: 'Translaminar Acaricide / Miticide',
    category: 'Miticide / Acaricide',
    dosage: '0.75 ml to 1 ml per 1 Litre of water (12-15 ml per 15L pump)',
    timing: 'Spray on leaf undersides where mites feed and spin webs',
    preHarvestInterval: '3 days',
    instructions: 'Translaminar action kills active nymphs and adult mites inside leaf tissue.',
    recommendedFor: 'Two-Spotted Spider Mites, Broad Mites, Leaf Miners'
  },
  {
    id: 'oberon',
    name: 'Spiromesifen 22.9% SC (Oberon)',
    type: 'Lipid Biosynthesis Inhibitor (Ovicidal Miticide)',
    category: 'Miticide / Ovicidal',
    dosage: '1.0 ml per 1 Litre of water',
    timing: 'Spray targeting mite eggs and juvenile stages',
    preHarvestInterval: '5 days',
    instructions: 'Provides long-lasting ovicidal protection for up to 3 weeks.',
    recommendedFor: 'Spider Mite eggs and nymphs, Whitefly nymphs'
  },
  {
    id: 'pseudomonas',
    name: 'Pseudomonas fluorescens 1% WP (Bio-bactericide)',
    type: 'Organic / Biological Bio-bactericide',
    category: 'Bio-Control / Organic',
    dosage: '5 g per 1 Litre of water (or 1 kg per acre via drenching/foliar)',
    timing: 'Every 10-14 days as preventative & mild curative spray',
    preHarvestInterval: '0 days (Eco-safe, residue free)',
    instructions: 'Apply during cloud cover or late afternoon. Compatible with organic farming.',
    recommendedFor: 'Bacterial Spot, Root Wilt, Rhizoctonia, Damping Off'
  },
  {
    id: 'trichoderma',
    name: 'Trichoderma viride / harzianum 1% WP (Bio-fungicide)',
    type: 'Organic Bio-fungicide & Soil Inoculant',
    category: 'Bio-Control / Organic',
    dosage: '5 g per 1 Litre of water foliar spray or 2 kg/acre mixed in FYM',
    timing: 'Preventative before rainy spell or early vegetative stage',
    preHarvestInterval: '0 days (Residue free)',
    instructions: 'Colonizes plant surface and outcompetes Alternaria & Fusarium spores naturally.',
    recommendedFor: 'Early Blight, Collar Rot, Root Rot, Damping Off'
  },
  {
    id: 'serenade',
    name: 'Bacillus subtilis strain QST 713 (Serenade ASO)',
    type: 'Biological / Organic Bio-fungicide',
    category: 'Bio-Control / Organic',
    dosage: '3 to 4 ml per 1 Litre of water',
    timing: 'Weekly preventative application in greenhouses/tunnels',
    preHarvestInterval: '0 days (Residue free)',
    instructions: 'Safe for pollinators; produces lipopeptides that rupture fungal cell membranes.',
    recommendedFor: 'Leaf Mold, Powdery Mildew, Botrytis Grey Mold'
  },
  {
    id: 'neem-oil',
    name: 'Neem Oil 10,000 PPM (Cold-pressed Azadirachtin / Karanja)',
    type: 'Organic Botanical Prophylactic & Insect Cuticle Dissolver',
    category: 'Bio-Control / Organic',
    dosage: '3 to 5 ml per 1 Litre of water with 1 ml organic liquid soap',
    timing: 'Early morning preventative spray every 7-14 days',
    preHarvestInterval: '0 days (Eco-safe)',
    instructions: 'Smothers pests, disrupts feeding, and coats leaf cuticle against spore entry.',
    recommendedFor: 'Spider Mites, Whiteflies, Aphids, Early Spore Germination'
  },
  {
    id: 'chitosan',
    name: 'Chitosan / Organic Bio-stimulant spray',
    type: 'Plant Immunity & SAR Booster',
    category: 'Plant Immunity',
    dosage: '2 ml per 1 Litre of water',
    timing: 'Foliar spray across healthy adjacent rows',
    preHarvestInterval: '0 days',
    instructions: 'Stimulates systemic acquired resistance (SAR) in uninfected plants.',
    recommendedFor: 'Tomato Mosaic Virus defense, General Plant Immunity'
  },
  {
    id: 'skimmed-milk',
    name: 'Skimmed Milk Solution (10% Reconstituted Milk)',
    type: 'Antiviral Barrier / Protein Inactivator',
    category: 'Antiviral Barrier',
    dosage: '100 g skimmed milk powder in 1 Litre of water (or 10% fresh skim milk)',
    timing: 'Dip hands and tools during pruning and tying vines',
    preHarvestInterval: '0 days',
    instructions: 'Milk proteins bind and denature virion particles, preventing mechanical transmission.',
    recommendedFor: 'Tomato Mosaic Virus (ToMV), Tobacco Mosaic Virus'
  },
  {
    id: 'tsp',
    name: 'Trisodium Phosphate (TSP) 10% Solution',
    type: 'Disinfectant for Tools & Trellis Wire',
    category: 'Disinfectant / Non-Crop',
    dosage: '100 g TSP per 1 Litre of water',
    timing: 'Use to soak knives, shears, stakes, and crates between rows',
    preHarvestInterval: 'N/A (Tool disinfectant only)',
    instructions: 'Effectively inactivates stable tobamovirus particles on non-living surfaces.',
    recommendedFor: 'Disinfecting Pruning Shears, Stakes, and Crates'
  },
  {
    id: 'npk-191919',
    name: '19:19:19 (N-P-K) Water Soluble Balanced Fertilizer',
    type: 'Foliar Nutrient Supplement',
    category: 'Plant Nutrition / Foliar',
    dosage: '4.0 g to 5.0 g per 1 Litre of water',
    timing: 'Every 12-15 days during active vegetative & flowering stage',
    preHarvestInterval: '0 days',
    instructions: 'Provides balanced macronutrients for dark green foliage and vigorous branching.',
    recommendedFor: 'Vegetative Growth, Branching, Recovery from Blight'
  },
  {
    id: 'micronutrients',
    name: 'Chelated Micronutrient Mixture (Zn, Fe, B, Mn, Cu, Mo)',
    type: 'Micronutrient Tonic',
    category: 'Plant Nutrition / Foliar',
    dosage: '1.0 g to 1.5 g per 1 Litre of water',
    timing: 'Pre-flowering and fruit-set stages',
    preHarvestInterval: '0 days',
    instructions: 'Prevents blossom end rot and ensures uniform fruit size and glossy skin.',
    recommendedFor: 'Blossom End Rot prevention, Fruit Quality, Chlorosis'
  },
  {
    id: 'potassium-sulfate',
    name: 'Soluble Potassium Sulfate (00:00:50) + Boron 20%',
    type: 'Tuber Bulking & Quality Tonic',
    category: 'Plant Nutrition / Bulking',
    dosage: '4.0 g 00:00:50 + 1.0 g Boron 20% per 1 Litre of water',
    timing: '45-60 days after planting (tuber initiation stage)',
    preHarvestInterval: '0 days',
    instructions: 'Translocates sugars to developing tubers, increasing size and starch content.',
    recommendedFor: 'Potato Tuber Expansion, Fruit Starch Content'
  }
];

export function getMedicineCatalogItem(nameOrId) {
  if (!nameOrId) return null;
  const lower = nameOrId.toLowerCase();
  return ALL_MEDICINES_CATALOG.find(m => 
    m.id.toLowerCase() === lower || 
    m.name.toLowerCase().includes(lower)
  ) || null;
}
