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
  voiceTranscriptReady: string;
  voiceStopped: string;
  voiceProcessing: string;
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
  speechPreparing: string;
  speechPlaying: string;
  speechStopped: string;
  speechConfidenceLabel: string;
  speechDiagnosisLabel: string;
  speechRecommendationLabel: string;
  speechServiceNotConfigured: string;
  speechRateLimited: string;
  speechGenerationFailed: string;
  retry: string;
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
    voiceTranscriptReady: 'Voice transcript added. Review or edit it before sending.',
    voiceStopped: 'Listening stopped.',
    voiceProcessing: 'Processing speech...',
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
    errorNetwork: 'Network issue connecting to Plant Doctor. Your question was not answered.',
    errorLocalization: 'This message could not be translated. Please try switching languages again.',
    voicePermissionDenied: 'Microphone access was denied. Allow microphone access and try again.',
    voiceRecognitionFailed: 'Voice input could not be completed. Please try again or type your question.',
    speechNotAvailable: 'Speech playback failed. Please try again.',
    speechPreparing: 'Preparing spoken answer...',
    speechPlaying: 'Reading the answer aloud.',
    speechStopped: 'Speech stopped.',
    speechConfidenceLabel: 'Confidence level',
    speechDiagnosisLabel: 'Diagnosis',
    speechRecommendationLabel: 'Recommended actions',
    speechServiceNotConfigured: 'Speech service is not configured on the server. Set the existing Gemini API key to enable speech.',
    speechRateLimited: 'Speech generation is temporarily rate limited or the TTS quota is exhausted. Please retry after a short wait.',
    speechGenerationFailed: 'Speech could not be generated or played. Please try again.',
    retry: 'Retry',
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
    voiceTranscriptReady: 'અવાજનો લખાણ ઉમેરાયો છે. મોકલતા પહેલાં તપાસો અથવા ફેરફાર કરો.',
    voiceStopped: 'સાંભળવાનું બંધ થયું.',
    voiceProcessing: 'અવાજ પર પ્રક્રિયા થઈ રહી છે...',
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
    errorNetwork: 'પ્લાન્ટ ડોક્ટર સાથે નેટવર્ક સમસ્યા છે. તમારા પ્રશ્નનો જવાબ મળ્યો નથી.',
    errorLocalization: 'આ સંદેશનો અનુવાદ થઈ શક્યો નથી. કૃપા કરીને ભાષા ફરીથી બદલો.',
    voicePermissionDenied: 'માઇક્રોફોનની પરવાનગી નકારી છે. પરવાનગી આપીને ફરી પ્રયાસ કરો.',
    voiceRecognitionFailed: 'અવાજથી પ્રશ્ન લઈ શકાયો નથી. ફરી પ્રયાસ કરો અથવા પ્રશ્ન લખો.',
    speechNotAvailable: 'અવાજ વગાડી શકાયો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    speechPreparing: 'જવાબને અવાજમાં તૈયાર કરવામાં આવી રહ્યો છે...',
    speechPlaying: 'જવાબ અવાજમાં સંભળાવવામાં આવી રહ્યો છે.',
    speechStopped: 'અવાજ બંધ કર્યો.',
    speechConfidenceLabel: 'વિશ્વાસનું સ્તર',
    speechDiagnosisLabel: 'નિદાન',
    speechRecommendationLabel: 'ભલામણ કરેલ પગલાં',
    speechServiceNotConfigured: 'સર્વર પર વાણી સેવા ગોઠવેલી નથી. વાણી ચાલુ કરવા હાલની Gemini API કી ગોઠવો.',
    speechRateLimited: 'વાણી સેવા પર હાલ વિનંતીઓની મર્યાદા લાગી છે અથવા TTS ક્વોટા પૂરો થયો છે. થોડી વાર પછી ફરી પ્રયાસ કરો.',
    speechGenerationFailed: 'અવાજ તૈયાર થઈ શક્યો નથી અથવા વગાડી શકાયો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    retry: 'ફરી પ્રયાસ કરો',
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
    voiceTranscriptReady: 'आवाज़ का पाठ जोड़ दिया गया है। भेजने से पहले इसे जांचें या संपादित करें।',
    voiceStopped: 'सुनना बंद हुआ।',
    voiceProcessing: 'आवाज़ संसाधित हो रही है...',
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
    errorNetwork: 'प्लांट डॉक्टर से नेटवर्क कनेक्शन में समस्या है। आपके प्रश्न का उत्तर नहीं मिला।',
    errorLocalization: 'इस संदेश का अनुवाद नहीं हो सका। कृपया भाषा फिर से बदलें।',
    voicePermissionDenied: 'माइक्रोफ़ोन की अनुमति अस्वीकार की गई। अनुमति देकर फिर प्रयास करें।',
    voiceRecognitionFailed: 'आवाज़ से प्रश्न दर्ज नहीं हो सका। फिर प्रयास करें या प्रश्न लिखें।',
    speechNotAvailable: 'आवाज़ नहीं चल सकी। कृपया फिर से प्रयास करें।',
    speechPreparing: 'उत्तर को आवाज़ में तैयार किया जा रहा है...',
    speechPlaying: 'उत्तर आवाज़ में पढ़ा जा रहा है।',
    speechStopped: 'आवाज़ बंद की गई।',
    speechConfidenceLabel: 'विश्वास का स्तर',
    speechDiagnosisLabel: 'निदान',
    speechRecommendationLabel: 'सुझाए गए उपाय',
    speechServiceNotConfigured: 'सर्वर पर वाक् सेवा कॉन्फ़िगर नहीं है। आवाज़ सक्षम करने के लिए मौजूदा Gemini API key सेट करें।',
    speechRateLimited: 'वाक् सेवा पर अभी अनुरोध सीमा लगी है या TTS कोटा पूरा हो गया है। थोड़ी देर बाद फिर प्रयास करें।',
    speechGenerationFailed: 'आवाज़ तैयार या चल नहीं सकी। कृपया फिर से प्रयास करें।',
    retry: 'फिर प्रयास करें',
    userAttachedLeafText: 'प्लांट डॉक्टर जांच हेतु पत्ती की तस्वीर संलग्न की गई है',
  },
};
