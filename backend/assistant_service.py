import os
import re
import json
import urllib.request
import logging
from typing import Optional, List, Dict, Any, Tuple
import ml_service

logger = logging.getLogger("assistant_service")

# Supported internal application routes
INTERNAL_ROUTES = {
    "dashboard": {"route": "/dashboard", "en": "Dashboard", "ta": "டாஷ்போர்டு", "hi": "डैशबोर्ड"},
    "scan": {"route": "/scan", "en": "Crop Scan", "ta": "பயிர் ஸ்கேன்", "hi": "फसल स्कैन"},
    "crops": {"route": "/my-crops", "en": "My Crops", "ta": "என் பயிர்கள்", "hi": "मेरी फसलें"},
    "history": {"route": "/history", "en": "Diagnosis History", "ta": "நோயறிதல் வரலாறு", "hi": "निदान इतिहास"},
    "knowledge": {"route": "/knowledge", "en": "Disease Knowledge Base", "ta": "நோய் அறிவுத்தளம்", "hi": "रोग ज्ञान आधार"},
    "alerts": {"route": "/alerts", "en": "Weather & Risk Alerts", "ta": "வானிலை மற்றும் ஆபத்து எச்சரிக்கைகள்", "hi": "मौसम और जोखिम अलर्ट"},
    "notifications": {"route": "/notifications", "en": "Notifications & Reminders", "ta": "அறிவிப்புகள்", "hi": "सूचनाएँ"},
    "experts": {"route": "/experts", "en": "Agricultural Experts", "ta": "வேளாண் நிபுணர்கள்", "hi": "कृषि विशेषज्ञ"},
    "expert_request": {"route": "/expert-request", "en": "Expert Review Request", "ta": "நிபுணர் கோரிக்கை", "hi": "विशेषज्ञ अनुरोध"},
    "profile": {"route": "/profile", "en": "Profile & Settings", "ta": "சுயவிவரம் மற்றும் அமைப்புகள்", "hi": "प्रोफाइल और सेटिंग्स"},
    "how_it_works": {"route": "/how-it-works", "en": "How Payir Kaavalan Works", "ta": "எப்படி செயல்படுகிறது", "hi": "यह कैसे काम करता है"},
    "features": {"route": "/features", "en": "Platform Features", "ta": "அம்சங்கள்", "hi": "सुविधाएँ"},
    "contact": {"route": "/contact", "en": "Contact Support", "ta": "தொடர்பு", "hi": "संपर्क"},
    "login": {"route": "/login", "en": "Sign In", "ta": "உள்நுழைவு", "hi": "लॉगिन"},
}

# Supported verified external websites
EXTERNAL_WEBSITES = [
    {
        "patterns": ["google maps", "maps.google", "கூகுள் மேப்ஸ்", "மேப்ஸ்", "गूगल मैप्स", "मैप्स"],
        "url": "https://maps.google.com",
        "name": "Google Maps",
        "en": "Opening Google Maps in a new tab.",
        "ta": "கூகுள் மேப்ஸ் பக்கத்தை புதிய தாவலில் திறக்கிறேன்.",
        "hi": "गूगल मैप्स को नए टैब में खोल रहा हूँ।"
    },
    {
        "patterns": ["google", "google.com", "கூகுள்", "गूगल"],
        "url": "https://www.google.com",
        "name": "Google Search",
        "en": "Opening Google Search in a new tab.",
        "ta": "கூகுள் தேடுபொறியை புதிய தாவலில் திறக்கிறேன்.",
        "hi": "गूगल सर्च को नए टैब में खोल रहा हूँ।"
    },
    {
        "patterns": ["youtube", "youtube.com", "யூடியூப்", "यूट्यूब"],
        "url": "https://www.youtube.com",
        "name": "YouTube",
        "en": "Opening YouTube in a new tab.",
        "ta": "யூடியூப் பக்கத்தை புதிய தாவலில் திறக்கிறேன்.",
        "hi": "यूट्यूब को नए टैब में खोल रहा हूँ।"
    },
    {
        "patterns": ["farmer portal", "kisan portal", "kisan suvidha", "agricoop", "விவசாய போர்டல்", "किसान पोर्टल"],
        "url": "https://farmer.gov.in",
        "name": "National Farmers Portal (India)",
        "en": "Opening the National Farmers Portal (farmer.gov.in) for government agriculture schemes and advisory.",
        "ta": "அரசு விவசாய திட்டங்களுக்கான தேசிய விவசாயிகள் தளத்தை (farmer.gov.in) திறக்கிறேன்.",
        "hi": "सरकारी योजनाओं और सलाह के लिए राष्ट्रीय किसान पोर्टल (farmer.gov.in) खोल रहा हूँ।"
    },
    {
        "patterns": ["tnau", "tamil nadu agri", "agritech", "வேளாண் இணையதளம்", "டிஎன்ஏயு"],
        "url": "https://agritech.tnau.ac.in",
        "name": "TNAU Agritech Portal",
        "en": "Opening the Tamil Nadu Agricultural University Agritech Portal (agritech.tnau.ac.in).",
        "ta": "தமிழ்நாடு வேளாண் பல்கலைக்கழக அக்ரிடெக் தளத்தை (agritech.tnau.ac.in) திறக்கிறேன்.",
        "hi": "तमिलनाडु कृषि विश्वविद्यालय एग्रीटेक पोर्टल (agritech.tnau.ac.in) खोल रहा हूँ।"
    },
    {
        "patterns": ["weather website", "imd", "வானிலை தளம்", "मौसम वेबसाइट"],
        "url": "https://mausam.imd.gov.in",
        "name": "India Meteorological Department (IMD)",
        "en": "Opening India Meteorological Department (mausam.imd.gov.in) for official weather forecasts.",
        "ta": "இந்திய வானிலை ஆய்வு மையத்தின் அதிகாரப்பூர்வ தளத்தை (mausam.imd.gov.in) திறக்கிறேன்.",
        "hi": "भारतीय मौसम विज्ञान विभाग की आधिकारिक वेबसाइट (mausam.imd.gov.in) खोल रहा हूँ।"
    }
]

def detect_language(text: str, fallback: str = "en") -> str:
    """Detects script or mixed/Romanized languages (Tamil, Hindi, English)."""
    if not text:
        return fallback or "en"
    # Tamil Unicode block
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "ta"
    # Devanagari (Hindi) Unicode block
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    
    text_lower = text.lower()
    # Check for Romanized Tamil (Tanglish)
    tanglish_words = ["enna", "epdi", "irukku", "noi", "ilai", "payir", "vivasayam", "engirundhu", "poradhu", "solunga", "kattunga", "thira", "pannu", "edunga", "thakkali", "nellu", "manjal"]
    if any(re.search(rf'\b{w}\b', text_lower) for w in tanglish_words):
        return "ta"

    # Check for Romanized Hindi (Hinglish)
    hinglish_words = ["kholo", "batao", "kaise", "kare", "karna", "bimari", "fasal", "rasta", "kahan", "mujhe", "chahiye", "tamatar", "paudha", "rog"]
    if any(re.search(rf'\b{w}\b', text_lower) for w in hinglish_words):
        return "hi"

    clean_fb = (fallback or "en").lower().split("-")[0]
    return clean_fb if clean_fb in ["en", "ta", "hi"] else "en"


def handle_directions_request(msg: str, lang: str) -> Optional[Dict[str, Any]]:
    """
    Handles real route and navigation guidance queries with origin & destination.
    Generates genuine Google Maps Directions URL and localized travel advice.
    """
    msg_lower = msg.lower().strip()

    # Direction intent indicators
    direction_keywords = [
        "direction", "directions", "route", "way to", "how to get to", "how do i get to",
        "how to reach", "how can i reach", "navigate to", "path to",
        "வழி", "வழிகாட்டு", "எப்படி போவது", "போறது எப்படி", "செல்லும் வழி",
        "ராஸ்தா", "रास्ता", "मार्ग", "रूट", "कैसे जाएँ", "जाने का रास्ता", "दूरी"
    ]

    has_direction_intent = any(k in msg_lower for k in direction_keywords)
    if not has_direction_intent:
        return None

    origin = None
    destination = None

    from_to_match = re.search(r'(?:from|எங்கிருந்து|से)\s+([^,\.\?]+?)\s+(?:to|வரை|तक|செல்ல|போக)\s+([^,\.\?]+)', msg, re.IGNORECASE)
    if from_to_match:
        origin = from_to_match.group(1).strip()
        destination = from_to_match.group(2).strip()
    else:
        patterns = [
            r'(?:direction[s]?\s+to|route\s+to|how\s+(?:do\s+i|to|can\s+i)\s+(?:get|reach|go)\s+to|navigate\s+to|way\s+to)\s+([^,\.\?]+)',
            r'([^\s,\.\?]+(?:\s+[^\s,\.\?]+)*?)(?:(?:க்கு|லுக்கு|ற்கு|க்குச்)?\s*(?:வழி\s*காட்டு|வழிகாட்டு|எப்படி\s*போவது|செல்லும்\s*வழி|போறது\s*எப்படி))',
            r'(?:வழி\s*காட்டு|வழிகாட்டு)\s+([^,\.\?]+)',
            r'(?:मुझे\s+)?([^\s,\.\?]+(?:\s+[^\s,\.\?]+)*?)(?:\s+(?:जाने\s+)?का\s+रास्ता\s*(?:बताओ|दिखाओ)?|कैसे\s+जाएँ|का\s+रूट)',
            r'(?:ராஸ்தா\s*बताओ|रास्ता\s*बताओ|rasta\s*batao)\s+(?:to\s+|for\s+)?([^,\.\?]+)',
        ]
        for p in patterns:
            m = re.search(p, msg, re.IGNORECASE)
            if m:
                destination = m.group(1).strip()
                break

    if not destination:
        for landmark in [
            "chennai central", "coimbatore", "madurai", "salem", "trichy", "thanjavur", "delhi", "mumbai",
            "railway station", "bus stand", "hospital", "market",
            "சென்னை சென்ட்ரல்", "ரயில் நிலையம்", "பேருந்து நிலையம்", "மருத்துவமனை",
            "रेलवे स्टेशन", "अस्पताल", "बस स्टैंड", "कृषि विज्ञान केंद्र"
        ]:
            if landmark in msg_lower:
                destination = landmark
                break

    if not destination:
        if any(h in msg_lower for h in ["hospital", "மருத்துவமனை", "अस्पताल"]):
            destination = "nearest hospital"
        elif any(r in msg_lower for r in ["railway station", "train station", "ரயில் நிலையம்", "रेलवे स्टेशन"]):
            destination = "nearest railway station"
        elif any(p in msg_lower for p in ["pharmacy", "medical shop", "மருந்தகம்", "दवा की दुकान"]):
            destination = "nearest pharmacy"

    import urllib.parse
    if destination:
        dest_clean = re.sub(r'^(the|a|an|to|for|nearest|அருகிலுள்ள|நज़दीकी)\s+', '', destination, flags=re.IGNORECASE).strip()
        dest_clean = re.sub(r'(?:க்கு|லுக்கு|ற்கு|\s+का|\s+की|\s+के|\s+ka|\s+ki)$', '', dest_clean, flags=re.IGNORECASE).strip()
        encoded_dest = urllib.parse.quote_plus(dest_clean)

        if origin:
            orig_clean = re.sub(r'^(the|a|an|from)\s+', '', origin, flags=re.IGNORECASE).strip()
            encoded_orig = urllib.parse.quote_plus(orig_clean)
            map_url = f"https://www.google.com/maps/dir/?api=1&origin={encoded_orig}&destination={encoded_dest}"
            if lang == "ta":
                reply = f"{orig_clean} முதல் {dest_clean} வரை செல்வதற்கான கூகுள் மேப்ஸ் நேரலை வழிகாட்டலைத் திறக்கிறேன். நிகழ்நேர வழித்தடம், போக்குவரத்து மற்றும் பயண நேரத்தை மேப்ஸில் பார்க்கலாம்."
            elif lang == "hi":
                reply = f"{orig_clean} से {dest_clean} जाने के लिए गूगल मैप्स का रास्ता खोल रहा हूँ। आप लाइव रूट, ट्रैफिक और समय गूगल मैप्स में देख सकते हैं।"
            else:
                reply = f"Opening Google Maps route from {orig_clean} to {dest_clean}. You can view live turn-by-turn navigation, estimated travel time, and traffic updates."
        else:
            map_url = f"https://www.google.com/maps/dir/?api=1&destination={encoded_dest}"
            if lang == "ta":
                reply = f"{dest_clean} செல்வதற்கான கூகுள் மேப்ஸ் வழிகாட்டலைத் திறக்கிறேன். உங்கள் தற்போதைய இடத்திலிருந்து நேரலை வழித்தடம் மற்றும் தூரத்தைக் காணலாம்."
            elif lang == "hi":
                reply = f"{dest_clean} जाने के लिए गूगल मैप्स का रास्ता खोल रहा हूँ। आपकी वर्तमान स्थिति से सटीक मार्ग और दूरी दिखाई जाएगी।"
            else:
                reply = f"Opening Google Maps directions to {dest_clean}. Turn-by-turn routing and live travel guidance from your current location will be displayed."

        return {
            "reply": reply,
            "route": None,
            "action": "open_url",
            "action_data": {
                "url": map_url,
                "target": f"Directions to {dest_clean}",
                "destination": dest_clean,
                "origin": origin,
                "type": "directions"
            },
            "language": lang,
            "intent": "route_guidance"
        }

    # General navigation without destination
    if lang == "ta":
        reply = "நீங்கள் செல்ல விரும்பும் இடத்தை (எ.கா: சென்னை சென்ட்ரல் அல்லது அருகிலுள்ள மருத்துவமனை) கூறுங்கள். அதற்கான நேரலை வழித்தடத்தை கூகுள் மேப்ஸில் காட்டுகிறேன்."
    elif lang == "hi":
        reply = "कृपया वह स्थान बताएं जहाँ आप जाना चाहते हैं (जैसे: चेन्नई सेंट्रल या नज़दीकी अस्पताल)। मैं गूगल मैप्स में सही रास्ता दिखा दूँगा।"
    else:
        reply = "Please tell me the destination you want to reach (for example: Chennai Central or nearest hospital), and I will generate live Google Maps turn-by-turn directions."

    return {
        "reply": reply,
        "route": None,
        "action": "open_url",
        "action_data": {
            "url": "https://maps.google.com",
            "target": "Google Maps",
            "type": "maps_home"
        },
        "language": lang,
        "intent": "route_guidance"
    }


def handle_language_switch_request(msg_lower: str) -> Optional[Tuple[str, str, Dict[str, Any]]]:
    """Detects requests to switch language."""
    # Tamil
    if ("tamil" in msg_lower and any(w in msg_lower for w in ["switch", "change", "set", "speak", "translate", "language"])) or \
       any(p in msg_lower for p in ["தமிழுக்கு மாற்று", "தமிழில் பேசு", "தமிழ் மொழி", "தமிழில் மாற்று", "tamil la pesu", "tamilku maathu"]):
        reply = "மொழியைத் தமிழுக்கு மாற்றியுள்ளேன். இனி உங்களுக்குத் தமிழில் வழிகாட்டுகிறேன்."
        return reply, "ta", {"language": "ta"}
    
    # Hindi
    if ("hindi" in msg_lower and any(w in msg_lower for w in ["switch", "change", "set", "speak", "translate", "language"])) or \
       any(p in msg_lower for p in ["हिंदी में बदलो", "हिंदी में बात करो", "हिंदी भाषा", "हिंदी करो", "hindi me bolo", "hindi karo"]):
        reply = "भाषा को हिंदी में बदल दिया गया है। अब मैं आपको हिंदी में सहायता दूँगा।"
        return reply, "hi", {"language": "hi"}
    
    # English
    if ("english" in msg_lower and any(w in msg_lower for w in ["switch", "change", "set", "speak", "translate", "language"])) or \
       any(p in msg_lower for p in ["ஆங்கிலத்தில் பேசு", "ஆங்கிலத்திற்கு மாற்று", "अंग्रेजी में बोलो", "अंग्रेजी में बदलो", "english la pesu"]):
        reply = "I have switched the language to English. How can I assist you today?"
        return reply, "en", {"language": "en"}
        
    return None


def handle_action_request(msg: str, lang: str) -> Optional[Dict[str, Any]]:
    """
    Understands requests to open, navigate, or operate supported features/websites.
    Returns dictionary with reply, route/action, action_data, intent if action detected.
    """
    msg_lower = msg.lower().strip()

    # 1. Language change action
    lang_switch = handle_language_switch_request(msg_lower)
    if lang_switch:
        reply, target_lang, data = lang_switch
        return {
            "reply": reply,
            "route": None,
            "action": "change_language",
            "action_data": data,
            "language": target_lang,
            "intent": "open_or_navigate"
        }

    # 2. Check for route and directions guidance requests
    dir_result = handle_directions_request(msg, lang)
    if dir_result:
        return dir_result

    # 3. Check for explicit URL in query (e.g. "open https://example.com" or "go to www.example.com")
    url_match = re.search(r'(https?://[^\s]+|www\.[^\s]+)', msg_lower)
    if url_match:
        raw_url = url_match.group(1)
        full_url = raw_url if raw_url.startswith("http") else f"https://{raw_url}"
        if lang == "ta":
            reply = f"{full_url} என்ற இணையதளத்தை புதிய தாவலில் திறக்கிறேன்."
        elif lang == "hi":
            reply = f"{full_url} वेबसाइट को नए टैब में खोल रहा हूँ।"
        else:
            reply = f"Opening {full_url} in a new tab."
        return {
            "reply": reply,
            "route": None,
            "action": "open_url",
            "action_data": {"url": full_url, "target": "External Website"},
            "language": lang,
            "intent": "open_or_navigate"
        }

    # 4. Check for recognized external websites
    is_open_intent = any(k in msg_lower for k in [
        "open", "go to", "launch", "browse", "visit", "show me", 
        "திற", "செல்", "காட்டு", "போ",
        "खोलो", "खोलें", "जाओ", "दिखाओ", "ले चलो"
    ])

    for site in EXTERNAL_WEBSITES:
        if any(p in msg_lower for p in site["patterns"]):
            reply = site.get(lang) or site["en"]
            return {
                "reply": reply,
                "route": None,
                "action": "open_url",
                "action_data": {"url": site["url"], "target": site["name"]},
                "language": lang,
                "intent": "open_or_navigate"
            }

    # 4. Check for in-app internal navigation
    # Crop Scan
    if any(k in msg_lower for k in ["scan", "camera", "leaf photo", "take photo", "upload image", "படம் எடு", "ஸ்கேன்", "கேமரா", "स्कैन", "कैमरा", "फोटो"]):
        if is_open_intent or any(k in msg_lower for k in ["how do i scan", "start scan"]):
            info = INTERNAL_ROUTES["scan"]
            if lang == "ta":
                reply = f"பயிர் ஸ்கேன் பக்கத்தைத் திறக்கிறேன். சூரிய வெளிச்சத்தில் பாதிக்கப்பட்ட இலையின் தெளிவான படத்தை எடுக்கவும்."
            elif lang == "hi":
                reply = f"फसल स्कैन पेज खोल रहा हूँ। दिन की रोशनी में प्रभावित पत्ती की साफ फोटो लें।"
            else:
                reply = f"Opening Crop Scan. Take a clear photo of the affected leaf in bright daylight for AI analysis."
            return {
                "reply": reply,
                "route": info["route"],
                "action": "navigate",
                "action_data": {"route": info["route"]},
                "language": lang,
                "intent": "open_or_navigate"
            }

    # My Crops
    if any(k in msg_lower for k in ["my crops", "crop list", "my farm", "என் பயிர்", "பயிர்கள்", "मेरी फसल", "फसलें"]):
        if is_open_intent:
            info = INTERNAL_ROUTES["crops"]
            if lang == "ta":
                reply = "உங்கள் பயிர்கள் பக்கத்தைத் திறக்கிறேன். இங்கே உங்கள் நிலத்தில் உள்ள பயிர்களின் நிலையைப் பார்க்கலாம்."
            elif lang == "hi":
                reply = "आपकी फसलें पेज खोल रहा हूँ। यहाँ आप अपनी फसलों की स्थिति देख सकते हैं।"
            else:
                reply = "Opening My Crops page where you can manage your tracked farm crops."
            return {
                "reply": reply,
                "route": info["route"],
                "action": "navigate",
                "action_data": {"route": info["route"]},
                "language": lang,
                "intent": "open_or_navigate"
            }

    # History
    if any(k in msg_lower for k in ["history", "past scan", "previous scan", "old scan", "வரலாறு", "முந்தைய", "இतिहास", "पिछला स्कैन"]):
        if is_open_intent:
            info = INTERNAL_ROUTES["history"]
            if lang == "ta":
                reply = "உங்கள் முந்தைய ஸ்கேன் வரலாற்றைத் திறக்கிறேன்."
            elif lang == "hi":
                reply = "आपके पिछले स्कैन इतिहास का पेज खोल रहा हूँ।"
            else:
                reply = "Opening your past Diagnosis History."
            return {
                "reply": reply,
                "route": info["route"],
                "action": "navigate",
                "action_data": {"route": info["route"]},
                "language": lang,
                "intent": "open_or_navigate"
            }

    # Alerts & Weather
    if any(k in msg_lower for k in ["weather", "alert", "humidity", "rain", "வானிலை", "மழை", "எச்சரிக்கை", "मौसम", "बारिश", "अलर्ट"]):
        if is_open_intent:
            info = INTERNAL_ROUTES["alerts"]
            if lang == "ta":
                reply = "வானிலை மற்றும் நோய் ஆபத்து எச்சரிக்கைகள் பக்கத்தைத் திறக்கிறேன்."
            elif lang == "hi":
                reply = "मौसम और बीमारी जोखिम अलर्ट पेज खोल रहा हूँ।"
            else:
                reply = "Opening Weather & Risk Alerts page to view local humidity and disease outbreak risks."
            return {
                "reply": reply,
                "route": info["route"],
                "action": "navigate",
                "action_data": {"route": info["route"]},
                "language": lang,
                "intent": "open_or_navigate"
            }

    # Agricultural Experts
    if any(k in msg_lower for k in ["expert", "agronomist", "officer", "doctor", "consult", "நிபுணர்", "அலுவலர்", "ஆலோசனை", "विशेषज्ञ", "कृषि अधिकारी", "परामर्श"]):
        if is_open_intent or "how to contact" in msg_lower:
            info = INTERNAL_ROUTES["experts"]
            if lang == "ta":
                reply = "வேளாண் நிபுணர்கள் பக்கத்தைத் திறக்கிறேன். இங்கே தகுதிவாய்ந்த நிபுணர்களிடம் நேரடி ஆலோசனை பெறலாம்."
            elif lang == "hi":
                reply = "कृषि विशेषज्ञ पेज खोल रहा हूँ। यहाँ आप योग्य विशेषज्ञों से परामर्श ले सकते हैं।"
            else:
                reply = "Opening Agricultural Experts directory where you can connect with certified agronomists."
            return {
                "reply": reply,
                "route": info["route"],
                "action": "navigate",
                "action_data": {"route": info["route"]},
                "language": lang,
                "intent": "open_or_navigate"
            }

    # Knowledge Base
    if any(k in msg_lower for k in ["knowledge", "disease library", "library", "disease info", "அறிவுத்தளம்", "நோய் விவரம்", "ज्ञान आधार", "रोग जानकारी"]):
        if is_open_intent:
            info = INTERNAL_ROUTES["knowledge"]
            if lang == "ta":
                reply = "பயிர் நோய் அறிவுத்தளத்தைத் திறக்கிறேன். அனைத்து பயிர்களின் அறிகுறிகள் மற்றும் தடுப்பு முறைகளை இங்கே படிக்கலாம்."
            elif lang == "hi":
                reply = "रोग ज्ञान आधार खोल रहा हूँ। यहाँ आप लक्षणों और रोकथाम की जानकारी पढ़ सकते हैं।"
            else:
                reply = "Opening the Disease Knowledge Base library."
            return {
                "reply": reply,
                "route": info["route"],
                "action": "navigate",
                "action_data": {"route": info["route"]},
                "language": lang,
                "intent": "open_or_navigate"
            }

    # Profile & Settings
    if any(k in msg_lower for k in ["profile", "settings", "account", "language setting", "சுயவிவரம்", "அமைப்பு", "प्रोफाइल", "सेटिंग"]):
        if is_open_intent:
            info = INTERNAL_ROUTES["profile"]
            if lang == "ta":
                reply = "உங்கள் சுயவிவரம் மற்றும் அமைப்புகள் பக்கத்தைத் திறக்கிறேன்."
            elif lang == "hi":
                reply = "आपकी प्रोफाइल और सेटिंग्स पेज खोल रहा हूँ।"
            else:
                reply = "Opening your Profile and Settings page."
            return {
                "reply": reply,
                "route": info["route"],
                "action": "navigate",
                "action_data": {"route": info["route"]},
                "language": lang,
                "intent": "open_or_navigate"
            }

    # Destructive or Security Sensitive Actions
    if any(k in msg_lower for k in ["delete", "erase", "அழிக்க", "நீக்க", "हटाओ", "डिलीट"]):
        if lang == "ta":
            reply = "பாதுகாப்பு காரணமாக தரவுகளை தானாக அழிக்க முடியாது. அந்தப் பக்கத்திற்குச் சென்று நீங்களே உறுதிப்படுத்த (Confirm) வேண்டும்."
        elif lang == "hi":
            reply = "सुरक्षा कारणों से डेटा को स्वचालित रूप से हटाया नहीं जा सकता। कृपया संबंधित पेज पर जाकर स्वयं पुष्टि (Confirm) करें।"
        else:
            reply = "For your security, items cannot be deleted automatically by voice. Please navigate to the item and confirm deletion manually."
        return {
            "reply": reply,
            "route": None,
            "action": None,
            "language": lang,
            "intent": "unsupported_action"
        }

    return None


def generate_how_to_guidance(msg: str, lang: str) -> Optional[Dict[str, Any]]:
    """
    Detects how-to procedural questions and produces simple, actionable step-by-step instructions.
    """
    msg_lower = msg.lower()
    is_how_to = any(p in msg_lower for p in [
        "how to", "how do i", "how can i", "steps to", "guide me to",
        "எப்படி", "வழிகாட்ட", "முறைகள்", "epdi", "pannu",
        "कैसे", "तरीका", "कदम", "batao", "karo", "khole"
    ])
    if not is_how_to:
        return None

    # How to open a website
    if (any(p in msg_lower for p in ["website", "இணையதள", "வேப்சைட", "वेबसाइट", "web site"]) and any(o in msg_lower for o in ["open", "திற", "खोल", "browse", "பார்", "pannu", "karo", "khole"])) or \
       any(p in msg_lower for p in ["open a website", "open website", "browse website", "inda website", "ye website"]):
        if lang == "ta":
            reply = (
                "இணையதளத்தைத் திறக்கும் எளிய படிகள்:\n"
                "1. உங்கள் போன் அல்லது கணினியில் Chrome அல்லது Edge உலாவியைத் திறக்கவும்.\n"
                "2. திரையின் மேற்புறத்தில் உள்ள முகவரிப் பட்டியைத் (Address Bar) தட்டவும்.\n"
                "3. இணையதள முகவரியைத் தட்டச்சு செய்யவும் (எ.கா: www.google.com).\n"
                "4. கீபோர்டில் Enter அல்லது Go அழுத்தவும். இணையதளம் உடனே திறக்கும்."
            )
        elif lang == "hi":
            reply = (
                "वेबसाइट खोलने के सरल कदम:\n"
                "1. अपने फोन या कंप्यूटर में Chrome या Edge ब्राउज़र खोलें।\n"
                "2. स्क्रीन के सबसे ऊपर दिए गए एड्रेस बार (Address Bar) पर टैप करें।\n"
                "3. वेबसाइट का पता टाइप करें (जैसे: www.google.com)।\n"
                "4. कीबोर्ड पर Enter या Go दबाएँ। वेबसाइट स्क्रीन पर खुल जाएगी।"
            )
        else:
            reply = (
                "Step-by-step guide to open a website:\n"
                "1. Open your web browser (such as Google Chrome, Edge, or Safari).\n"
                "2. Tap the address bar at the top of the browser window.\n"
                "3. Type the website address (for example: www.google.com).\n"
                "4. Press Enter or Go on your keyboard. The page will load immediately."
            )
        return {"reply": reply, "route": None, "action": None, "language": lang, "intent": "how_to"}

    # How to take a leaf photo / scan crop
    if any(p in msg_lower for p in ["scan", "photo", "leaf", "camera", "படம்", "இலை", "ஸ்கேன்", "फोटो", "पत्ती"]):
        if lang == "ta":
            reply = (
                "பயிர் இலையைச் சரியாக ஸ்கேன் செய்யும் படிகள்:\n"
                "1. 'பயிர் ஸ்கேன்' (Crop Scan) பக்கத்தைத் திறக்கவும்.\n"
                "2. நல்ல பகல் வெளிச்சத்தில், பாதிக்கப்பட்ட இலையின் மீது கேமராவைக் காட்டவும்.\n"
                "3. கேமரா குவியத்தை (Focus) இலையின் மீது சரியாக வைக்கவும்.\n"
                "4. 'படம் எடு' (Capture) என்பதை அழுத்தி AI மதிப்பீட்டு முடிவைப் பெறவும்."
            )
        elif lang == "hi":
            reply = (
                "पत्ती की सही फोटो स्कैन करने के चरण:\n"
                "1. ऐप में 'क्रॉप स्कैन' (Crop Scan) पेज खोलें।\n"
                "2. दिन की अच्छी रोशनी में प्रभावित पत्ती पर कैमरा केंद्रित करें।\n"
                "3. ध्यान रखें कि पत्ती का रोगग्रस्त हिस्सा साफ और स्पष्ट दिखे।\n"
                "4. फोटो खींचें या अपलोड करें। AI तुरंत परिणाम और रोकथाम के उपाय दिखाएगा।"
            )
        else:
            reply = (
                "How to take a clear crop scan:\n"
                "1. Open the 'Crop Scan' page in Payir Kaavalan.\n"
                "2. Place the affected leaf in bright, natural daylight against a plain background.\n"
                "3. Keep the diseased spot sharply in focus without shadows.\n"
                "4. Tap Capture to receive preliminary AI disease assessment and care instructions."
            )
        return {"reply": reply, "route": "/scan", "action": "navigate", "action_data": {"route": "/scan"}, "language": lang, "intent": "how_to"}

    # How to consult an agricultural expert
    if any(p in msg_lower for p in ["expert", "consult", "doctor", "निபுணர்", "ஆலோசனை", "विशेषज्ञ", "सलाह"]):
        if lang == "ta":
            reply = (
                "வேளாண் நிபுணரைத் தொடர்பு கொள்ளும் வழிகள்:\n"
                "1. மெனுவில் 'நிபுணர்கள்' (Experts) பக்கத்தைத் தேர்ந்தெடுக்கவும்.\n"
                "2. உங்கள் பயிர் வகை மற்றும் பிரச்சினையை விவரித்து இலைப் படத்தைப் பகிரவும்.\n"
                "3. வேளாண் விஞ்ஞானி உங்கள் பதிவை ஆய்வு செய்து தகுந்த வழிகாட்டல் வழங்குவார்."
            )
        elif lang == "hi":
            reply = (
                "कृषि विशेषज्ञ से सलाह लेने के चरण:\n"
                "1. मेनू में 'विशेषज्ञ' (Experts) पेज पर जाएँ।\n"
                "2. अपनी फसल की जानकारी और पत्ती की फोटो के साथ सवाल दर्ज करें।\n"
                "3. कृषि विशेषज्ञ आपकी केस की जाँच करके सही दवा और उपाय बताएंगे।"
            )
        else:
            reply = (
                "How to consult an agricultural expert:\n"
                "1. Open the 'Experts' section from the navigation menu.\n"
                "2. Select a verified agronomist or submit an expert review request with your leaf image.\n"
                "3. An agricultural specialist will review your case and provide verified guidance."
            )
        return {"reply": reply, "route": "/experts", "action": "navigate", "action_data": {"route": "/experts"}, "language": lang, "intent": "how_to"}

    # How to prevent plant diseases
    if any(p in msg_lower for p in ["prevent disease", "disease prevention", "நோய் தடுப்பு", "रोग रोकथाम"]):
        if lang == "ta":
            reply = (
                "பயிர் நோய்களைத் தடுக்கும் முக்கியமான படிகள்:\n"
                "1. நோய் எதிர்ப்புத் திறன் கொண்ட தரமான விதைகளைப் பயன்படுத்தவும்.\n"
                "2. இலைகளின் மேல் தண்ணீர் தெளிப்பதைத் தவிர்த்து, சொட்டு நீர் பாசனம் அமைக்கவும்.\n"
                "3. பயிர் சுழற்சி (Crop Rotation) முறையைக் கடைப்பிடிக்கவும்.\n"
                "4. பாதிக்கப்பட்ட இலைகளை உடனே அகற்றி அழித்துவிடவும்."
            )
        elif lang == "hi":
            reply = (
                "फसल रोगों की रोकथाम के मुख्य उपाय:\n"
                "1. रोग प्रतिरोधी प्रमाणित बीजों का ही उपयोग करें।\n"
                "2. पत्तियों पर पानी जमा होने से बचाने के लिए ड्रिप सिंचाई अपनाएँ।\n"
                "3. हर मौसम में फसल चक्र (Crop Rotation) का पालन करें।\n"
                "4. संक्रमित पत्तियों को तुरंत हटाकर नष्ट कर दें।"
            )
        else:
            reply = (
                "General preventive steps for healthy crops:\n"
                "1. Use certified disease-resistant seeds.\n"
                "2. Water at the base via drip irrigation to keep foliage dry and fungal-free.\n"
                "3. Practice crop rotation to break pest and disease cycles.\n"
                "4. Remove and safely dispose of infected plant debris promptly."
            )
        return {"reply": reply, "route": "/knowledge", "action": "navigate", "action_data": {"route": "/knowledge"}, "language": lang, "intent": "how_to"}

    return None


def answer_general_or_farming_query(msg: str, lang: str) -> Dict[str, Any]:
    """
    Answers technology, science, everyday tasks, agricultural knowledge, and general questions.
    """
    msg_lower = msg.lower()

    # Direct disease knowledge base lookup
    for key, info in ml_service.DISEASE_KNOWLEDGE.items():
        name_lower = info.get("name", "").lower()
        short_lower = info.get("short_name", "").lower()
        if (short_lower and short_lower in msg_lower) or (name_lower and name_lower in msg_lower):
            if lang == "ta":
                reply = f"{info['name']} பற்றிய வழிகாட்டல்: {info['treatment']} தடுப்பு முறை: {info['prevention']}"
            elif lang == "hi":
                reply = f"{info['name']} के लिए सलाह: {info['treatment']} रोकथाम: {info['prevention']}"
            else:
                reply = f"Guidance for {info['name']}: {info['treatment']} Prevention: {info['prevention']}"
            return {"reply": reply, "route": "/knowledge", "action": "navigate", "action_data": {"route": "/knowledge"}, "language": lang, "intent": "crop_advisory"}

    # Common agricultural questions
    if any(k in msg_lower for k in ["npk", "fertilizer", "उर्वरक", "உரம்"]):
        if lang == "ta":
            reply = "NPK உரங்கள் என்பது நைட்ரஜன் (இலை வளர்ச்சி), பாஸ்பரஸ் (வேர் வளர்ச்சி), மற்றும் பொட்டாசியம் (காய் வளர்ச்சி மற்றும் நோய் எதிர்ப்புத் திறன்) ஆகியவற்றின் கலவையாகும். மண் பரிசோதனை செய்து தேவையான விகிதத்தில் இடவும்."
        elif lang == "hi":
            reply = "NPK उर्वरक में नाइट्रोजन (पत्तियों की वृद्धि), फॉस्फोरस (जड़ों का विकास) और पोटाश (फल निर्माण और रोग प्रतिरोध) शामिल हैं। मिट्टी परीक्षण के अनुसार संतुलित मात्रा में उपयोग करें।"
        else:
            reply = "NPK fertilizers provide Nitrogen (for lush vegetative growth), Phosphorus (for strong root development), and Potassium (for fruit quality and disease resistance). Always apply based on soil test recommendations."
        return {"reply": reply, "route": None, "action": None, "language": lang, "intent": "crop_advisory"}

    if any(k in msg_lower for k in ["drip irrigation", "சொட்டு நீர்", "ड्रिप"]):
        if lang == "ta":
            reply = "சொட்டு நீர் பாசனம் என்பது பயிர்களின் வேர்ப்பகுதிக்கு நேரடியாக தண்ணீரைச் செலுத்தும் முறையாகும். இது 40% முதல் 60% வரை தண்ணீரைச் சேமித்து, இலைகளில் பூஞ்சை நோய் பரவாமல் தடுக்கிறது."
        elif lang == "hi":
            reply = "ड्रिप सिंचाई पौधों की जड़ों तक सीधे पानी और पोषक तत्व पहुँचाती है। यह 40% से 60% पानी बचाती है और पत्तियों को सूखा रखकर फंगल रोगों से बचाती है।"
        else:
            reply = "Drip irrigation delivers water and nutrients directly to plant root zones. It saves 40-60% of irrigation water and prevents fungal foliar diseases by keeping leaves dry."
        return {"reply": reply, "route": None, "action": None, "language": lang, "intent": "crop_advisory"}

    # General Technology / Science questions
    if any(k in msg_lower for k in ["operating system", "what is an os", "ஆப்பரேட்டிங் சிஸ்டம்", "ऑपरेटिंग सिस्टम"]):
        if lang == "ta":
            reply = "ஆப்பரேட்டிங் சிஸ்டம் (OS) என்பது கணினி அல்லது மொபைலின் வன்பொருளையும் (Hardware) மென்பொருளையும் (Software) இயக்கும் முதன்மை அமைப்பு மென்பொருள் ஆகும். எ.கா: Android, Windows, iOS."
        elif lang == "hi":
            reply = "ऑपरेटिंग सिस्टम (OS) वह मुख्य सॉफ्टवेयर है जो कंप्यूटर या मोबाइल के हार्डवेयर और अन्य ऐप्स को नियंत्रित करता है। उदाहरण: Android, Windows, iOS।"
        else:
            reply = "An Operating System (OS) is the primary software that manages computer or mobile hardware and software resources. Common examples include Android, Windows, macOS, and Linux."
        return {"reply": reply, "route": None, "action": None, "language": lang, "intent": "general_question"}

    if any(k in msg_lower for k in ["artificial intelligence", "what is ai", "ai என்றால் என்ன", "एआई क्या है"]):
        if lang == "ta":
            reply = "செயற்கை நுண்ணறிவு (AI) என்பது மனிதர்களைப் போல சிந்தித்து, படங்கள், மொழி மற்றும் தரவுகளைப் புரிந்துகொள்ளும் கணினி தொழில்நுட்பமாகும். பயிர் காவலனில் பயிர் நோய்களை உடனே அடையாளம் காண இது உதவுகிறது."
        elif lang == "hi":
            reply = "आर्टिफिशियल इंटेलिजेंस (AI) कंप्यूटर तकनीक है जो इंसानों की तरह सोचकर फोटो, भाषा और डेटा का विश्लेषण कर सकती है। यह फसलों की बीमारियों को तुरंत पहचानने में मदद करती है।"
        else:
            reply = "Artificial Intelligence (AI) refers to smart computer systems that can analyze images, understand human language, and solve complex problems. Payir Kaavalan uses AI computer vision to identify leaf diseases."
        return {"reply": reply, "route": None, "action": None, "language": lang, "intent": "general_question"}

    if any(k in msg_lower for k in ["photosynthesis", "ஒளிச்சேர்க்கை", "प्रकाश संश्लेषण"]):
        if lang == "ta":
            reply = "ஒளிச்சேர்க்கை என்பது தாவரங்கள் சூரிய ஒளி, நீர் மற்றும் காற்றில் உள்ள கார்பன் டை ஆக்சைடைப் பயன்படுத்தி தனக்கான உணவைத் தயாரிக்கும் இயற்கை நிகழ்வு ஆகும்."
        elif lang == "hi":
            reply = "प्रकाश संश्लेषण वह प्रक्रिया है जिसमें हरे पौधे सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड का उपयोग करके अपना भोजन बनाते हैं।"
        else:
            reply = "Photosynthesis is the biological process where green plants use sunlight, water, and carbon dioxide to produce glucose energy and oxygen."
        return {"reply": reply, "route": None, "action": None, "language": lang, "intent": "general_question"}

    # Troubleshooting assistant questions
    if any(k in msg_lower for k in ["mic not working", "microphone", "மைக் வேலை செய்யவில்லை", "माइक काम नहीं कर रहा"]):
        if lang == "ta":
            reply = "மைக்ரோஃபோன் சிக்கலைத் தீர்க்க: உலாவியின் முகவரிப் பட்டியில் உள்ள பூட்டு (Lock) ஐகானைத் தட்டி, மைக்ரோஃபோன் அனுமதியை 'Allow' செய்ய வேண்டும்."
        elif lang == "hi":
            reply = "माइक्रोफ़ोन ठीक करने के लिए: ब्राउज़र के एड्रेस बार में लॉक (Lock) आइकन पर टैप करें और माइक्रोफ़ोन की अनुमति को 'Allow' करें।"
        else:
            reply = "To fix microphone access: Tap the lock icon in your browser address bar and ensure microphone permissions are set to 'Allow'."
        return {"reply": reply, "route": None, "action": None, "language": lang, "intent": "troubleshoot"}

    # Default informative responses
    if lang == "ta":
        reply = "உங்கள் கேள்வியைப் பெற்றேன். பயிர்களை ஸ்கேன் செய்ய 'பயிர் ஸ்கேன்' திறக்கலாம், நோய் அறிவுத்தளத்தைப் படிக்கலாம் அல்லது இணையதளத்தைத் திறக்கக் கூறலாம்."
    elif lang == "hi":
        reply = "मुझे आपका प्रश्न मिला। फसल स्कैन करने के लिए 'क्रॉप स्कैन' खोलें, रोग ज्ञान आधार पढ़ें या मुझसे कोई वेबसाइट खोलने को कहें।"
    else:
        reply = "I received your question. You can ask me to open pages (like Crop Scan or Alerts), explain step-by-step instructions (like how to open a website), or answer crop health questions."

    return {"reply": reply, "route": None, "action": None, "language": lang, "intent": "general_question"}


def run_llm_assistant(query_msg: str, lang: str, history: List[Dict[str, str]]) -> Optional[Dict[str, Any]]:
    """
    Connects to external LLM (Groq / OpenAI) if API key is provided in environment.
    Instructs the LLM to provide step-by-step guidance and actions in JSON format.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not (groq_api_key or openai_api_key):
        return None

    api_key = groq_api_key or openai_api_key
    endpoint = "https://api.groq.com/openai/v1/chat/completions" if groq_api_key else "https://api.openai.com/v1/chat/completions"
    model = "llama-3.1-8b-instant" if groq_api_key else "gpt-3.5-turbo"

    system_prompt = (
        "You are CropCare AI Guide (Payir Kaavalan), an intelligent, multilingual assistant for farmers and general users. "
        "Capabilities:\n"
        "1. Understand natural-language questions in Tamil, English, and Hindi.\n"
        "2. Answer questions on agriculture, technology, general science, education, and everyday life.\n"
        "3. Provide simple, actionable step-by-step instructions for procedural questions (e.g., 'How do I open a website?').\n"
        "4. Recognize action intents: if the user wants to open an internal page (/scan, /my-crops, /history, /alerts, /knowledge, /experts, /profile, /dashboard) or external website (like Google, YouTube, Kisan portal), emit the route or action.\n"
        "5. Respond in the exact language of the user's latest query (Tamil, Hindi, or English).\n"
        "6. Output strict JSON with keys: reply (string with concise, spoken-friendly answer), route (optional string), action (optional string: open_url or navigate or change_language), action_data (optional dict), intent (general_question, how_to, open_or_navigate, troubleshoot, crop_advisory)."
    )

    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-4:]:
        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
    messages.append({"role": "user", "content": query_msg})

    try:
        req_data = json.dumps({
            "model": model,
            "messages": messages,
            "max_tokens": 300,
            "temperature": 0.3
        }).encode("utf-8")

        req = urllib.request.Request(endpoint, data=req_data, headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })

        with urllib.request.urlopen(req, timeout=10) as resp:
            res_json = json.loads(resp.read().decode("utf-8"))
            raw_text = res_json["choices"][0]["message"]["content"].strip()

            # Attempt to parse as JSON response
            if raw_text.startswith("{") and raw_text.endswith("}"):
                try:
                    parsed = json.loads(raw_text)
                    if "reply" in parsed:
                        return {
                            "reply": parsed["reply"],
                            "route": parsed.get("route"),
                            "action": parsed.get("action"),
                            "action_data": parsed.get("action_data"),
                            "language": lang,
                            "intent": parsed.get("intent", "general_question")
                        }
                except Exception:
                    pass

            return {
                "reply": raw_text,
                "route": None,
                "action": None,
                "action_data": None,
                "language": lang,
                "intent": "general_question"
            }
    except Exception as e:
        logger.warning(f"External LLM invocation failed: {e}")
        return None


def process_assistant_chat(message: str, requested_lang: str = "en", history: Optional[List[Any]] = None) -> Dict[str, Any]:
    """
    Main entry point for intelligent chat handling:
    1. Detects language (Tamil, Hindi, English).
    2. Checks for real action execution (open website, in-app navigation, language change).
    3. Checks for procedural how-to tutorials.
    4. Connects to external LLM if configured.
    5. Falls back to verified multilingual knowledge engine.
    """
    clean_msg = (message or "").strip()
    if not clean_msg:
        return {
            "reply": "How can I help you? Ask a question or say 'open crop scan'.",
            "route": None,
            "action": None,
            "action_data": None,
            "language": "en",
            "intent": "general_question"
        }

    lang = detect_language(clean_msg, requested_lang)

    # 1. Action & Navigation handling
    action_result = handle_action_request(clean_msg, lang)
    if action_result:
        return action_result

    # 2. Step-by-step Procedural guidance
    how_to_result = generate_how_to_guidance(clean_msg, lang)
    if how_to_result:
        return how_to_result

    # 3. External LLM (Groq / OpenAI) if configured
    formatted_hist = []
    if history:
        for item in history:
            if hasattr(item, "role") and hasattr(item, "content"):
                formatted_hist.append({"role": item.role, "content": item.content})
            elif isinstance(item, dict):
                formatted_hist.append({"role": item.get("role", "user"), "content": item.get("content", "")})

    llm_result = run_llm_assistant(clean_msg, lang, formatted_hist)
    if llm_result:
        return llm_result

    # 4. Comprehensive Multilingual Domain & General Knowledge Engine
    return answer_general_or_farming_query(clean_msg, lang)
