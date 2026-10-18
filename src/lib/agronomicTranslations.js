// Comprehensive Agronomic Translation Engine for Tamil, Hindi, and English
// Translates all crop names, disease diagnoses, medicine types, dosages, timings, action steps, prevention protocols, and prognosis timelines.

export const CROP_TRANSLATIONS = {
  'Tomato': { ta: 'தக்காளி', hi: 'टमाटर', en: 'Tomato' },
  'Rice': { ta: 'நெல் / அரிசி', hi: 'धान / चावल', en: 'Rice' },
  'Potato': { ta: 'உருளைக்கிழங்கு', hi: 'आलू', en: 'Potato' },
  'Maize': { ta: 'மக்காச்சோளம்', hi: 'मक्का', en: 'Maize' },
  'Cotton': { ta: 'பருத்தி', hi: 'कपास', en: 'Cotton' },
  'Chilli': { ta: 'மிளகாய்', hi: 'मिर्च', en: 'Chilli' },
  'Wheat': { ta: 'கோதுமை', hi: 'गेहूं', en: 'Wheat' },
  'Brinjal': { ta: 'கத்தரிக்காய்', hi: 'बैंगन', en: 'Brinjal' },
  'Groundnut': { ta: 'வேர்க்கடலை / நிலக்கடலை', hi: 'मूंगफली', en: 'Groundnut' },
  'Sugarcane': { ta: 'கரும்பு', hi: 'गन्ना', en: 'Sugarcane' }
};

export const SEVERITY_TRANSLATIONS = {
  'low': { ta: 'குறைவான தீவிரம்', hi: 'कम / सामान्य', en: 'Low' },
  'mild': { ta: 'லேசான தீவிரம்', hi: 'हल्की गंभीरता', en: 'Mild' },
  'moderate': { ta: 'மிதமான தீவிரம்', hi: 'मध्यम गंभीरता', en: 'Moderate' },
  'severe': { ta: 'அதிக தீவிரம் (அவசர நடவடிக்கை தேவை)', hi: 'गंभीर (तत्काल कार्रवाई आवश्यक)', en: 'Severe' }
};

export const DISEASE_TRANSLATIONS = {
  // Bacterial spot
  'Tomato - Bacterial Spot (Xanthomonas perforans)': {
    ta: 'தக்காளி - பாக்டீரியா இலைப்புள்ளி நோய் (சாந்தோமோனாஸ்)',
    hi: 'टमाटर - जीवाणु पत्ती धब्बा रोग (बैक्टीरियल स्पॉट)'
  },
  // Early blight
  'Tomato - Early Blight (Alternaria solani)': {
    ta: 'தக்காளி - ஆரம்பகால இலைக்கருகல் நோய் (ஆல்டர்நேரியா)',
    hi: 'टमाटर - अगेती झुलसा रोग (अर्ली ब्लाइट)'
  },
  // Late blight
  'Tomato - Late Blight (Phytophthora infestans)': {
    ta: 'தக்காளி - பின்கால இலைக்கருகல் / அடி அழுகல் நோய் (பைட்டோபதோரா)',
    hi: 'टमाटर - पछेती झुलसा रोग (लेट ब्लाइट)'
  },
  // Leaf mold
  'Tomato - Leaf Mold (Passalora fulva)': {
    ta: 'தக்காளி - இலை பூஞ்சான வெல்வெட் நோய்',
    hi: 'टमाटर - पत्ती फफूंद रोग (लीफ मोल्ड)'
  },
  // Septoria
  'Tomato - Septoria Leaf Spot (Septoria lycopersici)': {
    ta: 'தக்காளி - செப்டோரியா வட்ட இலைப்புள்ளி நோய்',
    hi: 'टमाटर - सेप्टोरिया पत्ती धब्बा रोग'
  },
  // Spider mites
  'Tomato - Two-Spotted Spider Mite (Tetranychus urticae)': {
    ta: 'தக்காளி - இருபுள்ளி சிவப்பு சிலந்திப் பேன் தாக்குதல்',
    hi: 'टमाटर - दो-धब्बेदार लाल मकड़ी घुन'
  },
  // Target spot
  'Tomato - Target Spot (Corynespora cassiicola)': {
    ta: 'தக்காளி - இலக்கு வளைய இலைப்புள்ளி நோய்',
    hi: 'टमाटर - टारगेट स्पॉट (निशाना धब्बा रोग)'
  },
  // Yellow leaf curl
  'Tomato - Yellow Leaf Curl Virus (TYLCV)': {
    ta: 'தக்காளி - இலை சுருட்டு நச்சுயிரி (வெள்ளை ஈ பரப்பும் சுருள் நோய்)',
    hi: 'टमाटर - पीली पत्ती मरोड़ विषाणु (लीफ कर्ल वायरस)'
  },
  // Mosaic virus
  'Tomato - Mosaic Virus (ToMV)': {
    ta: 'தக்காளி - தேமல் நச்சுயிரி நோய் (மொசைக் வைரஸ்)',
    hi: 'टमाटर - मोज़ेक वायरस रोग'
  },
  // Healthy
  'Tomato - Healthy Foliage': {
    ta: 'தக்காளி - ஆரோக்கியமான பயிர் (நோயற்ற பசுமை இலைகள்)',
    hi: 'टमाटर - स्वस्थ फसल (रोगमुक्त पत्तियां)'
  },
  'Healthy Plant': {
    ta: 'ஆரோக்கியமான செடி (நோய் இல்லை)',
    hi: 'स्वस्थ पौधा (कोई बीमारी नहीं)'
  },
  'Potato - Early Blight (Alternaria solani)': {
    ta: 'உருளைக்கிழங்கு - ஆரம்பகால இலைக்கருகல் நோய்',
    hi: 'आलू - अगेती झुलसा रोग'
  },
  'Potato - Late Blight (Phytophthora infestans)': {
    ta: 'உருளைக்கிழங்கு - பின்கால கருகல் / கிழங்கு அழுகல் நோய்',
    hi: 'आलू - पछेती झुलसा रोग'
  },
  'Potato - Healthy Foliage': {
    ta: 'உருளைக்கிழங்கு - ஆரோக்கியமான இலைகள்',
    hi: 'आलू - स्वस्थ पत्तियां'
  }
};

// Phrase by phrase dictionary for translating dynamic medicine dosages, timings, actions, and outlooks
export const PHRASE_DICTIONARY = {
  // Types
  'Foliar Nutrient Supplement': {
    ta: 'இலைவழி ஊட்டச்சத்து உரம் (Micronutrient / NPK)',
    hi: 'पत्तियों पर छिड़काव हेतु पोषक तत्व'
  },
  'Micronutrient Tonic': {
    ta: 'நுண்ணூட்டச்சத்து திரவம்',
    hi: 'सूक्ष्म पोषक तत्व टॉनिक'
  },
  'Organic Prophylactic Spray': {
    ta: 'இயற்கை பூச்சி விரட்டி மற்றும் பாதுகாப்பு தெளிப்பு',
    hi: 'जैविक कीट रोधक एवं सुरक्षात्मक स्प्रे'
  },
  'Chemical Bactericide / Fungicide': {
    ta: 'ரசாயன பாக்டீரியா / பூஞ்சாணக் கொல்லி',
    hi: 'रासायनिक जीवाणुनाशक / फफूंदनाशक'
  },
  'Antibacterial formulation': {
    ta: 'பாக்டீரியா எதிர்ப்பு மருந்து',
    hi: 'जीवाणुरोधी दवा'
  },
  'Organic / Biological Control': {
    ta: 'இயற்கை / உயிரியல் பூஞ்சாணக் கட்டுப்பாடு',
    hi: 'जैविक / प्राकृतिक नियंत्रण'
  },
  'Contact Protectant Fungicide': {
    ta: 'தொடுமுறை பாதுகாப்பு பூஞ்சாணக் கொல்லி',
    hi: 'संपर्क सुरक्षात्मक फफूंदनाशक'
  },
  'Systemic Curative Fungicide': {
    ta: 'உள்சென்று குணப்படுத்தும் தீவிர பூஞ்சாணக் கொல்லி',
    hi: 'प्रणालीगत उपचारात्मक फफूंदनाशक'
  },
  'Systemic + Contact Oomycete Fungicide': {
    ta: 'உள்செல்லும் + தொடுமுறை கூட்டு பூஞ்சாண மருந்து',
    hi: 'प्रणालीगत + संपर्क फफूंदनाशक'
  },
  'Fast Knockdown Curative Fungicide': {
    ta: 'விரைவாகக் குணப்படுத்தும் பூஞ்சாண மருந்து',
    hi: 'तीव्र उपचारात्मक फफूंदनाशक'
  },
  'Protective Surface Barrier': {
    ta: 'இலைமேல் பாதுகாப்பு கவசம் உருவாக்கும் மருந்து',
    hi: 'पत्ती सुरक्षा परत फफूंदनाशक'
  },

  // Dosage & Timings
  'Every 12-15 days during active vegetative & flowering stage': {
    ta: 'செடி வளரும் மற்றும் பூக்கும் தருணத்தில் 12-15 நாட்களுக்கு ஒருமுறை',
    hi: 'सक्रिय वृद्धि एवं फूल आने के समय हर 12-15 दिन में'
  },
  'Pre-flowering and fruit-set stages': {
    ta: 'பூ பூக்கும் முன்பும் மற்றும் பிஞ்சு பிடிக்கும் தருணத்திலும்',
    hi: 'फूल आने से पहले और फल लगने की अवस्था में'
  },
  'Every 14 days in early morning': {
    ta: 'அதிகாலை வேளையில் 14 நாட்களுக்கு ஒருமுறை',
    hi: 'सुबह के समय हर 14 दिन में एक बार'
  },
  'Early morning (6:00 AM - 8:30 AM) or cool late evening': {
    ta: 'காலை (6:00 - 8:30 மணிக்குள்) அல்லது மாலையில் வெயில் தணிந்த பின்',
    hi: 'सुबह (6:00 - 8:30 बजे) या शाम को ठंडक होने पर'
  },
  'Spray immediately upon spotting bullseye spots; repeat every 7-10 days': {
    ta: 'இலைகளில் வளையப் புள்ளிகள் தென்பட்டவுடன் தெளிக்கவும்; 7-10 நாட்களுக்குப் பின் மீண்டும் தெளிக்கவும்',
    hi: 'धब्बे दिखते ही तुरंत छिड़कें; 7-10 दिनों के बाद दोबारा छिड़कें'
  },
  'Curative spray when concentric ring lesions are expanding': {
    ta: 'புள்ளிகள் வேகமாகப் பரவும் போது உடனடி சிகிச்சையாகத் தெளிக்கவும்',
    hi: 'जब रोग के धब्बे तेजी से फैल रहे हों तब छिड़कें'
  },
  'Preventative before rainy spell or early vegetative stage': {
    ta: 'மழைக்காலத்திற்கு முன்பாக அல்லது ஆரம்ப வளர்ச்சி கட்டத்தில் தடுப்பு மருந்தாக',
    hi: 'बारिश से पहले या शुरुआती अवस्था में बचाव हेतु'
  },
  'Spray immediately! Do not delay when cool humid weather prevails': {
    ta: 'உடனடியாகத் தெளிக்கவும்! பனி அல்லது மழைக்காலத்தில் தாமதிக்கக் கூடாது',
    hi: 'तुरंत छिड़कें! ठंड और नमी के मौसम में बिल्कुल भी देरी न करें'
  },

  // Instructions / Agronomist Notes
  'Provides balanced macronutrients for dark green foliage and vigorous branching.': {
    ta: 'செடி அடர் பச்சையாக செழித்து வளரவும், கிளைகள் அதிகளவில் உருவாவதற்கும் உதவுகிறது.',
    hi: 'पौधों को गहरा हरा रंग देने और शाखाओं की भरपूर वृद्धि के लिए आवश्यक है।'
  },
  'Prevents blossom end rot and ensures uniform fruit size and glossy skin.': {
    ta: 'பூக்கள் உதிர்வதைத் தடுத்து, காய்கள் சம அளவிலும் பளபளப்பாகவும் வளர உதவுகிறது.',
    hi: 'फूलों को झड़ने से रोकता है और फलों का आकार एकसमान व चमकदार बनाता है।'
  },
  'Repels sucking pests and prevents early spore establishment.': {
    ta: 'சாறு உறிஞ்சும் பூச்சிகளை விரட்டி, ஆரம்பகால பூஞ்சாண வித்துக்கள் உருவாவதைத் தடுக்கிறது.',
    hi: 'रस चूसने वाले कीटों को दूर भगाता है और फफूंद के संक्रमण को रोकता है।'
  },
  'Ensure uniform misting across leaf undersides. Do not mix with acidic foliar fertilizers.': {
    ta: 'இலையின் அடிப்பகுதியில் நன்கு படும்படி தெளிக்கவும். அமிலத்தன்மை கொண்ட உரங்களுடன் கலக்கக் கூடாது.',
    hi: 'पत्तियों के निचले हिस्से पर अच्छी तरह छिड़कें। अम्लीय उर्वरकों के साथ न मिलाएं।'
  },
  'Curative application. Limit to max 2 sprays per season to avoid bacterial resistance.': {
    ta: 'நோய் தீவிரமாகும்போது தெளிக்கவும். ஒரு பருவத்தில் 2 முறைக்கு மேல் தெளிக்க வேண்டாம்.',
    hi: 'रोग की गंभीरता पर छिड़कें। एक सीजन में अधिकतम 2 बार ही उपयोग करें।'
  },
  'Apply during cloud cover or late afternoon. Compatible with organic farming.': {
    ta: 'மேகமூட்டமான நாளில் அல்லது மாலை வேளையில் தெளிக்கவும். இயற்கை விவசாயத்திற்கு ஏற்றது.',
    hi: 'बादल छाए रहने पर या शाम को छिड़कें। जैविक खेती के लिए पूरी तरह अनुकूल है।'
  },
  'Forms a multi-site protective shield over leaf cuticle. Excellent preventer of spore germination.': {
    ta: 'இலைகளின் மேல் பாதுகாப்பு அடுக்கு உருவாக்கி பூஞ்சாணம் முளைப்பதைத் தடுக்கிறது.',
    hi: 'पत्तियों पर सुरक्षात्मक परत बनाकर फफूंद के बीजाणुओं को पनपने से रोकता है।'
  },
  'Systemic translaminar action penetrates deep into infected leaf tissue to stop mycelium growth.': {
    ta: 'இலையினுள் ஊடுருவிச் சென்று உட்புறத்தில் உள்ள பூஞ்சாண வேர்களை அழிக்கிறது.',
    hi: 'पत्तियों के अंदर गहराई तक जाकर फफूंद के फैलाव को तुरंत रोकता है।'
  },
  'Colonizes plant surface and outcompetes Alternaria spores naturally.': {
    ta: 'இயற்கையாகவே இலைப்பரப்பில் நன்மை செய்யும் நுண்ணுயிரிகளைப் பெருக்கி நோயைத் தடுக்கிறது.',
    hi: 'पत्तियों पर मित्र फफूंद बनाकर हानिकारक फफूंद को स्वाभाविक रूप से रोकता है।'
  },

  // Immediate Actions
  'Continue regular irrigation and balanced fertilizer schedule.': {
    ta: 'வழக்கமான பாசன முறை மற்றும் சமச்சீர் உரமிடுதலைத் தொடர்ந்து மேற்கொள்ளவும்.',
    hi: 'नियमित सिंचाई और संतुलित उर्वरक प्रबंधन जारी रखें।'
  },
  'Conduct routine scouting of lower leaf undersides once a week.': {
    ta: 'வாரத்திற்கு ஒருமுறை கீழ் இலைகளின் அடிப்பகுதியை ஆய்வு செய்து பூச்சி/நோய் உள்ளதா என கவனிக்கவும்.',
    hi: 'हफ्ते में एक बार पत्तियों के निचले हिस्से की जांच करें ताकि किसी कीट/रोग का समय पर पता चले।'
  },
  'Maintain support stakes and trellis ties as fruit clusters get heavier.': {
    ta: 'காய்கள் பழுத்து பாரமாகும் போது செடி சாயாமல் இருக்க முட்டுக் கம்புகள் மற்றும் கயிறுகளால் கட்டவும்.',
    hi: 'फलों का वजन बढ़ने पर पौधों को सहारा देने के लिए डंडों और सुतली से बांधें।'
  },
  'Strip off the lowest 3 to 4 branches/leaves that touch the soil or show concentric brown rings.': {
    ta: 'மண்ணில் படும் மற்றும் காய்ந்த வளையப் புள்ளிகள் உள்ள கீழ்ப்பகுதி 3-4 இலைகளைக் கிள்ளி அப்புறப்படுத்தவும்.',
    hi: 'जमीन को छूने वाली और धब्बेदार निचली 3-4 पत्तियों को तुरंत तोड़कर हटा दें।'
  },
  'Clear fallen leaf debris from beneath the plants and incinerate or bury outside the farm boundary.': {
    ta: 'செடியின் அடியில் உதிர்ந்து கிடக்கும் காய்ந்த இலைகளைச் சேகரித்து தோட்டத்திற்கு வெளியே எரித்துவிடவும்.',
    hi: 'पौधों के नीचे गिरी सूखी पत्तियों को इकट्ठा करके खेत से बाहर जलाएं या मिट्टी में दबा दें।'
  },
  'Stake and tie tomato vines upright to promote maximum air circulation.': {
    ta: 'காற்று தாராளமாக வீசும் வகையில் தக்காளிச் செடிகளை நேராக முட்டுக் கொடுத்து கட்டவும்.',
    hi: 'हवा के संचार के लिए पौधों को सीधा डंडों से बांधकर रखें।'
  },
  'Prune and safely bag all severely infected lower leaves; do not drop leaves on field soil.': {
    ta: 'பாதிக்கப்பட்ட இலைகளை கத்தரித்து சாக்குப் பையில் அடைத்து அப்புறப்படுத்தவும்; நிலத்தில் போடக்கூடாது.',
    hi: 'संक्रमित पत्तियों को काटकर बोरे में बंद करें और खेत से बाहर निकालें; जमीन पर न फेंकें।'
  },
  'Immediately pause overhead sprinkler irrigation; switch strictly to drip or furrows to stop bacterial splash.': {
    ta: 'மேலிருந்து தண்ணீர் தெளிக்கும் தெளிப்பானை உடனே நிறுத்தவும்; சொட்டுநீர்ப் பாசனம் மட்டுமே பயன்படுத்தவும்.',
    hi: 'फव्वारा सिंचाई तुरंत बंद करें; केवल ड्रिप या नाली द्वारा ही पानी दें ताकि रोग न फैले।'
  },
  'Disinfect all pruning shears with 70% isopropyl alcohol or 10% household bleach between rows.': {
    ta: 'ஒரு வரிசையிலிருந்து அடுத்த வரிசைக்குச் செல்லும்போது கத்தரிக்கும் கருவியை டெட்டால் அல்லது ஆல்கஹாலால் சுத்தம் செய்யவும்.',
    hi: 'कटाई के औजारों को डेटॉल या सैनिटाइज़र से साफ करके ही दूसरे पौधों पर इस्तेमाल करें।'
  },
  'EMERGENCY ACTION: Late blight is fast-moving. Inspect the entire field immediately.': {
    ta: 'அவசர எச்சரிக்கை: பின்கால கருகல் வேகமாகப் பரவக்கூடியது. உடனடியாக முழுத் தோட்டத்தையும் கண்காணிக்கவும்.',
    hi: 'आपातकालीन चेतावनी: लेट ब्लाइट बहुत तेजी से फैलता है। पूरे खेत का तुरंत निरीक्षण करें।'
  },
  'Uproot and double-bag completely collapsed plants; never compost them, as oospores survive in piles.': {
    ta: 'முற்றிலும் அழுகிய செடிகளை வேரோடு பிடுங்கி பையில் அடைத்து எரிக்கவும்; உரம் தயாரிக்கும் குப்பையில் போடக்கூடாது.',
    hi: 'पूरी तरह सूखे व सड़े पौधों को उखाड़कर नष्ट करें; इन्हें खाद के गड्ढे में बिल्कुल न डालें।'
  },
  'Cease all sprinkler or overhead irrigation immediately; keep row valleys drained.': {
    ta: 'மழைநீர் தேங்காமல் பாத்திகளில் வடிகால் வசதி செய்து, மேலிருந்து நீர்ப்பாசனம் செய்வதைத் தவிர்க்கவும்.',
    hi: 'खेत में पानी जमा न होने दें और फव्वारा सिंचाई तुरंत बंद करें।'
  },

  // Prevention
  'Avoid water stress or sudden waterlogging which cracks developing fruit.': {
    ta: 'தண்ணீர் பற்றாக்குறை அல்லது திடீர் நீர் தேக்கத்தைத் தவிர்க்கவும், இது காய்கள் வெடிப்பதைத் தடுக்கும்.',
    hi: 'सूखा या खेत में अत्यधिक पानी जमा होने से बचाएं जिससे फल फटने की समस्या न हो।'
  },
  'Keep soil mulched and maintain clean farm borders free of weeds.': {
    ta: 'செடியின் அடியில் வைக்கோல் மூடாக்கு அமைத்து, வயல் வரப்புகளில் களைகள் இல்லாமல் சுத்தமாக வைக்கவும்.',
    hi: 'मिट्टी पर पुआल की मल्चिंग करें और खेत की मेड़ों को खरपतवार मुक्त रखें।'
  },
  'Rotate crops annually with legumes or millets to keep soil biota rich.': {
    ta: 'ஆண்டுதோறும் பயறு வகைகள் அல்லது சிறுதானியங்களுடன் பயிர் சுழற்சி செய்து மண் வளத்தைப் பாதுகாக்கவும்.',
    hi: 'दालों या मोटे अनाजों के साथ फसल चक्र अपनाएं ताकि मिट्टी की उर्वरता बनी रहे।'
  },
  'Apply 3 to 4 inches of organic mulch (straw or shredded bark) around the base to prevent rain-splashes.': {
    ta: 'மழைத்துளிகள் மூலம் மண் இலைகளில் தெறிக்காமல் இருக்க செடியின் அடியில் 3-4 அங்குலம் வைக்கோல் பரப்பவும்.',
    hi: 'बारिश की बूंदों से मिट्टी के छींटे पत्तियों पर न पड़ें, इसके लिए 3-4 इंच पुआल बिछाएं।'
  },
  'Ensure balanced potassium (K) nutrition; high nitrogen with low potassium makes leaves highly vulnerable.': {
    ta: 'பொட்டாஷ் உரத்தை சரியான அளவில் இடவும்; அதிக தழைச்சத்து இலைகளை பலவீனப்படுத்தி நோயை உண்டாக்கும்.',
    hi: 'पोटाश का संतुलित प्रयोग करें; अधिक यूरिया (नाइट्रोजन) देने से पत्तियां कमजोर होकर बीमार पड़ती हैं।'
  },
  'Water exclusively at soil level early in the day so foliage remains dry through the night.': {
    ta: 'காலை வேளையில் செடியின் வேர்ப்பகுதியில் மட்டுமே நீர் பாய்ச்சவும், இரவில் இலைகள் ஈரமாக இருக்கக்கூடாது.',
    hi: 'सुबह के समय केवल जड़ के पास पानी दें ताकि रात में पत्तियां सूखी रहें।'
  },
  'Use certified disease-free hot-water treated seeds or bactericide-treated nursery seedlings.': {
    ta: 'சான்றளிக்கப்பட்ட, வெந்நீர் அல்லது மருந்து நேர்த்தி செய்யப்பட்ட தரமான நாற்றுகளையே நடவு செய்யவும்.',
    hi: 'प्रमाणित रोगमुक्त बीज और उपचारित पौध का ही प्रयोग करें।'
  },
  'Strict 2-year crop rotation with non-solanaceous crops (e.g., maize, beans, marigold, millets).': {
    ta: 'தக்காளிக்கு பதிலாக சோளம், உளுந்து, சாமந்தி அல்லது சிறுதானியங்களுடன் 2 ஆண்டு பயிர் சுழற்சி செய்யவும்.',
    hi: 'टमाटर के बाद मक्का, दालें या गेंदा जैसी गैर-सोलेनेसी फसलों के साथ 2 साल का फसल चक्र अपनाएं।'
  },
  'Mulch soil around plants with dry paddy straw or silver-black plastic mulch to block soil splashing.': {
    ta: 'வைக்கோல் அல்லது வெள்ளி-கருப்பு பிளாஸ்டிக் மூடாக்கு தாள்களைப் பயன்படுத்தி மண் தெறிப்பதைத் தடுக்கவும்.',
    hi: 'सूखे पुआल या प्लास्टिक मल्च का उपयोग करें ताकि मिट्टी से फफूंद न फैले।'
  },
  'Maintain wide spacing (minimum 60 cm between plants) for rapid canopy drying after morning dew.': {
    ta: 'காலை பனி விரைவில் காயும் வகையில் செடிகளுக்கு இடையே குறைந்தது 60 செ.மீ இடைவெளி விடவும்.',
    hi: 'सुबह की ओस जल्दी सूखने के लिए पौधों के बीच कम से कम 60 सेमी की दूरी रखें।'
  },
  'Select Phytophthora-tolerant varieties (e.g., Mountain Magic, Defiant, or regional resistant hybrids).': {
    ta: 'நோய் எதிர்ப்புத் திறன் கொண்ட வீரிய ஒட்டு ரகங்களைத் தேர்ந்தெடுத்து சாகுபடி செய்யவும்.',
    hi: 'रोग प्रतिरोधी किस्मों का चयन करें।'
  },
  'Monitor local weather radar: relative humidity >90% with temps 15-22°C triggers aggressive sporulation.': {
    ta: 'வானிலை எச்சரிக்கையைக் கவனிக்கவும்: காற்றில் 90% ஈரப்பதமும் 15-22°C வெப்பமும் இருந்தால் நோய் விரைவாகப் பரவும்.',
    hi: 'मौसम पर नजर रखें: 90% से अधिक नमी और 15-22°C तापमान में यह फफूंद तेजी से फैलती है।'
  },
  'Eradicate volunteer potatoes, nightshade weeds, and tomato cull piles within 500 meters of the field.': {
    ta: 'வயலைச் சுற்றிலும் 500 மீட்டர் சுற்றளவில் உள்ள காட்டு தக்காளி மற்றும் களைச்செடிகளை அகற்றவும்.',
    hi: 'खेत के आसपास उगे जंगली पौधों और पुरानी फसलों के अवशेषों को पूरी तरह नष्ट करें।'
  },

  // Future Prognosis Timeline
  'Optimal plant vigor! Full yield potential expected under current care.': {
    ta: 'பயிர் மிகச் சிறந்த ஆரோக்கியத்துடன் உள்ளது! தற்போதைய பராமரிப்பில் முழுமையான மகசூல் கிடைக்கும்.',
    hi: 'पौधों का स्वास्थ्य उत्कृष्ट है! वर्तमान देखभाल से भरपूर पैदावार की उम्मीद है।'
  },
  'Continuous vegetative growth and healthy dark emerald green leaf luster.': {
    ta: 'தொடர்ச்சியான தழை வளர்ச்சி மற்றும் ஆரோக்கியமான அடர் பச்சை இலைகளின் பளபளப்பு நீடிக்கும்.',
    hi: 'निरंतर स्वस्थ वानस्पतिक वृद्धि और चमकदार गहरी हरी पत्तियां बनी रहेंगी।'
  },
  'Abundant flower cluster setting and healthy green fruit sizing.': {
    ta: 'ஏராளமான பூங்கொத்துகள் உருவாகி பிஞ்சுகள் ஆரோக்கியமாக உருவெடுக்கும்.',
    hi: 'भरपूर फूल आएंगे और फल स्वस्थ रूप से बड़े होंगे।'
  },
  'Watch out for sudden weather shifts (heavy downpours or sudden high humidity) and apply preventative bio-fungicides.': {
    ta: 'திடீர் கனமழை அல்லது அதிக பனிப்பொழிவு ஏற்பட்டால் உடனடியாக இயற்கை பூஞ்சாணத் தடுப்பு மருந்தைத் தெளிக்கவும்.',
    hi: 'मौसम में अचानक बदलाव (भारी बारिश या अधिक नमी) होने पर बचाव हेतु जैविक फफूंदनाशक का छिड़काव करें।'
  },
  'Very manageable with systemic-contact rotation; plant recovery rate > 90% when treated early.': {
    ta: 'ஆரம்பத்திலேயே கவனித்தால் எளிதில் குணப்படுத்தலாம்; செடிகள் 90% மேல் பூரண குணமடைந்து விடும்.',
    hi: 'शुरुआत में ही दवा छिड़कने से 90% से अधिक पौधे पूरी तरह ठीक हो जाते हैं।'
  },
  'Concentric target lesions turn dark, dry, and brittle without yellowish halo expansion.': {
    ta: 'இலைகளில் உள்ள வளையப் புள்ளிகள் மஞ்சள் நிறமாக மாறாமல் காய்ந்து வறண்டு செயலிழந்துவிடும்.',
    hi: 'रोग के धब्बे सूखकर कड़े हो जाएंगे और उनका पीलापन आगे नहीं फैलेगा।'
  },
  'Foliage recovery evident; canopy density stabilizes; fruit yield protected from sunscald.': {
    ta: 'புதிய தளிர்கள் ஆரோக்கியமாகத் தோன்றி காய்களுக்கு நல்ல நிழல் கிடைத்து சூரிய வெப்பு பாதிப்பு தடுக்கப்படும்.',
    hi: 'नई हरी पत्तियां निकलेंगी और फसल सुरक्षित रूप से स्वस्थ हो जाएगी।'
  },
  'Stems developing dark collar-rot girdles near the soil line indicates severe systemic decline.': {
    ta: 'தண்டின் அடிப்பகுதியில் மண்ணை ஒட்டி கறுப்பு நிற அழுகல் வளையம் தென்பட்டால் உடனே வேளாண் அலுவலரை அணுகவும்.',
    hi: 'यदि तने के निचले हिस्से पर काला सड़ा हुआ घेरा दिखे तो तुरंत विशेषज्ञ से संपर्क करें।'
  },
  'Favorable if caught early; high risk of fruit defoliation and sunken fruit lesions if untreated under warm humid conditions.': {
    ta: 'ஆரம்பத்திலேயே மருந்து தெளித்தால் செடி மீண்டுவிடும்; இல்லையெனில் இலைகள் உதிர்ந்து காய்களிலும் கரும்புள்ளிகள் தோன்றும்.',
    hi: 'समय पर उपचार से स्थिति नियंत्रण में रहेगी; अनदेखी करने पर पत्तियां झड़ेंगी और फलों में गड्ढेदार धब्बे बनेंगे।'
  },
  'Active lesions cease expanding and begin drying into crusty papery spots; no new yellow halos should appear on upper shoots.': {
    ta: 'புள்ளிகள் மேற்கொண்டு பரவாமல் தாள்போல காய்ந்துவிடும்; புதிய தளிர்களில் மஞ்சள் வளையங்கள் தோன்றாது.',
    hi: 'सक्रिय धब्बों का फैलाव रुक जाएगा और वे सूख जाएंगे; नई पत्तियों पर कोई पीला घेरा नहीं दिखेगा।'
  },
  'New emerging foliage remains clean and green; plant initiates normal flowering if secondary infection is halted.': {
    ta: 'புதிதாக வளரும் இலைகள் கறையின்றி பசுமையாக இருக்கும்; செடி வழக்கம் போல் பூக்கத் தொடங்கும்.',
    hi: 'नई पत्तियां बिल्कुल साफ और हरी होंगी; पौधा सामान्य रूप से फूल देना शुरू करेगा।'
  },
  'If lesions spread to tomato green fruits or cause premature flower dropping, request an expert agronomic visit.': {
    ta: 'பச்சைக்காய்களில் கரும்புள்ளிகள் பரவினாலோ அல்லது பூக்கள் உதிர்ந்தாலோ வேளாண் வல்லுநரின் உதவியை நாடவும்.',
    hi: 'यदि कच्चे फलों पर धब्बे फैलें या फूल तेजी से गिरें, तो तुरंत कृषि विशेषज्ञ से संपर्क करें।'
  },
  'Critical risk. Can destroy an entire acre within 7-10 days if left untreated under rainy weather; timely fungicides arrest it within 48 hours.': {
    ta: 'தீவிர அபாயம்: மழைக் காலத்தில் 7-10 நாட்களில் தோட்டம் அழியக்கூடும்; உடனே மருந்து தெளித்தால் 48 மணி நேரத்தில் கட்டுப்படுத்தலாம்.',
    hi: 'अत्यंत गंभीर खतरा: बारिश में 7-10 दिनों में फसल बर्बाद हो सकती है; तुरंत छिड़काव करने पर 48 घंटे में रोकथाम संभव है।'
  },
  'Water-soaked patches dry out and turn ash-grey; white downy mildew underneath leaves vanishes.': {
    ta: 'நீர் ஊறிய கறுப்புப் புள்ளிகள் காய்ந்து சாம்பல் நிறமாகும்; இலையின் கீழ் உள்ள வெள்ளை பூஞ்சாணம் மறைந்துவிடும்.',
    hi: 'पानी जैसे गीले धब्बे सूखकर भूरे हो जाएंगे और पत्ती के नीचे की सफेद फफूंद गायब हो जाएगी।'
  },
  'Surviving vines push healthy shoots; stems stay firm; fruit rot risk drops significantly.': {
    ta: 'தண்டுகள் வலுவடைந்து புதிய ஆரோக்கியமான தளிர்கள் உருவாகும்; காய் அழுகல் அபாயம் முற்றிலுமாக குறையும்.',
    hi: 'बचे हुए पौधे स्वस्थ शाखाएं निकालेंगे, तने मजबूत होंगे और फल सड़न का खतरा काफी कम हो जाएगा।'
  },
  'Greasy brown mottled rot spreading to green fruits or stem cankers turning black and soft.': {
    ta: 'காய்களில் எண்ணெய் போன்ற கரும்பழுப்பு அழுகல் தோன்றினாலோ அல்லது தண்டு மென்மையாக உடைந்தாலோ அது ஆபத்தான அறிகுறி.',
    hi: 'यदि कच्चे फलों पर भूरे रंग की सड़न दिखे या तना काला पड़कर गलने लगे तो यह गंभीर खतरे का संकेत है।'
  }
};

import { EXTENDED_AGRONOMIC_PHRASES } from './extendedPhrases';

/**
 * Smart translator function:
 * Translates any crop name, disease name, phrase, action, or fallback text to the selected language.
 */
export function getLocalizedText(text, lang = 'en') {
  if (!text || lang === 'en') return text;

  // 1. Direct phrase dictionary match
  if (PHRASE_DICTIONARY[text] && PHRASE_DICTIONARY[text][lang]) {
    return PHRASE_DICTIONARY[text][lang];
  }

  // 1b. Extended phrase dictionary match
  if (EXTENDED_AGRONOMIC_PHRASES[text] && EXTENDED_AGRONOMIC_PHRASES[text][lang]) {
    return EXTENDED_AGRONOMIC_PHRASES[text][lang];
  }

  // 2. Crop dictionary match
  if (CROP_TRANSLATIONS[text] && CROP_TRANSLATIONS[text][lang]) {
    return CROP_TRANSLATIONS[text][lang];
  }

  // 3. Disease dictionary match
  if (DISEASE_TRANSLATIONS[text] && DISEASE_TRANSLATIONS[text][lang]) {
    return DISEASE_TRANSLATIONS[text][lang];
  }

  // 4. Severity match
  const lower = String(text).toLowerCase();
  if (SEVERITY_TRANSLATIONS[lower] && SEVERITY_TRANSLATIONS[lower][lang]) {
    return SEVERITY_TRANSLATIONS[lower][lang];
  }

  // 5. Dynamic substring pattern replacements (for days, tank sizes, ratios)
  let result = text;

  if (lang === 'ta') {
    result = result
      .replace(/(\d+)\s*g\s*to\s*(\d+)\s*g/gi, '$1 முதல் $2 கிராம்')
      .replace(/(\d+)\s*g\s*per\s*1\s*Litre\s*of\s*water/gi, '1 லிட்டர் தண்ணீருக்கு $1 கிராம்')
      .replace(/(\d+)\s*ml\s*per\s*1\s*Litre\s*of\s*water/gi, '1 லிட்டர் தண்ணீருக்கு $1 மி.லி')
      .replace(/approx\.\s*(\d+)[-–](\d+)\s*g\s*per\s*15L\s*backpack\s*pump/gi, '15 லிட்டர் கைத்தெளிப்பானுக்கு சுமார் $1-$2 கிராம்')
      .replace(/approx\.\s*(\d+)\s*g\s*per\s*15L\s*pump/gi, '15 லிட்டர் கைத்தெளிப்பானுக்கு சுமார் $1 கிராம்')
      .replace(/(\d+)\s*to\s*(\d+)\s*days/gi, '$1 முதல் $2 நாட்கள்')
      .replace(/(\d+)\s*days/gi, '$1 நாட்கள்')
      .replace(/Day\s*(\d+)\s*to\s*(\d+)/gi, 'நாள் $1 முதல் $2')
      .replace(/Early morning/gi, 'அதிகாலை வேளையில்')
      .replace(/cool late evening/gi, 'மாலை வேளையில்')
      .replace(/before harvesting/gi, 'அறுவடைக்கு முன்')
      .replace(/0 days \(Eco-safe, residue free\)/gi, '0 நாட்கள் (இயற்கையானது, நஞ்சற்றது)')
      .replace(/0 days/gi, '0 நாட்கள் (பாதுகாப்பானது)');
  } else if (lang === 'hi') {
    result = result
      .replace(/(\d+)\s*g\s*to\s*(\d+)\s*g/gi, '$1 से $2 ग्राम')
      .replace(/(\d+)\s*g\s*per\s*1\s*Litre\s*of\s*water/gi, '1 लीटर पानी में $1 ग्राम')
      .replace(/(\d+)\s*ml\s*per\s*1\s*Litre\s*of\s*water/gi, '1 लीटर पानी में $1 मि.ली.')
      .replace(/approx\.\s*(\d+)[-–](\d+)\s*g\s*per\s*15L\s*backpack\s*pump/gi, '15 लीटर टंकी में लगभग $1-$2 ग्राम')
      .replace(/approx\.\s*(\d+)\s*g\s*per\s*15L\s*pump/gi, '15 लीटर टंकी में लगभग $1 ग्राम')
      .replace(/(\d+)\s*to\s*(\d+)\s*days/gi, '$1 से $2 दिन')
      .replace(/(\d+)\s*days/gi, '$1 दिन')
      .replace(/Day\s*(\d+)\s*to\s*(\d+)/gi, 'दिन $1 से $2')
      .replace(/Early morning/gi, 'सुबह के समय')
      .replace(/cool late evening/gi, 'शाम के समय')
      .replace(/before harvesting/gi, 'कटाई से पहले')
      .replace(/0 days \(Eco-safe, residue free\)/gi, '0 दिन (पूरी तरह जैविक एवं सुरक्षित)')
      .replace(/0 days/gi, '0 दिन (सुरक्षित)');
  }

  return result;
}
