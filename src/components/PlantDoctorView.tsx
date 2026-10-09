import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  Send,
  Droplets,
  AlertTriangle,
  Leaf,
  Volume2,
  ChevronRight,
  RefreshCw,
  X,
  CheckCircle2,
  Paperclip,
  Activity,
  Globe,
} from 'lucide-react';
import { Language } from '../data/translations.ts';
import { UserType } from './UserTypeSelection.tsx';
import { PLANT_DOCTOR_I18N } from '../data/plantDoctorI18n.ts';

interface PlantDoctorViewProps {
  userType: UserType;
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  cropName?: string;
  locationName?: string;
  initialQuery?: string;
  latestScanContext?: any;
  onClearScanContext?: () => void;
  onClose?: () => void;
  authToken?: string | null;
}

interface Message {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  time: string;
  imageUrl?: string;
  options?: string[];
  recommendation?: {
    diagnosis: string;
    action: string;
    confidence: string;
  };
  // Cache of translations for this message across languages
  translations?: Partial<
    Record<
      Language,
      {
        text: string;
        options?: string[];
        recommendation?: {
          diagnosis: string;
          action: string;
          confidence: string;
        };
      }
    >
  >;
}

export const PlantDoctorView: React.FC<PlantDoctorViewProps> = ({
  userType,
  lang: propLang,
  onLanguageChange,
  cropName = 'Tomato',
  locationName = 'Rajkot',
  initialQuery,
  latestScanContext,
  onClearScanContext,
  onClose,
  authToken,
}) => {
  // Maintain current active language
  const [currentLang, setCurrentLang] = useState<Language>(propLang || 'en');
  const i18n = PLANT_DOCTOR_I18N[currentLang] || PLANT_DOCTOR_I18N.en;

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Synchronize when parent propLang changes
  useEffect(() => {
    if (propLang && propLang !== currentLang) {
      handleSwitchLanguage(propLang);
    }
  }, [propLang]);

  // Pre-baked multilingual templates for initial starter messages
  const buildInitialStarterMessages = (targetLang: Language): Message[] => {
    if (latestScanContext) {
      const scanCrop = latestScanContext.plantName || cropName;
      const scanCond = latestScanContext.condition || 'Foliar Issue';
      const scanConf = latestScanContext.confidence ? `${latestScanContext.confidence}%` : '88%';

      const scanTexts: Record<Language, { text: string; options: string[]; time: string }> = {
        en: {
          text: `Hello! I am your Plant Doctor at PlantPulse AI. I have reviewed your latest optical scan for ${scanCrop} diagnosed with "${scanCond}" (${scanConf} confidence).\n\nI am ready to help you with safe organic triage, dosage, and irrigation adjustments. What would you like to explore?`,
          options: [
            'What is the best organic treatment for this?',
            'How much neem oil or bio-fungicide should I spray?',
            'How should I adjust watering right now?',
            'Will this spread to neighboring crops or pots?',
          ],
          time: 'Just now',
        },
        gu: {
          text: `નમસ્તે! હું પ્લાન્ટપલ્સ એઆઈ નો પ્લાન્ટ ડોક્ટર છું. મેં તમારા ${scanCrop} નો તાજો સ્કેન જોયો છે: "${scanCond}" (ચોકસાઈ: ${scanConf}).\n\nહું તમને દેશી ઉપચાર, સેન્દ્રિય દવાઓ અને પાણીના નિયમન વિશે માર્ગદર્શન આપવા તૈયાર છું. તમે શું જાણવા માગો છો?`,
          options: [
            'આ રોગ માટે શ્રેષ્ઠ દેશી ઉપચાર શું છે?',
            'શું લીમડાના તેલનો છંટકાવ કરવો જોઈએ?',
            'સિંચાઈ કેવી રીતે રાખવી?',
            'બીજા કયા પાકને આ રોગ લાગી શકે?',
          ],
          time: 'હમણાં',
        },
        hi: {
          text: `नमस्ते! मैं प्लांटपल्स एआई का प्लांट डॉक्टर हूँ। मैंने आपके ${scanCrop} का हालिया स्कैन देखा है: "${scanCond}" (सटीकता: ${scanConf})।\n\nमैं आपको जैविक उपचार, रोकथाम एवं सिंचाई प्रबंधन में सहायता करूँगा। आप क्या पूछना चाहते हैं?`,
          options: [
            'इसके लिए सर्वोत्तम जैविक उपचार क्या है?',
            'नीम तेल का कितना छिड़काव करें?',
            'पानी देने में क्या सावधानी रखें?',
            'क्या यह रोग आसपास के पौधों में फैलेगा?',
          ],
          time: 'अभी',
        },
      };

      const selected = scanTexts[targetLang] || scanTexts.en;
      return [
        {
          id: 'starter-scan-m1',
          sender: 'doctor',
          text: selected.text,
          time: selected.time,
          options: selected.options,
          translations: {
            en: { text: scanTexts.en.text, options: scanTexts.en.options },
            gu: { text: scanTexts.gu.text, options: scanTexts.gu.options },
            hi: { text: scanTexts.hi.text, options: scanTexts.hi.options },
          },
        },
      ];
    }

    // Default conversational starters
    const starterSets: Record<
      Language,
      Array<{ id: string; sender: 'user' | 'doctor'; text: string; time: string; options?: string[] }>
    > = {
      en: [
        {
          id: 'starter-m1',
          sender: 'doctor',
          text: `Hello! I am your Plant Doctor at PlantPulse AI. Tell me what you're seeing on your ${cropName} (${locationName}), or choose an issue below.`,
          time: 'Just now',
        },
        {
          id: 'starter-m2',
          sender: 'user',
          text: 'My tomato leaves are turning yellow at the bottom edges.',
          time: '1 min ago',
        },
        {
          id: 'starter-m3',
          sender: 'doctor',
          text: 'Yellow leaves can have several causes: overwatering, underwatering, or nitrogen nutrient stress.\n\nLet’s narrow it down:\n\nHow often do you water your plant?',
          time: 'Just now',
          options: [
            'Every day',
            'Every other day',
            '2–3 times a week',
            'When soil feels dry',
            "I don't know",
          ],
        },
      ],
      gu: [
        {
          id: 'starter-m1',
          sender: 'doctor',
          text: `નમસ્તે! હું પ્લાન્ટપલ્સ એઆઈ નો પ્લાન્ટ ડોક્ટર છું. તમારા ${cropName} (${locationName}) માં તમે શું જોઈ રહ્યા છો તે જણાવો, અથવા નીચે આપેલા વિકલ્પોમાંથી પસંદ કરો.`,
          time: 'હમણાં',
        },
        {
          id: 'starter-m2',
          sender: 'user',
          text: 'મારા ટામેટાના નીચેના પાંદડા કિનારીઓથી પીળા પડી રહ્યા છે.',
          time: '૧ મિનિટ પહેલા',
        },
        {
          id: 'starter-m3',
          sender: 'doctor',
          text: 'પાંદડા પીળા પડવાના મુખ્ય કારણો: વધુ પડતું પાણી, ઓછી ભેજ અથવા નાઇટ્રોજન પોષક તત્વોની ઉણપ.\n\nચાલો વિશ્લેષણ કરીએ:\n\nતમે તમારા છોડને કેટલી વાર પાણી આપો છો?',
          time: 'હમણાં',
          options: [
            'દરરોજ',
            'એકાંતરે દિવસે',
            'અઠવાડિયામાં ૨-૩ વાર',
            'જ્યારે માટી સુકાઈ જાય ત્યારે',
            'મને ખ્યાલ નથી',
          ],
        },
      ],
      hi: [
        {
          id: 'starter-m1',
          sender: 'doctor',
          text: `नमस्ते! मैं प्लांटपल्स एआई का प्लांट डॉक्टर हूँ। आपके ${cropName} (${locationName}) के बारे में बताएं कि आप क्या लक्षण देख रहे हैं, या नीचे से कोई विषय चुनें।`,
          time: 'अभी',
        },
        {
          id: 'starter-m2',
          sender: 'user',
          text: 'मेरे टमाटर के निचले पत्ते किनारों से पीले पड़ रहे हैं।',
          time: '१ मिनट पहले',
        },
        {
          id: 'starter-m3',
          sender: 'doctor',
          text: 'पत्ते पीले होने के मुख्य कारण: अधिक सिंचाई, कम नमी या नाइट्रोजन पोषक तत्व की कमी।\n\nआइए इसे स्पष्ट करें:\n\nआप अपने पौधे को कितनी बार पानी देते हैं?',
          time: 'अभी',
          options: [
            'रोजाना',
            'एक दिन छोड़कर',
            'हफ्ते में २-३ बार',
            'जब मिट्टी सूखी लगे',
            'मुझे पता नहीं',
          ],
        },
      ],
    };

    const targetList = starterSets[targetLang] || starterSets.en;
    return targetList.map((item, idx) => ({
      ...item,
      translations: {
        en: { text: starterSets.en[idx]?.text || '', options: starterSets.en[idx]?.options },
        gu: { text: starterSets.gu[idx]?.text || '', options: starterSets.gu[idx]?.options },
        hi: { text: starterSets.hi[idx]?.text || '', options: starterSets.hi[idx]?.options },
      },
    }));
  };

  const [messages, setMessages] = useState<Message[]>(() =>
    buildInitialStarterMessages(currentLang)
  );

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isLocalizing]);

  // If initialQuery was provided from ScanStudio or Dashboard
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0) {
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Dynamic language switcher that translates the entire UI AND all visible conversation messages
  const handleSwitchLanguage = async (newLang: Language) => {
    if (newLang === currentLang) return;
    setCurrentLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }

    // Step 1: Immediately localize any messages that have cached translations for newLang
    let needsApiLocalization = false;
    const updatedMessages = messages.map((m) => {
      if (m.translations && m.translations[newLang]) {
        const cached = m.translations[newLang]!;
        return {
          ...m,
          text: cached.text,
          options: cached.options || m.options,
          recommendation: cached.recommendation || m.recommendation,
          time:
            newLang === 'gu'
              ? m.time === 'Just now' || m.time === 'अभी'
                ? 'હમણાં'
                : '૧ મિનિટ પહેલા'
              : newLang === 'hi'
              ? m.time === 'Just now' || m.time === 'હમણાં'
                ? 'अभी'
                : '१ मिनट पहले'
              : m.time === 'હમણાં' || m.time === 'अभी'
              ? 'Just now'
              : '1 min ago',
        };
      }
      // Check if message is a known starter message
      if (m.id.startsWith('starter-')) {
        const starters = buildInitialStarterMessages(newLang);
        const match = starters.find((s) => s.id === m.id);
        if (match) {
          return {
            ...m,
            text: match.text,
            options: match.options,
            time: match.time,
            translations: {
              ...(m.translations || {}),
              [newLang]: { text: match.text, options: match.options },
            },
          };
        }
      }
      needsApiLocalization = true;
      return m;
    });

    setMessages(updatedMessages);

    // Step 2: If there are dynamic user or doctor messages without cached translation, call backend translation
    if (needsApiLocalization) {
      setIsLocalizing(true);
      try {
        const res = await fetch('/api/localize-doctor-messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              id: m.id,
              sender: m.sender,
              text: m.text,
              options: m.options,
              recommendation: m.recommendation,
            })),
            targetLang: newLang,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.messages)) {
            const locMap = new Map(data.messages.map((item: any) => [item.id, item]));
            setMessages((prev) =>
              prev.map((msg) => {
                const loc: any = locMap.get(msg.id);
                if (loc) {
                  return {
                    ...msg,
                    text: loc.text || msg.text,
                    options: loc.options || msg.options,
                    recommendation: loc.recommendation || msg.recommendation,
                    translations: {
                      ...(msg.translations || {}),
                      [newLang]: {
                        text: loc.text || msg.text,
                        options: loc.options || msg.options,
                        recommendation: loc.recommendation || msg.recommendation,
                      },
                    },
                  };
                }
                return msg;
              })
            );
          }
        }
      } catch (err) {
        console.warn('Could not localize messages via API:', err);
      } finally {
        setIsLocalizing(false);
      }
    }
  };

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Text-to-Speech in the selected language
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (currentLang === 'gu') {
        utterance.lang = 'gu-IN';
      } else if (currentLang === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice speech recognition in the selected language
  const toggleVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert(i18n.voiceNotSupported);
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = currentLang === 'gu' ? 'gu-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsRecording(false);
      sendMessage(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const sendMessage = async (textToSend: string, imageToSend?: string | null) => {
    if (!textToSend.trim() && !imageToSend && !attachedImage) return;

    const query = textToSend.trim();
    const currentAttachedImage = imageToSend !== undefined ? imageToSend : attachedImage;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query || (currentAttachedImage ? i18n.userAttachedLeafText : ''),
      time: i18n.justNow,
      imageUrl: currentAttachedImage || undefined,
      translations: {
        [currentLang]: {
          text: query || (currentAttachedImage ? i18n.userAttachedLeafText : ''),
        },
      },
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-plant-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({ sender: m.sender, text: m.text })),
          userMessage: query,
          attachedImage: currentAttachedImage ? { base64: currentAttachedImage } : undefined,
          latestScanContext,
          userContext: {
            userType,
            cropName,
            districtName: locationName,
            growingLocation: userType === 'farmer' ? 'Field Plot' : 'Balcony / Terrace',
          },
          lang: currentLang,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const doctorMsg: Message = {
            id: `d-${Date.now()}`,
            sender: 'doctor',
            text: json.data.replyText,
            time: i18n.justNow,
            options: json.data.suggestedOptions,
            recommendation: json.data.diagnosticInsight,
            translations: {
              [currentLang]: {
                text: json.data.replyText,
                options: json.data.suggestedOptions,
                recommendation: json.data.diagnosticInsight,
              },
            },
          };
          setMessages((prev) => [...prev, doctorMsg]);
          setIsLoading(false);
          return;
        }
      }

      // Offline fallback in pure selected language
      handleOfflineDoctorReply(query);
    } catch (e) {
      console.warn('Network issue reaching /api/chat-plant-doctor. Using local fallback.', e);
      handleOfflineDoctorReply(query);
    } finally {
      setIsLoading(false);
    }
  };

  // Pure localized fallback without language mixing
  const handleOfflineDoctorReply = (query: string) => {
    const isWater =
      query.toLowerCase().includes('water') ||
      query.includes('પાણી') ||
      query.includes('સિંચાઈ') ||
      query.includes('सिंचाई');
    const isWhy =
      query.toLowerCase().includes('why') ||
      query.includes('કેમ') ||
      query.includes('શા માટે') ||
      query.includes('કારણ') ||
      query.includes('क्यों') ||
      query.includes('वजह');

    let replyText = '';
    let options: string[] = [];

    if (latestScanContext) {
      const pName = latestScanContext.plantName || cropName;
      const pCond = latestScanContext.condition || 'Foliar Issue';
      const pCauses =
        Array.isArray(latestScanContext.possibleCauses) && latestScanContext.possibleCauses.length > 0
          ? latestScanContext.possibleCauses.join(', ')
          : currentLang === 'gu'
          ? 'વાતાવરણીય ભેજ અથવા ફૂગના કારણે'
          : currentLang === 'hi'
          ? 'पर्यावरणीय नमी या फफूंद के कारण'
          : 'environmental stress or fungal pathogens';

      if (isWhy) {
        replyText =
          currentLang === 'gu'
            ? `તમારા ${pName} માં "${pCond}" થવાનું મુખ્ય કારણ: ${pCauses}. પાંદડા પર લાંબા સમય સુધી પાણી રહેવું અને હવાની ઓછી અવરજવર આ સમસ્યા વધારે છે.`
            : currentLang === 'hi'
            ? `आपके ${pName} में "${pCond}" का मुख्य कारण: ${pCauses}। पत्तियों पर अधिक समय तक नमी रुकना और अपर्याप्त हवा इसे बढ़ावा देती है।`
            : `Based on your scan of ${pName} with ${pCond}, this typically occurs due to: ${pCauses}. Lingering leaf moisture and crowded foliage create favorable conditions for this.`;
        options =
          currentLang === 'gu'
            ? ['આ રોગ આગળ વધતો કેવી રીતે રોકવો?', 'લીમડાના તેલનો સ્પ્રે ક્યારે કરવો?']
            : currentLang === 'hi'
            ? ['इसे आगे फैलने से कैसे रोकें?', 'नीम तेल का स्प्रे कब करें?']
            : ['How do I stop this from spreading?', 'When should I spray organic neem?'];
      } else if (isWater) {
        replyText =
          currentLang === 'gu'
            ? `${pName} (${pCond}) માટે સિંચાઈ નિયમ: પાંદડા ભીના ન થાય તે રીતે માત્ર કૂંડાં કે જમીનમાં નીચે પાણી આપો. સૂર્યોદય સમયે પાણી આપવું શ્રેષ્ઠ છે.`
            : currentLang === 'hi'
            ? `${pName} (${pCond}) हेतु सिंचाई नियम: पत्तियां गीली न हों, केवल जड़ में मिट्टी पर पानी दें। सुबह के समय हल्की सिंचाई सर्वोत्तम है।`
            : `For ${pName} diagnosed with ${pCond}: Water strictly at the soil level. Keep the foliage completely dry to prevent pathogen spore germination.`;
        options =
          currentLang === 'gu'
            ? ['શું માટીમાં ડ્રેનેજ બરાબર છે?', 'પાણી આપવાનો શ્રેષ્ઠ સમય કયો?']
            : currentLang === 'hi'
            ? ['क्या मिट्टी में जल निकासी ठीक है?', 'सिंचाई का सर्वोत्तम समय क्या है?']
            : ['Is soil drainage adequate?', 'Best time to irrigate?'];
      } else {
        replyText =
          currentLang === 'gu'
            ? `તમારા ${pName} ના "${pCond}" સ્કેન સંદર્ભે: રોગગ્રસ્ત નીચેના પાંદડા તરત કાપો અને હવા ઉજાસ વધારો. પાંદડા પર સેન્દ્રિય લીમડાના અર્કનો છંટકાવ કરો.`
            : currentLang === 'hi'
            ? `आपके ${pName} के "${pCond}" स्कैन संदर्भ में: रोगग्रस्त निचली पत्तियों को तुरंत हटाएं और हवा का प्रवाह बढ़ाएं। पत्तियों पर जैविक नीम का छिड़काव करें।`
            : `Regarding your scan for ${pName} with ${pCond}: Ensure affected lower leaves are sanitized and removed, and stake plants for better canopy aeration. What specific step would you like to verify?`;
        options =
          currentLang === 'gu'
            ? ['શ્રેષ્ઠ દેશી ઉપચાર જણાવો', 'ખાતર આપવું કે નહીં?']
            : currentLang === 'hi'
            ? ['सर्वोत्तम जैविक उपचार बताएं', 'खाद देनी चाहिए या नहीं?']
            : ['What is the best organic treatment?', 'Should I pause fertilization?'];
      }
    } else if (isWater) {
      replyText =
        currentLang === 'gu'
          ? `તમારા ${cropName} (${locationName}) માટે સિંચાઈ સલાહ: પાંદડા પર સીધું પાણી ન છાંટવું. માત્ર થડ પાસે જમીનમાં સવારે ૭ થી ૯ વચ્ચે ભેજ જાળવવો.`
          : currentLang === 'hi'
          ? `आपके ${cropName} (${locationName}) के लिए सिंचाई सलाह: पत्तियों पर ऊपर से पानी न डालें। सुबह के समय केवल मिट्टी में हल्की सिंचाई करें।`
          : `Irrigation guidance for your ${cropName} in ${locationName}: Withhold overhead sprinkler wetting. Drip irrigate early in the morning so foliage stays bone-dry.`;
      options =
        currentLang === 'gu'
          ? ['શું માટીમાં ડ્રેનેજ બરાબર છે?', 'પાણી આપવાનો શ્રેષ્ઠ સમય કયો?']
          : currentLang === 'hi'
          ? ['क्या मिट्टी में जल निकासी ठीक है?', 'सिंचाई का सर्वोत्तम समय क्या है?']
          : ['Is soil drainage adequate?', 'Best time for drip irrigation?'];
    } else {
      replyText =
        currentLang === 'gu'
          ? `મેં તમારી પૂછપરછ નોંધી છે. ${cropName} (${locationName}) ના સંદર્ભમાં, છોડ પર કોઈ કાળા ડાઘ, કરચલી કે જીવાત દેખાય છે?`
          : currentLang === 'hi'
          ? `मैंने आपका प्रश्न दर्ज किया है। ${cropName} (${locationName}) के संदर्भ में, क्या पत्तियों पर कोई धब्बे, सिकुड़न या कीट दिख रहे हैं?`
          : `Understood. For your ${cropName} in ${locationName}, are you noticing leaf curling, chlorotic spots, or active sucking insects?`;
      options =
        currentLang === 'gu'
          ? ['હા, કથ્થઈ ડાઘ છે', 'ના, માત્ર પાંદડા પીળા છે']
          : currentLang === 'hi'
          ? ['हाँ, भूरे धब्बे हैं', 'नहीं, केवल पत्तियां पीली हैं']
          : ['Yes, brown spots visible', 'No, smooth yellowing only'];
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `d-${Date.now()}`,
        sender: 'doctor',
        text: replyText,
        time: i18n.justNow,
        options,
        translations: {
          [currentLang]: { text: replyText, options },
        },
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 select-none text-left">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageAttach}
        className="hidden"
      />

      {/* Header with Title and Prominent Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#8FAF91]/30 pb-5 mb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#245C43] text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-6 h-6 text-[#E5A93D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-[#17382B] font-display">
                {i18n.title}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F1E7] text-[#245C43] border border-[#8FAF91]/30">
                {i18n.badge}
              </span>
            </div>
            <p className="text-xs text-[#546b5e]">
              {i18n.contextLabel(cropName, locationName, userType === 'farmer')}
            </p>
          </div>
        </div>

        {/* Right Controls: In-View Language Selector & Close */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {/* Prominent Three-Way Language Selector */}
          <div className="flex items-center bg-[#FAF8F3] p-1 rounded-xl border border-[#8FAF91]/35 shadow-2xs">
            <button
              onClick={() => handleSwitchLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-[#245C43] text-white shadow-xs'
                  : 'text-[#476353] hover:text-[#17382B]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleSwitchLanguage('gu')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentLang === 'gu'
                  ? 'bg-[#245C43] text-white shadow-xs'
                  : 'text-[#476353] hover:text-[#17382B]'
              }`}
            >
              ગુજરાતી
            </button>
            <button
              onClick={() => handleSwitchLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentLang === 'hi'
                  ? 'bg-[#245C43] text-white shadow-xs'
                  : 'text-[#476353] hover:text-[#17382B]'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[#8FAF91]/35 hover:bg-[#E8F1E7]/70 text-[#245C43] transition-colors cursor-pointer"
              title={i18n.closeTooltip}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE SCAN CONTEXT BANNER (When referred from ScanStudio) */}
      {latestScanContext && (
        <div className="mb-5 p-4 rounded-2xl bg-[#E8F1E7]/60 border border-[#245C43]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            {latestScanContext.imageUrl ? (
              <img
                src={latestScanContext.imageUrl}
                alt="Scan thumbnail"
                className="w-10 h-10 rounded-xl object-cover border border-[#245C43]/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#245C43] text-white flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#245C43]">
                  {i18n.linkedScanBadge}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-[#245C43] border border-[#8FAF91]/40">
                  {i18n.confidenceLabel(latestScanContext.confidence || 88)}
                </span>
              </div>
              <div className="text-xs font-bold text-[#17382B]">
                {latestScanContext.plantName} — {latestScanContext.condition}
              </div>
            </div>
          </div>

          {onClearScanContext && (
            <button
              onClick={onClearScanContext}
              className="text-[11px] font-bold text-[#546b5e] hover:text-[#17382B] underline cursor-pointer"
            >
              {i18n.clearScanContext}
            </button>
          )}
        </div>
      )}

      {/* Specialty Quick Inquiry Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <button
          onClick={() => sendMessage(i18n.actionCheckHealth)}
          className="p-2.5 rounded-xl bg-white hover:bg-[#E8F1E7] border border-[#8FAF91]/30 text-xs font-bold text-[#17382B] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Leaf className="w-3.5 h-3.5 text-[#245C43]" />
          <span>{i18n.actionCheckHealth}</span>
        </button>

        <button
          onClick={() => sendMessage(i18n.actionWatering)}
          className="p-2.5 rounded-xl bg-white hover:bg-[#E8F1E7] border border-[#8FAF91]/30 text-xs font-bold text-[#17382B] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Droplets className="w-3.5 h-3.5 text-[#245C43]" />
          <span>{i18n.actionWatering}</span>
        </button>

        <button
          onClick={() => sendMessage(i18n.actionDisease)}
          className="p-2.5 rounded-xl bg-white hover:bg-[#E8F1E7] border border-[#8FAF91]/30 text-xs font-bold text-[#17382B] flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#E5A93D]" />
          <span>{i18n.actionDisease}</span>
        </button>

        <button
          onClick={toggleVoiceRecording}
          className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            isRecording
              ? 'bg-[#D96B5F] text-white animate-pulse'
              : 'bg-[#245C43] text-white hover:bg-[#1a4431]'
          }`}
          title={i18n.voiceTooltip}
        >
          <Mic className="w-3.5 h-3.5 text-[#E5A93D]" />
          <span>{isRecording ? i18n.actionStopVoice : i18n.actionSpeak}</span>
        </button>
      </div>

      {/* Conversation Messages Container */}
      <div className="bg-white rounded-3xl border border-[#8FAF91]/35 shadow-xs p-4 sm:p-6 mb-4 min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isDoc = m.sender === 'doctor';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isDoc ? 'items-start' : 'items-end'} space-y-2 max-w-2xl ${
                isDoc ? 'mr-auto' : 'ml-auto'
              }`}
            >
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isDoc
                    ? 'bg-[#FAF8F3] border border-[#8FAF91]/35 text-[#17382B]'
                    : 'bg-[#245C43] text-white font-medium'
                }`}
              >
                {m.imageUrl && (
                  <div className="mb-2 max-w-[200px] rounded-xl overflow-hidden border border-white/20">
                    <img src={m.imageUrl} alt="Uploaded attachment" className="w-full h-auto" />
                  </div>
                )}

                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Structured Recommendation Insight if present */}
                {m.recommendation && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-[#8FAF91]/35 space-y-1.5 text-xs">
                    <div className="font-bold text-[#245C43] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{m.recommendation.diagnosis}</span>
                      {m.recommendation.confidence && (
                        <span className="text-[10px] font-mono font-bold text-[#546b5e] ml-auto">
                          {m.recommendation.confidence}
                        </span>
                      )}
                    </div>
                    <p className="text-[#476353]">{m.recommendation.action}</p>
                  </div>
                )}
              </div>

              {/* Timestamp and TTS Read button for Doctor messages */}
              <div className="flex items-center gap-2 px-1 text-[10px] text-[#546b5e]">
                <span>{m.time}</span>
                {isDoc && (
                  <button
                    onClick={() => speakText(m.text)}
                    className="p-1 hover:text-[#245C43] transition-colors cursor-pointer"
                    title={i18n.readAloudTooltip}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Interactive Follow-Up Suggestion Option Chips */}
              {isDoc && m.options && m.options.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => sendMessage(opt)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-[#8FAF91]/40 bg-white hover:bg-[#E8F1E7] text-[#17382B] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{opt}</span>
                      <ChevronRight className="w-3 h-3 text-[#8FAF91]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Dynamic Localization In-Progress Notification */}
        {isLocalizing && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#E8F1E7] border border-[#245C43]/30 max-w-sm text-xs text-[#245C43]">
            <Globe className="w-3.5 h-3.5 animate-spin text-[#245C43]" />
            <span>{i18n.translatingLoading}</span>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 max-w-xs text-xs text-[#245C43]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E5A93D]" />
            <span>{i18n.consultingLoading}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(inputText);
        }}
        className="bg-white p-2 sm:p-3 rounded-2xl border border-[#8FAF91]/35 shadow-xs flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl text-[#476353] hover:text-[#245C43] hover:bg-[#E8F1E7]/70 transition-colors cursor-pointer"
          title={i18n.attachPhotoTooltip}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {attachedImage && (
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#245C43]">
            <img src={attachedImage} alt="Attachment" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="absolute top-0 right-0 bg-black/70 text-white p-0.5 rounded-bl cursor-pointer"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        )}

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={i18n.inputPlaceholder}
          className="flex-1 text-xs sm:text-sm px-2 py-1.5 bg-transparent text-[#17382B] focus:outline-none"
        />

        <button
          type="button"
          onClick={toggleVoiceRecording}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isRecording
              ? 'bg-[#D96B5F] text-white animate-pulse'
              : 'text-[#476353] hover:text-[#245C43] hover:bg-[#E8F1E7]/70'
          }`}
          title={i18n.voiceTooltip}
        >
          <Mic className="w-4 h-4" />
        </button>

        <button
          type="submit"
          disabled={!inputText.trim() && !attachedImage}
          className="p-2.5 bg-[#245C43] hover:bg-[#1a4431] text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
          title={i18n.sendTooltip}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
