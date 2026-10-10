import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Droplets,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  FileText,
  Bookmark,
  X,
  Trash2,
  Image as ImageIcon,
  RotateCcw,
  Zap,
  HelpCircle,
  Activity,
  Layers,
  Leaf,
  Info,
  Clock,
  Globe,
} from 'lucide-react';
import { cropDisplayName, Language, localizedText, translations, uiCopy } from '../data/translations.ts';
import { UserType } from './UserTypeSelection.tsx';
import { GUJARAT_DISTRICTS, localizeGujaratLocation } from '../data/gujaratLocations.ts';
import { SAMPLE_SPECIMENS, SampleSpecimen } from '../data/sampleSpecimens.ts';

export interface SavedPlantItem {
  id: string;
  name: string;
  cropType: string;
  location: string;
  healthScore: number;
  issue: string;
  status: 'Healthy' | 'Moderate' | 'Alert';
  date: string;
  imageUrl?: string;
}

export interface PlantDiagnosisData {
  isPlantImage: boolean;
  plantName: string;
  scientificName: string;
  condition: string;
  conditionType: 'disease' | 'pest' | 'nutrient_deficiency' | 'environmental_stress' | 'healthy' | 'uncertain';
  confidence: number;
  severity: 'low' | 'moderate' | 'high' | 'unknown';
  symptoms: string[];
  possibleCauses: string[];
  treatment: string[];
  whatToAvoid: string[];
  wateringAdvice: string;
  prevention: string[];
  nextSteps: string[];
  monitoringPlan: string[];
  needsMoreInformation: boolean;
  followUpQuestion: string;
  analysisNote: string;
  plantType?: string;
  overallHealth?: string;
  diseaseConfidence?: number;
  sunlightRequirement?: string;
  soilRecommendation?: string;
  fertilizerRecommendation?: string;
  immediateActions?: string[];
  careTips?: string[];
}

interface ScanStudioProps {
  userType: UserType;
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  defaultCrop?: string;
  defaultDistrict?: string;
  isGuest?: boolean;
  onOpenDoctor: (initialQuery?: string, scanContext?: any) => void;
  onClose?: () => void;
  onSavePlant?: (plant: SavedPlantItem) => void;
  onShowAuth?: () => void;
  authToken?: string | null;
}

export const ScanStudio: React.FC<ScanStudioProps> = ({
  userType,
  lang,
  onLanguageChange,
  defaultCrop = 'Tomato',
  defaultDistrict = 'Rajkot',
  isGuest = false,
  onOpenDoctor,
  onClose,
  onSavePlant,
  onShowAuth,
  authToken,
}) => {
  const [selectedCrop, setSelectedCrop] = useState(defaultCrop);
  const [selectedLocation, setSelectedLocation] = useState(defaultDistrict);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [hasSaved, setHasSaved] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeSpecimenId, setActiveSpecimenId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PlantDiagnosisData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'treatment' | 'prevention' | 'monitoring'>('treatment');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousLangRef = useRef(lang);
  const latestLangRef = useRef(lang);
  const t = translations[lang];

  // Helper to resize/compress large images via canvas before uploading
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t.extra.scanFileInvalid);
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      alert(t.extra.scanFileTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      const dataUrl = event.target.result as string;

      // Create an HTML Image to resize if dimensions exceed 1600px
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setPreviewImage(optimizedBase64);
            setActiveSpecimenId(null);
            setValidationError(null);
            setApiErrorMessage(null);
            executeAnalysis(optimizedBase64, selectedCrop);
            return;
          }
        }

        // Under 1600px, use original
        setPreviewImage(dataUrl);
        setActiveSpecimenId(null);
        setValidationError(null);
        setApiErrorMessage(null);
        executeAnalysis(dataUrl, selectedCrop);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (previousLangRef.current === lang) return;
    previousLangRef.current = lang;
    latestLangRef.current = lang;
    if (previewImage && analysisResult) {
      executeAnalysis(previewImage, selectedCrop);
    }
  }, [lang]);

  const handleSelectSpecimen = (specimen: SampleSpecimen) => {
    setActiveSpecimenId(specimen.id);
    setPreviewImage(specimen.dataUrl);
    setValidationError(null);
    setApiErrorMessage(null);
    setHasSaved(false);
    if (specimen.cropType !== 'Other') {
      setSelectedCrop(specimen.cropType);
    }
    executeAnalysis(specimen.dataUrl, specimen.cropType);
  };

  const executeAnalysis = async (imageDataUrl: string, crop: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setValidationError(null);
    setApiErrorMessage(null);
    setHasSaved(false);

    // Staged progress indicators
    setAnalysisStep(
      lang === 'gu'
        ? '૧/૩: ફોટો ચકાસણી અને ગુણવત્તા સ્કેન...'
        : lang === 'hi'
        ? '१/३: छवि सत्यापन और गुणवत्ता स्कैन...'
        : '1/3: Checking image & specimen quality...'
    );

    const stepTimer1 = setTimeout(() => {
      setAnalysisStep(
        lang === 'gu'
          ? '૨/૩: જેમિની વિઝન દ્વારા પર્ણ રોગ વિશ્લેષણ...'
          : lang === 'hi'
          ? '२/३: जेमिनी विजन द्वारा पर्ण रोग विश्लेषण...'
          : '2/3: Gemini Vision analyzing plant foliage...'
      );
    }, 700);

    const stepTimer2 = setTimeout(() => {
      setAnalysisStep(
        lang === 'gu'
          ? `૩/૩: લક્ષણો, ગંભીરતા અને સારવાર માર્ગદર્શિકા તૈયાર થઈ રહી છે...`
          : lang === 'hi'
          ? `३/३: लक्षण, गंभीरता एवं उपचार मार्गदर्शन तैयार हो रहा है...`
          : '3/3: Synthesizing symptoms, severity & treatment guidance...'
      );
    }, 1400);

    try {
      const response = await fetch('/api/analyze-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          image: {
            base64: imageDataUrl,
            mimeType: imageDataUrl.startsWith('data:image/png')
              ? 'image/png'
              : imageDataUrl.startsWith('data:image/svg')
              ? 'image/svg+xml'
              : 'image/jpeg',
          },
          userContext: {
            userType,
            cropName: crop,
            districtName: selectedLocation,
            growingLocation: userType === 'farmer' ? 'Commercial Acreage Plot' : 'Balcony / Terrace Pots',
          },
          lang,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(t.extra.scanFailure);
      }

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error(t.extra.scanFailure);
      }

      if (latestLangRef.current !== lang) {
        executeAnalysis(imageDataUrl, crop);
        return;
      }

      const data = json.data as PlantDiagnosisData;

      // 1. NON-PLANT VALIDATION
      if (!data.isPlantImage) {
        setValidationError(t.extra.scanClearGuidance);
        setAnalysisResult(data);
        setIsAnalyzing(false);
        return;
      }

      // 2. UNCERTAIN / LOW CONFIDENCE QUALITY
      if (data.conditionType === 'uncertain' || data.confidence < 35) {
        setAnalysisResult(data);
        setIsAnalyzing(false);
        return;
      }

      // 3. VALID BOTANICAL DIAGNOSIS
      setAnalysisResult(data);
      setIsAnalyzing(false);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      console.error('Scan analysis error:', err);
      setApiErrorMessage(t.extra.scanFailure);
      setAnalysisResult(null);
      setIsAnalyzing(false);
    }
  };

  const handleResetScan = () => {
    setPreviewImage(null);
    setActiveSpecimenId(null);
    setAnalysisResult(null);
    setValidationError(null);
    setApiErrorMessage(null);
    setHasSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (isGuest && onShowAuth) {
      onShowAuth();
    } else {
      setHasSaved(true);
      if (onSavePlant && analysisResult) {
        const severityStatus: 'Healthy' | 'Moderate' | 'Alert' =
          analysisResult.conditionType === 'healthy' || analysisResult.severity === 'low'
            ? 'Healthy'
            : analysisResult.severity === 'moderate'
            ? 'Moderate'
            : 'Alert';

        const plantPayload: SavedPlantItem = {
          id: `scan-${Date.now()}`,
          name: `${analysisResult.plantName} (${selectedLocation})`,
          cropType: selectedCrop,
          location: selectedLocation,
          healthScore: analysisResult.conditionType === 'healthy' ? 95 : Math.max(30, analysisResult.confidence),
          issue: analysisResult.condition,
          status: severityStatus,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          imageUrl: previewImage || undefined,
        };

        onSavePlant(plantPayload);

        // Also persist to MySQL database if user session is authenticated
        if (authToken) {
          try {
            await fetch('/api/plants', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({
                name: plantPayload.name,
                species: analysisResult.scientificName || analysisResult.plantName,
                location_type: userType === 'farmer' ? 'field' : 'balcony',
                sunlight: analysisResult.sunlightRequirement || 'full_sun',
                health_status: severityStatus,
                health_score: plantPayload.healthScore,
                notes: `${analysisResult.condition}: ${typeof analysisResult.treatment?.[0] === 'string' ? analysisResult.treatment[0] : 'Prescribed cultural protocol'}`,
              }),
            });
          } catch (err) {
            console.warn('Could not persist plant to backend:', err);
          }
        }
      }
    }
  };

  const handleConsultDoctor = () => {
    if (!analysisResult) {
      onOpenDoctor();
      return;
    }
    const initialQuery =
      lang === 'gu'
        ? `મારા ${analysisResult.plantName} માં "${analysisResult.condition}" વિશે વિગતવાર ઉપચાર અને સંભાળ જણાવો.`
        : lang === 'hi'
        ? `मेरे ${analysisResult.plantName} में "${analysisResult.condition}" के उपचार एवं देखभाल की जानकारी दें।`
        : `Tell me more about treating ${analysisResult.condition} on my ${analysisResult.plantName}.`;

    onOpenDoctor(initialQuery, {
      ...analysisResult,
      imageUrl: previewImage,
      selectedCrop,
      selectedLocation,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 text-left select-none">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processImageFile(file);
        }}
        className="hidden"
      />

      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8FAF91]/30 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#245C43] bg-[#E8F1E7] px-3.5 py-1.5 rounded-full border border-[#8FAF91]/30 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E5A93D]" />
            <span>
              {lang === 'gu'
                ? 'વાસ્તવિક એઆઈ વનસ્પતિ વિઝન નિદાન'
                : lang === 'hi'
                ? 'वास्तविक एआई वनस्पति विजन निदान'
                : uiCopy(lang, 'REAL AI BOTANICAL VISION DIAGNOSTICS')}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#17382B] font-display">
            {t.scanTitle}
          </h2>
          <p className="text-sm text-[#476353] mt-1">
            {uiCopy(lang, 'Upload a leaf photo for real-time pathology detection, severity estimation, and practical care protocols.')}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {onLanguageChange && (
            <div className="flex items-center gap-1 bg-[#E8F1E7] p-1 rounded-xl border border-[#8FAF91]/40 text-xs">
              <Globe className="w-3.5 h-3.5 ml-1 text-[#245C43]" />
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                  lang === 'en' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('gu')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                  lang === 'gu' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
                }`}
              >
                ગુજરાતી
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                  lang === 'hi' ? 'bg-[#245C43] text-white shadow-xs' : 'text-[#245C43] hover:text-black'
                }`}
              >
                हिन्दी
              </button>
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[#8FAF91]/35 hover:bg-[#E8F1E7]/70 text-[#245C43] transition-colors cursor-pointer"
              title={t.closeBtn}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* QUICK PRESET SPECIMEN SELECTOR */}
      <div className="bg-white p-5 rounded-2xl border border-[#8FAF91]/35 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#245C43]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#17382B]">
              {t.presetSpecimensTitle}
            </span>
          </div>
          <span className="text-[11px] text-[#546b5e]">
            {t.presetSpecimensSub}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {SAMPLE_SPECIMENS.map((specimen) => {
            const isSelected = activeSpecimenId === specimen.id;
            return (
              <button
                key={specimen.id}
                onClick={() => handleSelectSpecimen(specimen)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#E8F1E7] border-[#245C43] shadow-xs ring-2 ring-[#245C43]/20'
                    : 'bg-[#FAF8F3] border-[#8FAF91]/30 hover:border-[#245C43]/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      specimen.category === 'healthy'
                        ? 'bg-[#245C43] text-white'
                        : specimen.category === 'invalid'
                        ? 'bg-[#D96B5F] text-white'
                        : 'bg-[#E5A93D]/25 text-[#9A7653]'
                    }`}
                  >
                    {specimen.category === 'healthy'
                      ? uiCopy(lang, 'HEALTHY')
                      : specimen.category === 'invalid'
                      ? uiCopy(lang, 'TEST REJECT')
                      : uiCopy(lang, 'PATHOGEN')}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#245C43]" />}
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#17382B] line-clamp-1">
                    {cropDisplayName(lang, specimen.cropType)}: {specimen.name[lang]}
                  </div>
                  <div className="text-[10px] text-[#546b5e] line-clamp-1 italic">
                    {specimen.description[lang]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload, Specimen Viewport & Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Metadata Configuration */}
          <div className="bg-white p-5 rounded-2xl border border-[#8FAF91]/35 shadow-xs space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#17382B] block mb-1">
                  {userType === 'farmer' ? t.cropLabel : t.plantLabel}
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    if (previewImage) {
                      executeAnalysis(previewImage, e.target.value);
                    }
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-[#8FAF91]/40 bg-[#FAF8F3] text-[#17382B] focus:outline-none focus:ring-2 focus:ring-[#245C43]"
                >
                  {(['Tomato', 'Cotton', 'Chilli', 'Wheat', 'Groundnut', 'Rose', 'Tulsi'] as const).map((crop) => (
                    <option key={crop} value={crop}>{cropDisplayName(lang, crop)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#17382B] block mb-1">
                  {t.districtLabel}
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    if (previewImage) {
                      executeAnalysis(previewImage, selectedCrop);
                    }
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-[#8FAF91]/40 bg-[#FAF8F3] text-[#17382B] focus:outline-none focus:ring-2 focus:ring-[#245C43]"
                >
                  {GUJARAT_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.name.en}>
                      {d.name[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Photographic Specimen Upload Area */}
          <div className="relative rounded-3xl border-2 border-dashed border-[#8FAF91] bg-white p-6 text-center hover:bg-[#FAF8F3]/60 transition-colors flex flex-col items-center justify-center min-h-[290px] overflow-hidden group">
            {previewImage ? (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-md mb-3 border-2 border-[#245C43] bg-slate-900">
                <img
                  src={previewImage}
                  alt="Active plant specimen"
                  className="w-full h-full object-cover"
                />

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-[#245C43]/20 flex flex-col justify-between p-2 pointer-events-none">
                    <div className="w-full h-1 bg-[#E5A93D] shadow-[0_0_12px_#E5A93D] animate-bounce" />
                    <div className="text-[10px] font-mono text-white bg-black/70 px-2 py-0.5 rounded mx-auto uppercase">
                      {localizedText(lang, 'Neural Vision Triage')}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResetScan}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors cursor-pointer"
                  title={uiCopy(lang, 'Remove specimen')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-36 h-36 rounded-2xl bg-[#E8F1E7] border border-[#8FAF91]/40 flex flex-col items-center justify-center text-[#245C43] mb-4">
                <ImageIcon className="w-12 h-12 stroke-1 mb-1" />
                <span className="text-[11px] font-bold">{t.noImageSelected}</span>
              </div>
            )}

            <p className="text-xs font-extrabold text-[#17382B] mb-1">
              {previewImage
                ? `${cropDisplayName(lang, selectedCrop)} ${lang === 'gu' ? 'નમૂનો લોડ થયો' : lang === 'hi' ? 'नमूना लोड हुआ' : 'Specimen Loaded'}`
                : t.dragOrDrop}
            </p>
            <p className="text-[11px] text-[#546b5e] mb-4">
              {previewImage
                ? `${lang === 'gu' ? 'સંદર્ભ' : lang === 'hi' ? 'संदर्भ' : 'Context'}: ${selectedLocation} (${userType === 'farmer' ? (lang === 'gu' ? 'ખેતર' : lang === 'hi' ? 'खेत' : 'Field') : (lang === 'gu' ? 'બાલ્કની' : lang === 'hi' ? 'बालकनी' : 'Balcony')})`
                : lang === 'gu'
                ? 'કેમેરા, ડિવાઇસમાંથી અપલોડ કરો અથવા ઉપરથી પ્રીસેટ પસંદ કરો'
                : lang === 'hi'
                ? 'कैमरा या गैलरी से अपलोड करें या ऊपर से नमूना चुनें'
                : 'Upload from camera, disk or choose a calibrated preset above'}
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C43] bg-[#E8F1E7] hover:bg-[#8FAF91]/30 px-3.5 py-2 rounded-xl transition-colors border border-[#8FAF91]/40 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t.takePhoto}</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C43] bg-[#E8F1E7] hover:bg-[#8FAF91]/30 px-3.5 py-2 rounded-xl transition-colors border border-[#8FAF91]/40 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t.uploadImage}</span>
              </button>
            </div>
          </div>

          {/* Analyze / Re-Analyze CTA */}
          <button
            onClick={() => {
              if (previewImage) {
                executeAnalysis(previewImage, selectedCrop);
              } else {
                fileInputRef.current?.click();
              }
            }}
            disabled={isAnalyzing}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-base font-bold py-4 px-6 rounded-2xl shadow-md transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-[#E5A93D]" />
                <span>{analysisStep || t.analyzingPulse}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-[#E5A93D]" />
                <span>
                  {analysisResult
                    ? localizedText(lang, 'Re-Analyze Plant Foliage')
                    : t.analyzePlantBtn}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI DIAGNOSIS REPORT or VALIDATION / ERROR STATE */}
        <div className="lg:col-span-7">
          {/* 1. API ERROR STATE */}
          {apiErrorMessage && !isAnalyzing && (
            <div className="bg-white rounded-3xl border border-[#D96B5F]/40 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-[#D96B5F]/20 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D96B5F]/15 text-[#D96B5F] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D96B5F] block">
                    {t.extra.scanAnalysisNotice}
                  </span>
                  <h3 className="text-xl font-black text-[#17382B] font-display">
                    {lang === 'gu' ? 'વિશ્લેષણ નિષ્ફળ' : lang === 'hi' ? 'विश्लेषण विफल' : 'Analysis Could Not Be Completed'}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-[#17382B]">{apiErrorMessage}</p>
              <button
                onClick={() => {
                  if (previewImage) executeAnalysis(previewImage, selectedCrop);
                }}
                className="inline-flex items-center gap-2 bg-[#245C43] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a4431] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{uiCopy(lang, 'Try Again')}</span>
              </button>
            </div>
          )}

          {/* 2. NON-PLANT VALIDATION ALERT */}
          {validationError && !isAnalyzing && (
            <div className="bg-white rounded-3xl border border-[#D96B5F]/40 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-[#D96B5F]/20 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D96B5F]/15 text-[#D96B5F] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D96B5F] block">
                    {t.extra.scanPlantValidationNotice}
                  </span>
                  <h3 className="text-xl font-black text-[#17382B] font-display">
                    {lang === 'gu' ? 'વનસ્પતિ ઓળખાઈ નથી' : lang === 'hi' ? 'पौधा नहीं पहचाना गया' : 'No Plant Detected'}
                  </h3>
                </div>
              </div>

              <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#D96B5F]/25 text-sm text-[#17382B] leading-relaxed">
                <p className="font-semibold text-[#D96B5F] mb-1">
                  {t.extra.scanObservation}
                </p>
                <p>{validationError}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-[#546b5e]">
                  {t.extra.scanNextSteps}
                </p>
                <ul className="text-xs text-[#17382B] space-y-1.5 list-disc pl-4">
                  <li>
                    {t.extra.scanClearGuidance}
                  </li>
                  <li>
                    {t.extra.scanUploadSpecimen}
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 bg-[#245C43] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a4431] transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uiCopy(lang, 'Upload Plant Photo')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. UNCERTAIN / UNCLEAR IMAGE ALERT */}
          {analysisResult && analysisResult.isPlantImage && (analysisResult.conditionType === 'uncertain' || analysisResult.confidence < 35) && !isAnalyzing && (
            <div className="bg-white rounded-3xl border border-[#E5A93D]/40 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-[#E5A93D]/25 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E5A93D]/15 text-[#9A7653] flex items-center justify-center shrink-0">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#9A7653] block">
                    {localizedText(lang, 'IMAGE QUALITY & UNCERTAINTY NOTICE')}
                  </span>
                  <h3 className="text-xl font-black text-[#17382B] font-display">
                    {lang === 'gu' ? 'અસ્પષ્ટ ફોટો — નિદાન અનિશ્ચિત' : lang === 'hi' ? 'अस्पष्ट तस्वीर — निदान अनिश्चित' : 'Image Unclear — Diagnosis Uncertain'}
                  </h3>
                </div>
              </div>

              <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#E5A93D]/30 text-sm text-[#17382B]">
                <p>{analysisResult.analysisNote || t.extra.scanUnclearResult}</p>
                {analysisResult.followUpQuestion && (
                  <p className="mt-2 text-xs font-semibold text-[#9A7653]">{analysisResult.followUpQuestion}</p>
                )}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-[#245C43] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a4431] transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t.extra.scanClearPhoto}</span>
              </button>
            </div>
          )}

          {/* 4. LOADING STATE */}
          {isAnalyzing && (
            <div className="bg-white rounded-3xl border border-[#8FAF91]/35 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-[#E8F1E7] flex items-center justify-center text-[#245C43] animate-pulse">
                  <Activity className="w-8 h-8" />
                </div>
                <RefreshCw className="w-6 h-6 text-[#245C43] animate-spin absolute -top-1 -right-1" />
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#17382B]">
                  {analysisStep || t.analyzingPulse}
                </h4>
                <p className="text-xs text-[#546b5e] max-w-sm mx-auto">
                  {lang === 'gu'
                    ? 'જેમિની દ્વારા પાંદડાંનાં લક્ષણો, છોડની સ્થિતિ અને ઉગાડવાની માહિતીનું વિશ્લેષણ થઈ રહ્યું છે...'
                    : lang === 'hi'
                    ? 'जेमिनी द्वारा पत्तियों के लक्षणों, पौधे की स्थिति और उगाने की जानकारी का विश्लेषण किया जा रहा है...'
                    : 'Gemini is analyzing leaf symptoms, plant condition, and growing context...'}
                </p>
              </div>
            </div>
          )}

          {/* 5. INITIAL EMPTY STATE (Before User Scans) */}
          {!isAnalyzing && !validationError && !apiErrorMessage && !analysisResult && (
            <div className="bg-white rounded-3xl border border-[#8FAF91]/35 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#FAF8F3] border border-[#8FAF91]/30 flex items-center justify-center text-[#245C43] mx-auto">
                <Leaf className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-extrabold text-[#17382B] font-display">
                {lang === 'gu' ? 'પાંદડાનો ફોટો અપલોડ કરવા માટે તૈયાર' : lang === 'hi' ? 'पत्ती की तस्वीर अपलोड करने के लिए तैयार' : 'Ready to Check Plant Pulse'}
              </h4>
              <p className="text-xs text-[#546b5e] max-w-sm mx-auto leading-relaxed">
                {lang === 'gu'
                  ? 'ડાબી બાજુથી પાંદડાનો ફોટો લો અથવા ઉપર આપેલા પ્રીસેટ નમૂનાઓમાંથી એક પસંદ કરો.'
                  : lang === 'hi'
                  ? 'बाईं ओर से पत्ती की तस्वीर लें या ऊपर दिए गए किसी नमूने का चयन करें।'
                  : localizedText(lang, 'Capture or upload a leaf photo on the left, or select one of the calibrated specimens above to run live AI pathology.')}
              </p>
            </div>
          )}

          {/* 6. REAL AI DIAGNOSIS REPORT (Only after valid analysis finishes) */}
          {!isAnalyzing && !validationError && !apiErrorMessage && analysisResult && analysisResult.isPlantImage && analysisResult.conditionType !== 'uncertain' && analysisResult.confidence >= 35 && (
            <div className="bg-white rounded-3xl border border-[#8FAF91]/40 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8FAF91]/25 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#9A7653]">
                    <FileText className="w-3.5 h-3.5 text-[#245C43]" />
                    <span>{t.reportTitle}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F1E7] text-[#245C43]">
                      GEMINI VISION
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#17382B] font-display mt-0.5">
                    {analysisResult.plantName}{' '}
                    {analysisResult.scientificName && analysisResult.scientificName !== 'Unknown' && (
                      <span className="text-sm font-normal italic text-[#546b5e]">
                        ({analysisResult.scientificName})
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-[#546b5e]">
                    {localizedText(lang, 'Region')}: {localizeGujaratLocation(selectedLocation, lang)}, {localizedText(lang, 'Gujarat')} · {localizedText(lang, 'Setup')}: {localizedText(lang, userType === 'farmer' ? 'Field Plot' : 'Balcony Pots')}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      analysisResult.severity === 'low' || analysisResult.conditionType === 'healthy'
                        ? 'bg-[#E8F1E7] text-[#245C43] border-[#245C43]/30'
                        : analysisResult.severity === 'moderate'
                        ? 'bg-[#E5A93D]/15 text-[#9A7653] border-[#E5A93D]/30'
                        : 'bg-[#D96B5F]/15 text-[#D96B5F] border-[#D96B5F]/30'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        analysisResult.conditionType === 'healthy'
                          ? 'bg-[#245C43]'
                          : analysisResult.severity === 'moderate'
                          ? 'bg-[#E5A93D] animate-pulse'
                          : 'bg-[#D96B5F] animate-pulse'
                      }`}
                    />
                    <span className="uppercase font-mono">
                      {localizedText(lang, analysisResult.severity)} · {localizedText(lang, 'Severity')}
                    </span>
                  </span>
                </div>
              </div>

              {/* Diagnosis Highlight Bar */}
              <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#8FAF91]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#9A7653]">
                    {analysisResult.conditionType === 'healthy'
                      ? lang === 'gu'
                        ? 'આરોગ્ય સ્થિતિ'
                        : lang === 'hi'
                        ? 'स्वास्थ्य स्थिति'
                        : 'Health Status'
                      : t.possibleIssue}
                  </div>
                  <div className="text-2xl font-black text-[#17382B] tracking-tight">
                    {localizedText(lang, analysisResult.condition)}
                  </div>
                  {analysisResult.analysisNote && (
                    <p className="text-xs text-[#546b5e] max-w-md">
                      {localizedText(lang, analysisResult.analysisNote)}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right bg-white px-4 py-2.5 rounded-xl border border-[#8FAF91]/30 shrink-0">
                  <div className="text-[11px] font-bold text-[#546b5e] uppercase">
                    {t.confidence}
                  </div>
                  <div className="text-3xl font-black text-[#245C43] font-mono">
                    {analysisResult.confidence}%
                  </div>
                  <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-[#245C43] h-full"
                      style={{ width: `${analysisResult.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Phase 3: Comprehensive Botanical Care Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analysisResult.plantType && analysisResult.plantType !== 'None' && (
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7653] block">
                      {t.cropCategory}
                    </span>
                    <span className="font-bold text-[#17382B] block mt-0.5">
                      {cropDisplayName(lang, analysisResult.plantType)}
                    </span>
                  </div>
                )}
                {analysisResult.overallHealth && (
                  <div className="p-3.5 rounded-2xl bg-[#E8F1E7]/70 border border-[#8FAF91]/35 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#245C43] block">
                      {t.overallHealthLabel}
                    </span>
                    <span className="font-bold text-[#17382B] block mt-0.5">
                      {localizedText(lang, analysisResult.overallHealth)}
                    </span>
                  </div>
                )}
                {analysisResult.sunlightRequirement && (
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7653] block">
                      {t.sunlightNeedLabel}
                    </span>
                    <span className="font-bold text-[#17382B] block mt-0.5">
                      {localizedText(lang, analysisResult.sunlightRequirement)}
                    </span>
                  </div>
                )}
              </div>

              {/* Soil & Fertilizer Detailed Care Panels */}
              {(analysisResult.soilRecommendation || analysisResult.fertilizerRecommendation) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {analysisResult.soilRecommendation && (
                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7653] block">
                        🌱 {t.soilRecLabel}
                      </span>
                      <p className="text-[#395045] leading-relaxed">
                        {localizedText(lang, analysisResult.soilRecommendation)}
                      </p>
                    </div>
                  )}
                  {analysisResult.fertilizerRecommendation && (
                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#245C43] block">
                        🧪 {t.fertilizerRecLabel}
                      </span>
                      <p className="text-[#395045] leading-relaxed">
                        {localizedText(lang, analysisResult.fertilizerRecommendation)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Observed Symptoms */}
              {analysisResult.symptoms && analysisResult.symptoms.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#17382B] mb-2.5 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#245C43]" />
                    <span>{t.symptomsTitle}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {analysisResult.symptoms.map((symptom, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#F7F5EF] border border-[#8FAF91]/25 flex items-center gap-2.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-[#E5A93D] shrink-0" />
                        <span className="font-medium text-[#17382B]">{localizedText(lang, symptom)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Tab Actionable Care Plan */}
              <div className="bg-[#E8F1E7]/40 p-5 rounded-2xl border border-[#8FAF91]/35 space-y-4">
                <div className="flex items-center justify-between border-b border-[#8FAF91]/25 pb-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#245C43]">
                    <Zap className="w-3.5 h-3.5 text-[#E5A93D]" />
                    <span>{t.whatToDoTitle}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#8FAF91]/30 text-xs font-semibold">
                    <button
                      onClick={() => setActiveTab('treatment')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'treatment'
                          ? 'bg-[#245C43] text-white'
                          : 'text-[#476353] hover:text-[#17382B]'
                      }`}
                    >
                      {t.treatmentTab}
                    </button>
                    <button
                      onClick={() => setActiveTab('prevention')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'prevention'
                          ? 'bg-[#245C43] text-white'
                          : 'text-[#476353] hover:text-[#17382B]'
                      }`}
                    >
                      {t.preventionTab}
                    </button>
                    <button
                      onClick={() => setActiveTab('monitoring')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        activeTab === 'monitoring'
                          ? 'bg-[#245C43] text-white'
                          : 'text-[#476353] hover:text-[#17382B]'
                      }`}
                    >
                      {t.monitoringTab}
                    </button>
                  </div>
                </div>

                {/* Tab 1: Practical Treatment Steps */}
                {activeTab === 'treatment' && (
                  <ol className="space-y-2.5 text-xs sm:text-sm text-[#17382B]">
                    {analysisResult.treatment && analysisResult.treatment.length > 0 ? (
                      analysisResult.treatment.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#8FAF91]/25">
                          <span className="w-5 h-5 rounded-full bg-[#245C43] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-[#546b5e] p-2">
                        {lang === 'gu' ? 'કોઈ સારવારની જરૂર નથી, છોડ તંદુરસ્ત છે.' : lang === 'hi' ? 'उपचार की आवश्यकता नहीं है, पौधा स्वस्थ है।' : 'No chemical or physical treatment required. Plant is healthy.'}
                      </p>
                    )}
                  </ol>
                )}

                {/* Tab 2: Prevention */}
                {activeTab === 'prevention' && (
                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#17382B]">
                    {analysisResult.prevention && analysisResult.prevention.length > 0 ? (
                      analysisResult.prevention.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#8FAF91]/25">
                          <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-[#546b5e] p-2">{uiCopy(lang, 'Standard botanical hygiene recommended.')}</p>
                    )}
                  </ul>
                )}

                {/* Tab 3: Monitoring Plan */}
                {activeTab === 'monitoring' && (
                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#17382B]">
                    {analysisResult.monitoringPlan && analysisResult.monitoringPlan.length > 0 ? (
                      analysisResult.monitoringPlan.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#8FAF91]/25">
                          <Clock className="w-4 h-4 text-[#9A7653] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-[#546b5e] p-2">{uiCopy(lang, 'Re-inspect in 7 days.')}</p>
                    )}
                  </ul>
                )}
              </div>

              {/* What to Avoid Warnings */}
              {analysisResult.whatToAvoid && analysisResult.whatToAvoid.length > 0 && (
                <div className="bg-[#FAF8F3] p-4 rounded-2xl border border-[#8FAF91]/35 text-xs space-y-2">
                  <h4 className="font-extrabold uppercase tracking-wider text-[#9A7653] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{t.whatToAvoidTitle}</span>
                  </h4>
                  <ul className="space-y-1.5 text-[#395045]">
                    {analysisResult.whatToAvoid.map((avoidItem, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#D96B5F] font-bold">•</span>
                        <span>{avoidItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Watering & Care Advice */}
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#245C43] flex items-center justify-center text-white shrink-0">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7653] block">
                      {t.soilGuidanceTitle} · {selectedLocation}
                    </span>
                    <span className="text-xs font-bold text-[#17382B]">
                      {analysisResult.wateringAdvice}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-[#8FAF91]/40 text-[#546b5e] shrink-0">
                  {lang === 'gu' ? 'જમીન આધારિત માર્ગદર્શન' : lang === 'hi' ? 'मृदा आधारित मार्गदर्शन' : 'Soil-Based Guidance'}
                </span>
              </div>

              {/* Follow-Up Diagnostic Question */}
              {analysisResult.followUpQuestion && (
                <div className="p-4 rounded-2xl bg-white border border-[#245C43]/20 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#245C43]">
                    <HelpCircle className="w-4 h-4 text-[#E5A93D]" />
                    <span>{t.diagnosticFollowUp}:</span>
                  </div>
                  <p className="text-xs text-[#17382B] font-medium">
                    {analysisResult.followUpQuestion}
                  </p>
                </div>
              )}

              {/* Action Buttons Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleConsultDoctor}
                  className="inline-flex items-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E5A93D]" />
                  <span>{t.askDoctorBtn}</span>
                </button>

                <button
                  onClick={handleSave}
                  className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                    hasSaved
                      ? 'bg-[#E8F1E7] border-[#245C43] text-[#245C43]'
                      : 'bg-white border-[#8FAF91]/40 text-[#17382B] hover:bg-[#FAF8F3]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{hasSaved ? t.savedToPlantsSuccess : t.saveToMyPlantsBtn}</span>
                </button>

                <button
                  onClick={handleResetScan}
                  className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-[#8FAF91]/40 bg-white text-[#546b5e] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.scanAnotherBtn}</span>
                </button>

                {previewImage && (
                  <button
                    onClick={() => executeAnalysis(previewImage, selectedCrop)}
                    className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-[#8FAF91]/40 bg-white text-[#245C43] hover:bg-[#FAF8F3] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{t.reAnalyzeBtn}</span>
                  </button>
                )}
              </div>

              {/* Guest Warning / Save Banner */}
              {isGuest && (
                <div className="p-3.5 rounded-xl bg-[#E8F1E7] border border-[#8FAF91]/40 flex items-center justify-between text-xs text-[#245C43]">
                  <span>{t.guestSavePrompt}</span>
                  <button
                    onClick={onShowAuth}
                    className="font-bold underline underline-offset-2 hover:text-[#17382B] cursor-pointer"
                  >
                    {t.createAccount} →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
