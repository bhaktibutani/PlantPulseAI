export type Language = 'en' | 'gu' | 'hi';

export interface TranslationStrings {
  appName: string;
  tagline: string;
  taglineSub: string;
  getStarted: string;
  signInPrompt: string;
  signIn: string;
  createAccount: string;
  continueGuest: string;
  howDoYouGrow: string;
  selectSubtitle: string;
  farmerTitle: string;
  farmerDesc: string;
  farmerTag: string;
  urbanTitle: string;
  urbanDesc: string;
  urbanTag: string;
  continueBtn: string;
  backBtn: string;
  goodMorning: string;
  greetingFarmer: string;
  greetingUrban: string;
  healthPulseLabel: string;
  healthy: string;
  moderateIssue: string;
  waterLabel: string;
  diseaseLabel: string;
  weatherLabel: string;
  soilLabel: string;
  optimal: string;
  clear: string;
  favorable: string;
  soilAttention: string;
  scanPlantCTA: string;
  plantDoctorTitle: string;
  plantDoctorSubtitle: string;
  actionCheckHealth: string;
  actionWatering: string;
  actionDisease: string;
  actionSpeak: string;
  navOverview: string;
  navMyPlants: string;
  navScanPlant: string;
  navPlantDoctor: string;
  navWeatherWater: string;
  navSoilInsights: string;
  prototypeNotice: string;

  // Onboarding
  onboardingFarmerTitle: string;
  onboardingFarmerSub: string;
  onboardingUrbanTitle: string;
  onboardingUrbanSub: string;
  stateLabel: string;
  districtLabel: string;
  villageLabel: string;
  cityLabel: string;
  farmNameLabel: string;
  growingLocationLabel: string;
  cropLabel: string;
  plantLabel: string;
  completeOnboardingBtn: string;

  // Dashboard & Today at a Glance
  todayGlance: string;
  humidityLabel: string;
  rainProbLabel: string;
  smartCareTitle: string;
  viewRecommendation: string;
  myFarmCrops: string;
  myBalconyPots: string;
  soilDiagnosticTitle: string;
  cropHealthAvg: string;
  irrigationStatus: string;

  // Scan & Report
  scanTitle: string;
  scanSub: string;
  takePhoto: string;
  uploadImage: string;
  dragOrDrop: string;
  analyzePlantBtn: string;
  analyzingPulse: string;
  changeImage: string;
  demoAnalysisBadge: string;
  reportTitle: string;
  possibleIssue: string;
  confidence: string;
  severity: string;
  symptomsTitle: string;
  whatToDoTitle: string;
  whatToAvoidTitle: string;
  smartContextTitle: string;
  askDoctorBtn: string;
  saveToMyPlantsBtn: string;
  savedToPlantsSuccess: string;
  scanAnotherBtn: string;
  guestSavePrompt: string;

  // AI Doctor
  askAnythingPlaceholder: string;
  voiceListening: string;
  voiceStop: string;
  differentialDiagnosis: string;

  // Auth Modal & Profile
  emailLabel: string;
  passwordLabel: string;
  fullNameLabel: string;
  selectRoleLabel: string;
  farmerRoleTitle: string;
  farmerRoleSubtitle: string;
  urbanRoleTitle: string;
  urbanRoleSubtitle: string;
  welcomeBack: string;
  joinApp: string;
  authHeroTitle: string;
  authHeroDesc: string;
  authTrustMetric: string;
  authTrustDesc: string;
  signInHeading: string;
  signUpHeading: string;
  signInSubtitle: string;
  signUpSubtitle: string;
  checkingCredentials: string;
  creatingAccount: string;
  logoutBtn: string;
  helpGuideBtn: string;
  languageLabel: string;

  // Additional Navigation
  navCareReminders: string;
  navUrbanIntelligence: string;
  navSmartRecs: string;
  navActivityHistory: string;

  // Scan & Treatments
  reAnalyzeBtn: string;
  tryAgainBtn: string;
  retakePhotoBtn: string;
  treatmentTab: string;
  preventionTab: string;
  monitoringTab: string;
  healthStatus: string;
  soilGuidanceTitle: string;
  diagnosticFollowUp: string;
  emptyHistoryTitle: string;
  emptyHistoryDesc: string;
  closeBtn: string;
  cropCategory: string;
  overallHealthLabel: string;
  sunlightNeedLabel: string;
  soilRecLabel: string;
  fertilizerRecLabel: string;
  presetSpecimensTitle: string;
  presetSpecimensSub: string;
  noImageSelected: string;
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    appName: "PlantPulse AI",
    tagline: "Check the Pulse. Understand the Plant. Grow Better.",
    taglineSub: "An AI-powered companion for healthier plants, smarter care and better farming decisions.",
    getStarted: "Get Started",
    signInPrompt: "Already have an account?",
    signIn: "Sign In",
    createAccount: "Create Account",
    continueGuest: "Continue as Guest",
    howDoYouGrow: "How do you grow?",
    selectSubtitle: "Choose your growing focus to calibrate your plant care intelligence.",
    farmerTitle: "I’m a Farmer",
    farmerDesc: "Manage crops, fields, soil and farming needs with field-scale AI insights.",
    farmerTag: "Field Crops · Acreage · Yield Protection",
    urbanTitle: "I’m an Urban Gardener",
    urbanDesc: "Care for plants at home, balcony, terrace or garden with mindful precision.",
    urbanTag: "Balcony Pots · Terrace · Indoor Botanicals",
    continueBtn: "Continue",
    backBtn: "Back",
    goodMorning: "Good Morning",
    greetingFarmer: "Good Morning, Kisan Brother",
    greetingUrban: "Good Morning, Plant Parent",
    healthPulseLabel: "HEALTH PULSE",
    healthy: "Healthy",
    moderateIssue: "Moderate Stress",
    waterLabel: "Water",
    diseaseLabel: "Disease",
    weatherLabel: "Weather",
    soilLabel: "Soil",
    optimal: "Optimal",
    clear: "Clear",
    favorable: "Favorable",
    soilAttention: "Nitrogen Check",
    scanPlantCTA: "Scan Your Plant",
    plantDoctorTitle: "PlantPulse AI — Your Plant Doctor",
    plantDoctorSubtitle: "Tell me what you’re seeing. I’ll help you understand what your plant needs.",
    actionCheckHealth: "Check Plant Health",
    actionWatering: "Watering Help",
    actionDisease: "Disease Help",
    actionSpeak: "Speak with Doctor",
    navOverview: "Overview",
    navMyPlants: "My Plants",
    navScanPlant: "Scan Plant",
    navPlantDoctor: "PlantPulse AI",
    navWeatherWater: "Weather & Water",
    navSoilInsights: "Soil Insights",
    prototypeNotice: "Interactive Product Prototype",

    onboardingFarmerTitle: "Farm & Crop Calibration",
    onboardingFarmerSub: "Select your Gujarat district, village, and current crop to personalize irrigation alerts.",
    onboardingUrbanTitle: "Urban Garden Calibration",
    onboardingUrbanSub: "Select your district, growing space, and primary plant to customize sunlight & water tracking.",
    stateLabel: "State",
    districtLabel: "District (Gujarat)",
    villageLabel: "Village / Taluka",
    cityLabel: "City / Area",
    farmNameLabel: "Farm or Field Name",
    growingLocationLabel: "Growing Location",
    cropLabel: "Primary Crop",
    plantLabel: "Primary Plant",
    completeOnboardingBtn: "Complete Calibration & Enter Dashboard",

    todayGlance: "TODAY AT A GLANCE",
    humidityLabel: "Humidity",
    rainProbLabel: "Rain Probability",
    smartCareTitle: "SMART CARE RECOMMENDATION",
    viewRecommendation: "View Recommendation",
    myFarmCrops: "My Crops & Fields",
    myBalconyPots: "My Balcony Collection",
    soilDiagnosticTitle: "Soil Diagnostic",
    cropHealthAvg: "Average Vitality",
    irrigationStatus: "Irrigation Directive",

    scanTitle: "CHECK YOUR PLANT'S PULSE",
    scanSub: "Upload a clear photo of a leaf, stem or affected area to begin optical pulse investigation.",
    takePhoto: "Take Photo",
    uploadImage: "Upload Image",
    dragOrDrop: "Drag an image here, or upload from your device",
    analyzePlantBtn: "Analyze Plant →",
    analyzingPulse: "Analyzing Cellular Chlorophyll & Pathogen Spores...",
    changeImage: "Change / Remove Image",
    demoAnalysisBadge: "Demo Analysis · AI Preview",
    reportTitle: "PLANT PULSE REPORT",
    possibleIssue: "Possible Issue",
    confidence: "Confidence",
    severity: "Severity",
    symptomsTitle: "Symptoms Detected on Specimen",
    whatToDoTitle: "WHAT TO DO (Immediate Treatment)",
    whatToAvoidTitle: "WHAT TO AVOID",
    smartContextTitle: "SMART CONTEXT (Weather & Soil)",
    askDoctorBtn: "Ask PlantPulse AI",
    saveToMyPlantsBtn: "Save to My Plants",
    savedToPlantsSuccess: "Saved to My Plants ✓",
    scanAnotherBtn: "Scan Another Plant",
    guestSavePrompt: "Create a free account to save your plant health history.",

    askAnythingPlaceholder: "Ask anything about your plant... (e.g. why are leaves turning yellow?)",
    voiceListening: "Voice engine active · Listening in Gujarati / Hindi / English...",
    voiceStop: "Stop Voice",
    differentialDiagnosis: "Differential Diagnosis",

    // Auth Modal & Profile
    emailLabel: "Email Address",
    passwordLabel: "Password",
    fullNameLabel: "Full Name",
    selectRoleLabel: "Select Your Role",
    farmerRoleTitle: "Farmer",
    farmerRoleSubtitle: "Field crops, acreage & farming",
    urbanRoleTitle: "Urban Planner",
    urbanRoleSubtitle: "Home gardens, balcony pots & plants",
    welcomeBack: "Welcome Back",
    joinApp: "Join PlantPulse AI",
    authHeroTitle: "Understand the pulse of every crop and plant.",
    authHeroDesc: "Connect optical plant pathology, hyper-local weather predictions and vernacular AI advisory in one unified workspace.",
    authTrustMetric: "Connected to MySQL Database via XAMPP",
    authTrustDesc: "User identity, role-based dashboards, and private diagnostic history are secured with bcrypt encryption.",
    signInHeading: "Sign in to PlantPulse",
    signUpHeading: "Create your free account",
    signInSubtitle: "Access your saved crops, diagnosis logs and sensor trends.",
    signUpSubtitle: "Register your account to access your personal dashboard & persistent history.",
    checkingCredentials: "Checking credentials...",
    creatingAccount: "Creating your account...",
    logoutBtn: "Sign Out",
    helpGuideBtn: "Help Guide",
    languageLabel: "Language",

    // Additional Navigation
    navCareReminders: "Care & Reminders",
    navUrbanIntelligence: "Urban Intelligence",
    navSmartRecs: "Smart Recommendations",
    navActivityHistory: "Activity History",

    // Scan & Treatments
    reAnalyzeBtn: "Re-Analyze Specimen",
    tryAgainBtn: "Try Again",
    retakePhotoBtn: "Retake Clear Photo",
    treatmentTab: "Treatment",
    preventionTab: "Prevention",
    monitoringTab: "48-72h Plan",
    healthStatus: "Health Status",
    soilGuidanceTitle: "SOIL & IRRIGATION GUIDANCE",
    diagnosticFollowUp: "Diagnostic Follow-up",
    emptyHistoryTitle: "No Activity History Yet",
    emptyHistoryDesc: "Run a plant scan, consult the Plant Doctor or track crops to record your agronomic timeline.",
    closeBtn: "Close",
    cropCategory: "Plant Category",
    overallHealthLabel: "Overall Health",
    sunlightNeedLabel: "Sunlight Need",
    soilRecLabel: "Soil & Substrate Recommendation",
    fertilizerRecLabel: "Fertilizer & Nutrient Guidance",
    presetSpecimensTitle: "Preset Leaf Specimens (Instant Real AI Testing)",
    presetSpecimensSub: "Click any specimen to run live optical triage",
    noImageSelected: "No Image Selected",
  },
  gu: {
    appName: "પ્લાન્ટપલ્સ એઆઈ",
    tagline: "ધબકારા તપાસો. છોડને સમજો. ઉત્તમ વૃદ્ધિ પામો.",
    taglineSub: "તંદુરસ્ત પાક, સ્માર્ટ માવજત અને ખેતીના શ્રેષ્ઠ નિર્ણયો માટે તમારો એઆઈ સાથી.",
    getStarted: "શરૂ કરો",
    signInPrompt: "પહેલેથી ખાતું છે?",
    signIn: "સાઇન ઇન કરો",
    createAccount: "ખાતું બનાવો",
    continueGuest: "અતિથિ તરીકે ચાલુ રાખો",
    howDoYouGrow: "તમે કેવી રીતે ઉગાડો છો?",
    selectSubtitle: "તમારા ખેતી કે બાગકામના અનુભવ અનુસાર યોગ્ય વિકલ્પ પસંદ કરો.",
    farmerTitle: "હું ખેડૂત છું",
    farmerDesc: "પાક, ખેતર, જમીન અને ખેતી સંબંધિત નિર્ણયોનું સંચાલન કરો.",
    farmerTag: "ખેતીવાડી પાક · જમીન · પાક રક્ષણ",
    urbanTitle: "હું અર્બન ગાર્ડનર છું",
    urbanDesc: "ઘર, બાલ્કની, ટેરેસ કે બગીચાના છોડની કાળજી રાખો.",
    urbanTag: "બાલ્કની કૂંડાં · ટેરેસ બગીચો · ઇન્ડોર છોડ",
    continueBtn: "આગળ વધો",
    backBtn: "પાછા જાઓ",
    goodMorning: "સુપ્રભાત",
    greetingFarmer: "સુપ્રભાત, કિસાન મિત્ર",
    greetingUrban: "સુપ્રભાત, ગાર્ડનર મિત્ર",
    healthPulseLabel: "હેલ્થ પલ્સ",
    healthy: "તંદુરસ્ત",
    moderateIssue: "મધ્યમ લક્ષણો",
    waterLabel: "પાણી",
    diseaseLabel: "રોગ નિયંત્રણ",
    weatherLabel: "હવામાન",
    soilLabel: "જમીન",
    optimal: "યોગ્ય",
    clear: "રોગમુક્ત",
    favorable: "અનુકૂળ",
    soilAttention: "નાઇટ્રોજન ચકાસો",
    scanPlantCTA: "તમારો છોડ સ્કેન કરો",
    plantDoctorTitle: "પ્લાન્ટપલ્સ એઆઈ — તમારા પ્લાન્ટ ડોક્ટર",
    plantDoctorSubtitle: "તમે છોડમાં શું જોઈ રહ્યા છો તે જણાવો. હું તમને જરૂરિયાત સમજવામાં મદદ કરીશ.",
    actionCheckHealth: "છોડનું સ્વાસ્થ્ય ચકાસો",
    actionWatering: "સિંચાઈ સલાહ",
    actionDisease: "રોગ સહાય",
    actionSpeak: "બોલીને પૂછો",
    navOverview: "ઓવરવ્યૂ",
    navMyPlants: "મારા છોડ",
    navScanPlant: "છોડ સ્કેન",
    navPlantDoctor: "પ્લાન્ટપલ્સ એઆઈ",
    navWeatherWater: "હવામાન અને સિંચાઈ",
    navSoilInsights: "જમીન વિશ્લેષણ",
    prototypeNotice: "ઇન્ટરેક્ટિવ પ્રોટોટાઇપ",

    onboardingFarmerTitle: "ખેતી અને પાક વિગતો",
    onboardingFarmerSub: "સિંચાઈ અને હવામાન સલાહ મેળવવા તમારો ગુજરાતનો જિલ્લો, ગામ અને મુખ્ય પાક પસંદ કરો.",
    onboardingUrbanTitle: "અર્બન ગાર્ડન વિગતો",
    onboardingUrbanSub: "તડકો અને પાણીની સચોટ માહિતી માટે જિલ્લો, વાવેતર સ્થળ અને મુખ્ય છોડ પસંદ કરો.",
    stateLabel: "રાજ્ય",
    districtLabel: "જિલ્લો (ગુજરાત)",
    villageLabel: "ગામ / તાલુકો",
    cityLabel: "શહેર / વિસ્તાર",
    farmNameLabel: "ખેતર / પ્લોટનું નામ",
    growingLocationLabel: "વાવેતર સ્થળ",
    cropLabel: "મુખ્ય પાક",
    plantLabel: "મુખ્ય છોડ",
    completeOnboardingBtn: "માહિતી સાચવો અને ડેશબોર્ડમાં જાઓ",

    todayGlance: "આજની સ્થિતિ",
    humidityLabel: "ભેજ",
    rainProbLabel: "વરસાદની શક્યતા",
    smartCareTitle: "સ્માર્ટ સલાહ",
    viewRecommendation: "સલાહ જુઓ",
    myFarmCrops: "મારા પાક અને ખેતરો",
    myBalconyPots: "મારા કૂંડાં અને છોડ",
    soilDiagnosticTitle: "જમીન વિશ્લેષણ",
    cropHealthAvg: "સરેરાશ તંદુરસ્તી",
    irrigationStatus: "સિંચાઈ આયોજન",

    scanTitle: "તમારા છોડના ધબકારા તપાસો",
    scanSub: "પાંદડું, થડ અથવા અસરગ્રસ્ત ભાગનો સ્પષ્ટ ફોટો અપલોડ કરો.",
    takePhoto: "ફોટો લો",
    uploadImage: "ફોટો અપલોડ કરો",
    dragOrDrop: "અહીં ફોટો મૂકો અથવા ડિવાઇસમાંથી પસંદ કરો",
    analyzePlantBtn: "છોડનું વિશ્લેષણ કરો →",
    analyzingPulse: "ક્લોરોફિલ અને રોગના લક્ષણો ચકાસી રહ્યા છીએ...",
    changeImage: "ફોટો બદલો / દૂર કરો",
    demoAnalysisBadge: "ડેમો વિશ્લેષણ · એઆઈ પ્રિવ્યૂ",
    reportTitle: "પ્લાન્ટ પલ્સ રિપોર્ટ",
    possibleIssue: "સંભવિત રોગ",
    confidence: "ચોકસાઈ દર",
    severity: "તીવ્રતા",
    symptomsTitle: "જોવા મળેલા રોગના લક્ષણો",
    whatToDoTitle: "શું કરવું (તાત્કાલિક સારવાર)",
    whatToAvoidTitle: "શું ન કરવું (સાવચેતી)",
    smartContextTitle: "હવામાન અને જમીન સંદર્ભ",
    askDoctorBtn: "પ્લાન્ટપલ્સ એઆઈને પૂછો",
    saveToMyPlantsBtn: "મારા છોડમાં સાચવો",
    savedToPlantsSuccess: "મારા છોડમાં સંગ્રહિત ✓",
    scanAnotherBtn: "બીજો છોડ સ્કેન કરો",
    guestSavePrompt: "તમારા છોડનો ઇતિહાસ સાચવવા મફત ખાતું બનાવો.",

    askAnythingPlaceholder: "છોડ વિશે કંઈ પણ પૂછો... (દા.ત. પાંદડા કેમ પીળા પડે છે?)",
    voiceListening: "વૉઇસ સિસ્ટમ સક્રિય · ગુજરાતી / હિન્દી / અંગ્રેજીમાં બોલો...",
    voiceStop: "વૉઇસ બંધ કરો",
    differentialDiagnosis: "રોગ નિદાન સલાહ",

    // Auth Modal & Profile
    emailLabel: "ઇમેઇલ સરનામું",
    passwordLabel: "પાસવર્ડ",
    fullNameLabel: "પૂરું નામ",
    selectRoleLabel: "તમારી ભૂમિકા પસંદ કરો",
    farmerRoleTitle: "ખેડૂત",
    farmerRoleSubtitle: "ખેતીવાડી પાક, જમીન અને ખેતર",
    urbanRoleTitle: "અર્બન ગાર્ડનર",
    urbanRoleSubtitle: "ઘર, બાલ્કની કૂંડાં અને છોડ",
    welcomeBack: "સ્વાગત છે",
    joinApp: "પ્લાન્ટપલ્સ એઆઈ સાથે જોડાઓ",
    authHeroTitle: "દરેક પાક અને છોડના ધબકારા સમજો.",
    authHeroDesc: "ઓપ્ટિકલ રોગ નિદાન, સ્થાનિક હવામાન આગાહી અને પ્રાદેશિક ભાષામાં એઆઈ માર્ગદર્શન એક જ પ્લેટફોર્મ પર મેળવો.",
    authTrustMetric: "XAMPP દ્વારા MySQL ડેટાબેઝ સાથે જોડાયેલ",
    authTrustDesc: "વપરાશકર્તા ઓળખ, ડેશબોર્ડ અને ડાયગ્નોસ્ટિક ઇતિહાસ સુરક્ષિત રીતે સંગ્રહિત છે.",
    signInHeading: "પ્લાન્ટપલ્સમાં સાઇન ઇન કરો",
    signUpHeading: "તમારું મફત ખાતું બનાવો",
    signInSubtitle: "તમારા સંગ્રહિત પાક, રોગ વિશ્લેષણ અને ઇતિહાસ જોવા માટે પ્રવેશ કરો.",
    signUpSubtitle: "તમારા અંગત ડેશબોર્ડ અને ઇતિહાસને સંગ્રહિત રાખવા માટે નોંધણી કરો.",
    checkingCredentials: "વિગતો ચકાસી રહ્યા છીએ...",
    creatingAccount: "ખાતું બનાવી રહ્યા છીએ...",
    logoutBtn: "લૉગઆઉટ",
    helpGuideBtn: "મદદ માર્ગદર્શિકા",
    languageLabel: "ભાષા",

    // Additional Navigation
    navCareReminders: "સંભાળ અને રીમાઇન્ડર",
    navUrbanIntelligence: "અર્બન બાગકામ બુદ્ધિ",
    navSmartRecs: "સ્માર્ટ ભલામણો",
    navActivityHistory: "પ્રવૃત્તિ ઇતિહાસ",

    // Scan & Treatments
    reAnalyzeBtn: "ફરીથી વિશ્લેષણ કરો",
    tryAgainBtn: "ફરી પ્રયાસ કરો",
    retakePhotoBtn: "નવો સ્પષ્ટ ફોટો લો",
    treatmentTab: "તાત્કાલિક સારવાર",
    preventionTab: "અગમચેતી",
    monitoringTab: "૪૮-૭૨ કલાક પ્લાન",
    healthStatus: "આરોગ્ય સ્થિતિ",
    soilGuidanceTitle: "જમીન અને સિંચાઈ માર્ગદર્શન",
    diagnosticFollowUp: "નિદાન ફોલો-અપ પ્રશ્ન",
    emptyHistoryTitle: "હજી સુધી કોઈ પ્રવૃત્તિ ઇતિહાસ નથી",
    emptyHistoryDesc: "તમારી ટાઈમલાઈન રેકોર્ડ કરવા માટે છોડ સ્કેન કરો, પ્લાન્ટ ડોક્ટરની સલાહ લો અથવા પાક ટ્રેક કરો.",
    closeBtn: "બંધ કરો",
    cropCategory: "છોડની શ્રેણી",
    overallHealthLabel: "સમગ્ર આરોગ્ય",
    sunlightNeedLabel: "તડકાની જરૂરિયાત",
    soilRecLabel: "જમીન અને સબસ્ટ્રેટ ભલામણ",
    fertilizerRecLabel: "ખાતર અને પોષક તત્વોની સલાહ",
    presetSpecimensTitle: "ચકાસાયેલા નમૂના પસંદ કરો (ઇન્સ્ટન્ટ ડેમો)",
    presetSpecimensSub: "ક્લિક કરીને લાઈવ વિઝન એનાલિસિસ જુઓ",
    noImageSelected: "કોઈ ફોટો પસંદ થયો નથી",
  },
  hi: {
    appName: "प्लांटपल्स एआई",
    tagline: "नब्ज पहचानें। पौधे को समझें। बेहतर फसल पाएं।",
    taglineSub: "स्वस्थ पौधों, समझदार देखभाल और बेहतर कृषि निर्णयों के लिए आपका एआई साथी।",
    getStarted: "शुरू करें",
    signInPrompt: "क्या पहले से खाता है?",
    signIn: "साइन इन करें",
    createAccount: "खाता बनाएं",
    continueGuest: "अतिथि के रूप में जारी रखें",
    howDoYouGrow: "आप कैसे पौधे उगाते हैं?",
    selectSubtitle: "अपनी खेती या बागवानी के अनुसार सही विकल्प चुनें।",
    farmerTitle: "मैं किसान हूँ",
    farmerDesc: "फसल, खेत, मिट्टी और कृषि जरूरतों का स्मार्ट प्रबंधन करें।",
    farmerTag: "खेत की फसलें · रकबा · उपज सुरक्षा",
    urbanTitle: "मैं शहरी माली हूँ",
    urbanDesc: "घर, बालकनी, छत या बगीचे के पौधों की सटीक देखभाल करें।",
    urbanTag: "बालकनी गमले · टेरेस गार्डन · इनडोर पौधे",
    continueBtn: "आगे बढ़ें",
    backBtn: "वापस",
    goodMorning: "शुभ प्रभात",
    greetingFarmer: "शुभ प्रभात, किसान भाई",
    greetingUrban: "शुभ प्रभात, प्लांट लवर",
    healthPulseLabel: "हेल्थ पल्स",
    healthy: "स्वस्थ",
    moderateIssue: "मध्यम तनाव",
    waterLabel: "जल स्तर",
    diseaseLabel: "रोग जांच",
    weatherLabel: "मौसम",
    soilLabel: "मिट्टी",
    optimal: "उचित",
    clear: "रोगमुक्त",
    favorable: "अनुकूल",
    soilAttention: "नाइट्रोजन जांचें",
    scanPlantCTA: "अपने पौधे को स्कैन करें",
    plantDoctorTitle: "प्लांटपल्स एआई — आपके प्लांट डॉक्टर",
    plantDoctorSubtitle: "बताएं कि आप पौधे में क्या देख रहे हैं। मैं उसकी आवश्यकता समझने में मदद करूँगा।",
    actionCheckHealth: "पौधे का स्वास्थ्य जांचें",
    actionWatering: "सिंचाई सलाह",
    actionDisease: "रोग उपचार",
    actionSpeak: "बोलकर पूछें",
    navOverview: "अवलोकन",
    navMyPlants: "मेरे पौधे",
    navScanPlant: "पौधा स्कैन",
    navPlantDoctor: "प्लांटपल्स एआई",
    navWeatherWater: "मौसम और पानी",
    navSoilInsights: "मृदा अंतर्दृष्टि",
    prototypeNotice: "इंटरैक्टिव प्रोटोटाइप",

    onboardingFarmerTitle: "खेत और फसल की सेटिंग",
    onboardingFarmerSub: "सिंचाई और मौसम सलाह के लिए अपना गुजरात का जिला, गाँव और मुख्य फसल चुनें।",
    onboardingUrbanTitle: "शहरी बगिया की सेटिंग",
    onboardingUrbanSub: "धूप और पानी की सटीक निगरानी के लिए जिला, स्थान और मुख्य पौधा चुनें।",
    stateLabel: "राज्य",
    districtLabel: "जिला (गुजरात)",
    villageLabel: "गाँव / तहसील",
    cityLabel: "शहर / क्षेत्र",
    farmNameLabel: "खेत / प्लॉट का नाम",
    growingLocationLabel: "पौधा लगाने का स्थान",
    cropLabel: "मुख्य फसल",
    plantLabel: "मुख्य पौधा",
    completeOnboardingBtn: "विवरण सहेजें और डैशबोर्ड पर जाएं",

    todayGlance: "आज की स्थिति",
    humidityLabel: "आर्द्रता",
    rainProbLabel: "बारिश की संभावना",
    smartCareTitle: "स्मार्ट सलाह",
    viewRecommendation: "सलाह देखें",
    myFarmCrops: "मेरी फसलें और खेत",
    myBalconyPots: "मेरे गमले और पौधे",
    soilDiagnosticTitle: "मृदा स्वास्थ्य",
    cropHealthAvg: "औसत जीवन शक्ति",
    irrigationStatus: "सिंचाई निर्देश",

    scanTitle: "अपने पौधे की नब्ज जांचें",
    scanSub: "पत्ती, तने या प्रभावित हिस्से की स्पष्ट तस्वीर अपलोड करें।",
    takePhoto: "फोटो खींचें",
    uploadImage: "फोटो अपलोड करें",
    dragOrDrop: "यहाँ फोटो खींच कर लाएं या गैलरी से चुनें",
    analyzePlantBtn: "पौधे का विश्लेषण करें →",
    analyzingPulse: "पत्तियों के क्लोरोफिल और रोग के लक्षणों की जांच जारी है...",
    changeImage: "फोटो बदलें / हटाएं",
    demoAnalysisBadge: "डेमो विश्लेषण · एआई पूर्वावलोकन",
    reportTitle: "प्लांट पल्स रिपोर्ट",
    possibleIssue: "संभावित रोग",
    confidence: "सटीकता दर",
    severity: "गंभीरता",
    symptomsTitle: "पौधे पर दिखे लक्षण",
    whatToDoTitle: "क्या करें (त्वरित उपचार)",
    whatToAvoidTitle: "क्या न करें (सावधानियां)",
    smartContextTitle: "मौसम और मिट्टी का संदर्भ",
    askDoctorBtn: "प्लांटपल्स एआई से पूछें",
    saveToMyPlantsBtn: "मेरे पौधों में सहेजें",
    savedToPlantsSuccess: "मेरे पौधों में सहेजा गया ✓",
    scanAnotherBtn: "दूसरा पौधा स्कैन करें",
    guestSavePrompt: "अपने पौधों का इतिहास सहेजने के लिए निःशुल्क खाता बनाएं।",

    askAnythingPlaceholder: "पौधे के बारे में कुछ भी पूछें... (जैसे पत्तियां पीली क्यों पड़ रही हैं?)",
    voiceListening: "वॉयस असिस्टेंट सक्रिय · गुजराती / हिंदी / अंग्रेजी में बोलें...",
    voiceStop: "वॉयस रोकें",
    differentialDiagnosis: "रोग निदान रिपोर्ट",

    // Auth Modal & Profile
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    fullNameLabel: "पूरा नाम",
    selectRoleLabel: "अपनी भूमिका चुनें",
    farmerRoleTitle: "किसान",
    farmerRoleSubtitle: "खेत की फसलें, रकबा और कृषि",
    urbanRoleTitle: "शहरी योजनाकार",
    urbanRoleSubtitle: "घर, बालकनी गमले और पौधे",
    welcomeBack: "पुनः स्वागत है",
    joinApp: "प्लांटपल्स एआई से जुड़ें",
    authHeroTitle: "हर फसल और पौधे की नब्ज समझें।",
    authHeroDesc: "ऑप्टिकल रोग निदान, स्थानीय मौसम पूर्वानुमान और क्षेत्रीय भाषा में एआई परामर्श एक ही स्थान पर पाएं।",
    authTrustMetric: "XAMPP के माध्यम से MySQL डेटाबेस से जुड़ा",
    authTrustDesc: "उपयोगकर्ता पहचान, डैशबोर्ड और नैदानिक इतिहास सुरक्षित रूप से संग्रहीत हैं।",
    signInHeading: "प्लांटपल्स में साइन इन करें",
    signUpHeading: "अपना निःशुल्क खाता बनाएं",
    signInSubtitle: "अपनी सहेजी गई फसलों, निदान लॉग और इतिहास तक पहुँचने के लिए प्रवेश करें।",
    signUpSubtitle: "अपने व्यक्तिगत डैशबोर्ड और इतिहास को सहेजने के लिए पंजीकरण करें।",
    checkingCredentials: "विवरण की जांच हो रही है...",
    creatingAccount: "खाता बनाया जा रहा है...",
    logoutBtn: "लॉगआउट",
    helpGuideBtn: "सहायता गाइड",
    languageLabel: "भाषा",

    // Additional Navigation
    navCareReminders: "देखभाल और अनुस्मारक",
    navUrbanIntelligence: "शहरी कृषि अंतर्दृष्टि",
    navSmartRecs: "स्मार्ट अनुशंसाएं",
    navActivityHistory: "गतिविधि इतिहास",

    // Scan & Treatments
    reAnalyzeBtn: "पुनः विश्लेषण करें",
    tryAgainBtn: "पुनः प्रयास करें",
    retakePhotoBtn: "नई साफ तस्वीर लें",
    treatmentTab: "तत्काल उपचार",
    preventionTab: "रोकथाम",
    monitoringTab: "४८-७२ घंटे प्लान",
    healthStatus: "स्वास्थ्य स्थिति",
    soilGuidanceTitle: "मृदा और सिंचाई मार्गदर्शन",
    diagnosticFollowUp: "नैदानिक फॉलो-अप प्रश्न",
    emptyHistoryTitle: "अभी तक कोई गतिविधि इतिहास नहीं है",
    emptyHistoryDesc: "अपनी टाइमलाइन रिकॉर्ड करने के लिए पौधा स्कैन करें, प्लांट डॉक्टर से परामर्श लें या फसल ट्रैक करें।",
    closeBtn: "बंद करें",
    cropCategory: "पौधे की श्रेणी",
    overallHealthLabel: "समग्र स्वास्थ्य",
    sunlightNeedLabel: "धूप की आवश्यकता",
    soilRecLabel: "मृदा एवं सब्सट्रेट अनुशंसा",
    fertilizerRecLabel: "उर्वरक एवं पोषक तत्व मार्गदर्शन",
    presetSpecimensTitle: "परीक्षित नमूने चुनें (त्वरित डेमो)",
    presetSpecimensSub: "क्लिक करके लाइव एआई विश्लेषण देखें",
    noImageSelected: "कोई तस्वीर चयनित नहीं",
  },
};
