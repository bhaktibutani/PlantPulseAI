export interface GujaratDistrict {
  id: string;
  name: {
    en: string;
    gu: string;
    hi: string;
  };
  villages: {
    en: string[];
    gu: string[];
    hi: string[];
  };
  cities: {
    en: string[];
    gu: string[];
    hi: string[];
  };
}

export const GUJARAT_DISTRICTS: GujaratDistrict[] = [
  {
    id: 'rajkot',
    name: { en: 'Rajkot', gu: 'રાજકોટ', hi: 'राजकोट' },
    villages: {
      en: ['Gondal Rural', 'Jasdan', 'Dhoraji', 'Kotda Sangani', 'Jetpur Rural', 'Lodhika', 'Paddhari'],
      gu: ['ગોંડલ ગ્રામ્ય', 'જસદણ', 'ધોરાજી', 'કોટડા સાંગાણી', 'જેતપુર ગ્રામ્ય', 'લોધિકા', 'પડધરી'],
      hi: ['गोंडल ग्रामीण', 'जसदण', 'धोराजी', 'कोटडा सांगाणी', 'जेतपुर ग्रामीण', 'लोधिका', 'पडधरी'],
    },
    cities: {
      en: ['Rajkot City', 'Gondal Town', 'Jetpur City', 'Dhoraji Town'],
      gu: ['રાજકોટ શહેર', 'ગોંડલ શહેર', 'જેતપુર શહેર', 'ધોરાજી શહેર'],
      hi: ['राजकोट शहर', 'गोंडल शहर', 'जेतपुर शहर', 'धोराजी शहर'],
    },
  },
  {
    id: 'junagadh',
    name: { en: 'Junagadh', gu: 'જૂનાગઢ', hi: 'जूनागढ़' },
    villages: {
      en: ['Keshod Rural', 'Mangrol', 'Manavadar', 'Visavadar', 'Mendarda', 'Vanthali', 'Bilkha'],
      gu: ['કેશોદ ગ્રામ્ય', 'માંગરોળ', 'માણાવદર', 'વિસાવદર', 'મેંદરડા', 'વંથલી', 'બિલખા'],
      hi: ['केशोद ग्रामीण', 'मांगरोल', 'माणावदर', 'विसावदर', 'मेंदरडा', 'वंथली', 'बिलखा'],
    },
    cities: {
      en: ['Junagadh Urban', 'Keshod City', 'Mangrol Port Area'],
      gu: ['જૂનાગઢ શહેર', 'કેશોદ શહેર', 'માંગરોળ બંદર વિસ્તાર'],
      hi: ['जूनागढ़ शहर', 'केशोद शहर', 'मांगरोल पोर्ट एरिया'],
    },
  },
  {
    id: 'amreli',
    name: { en: 'Amreli', gu: 'અમરેલી', hi: 'अमरेली' },
    villages: {
      en: ['Dhari', 'Babra', 'Bagasara', 'Savarkundla Rural', 'Rajula', 'Jafrabad', 'Khambha'],
      gu: ['ધારી', 'બાબરા', 'બગસરા', 'સાવરકુંડલા ગ્રામ્ય', 'રાજુલા', 'જાફરાબાદ', 'ખાંભા'],
      hi: ['धारी', 'बाबरा', 'बगसरा', 'सावरकुंडला ग्रामीण', 'राजुला', 'जाफराबाद', 'खांभा'],
    },
    cities: {
      en: ['Amreli City', 'Savarkundla Town', 'Rajula Port'],
      gu: ['અમરેલી શહેર', 'સાવરકુંડલા શહેર', 'રાજુલા બંદર'],
      hi: ['अमरेली शहर', 'सावरकुंडला शहर', 'राजुला पोर्ट'],
    },
  },
  {
    id: 'jamnagar',
    name: { en: 'Jamnagar', gu: 'જામનગર', hi: 'जामनगर' },
    villages: {
      en: ['Dhrol', 'Kalavad', 'Lalpur', 'Jamjodhpur Rural', 'Jodiya', 'Aliabada'],
      gu: ['ધ્રોલ', 'કાલાવડ', 'લાલપુર', 'જામજોધપુર ગ્રામ્ય', 'જોડિયા', 'અલીયાબાડા'],
      hi: ['ध्रोल', 'कालावाद', 'लालपुर', 'जामजोधपुर ग्रामीण', 'जोडिया', 'अलियाबाड़ा'],
    },
    cities: {
      en: ['Jamnagar Urban', 'Digvijaygram', 'Sikka'],
      gu: ['જામનગર શહેર', 'દિગ્વિજયગ્રામ', 'સિક્કા'],
      hi: ['जामनगर शहर', 'दिग्विजयग्राम', 'सिक्का'],
    },
  },
  {
    id: 'bhavnagar',
    name: { en: 'Bhavnagar', gu: 'ભાવનગર', hi: 'भावनगर' },
    villages: {
      en: ['Mahuva Rural', 'Palitana Rural', 'Talaja', 'Gariadhar', 'Sihor', 'Gadhada Border'],
      gu: ['મહુવા ગ્રામ્ય', 'પાલીતાણા ગ્રામ્ય', 'તળાજા', 'ગારીયાધાર', 'સિહોર', 'ગઢડા સીમા'],
      hi: ['महुवा ग्रामीण', 'पालीताना ग्रामीण', 'तलाजा', 'गारियाधार', 'सिहोर', 'गढडा सीमा'],
    },
    cities: {
      en: ['Bhavnagar City', 'Mahuva Town', 'Palitana Town'],
      gu: ['ભાવનગર શહેર', 'મહુવા શહેર', 'પાલીતાણા શહેર'],
      hi: ['भावनगर शहर', 'महुवा शहर', 'पालीताना शहर'],
    },
  },
  {
    id: 'ahmedabad',
    name: { en: 'Ahmedabad', gu: 'અમદાવાદ', hi: 'अहमदाबाद' },
    villages: {
      en: ['Dholka Rural', 'Dhandhuka', 'Sanand Rural', 'Bavla', 'Viramgam', 'Mandal'],
      gu: ['ધોળકા ગ્રામ્ય', 'ધંધૂકા', 'સાણંદ ગ્રામ્ય', 'બાવળા', 'વિરમગામ', 'માંડલ'],
      hi: ['धोलका ग्रामीण', 'धंधुका', 'साणंद ग्रामीण', 'बावला', 'वीरमगाम', 'मांडल'],
    },
    cities: {
      en: ['Ahmedabad West (Balcony/Terrace)', 'Ahmedabad East', 'Bopal-Shela', 'Sanand Town'],
      gu: ['અમદાવાદ પશ્ચિમ (બાલ્કની/ટેરેસ)', 'અમદાવાદ પૂર્વ', 'બોપલ-શીલજ', 'સાણંદ શહેર'],
      hi: ['अहमदाबाद पश्चिम (बालकनी/टेरेस)', 'अहमदाबाद पूर्व', 'बोपल-शीला', 'साणंद शहर'],
    },
  },
  {
    id: 'surat',
    name: { en: 'Surat', gu: 'સુરત', hi: 'सूरत' },
    villages: {
      en: ['Bardoli Rural', 'Mandvi Rural', 'Mangrol Surat', 'Olpad', 'Kamrej', 'Mahuva Surat'],
      gu: ['બારડોલી ગ્રામ્ય', 'માંડવી ગ્રામ્ય', 'માંગરોળ સુરત', 'ઓલપાડ', 'કામરેજ', 'મહુવા સુરત'],
      hi: ['बारडोली ग्रामीण', 'मांडवी ग्रामीण', 'मांगरोल सूरत', 'ओलपाड', 'कामरेज', 'महुवा सूरत'],
    },
    cities: {
      en: ['Surat City (Adajan/Vesu)', 'Bardoli Town', 'Rander Area'],
      gu: ['સુરત શહેર (અડાજણ/વેસુ)', 'બારડોલી શહેર', 'રાંદેર વિસ્તાર'],
      hi: ['सूरत शहर (अडाजण/वेसु)', 'बारडोली शहर', 'रांदेर क्षेत्र'],
    },
  },
  {
    id: 'vadodara',
    name: { en: 'Vadodara', gu: 'વડોદરા', hi: 'वडोदरा' },
    villages: {
      en: ['Dabhoi Rural', 'Padra', 'Karjan', 'Waghodia', 'Savli', 'Sinor'],
      gu: ['ડભોઈ ગ્રામ્ય', 'પાદરા', 'કરજણ', 'વાઘોડિયા', 'સાવલી', 'સિનોર'],
      hi: ['डभोई ग्रामीण', 'पादरा', 'करजण', 'वाघोडिया', 'सावली', 'सिनोर'],
    },
    cities: {
      en: ['Vadodara Urban (Alkapuri/Gotri)', 'Dabhoi Town', 'Padra Town'],
      gu: ['વડોદરા શહેર (અલકાપુરી/ગોત્રી)', 'ડભોઈ શહેર', 'પાદરા શહેર'],
      hi: ['वडोदरा शहर (अलकापुरी/गोत्री)', 'डभोई शहर', 'पादरा शहर'],
    },
  },
  {
    id: 'mehsana',
    name: { en: 'Mehsana', gu: 'મહેસાણા', hi: 'मेहसाणा' },
    villages: {
      en: ['Kadi Rural', 'Visnagar Rural', 'Vadnagar', 'Vijapur', 'Unjha Rural', 'Becharaji'],
      gu: ['કડી ગ્રામ્ય', 'વિસનગર ગ્રામ્ય', 'વડનગર', 'વિજાપુર', 'ઊંઝા ગ્રામ્ય', 'બેચરાજી'],
      hi: ['कडी ग्रामीण', 'विसनगर ग्रामीण', 'वडनगर', 'विजापुर', 'ऊंझा ग्रामीण', 'बेचराजी'],
    },
    cities: {
      en: ['Mehsana City', 'Kadi Town', 'Unjha Mandi Area'],
      gu: ['મહેસાણા શહેર', 'કડી શહેર', 'ઊંઝા માર્કેટ યાર્ડ'],
      hi: ['मेहसाणा शहर', 'कडी शहर', 'ऊंझा मंडी क्षेत्र'],
    },
  },
  {
    id: 'kutch',
    name: { en: 'Kutch', gu: 'કચ્છ', hi: 'कच्छ' },
    villages: {
      en: ['Nakhatrana', 'Mandvi Kutch', 'Mundra Rural', 'Anjar Rural', 'Rapar', 'Bhachau', 'Lakhpat'],
      gu: ['નખત્રાણા', 'માંડવી કચ્છ', 'મુન્દ્રા ગ્રામ્ય', 'અંજાર ગ્રામ્ય', 'રાપર', 'ભચાઉ', 'લખપત'],
      hi: ['नखत्राणा', 'मांडवी कच्छ', 'मुन्द्रा ग्रामीण', 'अंजार ग्रामीण', 'रापर', 'भचाऊ', 'लखपत'],
    },
    cities: {
      en: ['Bhuj City', 'Gandhidham Urban', 'Mundra Port Area'],
      gu: ['ભુજ શહેર', 'ગાંધીધામ શહેર', 'મુન્દ્રા બંદર'],
      hi: ['भुज शहर', 'गांधीधाम शहर', 'मुन्द्रा पोर्ट'],
    },
  },
  {
    id: 'anand',
    name: { en: 'Anand', gu: 'આણંદ', hi: 'आणंद' },
    villages: {
      en: ['Borsad Rural', 'Petlad', 'Khambhat Rural', 'Umreth', 'Tarapur', 'Sojitra'],
      gu: ['બોરસદ ગ્રામ્ય', 'પેટલાદ', 'ખંભાત ગ્રામ્ય', 'ઉમરેઠ', 'તારાપુર', 'સોજિત્રા'],
      hi: ['बोरसद ग्रामीण', 'पेटलाद', 'खंभात ग्रामीण', 'उमरेठ', 'तारापुर', 'सोजित्रा'],
    },
    cities: {
      en: ['Anand City / Milk City', 'Vallabh Vidyanagar', 'Petlad Town'],
      gu: ['આણંદ શહેર', 'વલ્લભ વિદ્યાનગર', 'પેટલાદ શહેર'],
      hi: ['आणंद शहर', 'वल्लभ विद्यानगर', 'पेटलाद शहर'],
    },
  },
  {
    id: 'banaskantha',
    name: { en: 'Banaskantha', gu: 'બનાસકાંઠા', hi: 'बनासकांठा' },
    villages: {
      en: ['Deesa Rural', 'Dhanera', 'Tharad', 'Danta', 'Vav', 'Kankrej', 'Bhabhar'],
      gu: ['ડીસા ગ્રામ્ય', 'ધાનેરા', 'થરાદ', 'દાંતા', 'વાવ', 'કાંકરેજ', 'ભાભર'],
      hi: ['डीसा ग्रामीण', 'धानेरा', 'थराद', 'दांता', 'वाव', 'कांकरेज', 'भाभर'],
    },
    cities: {
      en: ['Palanpur City', 'Deesa Town', 'Tharad Town'],
      gu: ['પાલનપુર શહેર', 'ડીસા શહેર', 'થરાદ શહેર'],
      hi: ['पालनपुर शहर', 'डीसा शहर', 'थराद शहर'],
    },
  },
];

export const INITIAL_FARMER_CROPS = [
  { id: 'tomato', name: { en: 'Tomato', gu: 'ટામેટા', hi: 'टमाटर' }, icon: '🍅', variety: 'Vaibhav Hybrid' },
  { id: 'cotton', name: { en: 'Cotton', gu: 'કપાસ', hi: 'कपास' }, icon: '🌱', variety: 'BT Cotton II' },
  { id: 'wheat', name: { en: 'Wheat', gu: 'ઘઉં', hi: 'गेहूं' }, icon: '🌾', variety: 'Lokwan / Tukdi' },
  { id: 'groundnut', name: { en: 'Groundnut', gu: 'મગફળી', hi: 'मूंगफली' }, icon: '🥜', variety: 'GG-20 / Spanish' },
  { id: 'chilli', name: { en: 'Chilli', gu: 'મરચાં', hi: 'मिर्च' }, icon: '🌶️', variety: 'G-4 Jawala' },
];

export const INITIAL_URBAN_PLANTS = [
  { id: 'tomato', name: { en: 'Tomato', gu: 'ટામેટા', hi: 'टमाटर' }, icon: '🍅', care: 'Full Sun · 4-5 hrs' },
  { id: 'tulsi', name: { en: 'Tulsi (Holy Basil)', gu: 'તુલસી', hi: 'तुलसी' }, icon: '🌿', care: 'Morning Sun · Moderate' },
  { id: 'chilli', name: { en: 'Chilli', gu: 'મરચાં', hi: 'मिर्च' }, icon: '🌶️', care: 'Direct Balcony Sun' },
  { id: 'money_plant', name: { en: 'Money Plant (Pothos)', gu: 'મની પ્લાન્ટ', hi: 'मनी प्लांट' }, icon: '🪴', care: 'Indirect Light' },
  { id: 'rose', name: { en: 'Desi Rose', gu: 'ગુલાબ', hi: 'गुलाब' }, icon: '🌹', care: 'Morning Light · 6 hrs' },
];

export const URBAN_GROWING_LOCATIONS = [
  { id: 'home', name: { en: 'Home', gu: 'ઘર', hi: 'घर' }, icon: '🏡' },
  { id: 'balcony', name: { en: 'Balcony', gu: 'બાલ્કની', hi: 'बालकनी' }, icon: '🪴' },
  { id: 'terrace', name: { en: 'Terrace', gu: 'ટેરેસ', hi: 'छत / टेरेस' }, icon: '☀️' },
  { id: 'garden', name: { en: 'Garden', gu: 'બગીચો', hi: 'बगीचा' }, icon: '🌳' },
  { id: 'office', name: { en: 'Office', gu: 'ઓફિસ', hi: 'कार्यालय' }, icon: '🏢' },
];
