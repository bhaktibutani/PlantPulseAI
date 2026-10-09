import React, { useState } from 'react';
import { X, Mic, Volume2, Sparkles, MessageSquare, Check, ArrowRight } from 'lucide-react';
import { Language, translations } from '../data/translations.ts';

export type DoctorTopic = 'health' | 'watering' | 'disease' | 'speak';

interface DoctorModalProps {
  isOpen: boolean;
  topic: DoctorTopic;
  onClose: () => void;
  lang: Language;
  userType: 'farmer' | 'urban';
}

export const DoctorModal: React.FC<DoctorModalProps> = ({
  isOpen,
  topic,
  onClose,
  lang,
  userType,
}) => {
  const [activeTopic, setActiveTopic] = useState<DoctorTopic>(topic);
  const [isListening, setIsListening] = useState(topic === 'speak');
  const t = translations[lang];

  if (!isOpen) return null;

  // Responses tuned to English, Gujarati and Hindi + Farmer vs Urban context
  const getDoctorInsight = () => {
    if (activeTopic === 'watering') {
      if (lang === 'gu') {
        return {
          title: "સિંચાઈ સલાહ — ટામેટા",
          advice: "હાલનું તાપમાન ૩૧° સેલ્સિયસ અને ભેજ ૬૮% છે. પાંદડાના બાષ્પીભવન દર મુજબ, આજે સાંજે ૫:૩૦ વાગ્યે હળવું પાણી આપવાની જરૂર છે. વધુ પડતું પાણી ન આપો જેથી મૂળ સડી ન જાય.",
          actionTip: "જમીનમાં ૨ ઇંચ ઊંડે ભેજ તપાસો",
        };
      }
      if (lang === 'hi') {
        return {
          title: "सिंचाई सलाह — टमाटर",
          advice: "वर्तमान तापमान ३१°C और आर्द्रता ६८% है। वाष्पोत्सर्जन दर के अनुसार, आज शाम ५:३० बजे हल्की सिंचाई सर्वोत्तम रहेगी। गमले या क्यारी में जलभराव से बचें।",
          actionTip: "मिट्टी में २ इंच गहराई पर नमी जांचें",
        };
      }
      return {
        title: userType === 'farmer' ? "Field Irrigation Advisory — Tomato Crop" : "Balcony Watering Advisory — Potted Tomato",
        advice: userType === 'farmer'
          ? "Ambient temp is 31°C with 68% relative humidity. Based on soil evapotranspiration, drip irrigation of 35 mins at 5:30 PM is optimal. Soil moisture in row 4 is currently 42%."
          : "Your balcony gets 4.5 hours of afternoon sun. The topsoil is slightly dry. Water approximately 400ml at the base (avoid spraying foliage) this evening at sunset.",
        actionTip: "Target moisture band: 50% - 65%",
      };
    }

    if (activeTopic === 'disease') {
      if (lang === 'gu') {
        return {
          title: "રોગ નિવારણ — પાંદડાનું સ્વાસ્થ્ય",
          advice: "છેલ્લા સ્કેનમાં કોઈ ફૂગ કે જીવાત (લીલી ઇયળ / મોલોમશી) જોવા મળી નથી. હવામાનમાં ભેજ વધુ હોવાથી આગામી ૪ દિવસ સાવચેતી રાખવી.",
          actionTip: "લીમડાના તેલનો હળવો છંટકાવ ઉપયોગી થશે",
        };
      }
      if (lang === 'hi') {
        return {
          title: "रोग निवारण — पर्ण स्वास्थ्य",
          advice: "हालिया स्कैन में कोई फफूंद या कीट संक्रमण (अर्ली ब्लाइट) नहीं पाया गया है। आगामी उच्च आर्द्रता को देखते हुए नियमित निगरानी रखें।",
          actionTip: "नीम तेल का जैविक छिड़काव अनुशंसित",
        };
      }
      return {
        title: "Disease Prevention & Leaf Pathology",
        advice: "Optical scans show zero fungal spores or blight lesions. Chlorophyll distribution across upper leaf surfaces is uniform at 94%. Weather conditions show low pathogen risk over the next 72 hours.",
        actionTip: "Recommended: Preventive organic neem extract spray",
      };
    }

    if (activeTopic === 'speak') {
      if (lang === 'gu') {
        return {
          title: "વૉઇસ આસિસ્ટન્ટ — સાંભળી રહ્યા છીએ...",
          advice: "તમે ગુજરાતીમાં પૂછી શકો છો: 'મારા ટામેટાના પાંદડા કેમ પીળા પડે છે?' અથવા 'આજે ખાતર આપવું જોઈએ?'",
          actionTip: "માઇક્રોફોન ચાલુ છે — બોલો",
        };
      }
      if (lang === 'hi') {
        return {
          title: "वॉइस असिस्टेंट — सुन रहे हैं...",
          advice: "आप हिंदी में पूछ सकते हैं: 'टमाटर में फल कब लगेंगे?' अथवा 'आज पानी देना है या नहीं?'",
          actionTip: "माइक सक्रिय है — बोलिए",
        };
      }
      return {
        title: "Plant Doctor Voice Consultation",
        advice: userType === 'farmer'
          ? "Speak naturally in Gujarati, Hindi or English: 'How is the soil condition for my tomato crop today?' or 'Is there rain expected before fertilizer application?'"
          : "Ask about your indoor or balcony plants: 'How often should I mist my tomato plant?' or 'Why are the bottom leaves slightly curling?'",
        actionTip: "Microphone calibrated · Listening...",
      };
    }

    // Default: Check Health
    if (lang === 'gu') {
      return {
        title: "સમગ્ર આરોગ્ય વિશ્લેષણ — સ્કોર ૮૭/૧૦૦",
        advice: "તમારો ટામેટાનો છોડ ખૂબ જ તંદુરસ્ત છે! માત્ર જમીનમાં નાઇટ્રોજનની માત્રા સામાન્ય ઓછી છે. ૧ અઠવાડિયામાં ખાતર આપવાથી ફૂલો સારા આવશે.",
        actionTip: "હેલ્થ પલ્સ: ૮૭ (તંદુરસ્ત)",
      };
    }
    if (lang === 'hi') {
      return {
        title: "समग्र स्वास्थ्य विश्लेषण — स्कोर ८७/१००",
        advice: "आपका टमाटर का पौधा उत्कृष्ट स्थिति में है! केवल मिट्टी में नाइट्रोजन की हल्की कमी के संकेत हैं। जैविक खाद से पोषण संतुलित करें।",
        actionTip: "हेल्थ पल्स: ८७ (स्वस्थ)",
      };
    }
    return {
      title: "Overall Vitality Pulse: 87 / 100",
      advice: "The plant displays strong vascular turgor and active photosynthesis. Sunlight capture and leaf surface respiration are balanced. Only nitrogen uptake in the root zone requires minor enrichment.",
      actionTip: "Status: Healthy · High Yield Trajectory",
    };
  };

  const currentInsight = getDoctorInsight();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#F7F5EF] rounded-2xl shadow-2xl border border-[#8FAF91]/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#8FAF91]/25">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#245C43] flex items-center justify-center text-[#F7F5EF]">
              <Sparkles className="w-4 h-4 text-[#E5A93D]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#245C43] font-display">
                PlantPulse AI · Your Plant Doctor
              </h3>
              <p className="text-xs text-[#546b5e]">
                Multilingual Agronomic Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Selector Tabs */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-2 overflow-x-auto border-b border-[#8FAF91]/20 bg-[#FAF8F3]">
          <button
            onClick={() => { setActiveTopic('health'); setIsListening(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTopic === 'health'
                ? 'bg-[#245C43] text-white shadow-xs'
                : 'text-[#245C43] hover:bg-[#E8F1E7]'
            }`}
          >
            🌱 {t.actionCheckHealth}
          </button>
          <button
            onClick={() => { setActiveTopic('watering'); setIsListening(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTopic === 'watering'
                ? 'bg-[#245C43] text-white shadow-xs'
                : 'text-[#245C43] hover:bg-[#E8F1E7]'
            }`}
          >
            💧 {t.actionWatering}
          </button>
          <button
            onClick={() => { setActiveTopic('disease'); setIsListening(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTopic === 'disease'
                ? 'bg-[#245C43] text-white shadow-xs'
                : 'text-[#245C43] hover:bg-[#E8F1E7]'
            }`}
          >
            🐛 {t.actionDisease}
          </button>
          <button
            onClick={() => { setActiveTopic('speak'); setIsListening(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTopic === 'speak'
                ? 'bg-[#245C43] text-white shadow-xs'
                : 'text-[#245C43] hover:bg-[#E8F1E7]'
            }`}
          >
            🎤 {t.actionSpeak}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Animated voice wave if speaking */}
          {activeTopic === 'speak' && (
            <div className="mb-4 p-4 rounded-xl bg-[#245C43] text-[#F7F5EF] flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#8FAF91]/30 flex items-center justify-center mb-2">
                <Mic className="w-6 h-6 text-[#E5A93D] animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 my-2">
                <span className="w-1 h-3 bg-[#E5A93D] rounded-full animate-bounce" />
                <span className="w-1 h-6 bg-[#E8F1E7] rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1 h-4 bg-[#8FAF91] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-7 bg-[#E5A93D] rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="w-1 h-3 bg-[#E8F1E7] rounded-full animate-bounce [animation-delay:0.15s]" />
              </div>
              <span className="text-xs text-[#E8F1E7] font-medium">
                {lang === 'gu' ? 'ગુજરાતીમાં સાંભળી રહ્યા છીએ...' : lang === 'hi' ? 'हिंदी में सुन रहे हैं...' : 'Listening in your regional language...'}
              </span>
            </div>
          )}

          {/* Consultation Dialogue Box */}
          <div className="bg-white p-5 rounded-xl border border-[#8FAF91]/35 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-[#245C43] text-sm sm:text-base">
                {currentInsight.title}
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F1E7] text-[#245C43]">
                Plant Doctor AI
              </span>
            </div>

            <p className="text-sm text-[#2E4237] leading-relaxed mb-4">
              {currentInsight.advice}
            </p>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FAF8F3] border border-[#8FAF91]/25 text-xs font-semibold text-[#9A7653]">
              <Sparkles className="w-4 h-4 text-[#E5A93D] shrink-0" />
              <span>{currentInsight.actionTip}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#8FAF91]/25 flex items-center justify-between text-xs text-[#546b5e]">
          <span>Available in Gujarati, Hindi & English</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#245C43] hover:bg-[#1a4431] text-white font-semibold rounded-lg transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
