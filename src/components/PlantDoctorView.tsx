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
import { cropDisplayName, Language } from '../data/translations.ts';
import { UserType } from './UserTypeSelection.tsx';
import { PLANT_DOCTOR_I18N } from '../data/plantDoctorI18n.ts';
import { localizeGujaratLocation } from '../data/gujaratLocations.ts';

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

const getSpeakableResponse = (
  message: Message,
  labels: { diagnosis: string; confidence: string; recommendation: string },
): string => {
  const segments = [
    { text: message.text, label: '' },
    { text: message.recommendation?.diagnosis || '', label: labels.diagnosis },
    { text: message.recommendation?.confidence || '', label: labels.confidence },
    { text: message.recommendation?.action || '', label: labels.recommendation },
  ].filter((segment) => segment.text.trim().length > 0);
  const seenSentences = new Set<string>();

  return segments
    .flatMap(({ text, label }) =>
      text
        .split(/(?<=[.!?।])\s+|\n+/u)
        .map((sentence) => sentence.trim())
        .filter((sentence) => {
          const normalized = sentence.toLocaleLowerCase().replace(/[^\p{L}\p{N}%]+/gu, '');
          if (!normalized || seenSentences.has(normalized)) return false;
          seenSentences.add(normalized);
          return true;
        })
        .map((sentence) => (label ? `${label}: ${sentence}` : sentence)),
    )
    .join(' ');
};

const splitSpeechText = (text: string, maxLength = 2400): string[] => {
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > maxLength) {
    let splitAt = -1;
    const boundaryRegex = /[.!?।]\s|\n/gu;
    for (const boundary of remaining.matchAll(boundaryRegex)) {
      const end = boundary.index + 1;
      if (end > maxLength) break;
      if (end > maxLength / 2) splitAt = end;
    }
    if (splitAt < maxLength / 2) splitAt = remaining.lastIndexOf(' ', maxLength);
    if (splitAt < maxLength / 2) splitAt = maxLength;
    if (splitAt > 0 && /[\uD800-\uDBFF]/u.test(remaining[splitAt - 1])) splitAt -= 1;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
};

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionResultEventLike {
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

interface SpeechRequestWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
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
  const localizedLocationName = localizeGujaratLocation(locationName, currentLang);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsObjectUrlRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [retryPayload, setRetryPayload] = useState<{ query: string; image: string | null } | null>(null);
  const [isLocalizing, setIsLocalizing] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sendingRef = useRef(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechRequestRef = useRef(0);
  const recognitionCancelledRef = useRef(false);
  const recognitionStartTimeoutRef = useRef<number | null>(null);

  const cancelSpeechPlayback = () => {
    speechRequestRef.current += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    speechSynthesisRef.current = null;
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;
    const audio = ttsAudioRef.current;
    ttsAudioRef.current = null;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    if (ttsObjectUrlRef.current) {
      URL.revokeObjectURL(ttsObjectUrlRef.current);
      ttsObjectUrlRef.current = null;
    }
    setSpeakingMessageId(null);
  };

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const refreshVoices = () => {
      const voices = synth.getVoices();
      availableVoicesRef.current = voices;
      setAvailableVoices(voices);
    };
    refreshVoices();
    synth.addEventListener('voiceschanged', refreshVoices);
    return () => synth.removeEventListener('voiceschanged', refreshVoices);
  }, []);

  useEffect(() => {
    cancelSpeechPlayback();
    setVoiceFeedback('');
  }, [currentLang]);

  useEffect(
    () => () => {
      cancelSpeechPlayback();
    },
    [],
  );

  // Synchronize when parent propLang changes
  useEffect(() => {
    if (propLang && propLang !== currentLangRef.current) {
      handleSwitchLanguage(propLang);
    }
  }, [propLang]);

  // Pre-baked multilingual templates for initial starter messages
  const buildInitialStarterMessages = (targetLang: Language): Message[] => {
    const localizedCrop = cropDisplayName(targetLang, cropName);
    const localizedLocation = localizeGujaratLocation(locationName, targetLang);
    if (latestScanContext) {
      const scanCrop = cropDisplayName(targetLang, latestScanContext.plantName || cropName);
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
          text: `Hello! I am your Plant Doctor at PlantPulse AI. Tell me what you're seeing on your ${localizedCrop} (${localizedLocation}), or choose an issue below.`,
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
          text: `નમસ્તે! હું પ્લાન્ટપલ્સ એઆઈ નો પ્લાન્ટ ડોક્ટર છું. તમારા ${localizedCrop} (${localizedLocation}) માં તમે શું જોઈ રહ્યા છો તે જણાવો, અથવા નીચે આપેલા વિકલ્પોમાંથી પસંદ કરો.`,
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
          text: `नमस्ते! मैं प्लांटपल्स एआई का प्लांट डॉक्टर हूँ। आपके ${localizedCrop} (${localizedLocation}) के बारे में बताएं कि आप क्या लक्षण देख रहे हैं, या नीचे से कोई विषय चुनें।`,
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
    return targetList.slice(0, 1).map((item, idx) => ({
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
  const messagesRef = useRef(messages);
  const currentLangRef = useRef(currentLang);
  const localizationRequestRef = useRef(0);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(
    () => () => {
      speechRecognitionRef.current?.stop();
      if (recognitionStartTimeoutRef.current !== null) {
        window.clearTimeout(recognitionStartTimeoutRef.current);
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    },
    [],
  );

  const localizedMessageTime = (targetLang: Language, time: string) => {
    const isRecent = ['Just now', 'अभी', 'હમણાં'].includes(time);
    if (targetLang === 'gu') return isRecent ? 'હમણાં' : '૧ મિનિટ પહેલા';
    if (targetLang === 'hi') return isRecent ? 'अभी' : '१ मिनट पहले';
    return isRecent ? 'Just now' : '1 min ago';
  };

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
    if (newLang === currentLangRef.current) return;
    const sourceLang = currentLangRef.current;
    currentLangRef.current = newLang;
    const requestId = ++localizationRequestRef.current;
    setCurrentLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }

    // Step 1: Immediately localize any messages that have cached translations for newLang
    const pendingTranslations: Message[] = [];
    const updatedMessages = messagesRef.current.map((m) => {
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
      if (m.translations && m.translations[newLang]) {
        const cached = m.translations[newLang]!;
        return {
          ...m,
          text: cached.text,
          options: cached.options || m.options,
          recommendation: cached.recommendation || m.recommendation,
          time: localizedMessageTime(newLang, m.time),
        };
      }
      const source = m.translations?.[sourceLang];
      pendingTranslations.push({
        ...m,
        text: source?.text || m.text,
        options: source?.options || m.options,
        recommendation: source?.recommendation || m.recommendation,
      });
      return {
        ...m,
        text: PLANT_DOCTOR_I18N[newLang].translatingLoading,
        time: localizedMessageTime(newLang, m.time),
        options: undefined,
        recommendation: undefined,
      };
    });

    const localizedById = new Map(updatedMessages.map((message) => [message.id, message]));
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);

    // Step 2: If there are dynamic user or doctor messages without cached translation, call backend translation
    if (pendingTranslations.length > 0) {
      setIsLocalizing(true);
      try {
        const res = await fetch('/api/localize-doctor-messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            messages: pendingTranslations.map((m) => ({
              id: m.id,
              sender: m.sender,
              text: m.text,
              ...(m.options ? { options: m.options } : {}),
              ...(m.recommendation ? { recommendation: m.recommendation } : {}),
            })),
            targetLang: newLang,
          }),
        });

        if (!res.ok) {
          throw new Error(`Message localization failed with HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!data.success || !Array.isArray(data.messages)) {
          throw new Error('Message localization returned an invalid response.');
        }
        const translatedById = new Map<string, any>(
          data.messages.map((item: any) => [item.id, item])
        );
        for (const source of pendingTranslations) {
          const translated = translatedById.get(source.id);
          if (!translated || typeof translated.text !== 'string' || !translated.text.trim()) {
            throw new Error(`Message ${source.id} was not translated.`);
          }
          if (
            source.options?.length &&
            (!Array.isArray(translated.options) || translated.options.length !== source.options.length)
          ) {
            throw new Error(`Suggested options for ${source.id} were not translated.`);
          }
          const current = localizedById.get(source.id);
          if (current) {
            localizedById.set(source.id, {
              ...current,
              text: translated.text,
              time: localizedMessageTime(newLang, source.time),
              options: translated.options || current.options,
              recommendation: translated.recommendation || current.recommendation,
              translations: {
                ...(source.translations || {}),
                [newLang]: {
                  text: translated.text,
                  options: translated.options || current.options,
                  recommendation: translated.recommendation || current.recommendation,
                },
              },
            });
          }
        }
      } catch (err) {
        console.error('Could not localize Plant Doctor messages:', err);
        for (const source of pendingTranslations) {
          const current = localizedById.get(source.id);
          if (current) {
            localizedById.set(source.id, {
              ...current,
              text: PLANT_DOCTOR_I18N[newLang].errorLocalization,
              options: undefined,
              recommendation: undefined,
            });
          }
        }
      } finally {
        if (requestId === localizationRequestRef.current) {
          const finalMessages = messagesRef.current.map(
            (message) => localizedById.get(message.id) || message
          );
          messagesRef.current = finalMessages;
          setMessages(finalMessages);
          setIsLocalizing(false);
        }
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

  const stopSpeech = () => {
    cancelSpeechPlayback();
    setVoiceFeedback(i18n.speechStopped);
  };

  const speakText = async (text: string, messageId: string) => {
    if (speakingMessageId === messageId) {
      stopSpeech();
      return;
    }
    if (!text.trim()) {
      setVoiceFeedback(i18n.speechNotAvailable);
      return;
    }

    const requestId = ++speechRequestRef.current;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.removeAttribute('src');
      ttsAudioRef.current.load();
      ttsAudioRef.current = null;
    }
    if (ttsObjectUrlRef.current) {
      URL.revokeObjectURL(ttsObjectUrlRef.current);
      ttsObjectUrlRef.current = null;
    }
    setSpeakingMessageId(messageId);
    setVoiceFeedback(i18n.speechPreparing);
    const languageCode = currentLang === 'gu' ? 'gu-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    const languagePrefix = languageCode.slice(0, 2).toLowerCase();
    let voice: SpeechSynthesisVoice | undefined;
    if ('speechSynthesis' in window) {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        voices = await new Promise<SpeechSynthesisVoice[]>((resolve) => {
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            window.speechSynthesis.removeEventListener('voiceschanged', finish);
            resolve(window.speechSynthesis.getVoices());
          };
          window.speechSynthesis.addEventListener('voiceschanged', finish, { once: true });
          window.setTimeout(finish, 2000);
        });
      }
      if (requestId !== speechRequestRef.current) return;
      if (voices.length === 0) {
        voices = availableVoicesRef.current.length ? availableVoicesRef.current : availableVoices;
      }
      const languageVoices = voices.filter((item) => {
        const voiceLanguage = item.lang.toLowerCase();
        return voiceLanguage === languagePrefix || voiceLanguage.startsWith(`${languagePrefix}-`);
      });
      voice =
        languageVoices.find((item) => item.lang.toLowerCase() === languageCode.toLowerCase()) ||
        languageVoices[0];
    }

    const chunks = splitSpeechText(text);

    if (voice && 'speechSynthesis' in window) {
      try {
        chunks.forEach((chunk, index) => {
          const utterance = new SpeechSynthesisUtterance(chunk);
          utterance.lang = languageCode;
          utterance.voice = voice;
          utterance.rate = 0.95;
          utterance.onstart = () => {
            if (requestId === speechRequestRef.current) {
              speechSynthesisRef.current = utterance;
              setVoiceFeedback(i18n.speechPlaying);
            }
          };
          utterance.onend = () => {
            if (requestId === speechRequestRef.current && index === chunks.length - 1) {
              speechSynthesisRef.current = null;
              setSpeakingMessageId(null);
              setVoiceFeedback('');
            }
          };
          utterance.onerror = () => {
            if (requestId === speechRequestRef.current) {
              speechSynthesisRef.current = null;
              setSpeakingMessageId(null);
              setVoiceFeedback(i18n.speechNotAvailable);
            }
          };
          window.speechSynthesis.speak(utterance);
        });
      } catch {
        speechSynthesisRef.current = null;
        setSpeakingMessageId(null);
        setVoiceFeedback(i18n.speechNotAvailable);
      }
      return;
    }

    const abortController = new AbortController();
    ttsAbortRef.current = abortController;
    try {
      for (const chunk of chunks) {
        const response = await fetch('/api/plant-doctor/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ text: chunk, lang: currentLang }),
          signal: abortController.signal,
        });
        if (!response.ok) {
          const error = (await response.json().catch(() => ({}))) as { code?: string };
          if (requestId !== speechRequestRef.current) return;
          setSpeakingMessageId(null);
          setVoiceFeedback(
            error.code === 'TTS_NOT_CONFIGURED'
              ? i18n.speechServiceNotConfigured
              : error.code === 'TTS_RATE_LIMIT'
                ? i18n.speechRateLimited
                : i18n.speechGenerationFailed,
          );
          return;
        }
        const audioUrl = URL.createObjectURL(await response.blob());
        if (requestId !== speechRequestRef.current) {
          URL.revokeObjectURL(audioUrl);
          return;
        }
        ttsObjectUrlRef.current = audioUrl;
        const audio = new Audio(audioUrl);
        ttsAudioRef.current = audio;
        await new Promise<void>((resolve, reject) => {
          audio.onplay = () => {
            if (requestId === speechRequestRef.current) setVoiceFeedback(i18n.speechPlaying);
          };
          audio.onended = () => resolve();
          audio.onpause = () => resolve();
          audio.onerror = () => reject(new Error('Audio playback failed.'));
          audio.play().catch(reject);
        });
        if (ttsObjectUrlRef.current === audioUrl) {
          URL.revokeObjectURL(audioUrl);
          ttsObjectUrlRef.current = null;
        }
        if (requestId !== speechRequestRef.current) return;
        if (ttsAudioRef.current === audio) ttsAudioRef.current = null;
      }
      if (requestId === speechRequestRef.current) {
        setSpeakingMessageId(null);
        setVoiceFeedback('');
      }
    } catch {
      if (requestId !== speechRequestRef.current || abortController.signal.aborted) return;
      setSpeakingMessageId(null);
      setVoiceFeedback(i18n.speechGenerationFailed);
    } finally {
      if (ttsAbortRef.current === abortController) ttsAbortRef.current = null;
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionCancelledRef.current = true;
      speechRecognitionRef.current?.stop();
      setVoiceFeedback(i18n.voiceStopped);
      return;
    }

    const speechWindow = window as SpeechRequestWindow;
    const SpeechRec = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceFeedback(i18n.voiceNotSupported);
      return;
    }

    const recognition = new SpeechRec();
    speechRecognitionRef.current = recognition;
    recognition.lang = currentLang === 'gu' ? 'gu-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionCancelledRef.current = false;
    let receivedTranscript = false;
    let recognitionFailed = false;
    let recognitionStarted = false;
    let lastTranscript = '';

    recognition.onstart = () => {
      recognitionStarted = true;
      if (recognitionStartTimeoutRef.current !== null) {
        window.clearTimeout(recognitionStartTimeoutRef.current);
        recognitionStartTimeoutRef.current = null;
      }
      setIsRecording(true);
      setVoiceFeedback(i18n.voiceListening);
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript.trim())
        .filter(Boolean)
        .join(' ');
      if (transcript && transcript !== lastTranscript) {
        const addition = transcript.startsWith(lastTranscript)
          ? transcript.slice(lastTranscript.length).trim()
          : transcript;
        lastTranscript = transcript;
        receivedTranscript = true;
        if (addition) {
          setInputText((previous) => [previous.trim(), addition].filter(Boolean).join(' '));
          setVoiceFeedback(i18n.voiceTranscriptReady);
        }
      } else {
        setVoiceFeedback(i18n.voiceProcessing);
      }
    };
    recognition.onerror = (event) => {
      recognitionFailed = true;
      if (recognitionStartTimeoutRef.current !== null) {
        window.clearTimeout(recognitionStartTimeoutRef.current);
        recognitionStartTimeoutRef.current = null;
      }
      setIsRecording(false);
      setVoiceFeedback(
        event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? i18n.voicePermissionDenied
          : i18n.voiceRecognitionFailed,
      );
    };
    recognition.onend = () => {
      if (recognitionStartTimeoutRef.current !== null) {
        window.clearTimeout(recognitionStartTimeoutRef.current);
        recognitionStartTimeoutRef.current = null;
      }
      setIsRecording(false);
      speechRecognitionRef.current = null;
      if (!receivedTranscript && !recognitionFailed && !recognitionCancelledRef.current) {
        setVoiceFeedback(i18n.voiceRecognitionFailed);
      }
    };

    try {
      setVoiceFeedback(i18n.voiceProcessing);
      recognition.start();
      recognitionStartTimeoutRef.current = window.setTimeout(() => {
        recognitionStartTimeoutRef.current = null;
        if (!recognitionStarted && speechRecognitionRef.current === recognition) {
          recognitionFailed = true;
          recognition.stop();
          speechRecognitionRef.current = null;
          setIsRecording(false);
          setVoiceFeedback(i18n.voiceRecognitionFailed);
        }
      }, 8000);
    } catch {
      if (recognitionStartTimeoutRef.current !== null) {
        window.clearTimeout(recognitionStartTimeoutRef.current);
        recognitionStartTimeoutRef.current = null;
      }
      setIsRecording(false);
      speechRecognitionRef.current = null;
      setVoiceFeedback(i18n.voiceRecognitionFailed);
    }
  };

  const sendMessage = async (
    textToSend: string,
    imageToSend?: string | null,
    isRetry = false,
  ) => {
    if (sendingRef.current || (!textToSend.trim() && !imageToSend && !attachedImage)) return;

    const query = textToSend.trim();
    const currentAttachedImage = imageToSend !== undefined ? imageToSend : attachedImage;
    const submittedText = query || (currentAttachedImage ? i18n.userAttachedLeafText : '');
    const requestLanguage = currentLang;
    sendingRef.current = true;
    setRequestError('');
    setRetryPayload(null);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: submittedText,
      time: i18n.justNow,
      imageUrl: currentAttachedImage || undefined,
      translations: {
        [currentLang]: {
          text: submittedText,
        },
      },
    };

    if (!isRetry) {
      setMessages((prev) => [...prev, userMsg]);
      messagesRef.current = [...messagesRef.current, userMsg];
    }
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
          messages: messagesRef.current
            .filter((message, index, history) =>
              isRetry && index === history.length - 1 && message.sender === 'user' && message.text === submittedText
                ? false
                : message.id !== userMsg.id,
            )
            .slice(-10)
            .map((message) => ({ sender: message.sender, text: message.text })),
          userMessage: query,
          attachedImage: currentAttachedImage ? { base64: currentAttachedImage } : undefined,
          latestScanContext,
          userContext: {
            userType,
            cropName,
            districtName: localizedLocationName,
            growingLocation: userType === 'farmer' ? 'Field Plot' : 'Balcony / Terrace',
          },
          lang: requestLanguage,
        }),
      });

      const json = await response.json();
      if (
        !response.ok ||
        !json?.success ||
        typeof json?.data?.replyText !== 'string' ||
        !json.data.replyText.trim()
      ) {
        throw new Error('DOCTOR_REQUEST_FAILED');
      }

      const doctorMsg: Message = {
        id: `d-${Date.now()}`,
        sender: 'doctor',
        text: json.data.replyText.trim(),
        time: i18n.justNow,
        options: Array.isArray(json.data.suggestedOptions)
          ? json.data.suggestedOptions.filter((option: unknown) => typeof option === 'string')
          : undefined,
        recommendation:
          json.data.diagnosticInsight && typeof json.data.diagnosticInsight === 'object'
            ? json.data.diagnosticInsight
            : undefined,
        translations: {
          [requestLanguage]: {
            text: json.data.replyText.trim(),
            options: Array.isArray(json.data.suggestedOptions)
              ? json.data.suggestedOptions.filter((option: unknown) => typeof option === 'string')
              : undefined,
            recommendation: json.data.diagnosticInsight,
          },
        },
      };
      setMessages((prev) => [...prev, doctorMsg]);
      messagesRef.current = [...messagesRef.current, doctorMsg];
      setVoiceFeedback('');
    } catch {
      handleDoctorRequestFailure(query, currentAttachedImage || null);
    } finally {
      sendingRef.current = false;
      setIsLoading(false);
    }
  };

  // Pure localized fallback without language mixing
  const handleDoctorRequestFailure = (query: string, image: string | null = null) => {
    setRequestError(i18n.errorConsultation);
    setRetryPayload({ query, image });
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
              {i18n.contextLabel(cropDisplayName(currentLang, cropName), localizedLocationName, userType === 'farmer')}
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

      {(voiceFeedback || requestError) && (
        <div
          role={requestError ? 'alert' : 'status'}
          className={`mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${
            requestError
              ? 'border-[#D96B5F]/40 bg-red-50 text-[#8F332B]'
              : 'border-[#8FAF91]/40 bg-[#E8F1E7] text-[#245C43]'
          }`}
        >
          <span>{requestError || voiceFeedback}</span>
          {requestError && retryPayload && (
            <button
              type="button"
              onClick={() => sendMessage(retryPayload.query, retryPayload.image, true)}
              disabled={isLoading}
              className="rounded-lg bg-[#245C43] px-3 py-1.5 font-bold text-white hover:bg-[#1a4431] disabled:opacity-50"
            >
              {i18n.retry}
            </button>
          )}
        </div>
      )}

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
                    onClick={() =>
                      speakText(
                        getSpeakableResponse(m, {
                          diagnosis: i18n.speechDiagnosisLabel,
                          confidence: i18n.speechConfidenceLabel,
                          recommendation: i18n.speechRecommendationLabel,
                        }),
                        m.id,
                      )
                    }
                    className="p-1 hover:text-[#245C43] transition-colors cursor-pointer"
                    title={speakingMessageId === m.id ? i18n.actionStopVoice : i18n.readAloudTooltip}
                    aria-label={speakingMessageId === m.id ? i18n.actionStopVoice : i18n.readAloudTooltip}
                  >
                    {speakingMessageId === m.id ? (
                      <X className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
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
