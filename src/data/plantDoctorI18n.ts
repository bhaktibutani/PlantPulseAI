import { Language } from './translations.ts';

export interface DoctorI18nStrings {
  title: string;
  badge: string;
  contextLabel: (crop: string, location: string, isFarmer: boolean) => string;
  linkedScanBadge: string;
  confidenceLabel: (val: string | number) => string;
  clearScanContext: string;
  actionCheckHealth: string;
  actionWatering: string;
  actionDisease: string;
  actionSpeak: string;
  actionStopVoice: string;
  voiceListening: string;
  voiceNotSupported: string;
  consultingLoading: string;
  translatingLoading: string;
  inputPlaceholder: string;
  attachPhotoTooltip: string;
  voiceTooltip: string;
  sendTooltip: string;
  readAloudTooltip: string;
  justNow: string;
  oneMinAgo: string;
  diagnosisHeading: string;
  actionHeading: string;
  closeTooltip: string;
  errorConsultation: string;
  errorNetwork: string;
  errorLocalization: string;
  voicePermissionDenied: string;
  voiceRecognitionFailed: string;
  speechNotAvailable: string;
  userAttachedLeafText: string;
}

export const PLANT_DOCTOR_I18N: Record<Language, DoctorI18nStrings> = {
  en: {
    title: 'PlantPulse AI',
    badge: 'Plant Doctor AI',
    contextLabel: (crop, location, isFarmer) =>
      `Context: ${crop} · ${location} (${isFarmer ? 'Field Plot' : 'Urban Space'})`,
    linkedScanBadge: 'LINKED OPTICAL SCAN',
    confidenceLabel: (val) => `${val}% confidence`,
    clearScanContext: 'Clear Scan Context',
    actionCheckHealth: 'Check Plant Health',
    actionWatering: 'Watering Help',
    actionDisease: 'Disease Help',
    actionSpeak: 'Speak with Doctor',
    actionStopVoice: 'Stop Voice',
    voiceListening: 'Listening in English... Speak your query.',
    voiceNotSupported: 'Voice speech recognition is not supported in this browser.',
    consultingLoading: 'Consulting Plant Doctor & Gemini 3.8 Flash...',
    translatingLoading: 'Updating conversation to English...',
    inputPlaceholder: 'Ask anything about your plant... (e.g. why are leaves turning yellow?)',
    attachPhotoTooltip: 'Attach photo of leaf or crop specimen',
    voiceTooltip: 'Voice input (English)',
    sendTooltip: 'Send inquiry',
    readAloudTooltip: 'Read out loud in English',
    justNow: 'Just now',
    oneMinAgo: '1 min ago',
    diagnosisHeading: 'Diagnosis',
    actionHeading: 'Immediate Action',
    closeTooltip: 'Close Plant Doctor',
    errorConsultation: 'Plant Doctor is currently unable to complete consultation. Please try again.',
    errorNetwork: 'Network issue connecting to Plant Doctor. Using local agronomic knowledge.',
    errorLocalization: 'This message could not be translated. Please try switching languages again.',
    voicePermissionDenied: 'Microphone access was denied. Allow microphone access and try again.',
    voiceRecognitionFailed: 'Voice input could not be completed. Please try again or type your question.',
    speechNotAvailable: 'Speech output is unavailable for this language on this device.',
    userAttachedLeafText: 'Attached leaf image for plant doctor triage',
  },
  gu: {
    title: 'પ્લાન્ટપલ્સ એઆઈ',
    badge: 'પ્લાન્ટ ડોક્ટર એઆઈ',
    contextLabel: (crop, location, isFarmer) =>
      `સંદર્ભ: ${crop} · ${location} (${isFarmer ? 'ખેતર પ્લોટ' : 'શહેરી કૂંડાં'})`,
    linkedScanBadge: 'જોડાયેલ ઓપ્ટિકલ સ્કેન',
    confidenceLabel: (val) => `${val}% ચોકસાઈ`,
    clearScanContext: 'સ્કેન સંદર્ભ હટાવો',
    actionCheckHealth: 'છોડનું આરોગ્ય તપાસો',
    actionWatering: 'સિંચાઈ સલાહ',
    actionDisease: 'રોગ અને ઉપચાર',
    actionSpeak: 'ડોક્ટર સાથે બોલો',
    actionStopVoice: 'બોલવાનું બંધ કરો',
    voiceListening: 'ગુજરાતીમાં સાંભળી રહ્યું છે... તમારો પ્રશ્ન બોલો.',
    voiceNotSupported: 'તમારા બ્રાઉઝરમાં વોઇસ રેકગ્નિશન સપોર્ટેડ નથી.',
    consultingLoading: 'પ્લાન્ટ ડોક્ટર અને જેમિની એઆઈ સાથે પરામર્શ ચાલુ છે...',
    translatingLoading: 'વાતચીત ગુજરાતીમાં અનુવાદિત થઈ રહી છે...',
    inputPlaceholder: 'પાંદડા, ખાતર અથવા સિંચાઈ વિશે કંઈપણ પૂછો... (દા.ત. પાંદડા કેમ પીળા પડે છે?)',
    attachPhotoTooltip: 'પાંદડા અથવા પાકનો ફોટો જોડો',
    voiceTooltip: 'અવાજ દ્વારા પ્રશ્ન પૂછો (ગુજરાતી)',
    sendTooltip: 'સંદેશ મોકલો',
    readAloudTooltip: 'ગુજરાતીમાં મોટેથી સાંભળો',
    justNow: 'હમણાં',
    oneMinAgo: '૧ મિનિટ પહેલા',
    diagnosisHeading: 'રોગ નિદાન',
    actionHeading: 'તાત્કાલિક પગલું',
    closeTooltip: 'પ્લાન્ટ ડોક્ટર બંધ કરો',
    errorConsultation: 'પ્લાન્ટ ડોક્ટર હાલ પરામર્શ પૂર્ણ કરી શક્યા નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    errorNetwork: 'નેટવર્ક સમસ્યા છે. દેશી કૃષિ જ્ઞાનનો ઉપયોગ કરવામાં આવી રહ્યો છે.',
    errorLocalization: 'આ સંદેશનો અનુવાદ થઈ શક્યો નથી. કૃપા કરીને ભાષા ફરીથી બદલો.',
    voicePermissionDenied: 'માઇક્રોફોનની પરવાનગી નકારી છે. પરવાનગી આપીને ફરી પ્રયાસ કરો.',
    voiceRecognitionFailed: 'અવાજથી પ્રશ્ન લઈ શકાયો નથી. ફરી પ્રયાસ કરો અથવા પ્રશ્ન લખો.',
    speechNotAvailable: 'આ ઉપકરણમાં આ ભાષા માટે અવાજ ઉપલબ્ધ નથી.',
    userAttachedLeafText: 'પ્લાન્ટ ડોક્ટર તપાસ માટે પાંદડાનો ફોટો જોડ્યો છે',
  },
  hi: {
    title: 'प्लांटपल्स एआई',
    badge: 'प्लांट डॉक्टर एआई',
    contextLabel: (crop, location, isFarmer) =>
      `संदर्भ: ${crop} · ${location} (${isFarmer ? 'खेत का रकबा' : 'शहरी गमले'})`,
    linkedScanBadge: 'संबद्ध ऑप्टिकल स्कैन',
    confidenceLabel: (val) => `${val}% सटीकता`,
    clearScanContext: 'स्कैन संदर्भ हटाएं',
    actionCheckHealth: 'पौधे का स्वास्थ्य जांचें',
    actionWatering: 'सिंचाई सहायता',
    actionDisease: 'रोग एवं उपचार',
    actionSpeak: 'डॉक्टर से बोलें',
    actionStopVoice: 'आवाज़ रोकें',
    voiceListening: 'हिंदी में सुन रहा है... अपना प्रश्न बोलें।',
    voiceNotSupported: 'आपके ब्राउज़र में वॉइस रिकॉग्निशन समर्थित नहीं है।',
    consultingLoading: 'प्लांट डॉक्टर और जेमिनी एआई से परामर्श जारी है...',
    translatingLoading: 'बातचीत हिंदी में अनुवादित हो रही है...',
    inputPlaceholder: 'पत्तियों, खाद या सिंचाई के बारे में कुछ भी पूछें... (जैसे पत्तियां पीली क्यों पड़ रही हैं?)',
    attachPhotoTooltip: 'पत्ती या फसल की तस्वीर जोड़ें',
    voiceTooltip: 'आवाज़ द्वारा पूछें (हिन्दी)',
    sendTooltip: 'संदेश भेजें',
    readAloudTooltip: 'हिंदी में बोलकर सुनें',
    justNow: 'अभी',
    oneMinAgo: '१ मिनट पहले',
    diagnosisHeading: 'रोग निदान',
    actionHeading: 'तत्काल कार्रवाई',
    closeTooltip: 'प्लांट डॉक्टर बंद करें',
    errorConsultation: 'प्लांट डॉक्टर अभी परामर्श पूरा नहीं कर सके। कृपया पुनः प्रयास करें।',
    errorNetwork: 'नेटवर्क समस्या है। स्थानीय कृषि ज्ञान का उपयोग किया जा रहा है।',
    errorLocalization: 'इस संदेश का अनुवाद नहीं हो सका। कृपया भाषा फिर से बदलें।',
    voicePermissionDenied: 'माइक्रोफ़ोन की अनुमति अस्वीकार की गई। अनुमति देकर फिर प्रयास करें।',
    voiceRecognitionFailed: 'आवाज़ से प्रश्न दर्ज नहीं हो सका। फिर प्रयास करें या प्रश्न लिखें।',
    speechNotAvailable: 'इस डिवाइस पर इस भाषा के लिए वाक् आउटपुट उपलब्ध नहीं है।',
    userAttachedLeafText: 'प्लांट डॉक्टर जांच हेतु पत्ती की तस्वीर संलग्न की गई है',
  },
};
