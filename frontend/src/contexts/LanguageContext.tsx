import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'sat' | 'ho' | 'khr';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'National / Jharkhand Official' },
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global / Official' },
  { code: 'sat', name: 'Santali', nativeName: 'संथाली (Santali)', region: 'Santhal Pargana / East Singhbhum' },
  { code: 'ho', name: 'Ho', nativeName: 'हो (Ho)', region: 'Kolhan / West Singhbhum' },
  { code: 'khr', name: 'Khortha / Nagpuri', nativeName: 'खोरठा / सादरी (Jharkhandi)', region: 'Chota Nagpur / Ranchi / Dhanbad' }
];

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    sat: string;
    ho: string;
    khr: string;
  };
}

export const DICTIONARY: Translations = {
  appName: {
    en: 'SamadhanSetu',
    hi: 'समाधानसेतु',
    sat: 'समाधानसेतु',
    ho: 'समाधानसेतु',
    khr: 'समाधानसेतु'
  },
  govSubtitle: {
    en: 'Government of India | National Innovation Initiative',
    hi: 'भारत सरकार | राष्ट्रीय नवाचार पहल',
    sat: 'भारत सरकार | दिशोम सुविधार पहल',
    ho: 'भारत सरकार | दिशुम नवाचार पहल',
    khr: 'भारत सरकार | झारखंड राज्य नवाचार पहल'
  },
  tagline: {
    en: 'AI-Powered Societal Challenge Convergence Platform',
    hi: 'एआई-संचालित सामाजिक चुनौती एवं समाधान अभिसरण मंच',
    sat: 'एआई ते समाज रेनाः समोसिया आड़ो सुविधार मंच',
    ho: 'एआई ते समाज रा समिस्या को लगाउ मंच',
    khr: 'एआई-चालित समाज के दुख-तकलीफ सुलझावेक मंच'
  },
  heroHeadline1: {
    en: 'Bridging Citizens, Universities &',
    hi: 'नागरिकों, विश्वविद्यालयों और',
    sat: 'आतो होड़, विश्वविद्यालय आड़ो',
    ho: 'हातु प्रजा, कॉलेज आर',
    khr: 'गांवेक रइयत, कॉलेज आर'
  },
  heroHeadline2: {
    en: 'Industry into Solutions',
    hi: 'उद्योग को समाधान से जोड़ना',
    sat: 'कारखाना को समोसिया ते सुविधार रे जोड़ाय',
    ho: 'कारखाना को समस्या सुविधार रे जोड़ाव',
    khr: 'उद्योग के समाधान ले जोड़ेक पुल'
  },
  heroSubtitle: {
    en: 'SamadhanSetu automates the grassroots innovation lifecycle across India: AI classifies local problems, matches them to university engineering labs, and unlocks industry CSR funding under a transparent joint IP framework.',
    hi: 'समाधानसेतु भारत भर में जमीनी नवाचार चक्र को स्वचालित करता है: एआई स्थानीय समस्याओं को वर्गीकृत करता है, उन्हें विश्वविद्यालय इंजीनियरिंग प्रयोगशालाओं से मिलाता है, और संयुक्त आईपी ढांचे के तहत उद्योग सीएसआर अनुदान दिलाता है।',
    sat: 'समाधानसेतु आतो रेनाः दाक, साड़क, डाक्टर समोसिया को एआई ते चीन्हौ काते कॉलेज आड़ो कारखाना सोनोद ते सुविधार एमाय।',
    ho: 'समाधानसेतु हातु रा दाः, सडक, स्कुल समिस्या को एआई ते विचार केदते कॉलेज आर कारखाना सहायता ते सुविधार बानाव एमाय।',
    khr: 'समाधानसेतु गांव-घर के पानी, सड़क, अस्पताल के समस्या के एआई से तुरंत छांट के कॉलेज के लैब आर कंपनी के सीएसआर फंड से पूरा समाधान करवइया मंच हेकइ।'
  },
  reportProblem: {
    en: 'Report a Problem',
    hi: 'समस्या दर्ज करें',
    sat: 'समोसिया ओल में',
    ho: 'समिस्या ओल दर्जियपे',
    khr: 'अपन समस्या दर्ज करा'
  },
  explorePortals: {
    en: 'Explore Stakeholder Portals',
    hi: 'हितधारक पोर्टल देखें',
    sat: 'कामी पोर्टल को नेल में',
    ho: 'पोर्टल को नेलपे',
    khr: 'सभे विभाग के पोर्टल देखा'
  },
  problemTitle: {
    en: 'Problem Title',
    hi: 'समस्या का शीर्षक',
    sat: 'समोसिया रेनाः चेतान ञुतूम',
    ho: 'समिस्या रा मूतुल',
    khr: 'समस्या के मुख्य बात'
  },
  problemDescription: {
    en: 'Detailed Problem Description',
    hi: 'समस्या का पूरा विवरण',
    sat: 'समोसिया रेनाः पुरा विवरण ओल में',
    ho: 'समिस्या रा पूरा बिवरन ओलपे',
    khr: 'समस्या के पूरा हाल-चाल लिखा'
  },
  uploadPhoto: {
    en: 'Upload Ground Photo Evidence',
    hi: 'मौके की तस्वीर अपलोड करें',
    sat: 'जायगा रेनाः फोटो सांवते एमायपे',
    ho: 'जायगा रा फोटो साओ लगाउपे',
    khr: 'मौका के फोटो साथे लगावा'
  },
  districtLabel: {
    en: 'District',
    hi: 'जिला',
    sat: 'जिला',
    ho: 'दिशुम / जिला',
    khr: 'जिला'
  },
  wardLabel: {
    en: 'Ward / Panchayat',
    hi: 'वार्ड / पंचायत',
    sat: 'टोला / पंचायत',
    ho: 'हातु / पंचायत',
    khr: 'वार्ड / टोला / पंचायत'
  },
  autoGps: {
    en: 'Auto-Detect GPS Coordinates',
    hi: 'जीपीएस स्वतः पहचानें',
    sat: 'जीपीएस अतेद ञाम में',
    ho: 'जीपीएस ते जायगा ञामपे',
    khr: 'जीपीएस से जगह तुरंत खोजा'
  },
  submitBtn: {
    en: 'Submit Grievance to AI Pipeline',
    hi: 'समस्या एआई पाइपलाइन में दर्ज करें',
    sat: 'समोसिया एआई सुविधार रे जोमा में',
    ho: 'समिस्या एआई पाइपलाइन रे ओमायपे',
    khr: 'समस्या के एआई समाधान ले भेजल जा'
  },
  citizensAffected: {
    en: 'Citizens Affected',
    hi: 'प्रभावित नागरिक',
    sat: 'घाटी लेन आतो होड़ को',
    ho: 'कष्ट पावेतन होड़ को',
    khr: 'परेशान लोगन के संख्या'
  },
  recommendedDept: {
    en: 'Recommended Department',
    hi: 'अनुशंसित विभाग',
    sat: 'जोड़ाय विभाग',
    ho: 'अनुशंसित विभाग',
    khr: 'जिम्मेदार कॉलेज विभाग'
  },
  whyRouted: {
    en: 'Why This Was Routed Here',
    hi: 'यह यहाँ क्यों निर्देशित किया गया',
    sat: 'नोवा दो नोड़े चेदाः कुल एना',
    ho: 'नेआ नेंदोर चिनाः कुलेना',
    khr: 'ई समस्या ए कॉलेज के काहे दिहल गेल'
  },
  priorityHigh: {
    en: 'HIGH PRIORITY',
    hi: 'अत्यधिक प्राथमिकता',
    sat: 'लागातार जरूरी',
    ho: 'जोरोरी कामी',
    khr: 'सबले जरूरी'
  },
  submitSuccess: {
    en: 'Problem Captured! AI classification running in background.',
    hi: 'समस्या दर्ज हुई! एआई वर्गीकरण पृष्ठभूमि में सक्रिय है।',
    sat: 'समोसिया ओल एना! एआई ते बाछव चालू मेनाः-आ।',
    ho: 'समिस्या दर्ज एना! एआई कामि एतेयाक।',
    khr: 'समस्या दर्ज भ गेल! एआई जांच कर रहल हे।'
  },
  offlineNotice: {
    en: 'Offline Mode Active. Saved securely to local store.',
    hi: 'ऑफ़लाइन मोड सक्रिय। स्थानीय रूप से सुरक्षित सहेजा गया।',
    sat: 'इंटरनेट बूनूक्-आ। आतो रेगे सांचाव एना।',
    ho: 'नेटवर्क बानोः। जमा केदते दोहो एना।',
    khr: 'नेट नइखे तभो सुरक्षित जमा भ गेल।'
  },
  statsReported: {
    en: 'Reported Challenges',
    hi: 'दर्ज समस्याएं',
    sat: 'ओल लेन समोसिया',
    ho: 'ओलेना समिस्या',
    khr: 'दर्ज समस्या कुल'
  },
  statsUniversities: {
    en: 'Pilot Universities',
    hi: 'सहयोगी विश्वविद्यालय',
    sat: 'सोड़ो विश्वविद्यालय',
    ho: 'हातु कॉलेज को',
    khr: 'जुड़ल विश्वविद्यालय'
  },
  statsFunding: {
    en: 'CSR Funding Engaged',
    hi: 'सीएसआर अनुदान राशि',
    sat: 'कारखाना रूपया सोनोद',
    ho: 'कारखाना टाका सहायता',
    khr: 'सीएसआर फंड'
  },
  statsAccuracy: {
    en: 'AI Routing Accuracy',
    hi: 'एआई रूटिंग सटीकता',
    sat: 'एआई सोझ सटीकता',
    ho: 'एआई बाछव सटीकता',
    khr: 'एआई जांच सटीकता'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentLanguageOption: LanguageOption;
  t: (key: keyof typeof DICTIONARY) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('samadhansetu_lang') as Language;
    return saved || 'hi';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('samadhansetu_lang', lang);
  };

  const t = (key: keyof typeof DICTIONARY): string => {
    if (DICTIONARY[key] && DICTIONARY[key][language]) {
      return DICTIONARY[key][language];
    }
    if (DICTIONARY[key] && DICTIONARY[key]['hi']) {
      return DICTIONARY[key]['hi'];
    }
    return String(key);
  };

  const currentOption = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        currentLanguageOption: currentOption,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
