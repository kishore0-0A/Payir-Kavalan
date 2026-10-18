// Shared crop catalogue for the UI with high-quality real crop photography.

const CROP_IMAGES = {
  tomato: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80',
  rice: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  cotton: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
  chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  brinjal: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
  groundnut: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80',
  sugarcane: 'https://images.unsplash.com/photo-1589782182703-2aaa69037b5b?auto=format&fit=crop&w=600&q=80'
};

export const SUPPORTED_CROPS = [
  { id: 'tomato', name: 'Tomato', image: CROP_IMAGES.tomato, diseases: ['Early Blight', 'Late Blight', 'Leaf Mold'] },
  { id: 'rice', name: 'Rice', image: CROP_IMAGES.rice, diseases: ['Blast', 'Brown Spot', 'Sheath Blight'] },
  { id: 'potato', name: 'Potato', image: CROP_IMAGES.potato, diseases: ['Early Blight', 'Late Blight'] },
  { id: 'maize', name: 'Maize', image: CROP_IMAGES.maize, diseases: ['Common Rust', 'Gray Leaf Spot'] },
  { id: 'cotton', name: 'Cotton', image: CROP_IMAGES.cotton, diseases: ['Boll Rot', 'Leaf Curl'] },
  { id: 'chilli', name: 'Chilli', image: CROP_IMAGES.chilli, diseases: ['Leaf Curl', 'Powdery Mildew'] },
  { id: 'wheat', name: 'Wheat', image: CROP_IMAGES.wheat, diseases: ['Leaf Rust', 'Powdery Mildew'] },
  { id: 'brinjal', name: 'Brinjal', image: CROP_IMAGES.brinjal, diseases: ['Leaf Spot'] },
  { id: 'groundnut', name: 'Groundnut', image: CROP_IMAGES.groundnut, diseases: ['Leaf Rust'] },
  { id: 'sugarcane', name: 'Sugarcane', image: CROP_IMAGES.sugarcane, diseases: ['Red Rot'] }
];

export function getCropByName(name) {
  return SUPPORTED_CROPS.find((c) => c.name.toLowerCase() === String(name || '').toLowerCase());
}