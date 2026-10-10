import React, { useState, useEffect } from 'react';
import { Logo } from './Logo.tsx';
import { UserType } from './UserTypeSelection.tsx';
import { cropDisplayName, Language, localizedText, translations, uiCopy } from '../data/translations.ts';
import { FarmerOnboardingData } from './FarmerOnboarding.tsx';
import { UrbanOnboardingData } from './UrbanOnboarding.tsx';
import { SavedPlantItem } from './ScanStudio.tsx';
import { getWeatherData, WeatherModel } from '../data/weatherData.ts';
import { GUJARAT_DISTRICTS, localizeGujaratLocation } from '../data/gujaratLocations.ts';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  HeartPulse,
  HelpCircle,
  Layers,
  Leaf,
  LogOut,
  MapPin,
  Mic,
  Plus,
  RefreshCw,
  ScanLine,
  Send,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Thermometer,
  User,
  Wind,
  X,
  Clock,
  History,
  Database,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Check,
  Trash2,
  Zap,
  FileText,
} from 'lucide-react';
import { AuthUser } from './AuthModal.tsx';

interface DashboardProps {
  userType: UserType;
  setUserType: (type: UserType) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  farmerData?: FarmerOnboardingData;
  urbanData?: UrbanOnboardingData;
  savedPlants: SavedPlantItem[];
  onOpenScanStudio: (crop?: string) => void;
  onOpenDoctor: (query?: string, scanContext?: any) => void;
  onBackToLanding: () => void;
  onChangePersona: () => void;
  isGuest?: boolean;
  onShowAuth?: () => void;
  currentUser?: AuthUser | null;
  authToken?: string | null;
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userType,
  setUserType,
  lang,
  onLanguageChange,
  farmerData,
  urbanData,
  savedPlants,
  onOpenScanStudio,
  onOpenDoctor,
  onBackToLanding,
  onChangePersona,
  isGuest = false,
  onShowAuth,
  currentUser = null,
  authToken = null,
  onLogout,
}) => {
  const [activeSidebarNav, setActiveSidebarNav] = useState('Overview');
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [quickQueryText, setQuickQueryText] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'plant_scan' | 'doctor_chat' | 'care_reminder' | 'account_created'>('all');
  const [selectedReportScan, setSelectedReportScan] = useState<any | null>(null);
  const [scanModalTab, setScanModalTab] = useState<'treatment' | 'prevention' | 'monitoring' | 'soil'>('treatment');
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Selected district override for live weather intelligence
  const defaultDistrictId = userType === 'farmer' ? (farmerData?.districtId || 'rajkot') : (urbanData?.districtId || 'rajkot');
  const [currentDistrictId, setCurrentDistrictId] = useState<string>(defaultDistrictId);

  // Phase 3.6: Tasks & Reminders State
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState('watering');
  const [newTaskDueDate, setNewTaskDueDate] = useState('Today');

  // Phase 3.3: Urban Farming Intelligence State
  const [urbanSpaceType, setUrbanSpaceType] = useState('balcony');
  const [urbanContainer, setUrbanContainer] = useState('terracotta_pots');
  const [urbanSunHours, setUrbanSunHours] = useState(6);
  const [urbanIntelligence, setUrbanIntelligence] = useState<any>(null);
  const [isLoadingUrban, setIsLoadingUrban] = useState(false);

  // Phase 3.4: Personalized Recommendations State
  const [personalizedRecs, setPersonalizedRecs] = useState<any>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Phase 3 Plants Ledger State
  const [monitoredPlants, setMonitoredPlants] = useState<any[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantSpecies, setNewPlantSpecies] = useState('');
  const [newPlantLocation, setNewPlantLocation] = useState('balcony');

  const t = translations[lang];

  // Fetch persistent user history from MySQL
  const fetchHistory = async () => {
    if (!authToken) {
      setActivities([]);
      return;
    }
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.activities)) {
        setActivities(data.activities);
      }
    } catch (err) {
      console.warn('Could not fetch user activity history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fetch Care Tasks from MySQL
  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const res = await fetch('/api/tasks', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.warn('Could not fetch tasks:', err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Fetch Monitored Plants from MySQL
  const fetchPlants = async () => {
    setIsLoadingPlants(true);
    try {
      const res = await fetch('/api/plants', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.plants)) {
        setMonitoredPlants(data.plants);
      }
    } catch (err) {
      console.warn('Could not fetch plants:', err);
    } finally {
      setIsLoadingPlants(false);
    }
  };

  // Fetch MySQL database connection status
  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      if (data.success) {
        setDbStatus(data);
      }
    } catch (err) {}
  };

  // Run Real AI Urban Farming Intelligence (Phase 3.3)
  const runUrbanIntelligence = async () => {
    setIsLoadingUrban(true);
    try {
      const res = await fetch('/api/urban-farming-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          spaceType: urbanSpaceType,
          containerType: urbanContainer,
          sunHours: urbanSunHours,
          plantTypes: [activeCropName, 'Basil', 'Mint', 'Coriander'],
          location: `${currentDistrictId.toUpperCase()}, Gujarat`,
          lang,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUrbanIntelligence(data.data);
      }
    } catch (err) {
      console.error('Urban intelligence error:', err);
    } finally {
      setIsLoadingUrban(false);
    }
  };

  // Fetch Real AI Personalized Recommendations (Phase 3.4)
  const fetchPersonalizedRecs = async () => {
    setIsLoadingRecs(true);
    try {
      const weather = getWeatherData(currentDistrictId);
      const res = await fetch('/api/personalized-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          userType,
          cropName: activeCropName,
          districtId: currentDistrictId,
          weatherData: weather,
          lang,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPersonalizedRecs(data.data);
      }
    } catch (err) {
      console.error('Personalized recs error:', err);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  // Toggle Task Completion in MySQL
  const handleToggleTask = async (taskId: number, currentCompleted: boolean) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !currentCompleted } : t))
      );
      if (authToken) {
        await fetch(`/api/tasks/${taskId}/toggle`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ completed: !currentCompleted }),
        });
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // Add Task to MySQL
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      if (authToken) {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            title: newTaskTitle.trim(),
            task_type: newTaskType,
            due_date: newTaskDueDate,
          }),
        });
        const data = await res.json();
        if (data.success && data.task) {
          setTasks((prev) => [data.task, ...prev]);
        }
      } else {
        const localTask = {
          id: Date.now(),
          user_id: 0,
          plant_id: null,
          task_type: newTaskType,
          title: newTaskTitle.trim(),
          due_date: newTaskDueDate,
          completed: false,
        };
        setTasks((prev) => [localTask, ...prev]);
      }
      setNewTaskTitle('');
      setShowAddTaskModal(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Add Plant to MySQL
  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName.trim()) return;
    try {
      if (authToken) {
        const res = await fetch('/api/plants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: newPlantName.trim(),
            species: newPlantSpecies.trim() || 'Botanical Specimen',
            location_type: newPlantLocation,
            health_status: 'Healthy',
            health_score: 90,
          }),
        });
        const data = await res.json();
        if (data.success && data.plant) {
          setMonitoredPlants((prev) => [data.plant, ...prev]);
        }
      } else {
        const localPlant = {
          id: Date.now(),
          name: newPlantName.trim(),
          species: newPlantSpecies.trim() || 'Botanical Specimen',
          location_type: newPlantLocation,
          health_status: 'Healthy',
          health_score: 90,
        };
        setMonitoredPlants((prev) => [localPlant, ...prev]);
      }
      setNewPlantName('');
      setNewPlantSpecies('');
      setShowAddPlantModal(false);
    } catch (err) {
      console.error('Failed to create plant:', err);
    }
  };

  useEffect(() => {
    fetchDbStatus();
    fetchTasks();
    fetchPlants();
    if (authToken) {
      fetchHistory();
    } else {
      setActivities([]);
    }
  }, [authToken, currentUser]);

  useEffect(() => {
    if (activeSidebarNav === 'Urban Farming Intelligence') {
      setUrbanIntelligence(null);
      runUrbanIntelligence();
    } else if (activeSidebarNav === 'Smart Recommendations') {
      setPersonalizedRecs(null);
      fetchPersonalizedRecs();
    }
  }, [lang]);

  // Weather data resolved for current district
  const weather = getWeatherData(currentDistrictId);
  const activeDistrictName = GUJARAT_DISTRICTS.find((district) => district.id === currentDistrictId)?.name[lang] || currentDistrictId;

  const activeCropName = cropDisplayName(
    lang,
    userType === 'farmer' ? (farmerData?.cropName || 'Tomato') : (urbanData?.plantName || 'Tomato')
  );
  const activeCropId = userType === 'farmer'
    ? (farmerData?.cropId || 'tomato')
    : (urbanData?.plantId || 'tomato');

  const activeLocationLabel = userType === 'farmer'
    ? `${activeDistrictName} · ${localizeGujaratLocation(farmerData?.village || 'Gondal Rural', lang)}`
    : `${activeDistrictName} · ${localizedText(lang, localizeGujaratLocation(urbanData?.cityArea || 'City Balcony', lang))} (${localizedText(lang, urbanData?.growingLocationName || 'Balcony')})`;

  const farmOrBalconyTitle = userType === 'farmer'
    ? localizedText(lang, farmerData?.farmName || 'Kisan Field Plot 1')
    : `${localizedText(lang, urbanData?.growingLocationName || 'Balcony')} ${localizedText(lang, 'Garden')}`;

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col md:flex-row text-[#17382B] selection:bg-[#E8F1E7] selection:text-[#245C43]">
      {/* LEFT SIDEBAR: Professional Application Shell */}
      <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-[#8FAF91]/30 flex flex-col justify-between shrink-0 select-none">
        <div className="min-w-0 flex-1">
          {/* Brand Wordmark & Mode Header */}
          <div className="p-6 border-b border-[#8FAF91]/25">
            <Logo size="md" onClick={onBackToLanding} className="cursor-pointer" />

            {/* Persona Switcher Pill */}
            <div className="mt-5 p-1 bg-[#FAF8F3] rounded-xl border border-[#8FAF91]/35 flex items-center gap-1">
              <button
                onClick={() => setUserType('farmer')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  userType === 'farmer'
                    ? 'bg-[#245C43] text-white shadow-xs'
                    : 'text-[#476353] hover:text-[#17382B]'
                }`}
              >
                <span>🌾</span>
                <span>{lang === 'gu' ? 'ખેડૂત' : lang === 'hi' ? 'किसान' : 'Farmer'}</span>
              </button>
              <button
                onClick={() => setUserType('urban')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  userType === 'urban'
                    ? 'bg-[#245C43] text-white shadow-xs'
                    : 'text-[#476353] hover:text-[#17382B]'
                }`}
              >
                <span>🪴</span>
                <span>{lang === 'gu' ? 'શહેરી' : lang === 'hi' ? 'शहरी' : t.extra.urbanRoleShort}</span>
              </button>
            </div>
          </div>

          {/* Core Navigation Items */}
          <nav className="p-4 space-y-1 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveSidebarNav('Overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                activeSidebarNav === 'Overview'
                  ? 'bg-[#E8F1E7] text-[#245C43] font-bold'
                  : 'text-[#476353] hover:bg-[#FAF8F3] hover:text-[#17382B]'
              }`}
            >
              <Activity className="w-4 h-4 text-[#245C43]" />
              <span>{t.navOverview}</span>
            </button>

            <button
              onClick={() => setActiveSidebarNav('My Plants')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                activeSidebarNav === 'My Plants'
                  ? 'bg-[#E8F1E7] text-[#245C43] font-bold'
                  : 'text-[#476353] hover:bg-[#FAF8F3] hover:text-[#17382B]'
              }`}
            >
              <Leaf className="w-4 h-4 text-[#245C43]" />
              <span>{userType === 'farmer' ? t.myFarmCrops : t.myBalconyPots}</span>
            </button>

            {/* Phase 3.6: Dedicated Plant Care & Reminders */}
            <button
              onClick={() => setActiveSidebarNav('Plant Care & Reminders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                activeSidebarNav === 'Plant Care & Reminders'
                  ? 'bg-[#E8F1E7] text-[#245C43] font-bold'
                  : 'text-[#476353] hover:bg-[#FAF8F3] hover:text-[#17382B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#245C43]" />
                <span>{t.navCareReminders}</span>
              </div>
              {tasks.filter((t) => !t.completed).length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#E5A93D] text-[#17382B] font-bold">
                  {tasks.filter((t) => !t.completed).length} {uiCopy(lang, 'due')}
                </span>
              )}
            </button>

            {/* Phase 3.3: Urban Farming Intelligence (Especially for Urban Planners) */}
            <button
              onClick={() => {
                setActiveSidebarNav('Urban Farming Intelligence');
                if (!urbanIntelligence) runUrbanIntelligence();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                activeSidebarNav === 'Urban Farming Intelligence'
                  ? 'bg-[#E8F1E7] text-[#245C43] font-bold'
                  : 'text-[#476353] hover:bg-[#FAF8F3] hover:text-[#17382B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-[#245C43]" />
                <span>{t.navUrbanIntelligence}</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#245C43] text-white font-mono">
                AI
              </span>
            </button>

            {/* Phase 3.4: Personalized Recommendations */}
            <button
              onClick={() => {
                setActiveSidebarNav('Smart Recommendations');
                if (!personalizedRecs) fetchPersonalizedRecs();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                activeSidebarNav === 'Smart Recommendations'
                  ? 'bg-[#E8F1E7] text-[#245C43] font-bold'
                  : 'text-[#476353] hover:bg-[#FAF8F3] hover:text-[#17382B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#9A7653]" />
                <span>{t.navSmartRecs}</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#9A7653] text-white font-mono">
                {uiCopy(lang, 'Pulse')}
              </span>
            </button>

            {/* Phase 3.1: Optical Scan Plant */}
            <button
              onClick={() => {
                onOpenScanStudio(activeCropName);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#245C43] text-white font-bold shadow-xs hover:bg-[#1b4834] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ScanLine className="w-4 h-4 text-[#E5A93D]" />
                <span>{t.navScanPlant}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 font-mono">
                {uiCopy(lang, 'Vision AI')}
              </span>
            </button>

            {/* Phase 3.2: AI Plant Doctor */}
            <button
              onClick={() => {
                onOpenDoctor();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left text-[#476353] hover:bg-[#FAF8F3] hover:text-[#17382B] cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#9A7653]" />
              <span>{t.navPlantDoctor}</span>
            </button>

            {/* Phase 3.5: Weather & Water */}
            <button
              onClick={() => setActiveSidebarNav('Weather & Water')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                activeSidebarNav === 'Weather & Water'
                  ? 'bg-[#E8F1E7] text-[#245C43] font-bold'
                  : 'text-[#476353] hover:bg-[#FAF8F3] hover:text-[#17382B]'
              }`}
            >
              <CloudSun className="w-4 h-4 text-[#245C43]" />
              <span>{t.navWeatherWater}</span>
            </button>

            <button
              onClick={() => setActiveSidebarNav('Soil Insights')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                activeSidebarNav === 'Soil Insights'
                  ? 'bg-[#E8F1E7] text-[#245C43] font-bold'
                  : 'text-[#476353] hover:bg-[#FAF8F3] hover:text-[#17382B]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#9A7653]" />
              <span>{t.navSoilInsights}</span>
            </button>

            {/* Activity History */}
            <button
              onClick={() => {
                setActiveSidebarNav('Activity History');
                fetchHistory();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                activeSidebarNav === 'Activity History'
                  ? 'bg-[#E8F1E7] text-[#245C43] font-bold shadow-2xs'
                  : 'text-[#476353] hover:bg-[#FAF8F3] hover:text-[#17382B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-[#245C43]" />
                <span>{t.navActivityHistory}</span>
              </div>
              {activities.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#245C43] text-white font-bold">
                  {activities.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar: User & Help */}
        <div className="p-4 border-t border-[#8FAF91]/25 space-y-3">
          {/* Language Switcher */}
          <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-[#FAF8F3] rounded-xl border border-[#8FAF91]/30">
            <span className="text-[#546b5e] font-medium">{t.languageLabel}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                  lang === 'en' ? 'bg-[#245C43] text-white' : 'text-[#476353]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('gu')}
                className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                  lang === 'gu' ? 'bg-[#245C43] text-white' : 'text-[#476353]'
                }`}
              >
                ગુજ
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
                  lang === 'hi' ? 'bg-[#245C43] text-white' : 'text-[#476353]'
                }`}
              >
                हिं
              </button>
            </div>
          </div>

          {/* Profile Card */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#245C43] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {currentUser?.name ? currentUser.name.trim().charAt(0) : 'P'}
              </div>
              <div className="text-left min-w-0">
                <span
                  className="text-xs font-bold text-[#17382B] block leading-tight truncate"
                  title={currentUser?.name || (isGuest ? uiCopy(lang, 'Guest Explorer') : uiCopy(lang, 'Guest'))}
                >
                  {currentUser ? currentUser.name : (isGuest ? uiCopy(lang, 'Guest Explorer') : 'PlantPulse')}
                </span>
                <span className="text-[11px] text-[#546b5e] block truncate">
                  {currentUser
                    ? (currentUser.role === 'farmer' ? `🌾 ${uiCopy(lang, 'Kisan Partner')}` : `🏙️ ${uiCopy(lang, 'Urban Planner')}`)
                    : (isGuest ? uiCopy(lang, 'Guest') : userType === 'farmer' ? uiCopy(lang, 'Kisan Pro') : uiCopy(lang, 'Urban Member'))}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowHelpModal(true)}
                title={t.helpGuideBtn}
                className="p-1.5 text-[#546b5e] hover:text-[#245C43] rounded-lg hover:bg-[#E8F1E7] cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onLogout || onBackToLanding}
                title={t.logoutBtn}
                className="p-1.5 text-[#546b5e] hover:text-[#B23B2B] rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT AREA */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full text-left">
        {/* Top Header: Personalized Greeting & District Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8FAF91]/30 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9A7653] mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#9A7653]" />
              <span>{activeLocationLabel}</span>
              <span className="text-[#8FAF91]">·</span>
              {/* District Dropdown Selector */}
              <select
                value={currentDistrictId}
                onChange={(e) => setCurrentDistrictId(e.target.value)}
                className="bg-[#FAF8F3] border border-[#8FAF91]/40 rounded-lg px-2 py-0.5 text-xs text-[#245C43] font-bold focus:outline-none"
              >
                {GUJARAT_DISTRICTS.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {dist.name[lang] || dist.name.en}
                  </option>
                ))}
              </select>
            </div>
            <h1 className="text-xl font-extrabold text-[#17382B] font-display sm:text-3xl lg:text-4xl">
              <span className="break-words">
                {currentUser
                  ? `${uiCopy(lang, 'Welcome,')} ${currentUser.name}`
                  : userType === 'farmer'
                  ? t.greetingFarmer
                  : t.greetingUrban}
              </span>
              <span aria-hidden="true" className="whitespace-nowrap">{'\u00a0'}👋</span>
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-normal text-[#476353]">
              {userType === 'farmer'
                ? t.extra.dashboardFieldSummary
                    .replace('{place}', farmOrBalconyTitle)
                    .replace('{district}', localizeGujaratLocation(currentDistrictId, lang))
                : t.extra.dashboardGardenSummary.replace('{place}', farmOrBalconyTitle).replace('{crop}', activeCropName)}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 self-start sm:self-auto">
            <button
              onClick={onChangePersona}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C43] bg-white border border-[#8FAF91]/40 px-3.5 py-2 rounded-xl hover:bg-[#E8F1E7] transition-colors shadow-2xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{lang === 'gu' ? 'વિગતો બદલો' : lang === 'hi' ? 'प्रोफ़ाइल बदलें' : uiCopy(lang, 'Change Profile')}</span>
            </button>

            <button
              onClick={() => onOpenScanStudio(activeCropName)}
              className="inline-flex items-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>{t.scanPlantCTA}</span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* VIEW 1: MY PLANTS / CROPS MONITORED LEDGER */}
        {/* ==================================================================== */}
        {activeSidebarNav === 'My Plants' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8FAF91]/25 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#9A7653] mb-1">
                    <Leaf className="w-4 h-4 text-[#245C43]" />
                    <span>{uiCopy(lang, 'Monitored Botanical Ledger')}</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#17382B] font-display">
                    {userType === 'farmer' ? uiCopy(lang, 'Farm Acreage Crops') : uiCopy(lang, 'Urban Balcony & Container Garden')}
                  </h2>
                  <p className="text-xs text-[#546b5e] mt-1">
                    {uiCopy(lang, 'Track the lifecycle, chlorophyll vigor, and disease immunity history of your plants.')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddPlantModal(true)}
                    className="inline-flex items-center gap-1.5 bg-[#245C43] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a4431] transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{uiCopy(lang, 'Add Plant to Monitor')}</span>
                  </button>
                </div>
              </div>

              {/* Plants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                {(monitoredPlants.length > 0 ? monitoredPlants : savedPlants).map((plant) => (
                  <div
                    key={plant.id}
                    className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/35 hover:border-[#245C43]/50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E8F1E7] text-xl flex items-center justify-center">
                          {plant.name.toLowerCase().includes('tomato') ? '🍅' : plant.name.toLowerCase().includes('cotton') ? '🌾' : '🪴'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#17382B]">{localizedText(lang, plant.name)}</h4>
                          <span className="text-[11px] text-[#546b5e] italic block">{localizedText(lang, plant.species || uiCopy(lang, 'Botanical specimen'))}</span>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-black text-[#245C43]">
                        {plant.health_score || plant.healthScore || 88}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#8FAF91]/20">
                      <div>
                        <span className="text-[#546b5e] block">{uiCopy(lang, 'Sunlight')}</span>
                        <strong className="text-[#17382B] capitalize">{plant.sunlight || uiCopy(lang, 'Full Sun')}</strong>
                      </div>
                      <div>
                        <span className="text-[#546b5e] block">{uiCopy(lang, 'Watering')}</span>
                        <strong className="text-[#17382B] capitalize">{plant.watering_frequency || uiCopy(lang, 'Daily')}</strong>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => onOpenScanStudio(plant.name)}
                        className="text-xs font-bold text-[#245C43] hover:underline cursor-pointer"
                      >
                        {uiCopy(lang, 'Run Optical Scan →')}
                      </button>
                      <button
                        onClick={() => onOpenDoctor(`How is my ${plant.name} doing?`)}
                        className="text-xs font-semibold text-[#9A7653] hover:underline cursor-pointer"
                      >
                        {uiCopy(lang, 'Ask Doctor')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* ==================================================================== */}
        {/* VIEW 2: PHASE 3.6 — PLANT CARE TASKS & SMART REMINDERS */}
        {/* ==================================================================== */}
        {activeSidebarNav === 'Plant Care & Reminders' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8FAF91]/25 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#245C43] mb-1">
                    <Bell className="w-4 h-4 text-[#245C43]" />
                    <span>{uiCopy(lang, 'Plant Care Tasks')}</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#17382B] font-display">
                    {uiCopy(lang, 'Plant Care Tasks & Smart Reminders')}
                  </h2>
                  <p className="text-xs text-[#546b5e] mt-1">
                    {uiCopy(lang, 'Real-time irrigation reminders, bio-fertilizer feeding cycles, and diagnostic leaf inspections.')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="inline-flex items-center gap-1.5 bg-[#245C43] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a4431] transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{uiCopy(lang, 'Add Care Reminder')}</span>
                  </button>
                </div>
              </div>

              {/* Task Filter Pills */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    taskFilter === 'all' ? 'bg-[#245C43] text-white' : 'bg-[#FAF8F3] text-[#476353] hover:bg-[#E8F1E7]'
                  }`}
                >
                  {uiCopy(lang, 'All Tasks')} ({tasks.length})
                </button>
                <button
                  onClick={() => setTaskFilter('pending')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    taskFilter === 'pending' ? 'bg-[#245C43] text-white' : 'bg-[#FAF8F3] text-[#476353] hover:bg-[#E8F1E7]'
                  }`}
                >
                  {uiCopy(lang, 'Pending')} ({tasks.filter((t) => !t.completed).length})
                </button>
                <button
                  onClick={() => setTaskFilter('completed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    taskFilter === 'completed' ? 'bg-[#245C43] text-white' : 'bg-[#FAF8F3] text-[#476353] hover:bg-[#E8F1E7]'
                  }`}
                >
                  {uiCopy(lang, 'Completed')} ({tasks.filter((t) => t.completed).length})
                </button>
              </div>

              {/* Task Items List */}
              <div className="space-y-3 pt-4">
                {isLoadingTasks ? (
                  <div className="p-8 text-center text-xs text-[#546b5e]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#245C43] mb-2" />
                    <span>{uiCopy(lang, 'Loading care tasks...')}</span>
                  </div>
                ) : (
                  tasks
                    .filter((t) => {
                      if (taskFilter === 'pending') return !t.completed;
                      if (taskFilter === 'completed') return t.completed;
                      return true;
                    })
                    .map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                          task.completed
                            ? 'bg-[#FAF8F3]/60 border-[#8FAF91]/20 opacity-70'
                            : 'bg-[#FAF8F3] border-[#8FAF91]/35 hover:border-[#245C43]/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleTask(task.id, task.completed)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 transition-colors cursor-pointer ${
                              task.completed
                                ? 'bg-[#245C43] border-[#245C43] text-white'
                                : 'bg-white border-[#8FAF91]/50 hover:border-[#245C43]'
                            }`}
                          >
                            {task.completed && <Check className="w-4 h-4" />}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                task.task_type === 'watering'
                                  ? 'bg-blue-50 text-blue-700'
                                  : task.task_type === 'fertilizing'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {task.task_type}
                              </span>
                              <span className="text-[11px] text-[#9A7653] font-bold">
                                {uiCopy(lang, 'Due')}: {localizedText(lang, task.due_date)}
                              </span>
                            </div>
                            <h4 className={`text-sm font-bold mt-1 ${task.completed ? 'line-through text-[#546b5e]' : 'text-[#17382B]'}`}>
                              {localizedText(lang, task.title)}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-[#546b5e] mt-0.5 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                          task.completed ? 'bg-[#E8F1E7] text-[#245C43]' : 'bg-[#FFF9EB] text-[#7A5416]'
                        }`}>
                          {task.completed ? uiCopy(lang, 'Completed') : uiCopy(lang, 'Action Required')}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* ==================================================================== */}
        {/* VIEW 3: PHASE 3.3 — URBAN FARMING INTELLIGENCE (REAL AI) */}
        {/* ==================================================================== */}
        {activeSidebarNav === 'Urban Farming Intelligence' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8FAF91]/25 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#245C43] mb-1">
                    <Compass className="w-4 h-4 text-[#245C43]" />
                    <span>{uiCopy(lang, 'Urban Farming Intelligence')}</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#17382B] font-display">
                    {uiCopy(lang, 'Urban Farming Intelligence')}
                  </h2>
                  <p className="text-xs text-[#546b5e] mt-1">
                    {uiCopy(lang, 'Maximize vegetable and botanical yield in limited city spaces, balconies, and rooftops.')}
                  </p>
                </div>

                <button
                  onClick={runUrbanIntelligence}
                  disabled={isLoadingUrban}
                  className="inline-flex items-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUrban ? 'animate-spin' : ''}`} />
                  <span>{uiCopy(lang, isLoadingUrban ? 'Calculating with AI...' : 'Recalculate Spatial Plan')}</span>
                </button>
              </div>

              {/* Spatial Config Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 pb-5 border-b border-[#8FAF91]/20">
                <div>
                  <label className="text-[11px] font-bold text-[#546b5e] uppercase block mb-1">
                    {uiCopy(lang, 'Growing Space')}
                  </label>
                  <select
                    value={urbanSpaceType}
                    onChange={(e) => setUrbanSpaceType(e.target.value)}
                    className="w-full bg-[#FAF8F3] border border-[#8FAF91]/35 rounded-xl px-3 py-2 text-xs font-bold text-[#17382B]"
                  >
                    <option value="balcony">{uiCopy(lang, 'Balcony Container Garden')}</option>
                    <option value="terrace">{uiCopy(lang, 'Rooftop / Terrace Garden')}</option>
                    <option value="window_sill">{uiCopy(lang, 'Window Sill Herb Box')}</option>
                    <option value="vertical_wall">{uiCopy(lang, 'Vertical Living Wall')}</option>
                    <option value="hydroponic_tower">{uiCopy(lang, 'Hydroponic NFT / Tower')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#546b5e] uppercase block mb-1">
                    {uiCopy(lang, 'Container Type')}
                  </label>
                  <select
                    value={urbanContainer}
                    onChange={(e) => setUrbanContainer(e.target.value)}
                    className="w-full bg-[#FAF8F3] border border-[#8FAF91]/35 rounded-xl px-3 py-2 text-xs font-bold text-[#17382B]"
                  >
                    <option value="terracotta_pots">{uiCopy(lang, 'Terracotta / Clay Pots (Breathable)')}</option>
                    <option value="fabric_growbags">{uiCopy(lang, 'Fabric Grow Bags (Aeration)')}</option>
                    <option value="self_watering_boxes">{uiCopy(lang, 'Self-Watering Sub-Irrigation Boxes')}</option>
                    <option value="raised_wooden_bed">{uiCopy(lang, 'Raised Wooden Bed')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#546b5e] uppercase block mb-1">
                    {uiCopy(lang, 'Direct Sunlight Hours')} ({urbanSunHours})
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={urbanSunHours}
                    onChange={(e) => setUrbanSunHours(parseInt(e.target.value, 10))}
                    className="w-full mt-2 accent-[#245C43]"
                  />
                </div>
              </div>

              {/* Real AI Urban Intelligence Results */}
              {isLoadingUrban ? (
                <div className="py-16 text-center text-xs text-[#546b5e]">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#245C43] mb-3" />
                  <p className="font-bold text-[#17382B]">{uiCopy(lang, 'Calculating with AI...')}</p>
                  <p className="text-[11px] mt-1">{uiCopy(lang, 'Microclimate & Thermal Radiation')}</p>
                </div>
              ) : urbanIntelligence ? (
                <div className="space-y-5 pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#E8F1E7] border border-[#8FAF91]/40 text-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#245C43] block">
                        {uiCopy(lang, 'Space Suitability Score')}
                      </span>
                      <span className="text-3xl font-black text-[#17382B] font-mono mt-1 block">
                        {urbanIntelligence.spaceSuitabilityScore} / 100
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9A7653] block">
                        {uiCopy(lang, 'Estimated Monthly Harvest')}
                      </span>
                      <span className="text-sm font-bold text-[#17382B] mt-1 block">
                        {urbanIntelligence.estimatedMonthlyYield}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#245C43] block">
                        {uiCopy(lang, 'Water Conservation Mode')}
                      </span>
                      <span className="text-xs text-[#395045] mt-1 block">
                        {urbanIntelligence.waterSavingStrategy}
                      </span>
                    </div>
                  </div>

                  {/* Microclimate and Substrate Formula */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 space-y-1.5">
                      <strong className="text-[#17382B] block text-sm">{uiCopy(lang, 'Microclimate & Thermal Radiation')}</strong>
                      <p className="text-[#476353] leading-relaxed">
                        {urbanIntelligence.microclimateAnalysis}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 space-y-1.5">
                      <strong className="text-[#17382B] block text-sm">{uiCopy(lang, 'Optimal Potting Substrate Formula')}</strong>
                      <p className="text-[#476353] leading-relaxed">
                        {urbanIntelligence.pottingSubstrateFormula}
                      </p>
                    </div>
                  </div>

                  {/* Companion Planting & Vertical Optimization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 space-y-2">
                      <strong className="text-[#17382B] block text-sm">{uiCopy(lang, 'Companion Planting Combinations')}</strong>
                      <ul className="space-y-1 text-[#395045] list-disc pl-4">
                        {urbanIntelligence.companionPlantingAdvice?.map((c: string, i: number) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 space-y-2">
                      <strong className="text-[#17382B] block text-sm">{uiCopy(lang, 'Vertical Space Optimization Tips')}</strong>
                      <ul className="space-y-1 text-[#395045] list-disc pl-4">
                        {urbanIntelligence.verticalOptimizationTips?.map((v: string, i: number) => (
                          <li key={i}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ==================================================================== */}
        {/* VIEW 4: PHASE 3.4 — PERSONALIZED RECOMMENDATIONS (REAL AI) */}
        {/* ==================================================================== */}
        {activeSidebarNav === 'Smart Recommendations' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8FAF91]/25 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#9A7653] mb-1">
                    <Sparkles className="w-4 h-4 text-[#E5A93D]" />
                    <span>{uiCopy(lang, 'Personalized Agronomic AI Engine · Phase 3.4')}</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#17382B] font-display">
                    {uiCopy(lang, 'Personalized Recommendations for')} {activeCropName}
                  </h2>
                  <p className="text-xs text-[#546b5e] mt-1">
                    {t.extra.dashboardFieldSummary.replace('{place}', activeCropName).replace('{district}', activeDistrictName)}
                  </p>
                </div>

                <button
                  onClick={fetchPersonalizedRecs}
                  disabled={isLoadingRecs}
                  className="inline-flex items-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecs ? 'animate-spin' : ''}`} />
                  <span>{uiCopy(lang, isLoadingRecs ? 'Analyzing with Gemini...' : 'Refresh AI Recommendations')}</span>
                </button>
              </div>

              {isLoadingRecs ? (
                <div className="py-16 text-center text-xs text-[#546b5e]">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#245C43] mb-3" />
                  <p className="font-bold text-[#17382B]">{uiCopy(lang, 'Generating Personalized Directives...')}</p>
                </div>
              ) : personalizedRecs ? (
                <div className="space-y-5 pt-5">
                  {/* Primary Directive Banner */}
                  <div className="p-5 rounded-2xl bg-[#E8F1E7] border border-[#8FAF91]/40 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#245C43] block">
                      {uiCopy(lang, 'TODAY’S PRIMARY DIRECTIVE')}
                    </span>
                    <h3 className="text-xl font-black text-[#17382B]">
                      “{personalizedRecs.primaryRecommendation}”
                    </h3>
                  </div>

                  {/* Irrigation & Fertilizer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 space-y-1">
                      <strong className="text-[#17382B] block text-sm">💧 {uiCopy(lang, 'Precision Irrigation Guidance')}</strong>
                      <p className="text-[#476353] leading-relaxed">
                        {personalizedRecs.irrigationGuidance}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 space-y-1">
                      <strong className="text-[#17382B] block text-sm">🧪 {uiCopy(lang, 'Fertilizer & Nutrient Feeding Window')}</strong>
                      <p className="text-[#476353] leading-relaxed">
                        {personalizedRecs.fertilizerTiming}
                      </p>
                    </div>
                  </div>

                  {/* Pest Risk Level & Watchlist */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#17382B] block text-sm">🐛 {uiCopy(lang, 'Ambient Pest & Pathogen Watchlist')}</strong>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        personalizedRecs.pestRiskLevel === 'high' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {uiCopy(lang, 'Risk Level:')} {personalizedRecs.pestRiskLevel}
                      </span>
                    </div>
                    <ul className="space-y-1 text-[#476353] list-disc pl-4">
                      {personalizedRecs.pestWatchlist?.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 48-Hour Checklist */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 text-xs space-y-2">
                    <strong className="text-[#17382B] block text-sm">✅ {uiCopy(lang, '48-Hour Action Checklist')}</strong>
                    <ul className="space-y-1.5 text-[#395045]">
                      {personalizedRecs.actionChecklist?.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#245C43] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ==================================================================== */}
        {/* VIEW 5: PHASE 3.5 — WEATHER + LOCATION INTELLIGENCE */}
        {/* ==================================================================== */}
        {activeSidebarNav === 'Weather & Water' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8FAF91]/25 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#245C43] mb-1">
                    <CloudSun className="w-4 h-4 text-[#245C43]" />
                    <span>{uiCopy(lang, 'Atmospheric & Microclimate Intelligence · Phase 3.5')}</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#17382B] font-display">
                    {activeDistrictName} · {t.extra.districtStationSuffix}
                  </h2>
                  <p className="text-xs text-[#546b5e] mt-1">
                    {uiCopy(lang, 'Synchronized sensors measuring evapotranspiration, humidity saturation, and soil drainage.')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#546b5e]">{uiCopy(lang, 'Change Station:')}</span>
                  <select
                    value={currentDistrictId}
                    onChange={(e) => setCurrentDistrictId(e.target.value)}
                    className="bg-[#FAF8F3] border border-[#8FAF91]/40 rounded-xl px-3 py-1.5 text-xs text-[#245C43] font-bold"
                  >
                    {GUJARAT_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name[lang] || d.name.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weather Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                  <span className="text-[11px] font-bold text-[#546b5e] uppercase block">{uiCopy(lang, 'Ambient Temperature')}</span>
                  <span className="text-2xl font-black text-[#17382B] font-mono mt-0.5 block">{weather.temperature}</span>
                  <span className="text-xs text-[#476353]">{weather.condition[lang]}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                  <span className="text-[11px] font-bold text-[#546b5e] uppercase block">{uiCopy(lang, 'Atmospheric Humidity')}</span>
                  <span className="text-2xl font-black text-[#17382B] font-mono mt-0.5 block">{weather.humidity}%</span>
                  <span className="text-xs text-[#476353]">{uiCopy(lang, 'Wind:')} {weather.windSpeed}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                  <span className="text-[11px] font-bold text-[#546b5e] uppercase block">{uiCopy(lang, 'Rain Probability')}</span>
                  <span className="text-2xl font-black text-[#245C43] font-mono mt-0.5 block">{weather.rainProbability}%</span>
                  <span className="text-xs text-[#476353]">{uiCopy(lang, weather.rainProbability >= 60 ? 'Rain expected' : 'Dry conditions')}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                  <span className="text-[11px] font-bold text-[#546b5e] uppercase block">{uiCopy(lang, 'Soil Moisture Estimate')}</span>
                  <span className="text-2xl font-black text-[#9A7653] font-mono mt-0.5 block">{weather.soilMoistureEst}</span>
                  <span className="text-xs text-[#476353]">{uiCopy(lang, 'Estimated data · not a live sensor reading')}</span>
                </div>
              </div>

              {/* Smart Irrigation Recommendation */}
              <div className="p-5 rounded-2xl bg-[#E8F1E7] border border-[#8FAF91]/40 mt-5 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#245C43] block">
                  {uiCopy(lang, 'SMART IRRIGATION ENGINE')}
                </span>
                <h3 className="text-xl font-black text-[#17382B]">
                  “{weather.smartCareRecommendation.directive[lang]}”
                </h3>
                <p className="text-xs text-[#476353] leading-relaxed">
                  {weather.smartCareRecommendation.reason[lang]}
                </p>
              </div>

              {/* 4-Day Forecast Outlook */}
              <div className="pt-5">
                <h4 className="text-xs font-bold text-[#17382B] uppercase tracking-wider mb-3">
                  {uiCopy(lang, '4-Day Gujarat Meteorological Forecast')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {weather.forecast.map((f, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 text-center">
                      <span className="text-[11px] font-bold text-[#546b5e] block">{uiCopy(lang, f.day as Parameters<typeof uiCopy>[1])}</span>
                      <span className="text-lg font-black text-[#245C43] font-mono my-1 block">{f.temp}</span>
                      <span className="text-xs font-semibold text-[#17382B] block">{uiCopy(lang, f.condition as Parameters<typeof uiCopy>[1])}</span>
                      <span className="text-[10px] text-[#9A7653] font-bold mt-1 block">{f.rainProbability}% {uiCopy(lang, 'Rain')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ==================================================================== */}
        {/* VIEW 6: SOIL INSIGHTS VIEW */}
        {/* ==================================================================== */}
        {activeSidebarNav === 'Soil Insights' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8FAF91]/25 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#9A7653] mb-1">
                    <Layers className="w-4 h-4 text-[#9A7653]" />
                    <span>{uiCopy(lang, 'Soil & Substrate Diagnostics')}</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#17382B] font-display">
                    {uiCopy(lang, 'Substrate Chemistry:')} {currentDistrictId.toUpperCase()}
                  </h2>
                  <p className="text-xs text-[#546b5e] mt-1">
                    {uiCopy(lang, 'Nutrient availability in Black Cotton / Loam soil and urban potting mixes.')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-5">
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5A93D]/30">
                  <span className="text-[11px] font-bold text-[#546b5e] uppercase block">{uiCopy(lang, 'Nitrogen (N)')}</span>
                  <span className="text-xl font-black text-[#E5A93D] font-mono mt-1 block">34 ppm</span>
                  <span className="text-[11px] text-[#7A5416]">{uiCopy(lang, 'Slight Deficit ⚠')}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                  <span className="text-[11px] font-bold text-[#546b5e] uppercase block">{uiCopy(lang, 'Phosphorus (P)')}</span>
                  <span className="text-xl font-black text-[#245C43] font-mono mt-1 block">68 ppm</span>
                  <span className="text-[11px] text-[#245C43]">{uiCopy(lang, 'Optimal')}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                  <span className="text-[11px] font-bold text-[#546b5e] uppercase block">{uiCopy(lang, 'Potassium (K)')}</span>
                  <span className="text-xl font-black text-[#245C43] font-mono mt-1 block">142 ppm</span>
                  <span className="text-[11px] text-[#245C43]">{uiCopy(lang, 'High / Healthy')}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                  <span className="text-[11px] font-bold text-[#546b5e] uppercase block">{uiCopy(lang, 'Substrate pH')}</span>
                  <span className="text-xl font-black text-[#17382B] font-mono mt-1 block">6.8</span>
                  <span className="text-[11px] text-[#245C43]">{uiCopy(lang, 'Neutral')}</span>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/30 text-xs text-[#395045] leading-relaxed">
                <strong className="text-[#17382B] block mb-1">{uiCopy(lang, 'Agronomic Soil Recommendation:')}</strong>
                {uiCopy(lang, 'Top-dress 250g of organic neem cake or well-decomposed vermicompost per square meter. Avoid synthetic nitrogen spikes during cloudy monsoon conditions to reduce soft rot susceptibility.')}
                <p className="mt-2">{uiCopy(lang, 'No soil sensor is connected; measurements shown are illustrative estimates.')}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* ==================================================================== */}
        {/* VIEW 7: PERSISTENT ACTIVITY HISTORY */}
        {/* ==================================================================== */}
        {activeSidebarNav === 'Activity History' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#8FAF91]/25 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#9A7653] mb-1">
                    <History className="w-4 h-4 text-[#245C43]" />
                    <span>{uiCopy(lang, 'Persistent User History · MySQL Database')}</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#17382B] font-display">
                    {uiCopy(lang, 'Diagnostic Activity Ledger')}
                  </h2>
                  <p className="text-xs text-[#546b5e] mt-1">
                    {currentUser
                      ? `Viewing private logs for ${currentUser.name} (${currentUser.role === 'farmer' ? 'Kisan Pro' : 'Urban Planner'}). Each user only sees their own persistent data.`
                      : 'Temporary session activities. Sign in to link your records to your verified MySQL account.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E8F1E7] text-[#245C43] border border-[#8FAF91]/40">
                    <Database className="w-3.5 h-3.5 text-[#245C43]" />
                    <span>{dbStatus?.connected ? uiCopy(lang, 'MySQL Connected (XAMPP)') : uiCopy(lang, 'MySQL (Active)')}</span>
                  </div>
                  <button
                    onClick={fetchHistory}
                    disabled={isLoadingHistory}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C43] bg-white border border-[#8FAF91]/40 px-3.5 py-1.5 rounded-xl hover:bg-[#FAF8F3] transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    <span>{uiCopy(lang, 'Refresh')}</span>
                  </button>
                </div>
              </div>

              {/* Guest Warning if not logged in */}
              {!currentUser && isGuest && (
                <div className="mt-5 p-4 rounded-2xl bg-[#FFF9EB] border border-[#E5A93D]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#7A5416]">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#E5A93D]" />
                    <span>{uiCopy(lang, 'You are browsing as a guest. Plant scans and chats will not be saved permanently to MySQL without an account.')}</span>
                  </div>
                  <button
                    onClick={onShowAuth}
                    className="px-3.5 py-1.5 bg-[#245C43] text-white font-bold rounded-xl whitespace-nowrap hover:bg-[#1a4431] transition-colors cursor-pointer"
                  >
                    {uiCopy(lang, 'Create Account / Sign In')}
                  </button>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
                <button
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    historyFilter === 'all'
                      ? 'bg-[#245C43] text-white shadow-xs'
                      : 'bg-[#FAF8F3] text-[#476353] hover:bg-[#E8F1E7]'
                  }`}
                >
                  {uiCopy(lang, 'All Activities')} ({activities.length})
                </button>
                <button
                  onClick={() => setHistoryFilter('plant_scan')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    historyFilter === 'plant_scan'
                      ? 'bg-[#245C43] text-white shadow-xs'
                      : 'bg-[#FAF8F3] text-[#476353] hover:bg-[#E8F1E7]'
                  }`}
                >
                  <span>🌱 Plant Scans</span>
                  <span className="font-mono text-[10px] opacity-80">
                    ({activities.filter((a) => a.activity_type === 'plant_scan').length})
                  </span>
                </button>
                <button
                  onClick={() => setHistoryFilter('doctor_chat')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    historyFilter === 'doctor_chat'
                      ? 'bg-[#245C43] text-white shadow-xs'
                      : 'bg-[#FAF8F3] text-[#476353] hover:bg-[#E8F1E7]'
                  }`}
                >
                  <span>💬 Doctor Chats</span>
                  <span className="font-mono text-[10px] opacity-80">
                    ({activities.filter((a) => a.activity_type === 'doctor_chat').length})
                  </span>
                </button>
                <button
                  onClick={() => setHistoryFilter('care_reminder')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    historyFilter === 'care_reminder'
                      ? 'bg-[#245C43] text-white shadow-xs'
                      : 'bg-[#FAF8F3] text-[#476353] hover:bg-[#E8F1E7]'
                  }`}
                >
                  <span>🔔 {localizedText(lang, 'Care Tasks')}</span>
                  <span className="font-mono text-[10px] opacity-80">
                    ({activities.filter((a) => a.activity_type === 'care_reminder').length})
                  </span>
                </button>
                <button
                  onClick={() => setHistoryFilter('account_created')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    historyFilter === 'account_created'
                      ? 'bg-[#245C43] text-white shadow-xs'
                      : 'bg-[#FAF8F3] text-[#476353] hover:bg-[#E8F1E7]'
                  }`}
                >
                  <span>🛡️ {localizedText(lang, 'Account Events')}</span>
                  <span className="font-mono text-[10px] opacity-80">
                    ({activities.filter((a) => a.activity_type === 'account_created').length})
                  </span>
                </button>
              </div>

              {/* List of Activities */}
              <div className="space-y-3.5 pt-4">
                {isLoadingHistory ? (
                  <div className="bg-white rounded-3xl border border-[#8FAF91]/30 p-12 text-center text-xs text-[#546b5e]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#245C43] mb-3" />
                    <span>{localizedText(lang, 'Loading persistent records from MySQL...')}</span>
                  </div>
                ) : activities.filter((a) => historyFilter === 'all' || a.activity_type === historyFilter).length === 0 ? (
                  <div className="bg-white rounded-3xl border border-[#8FAF91]/30 p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#E8F1E7] flex items-center justify-center mx-auto text-[#245C43]">
                      <History className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#17382B]">{localizedText(lang, 'No Activity Records Found')}</h4>
                      <p className="text-xs text-[#546b5e] max-w-md mx-auto mt-1">
                        {currentUser
                          ? lang === 'gu'
                            ? `હજુ સુધી ${currentUser.name} માટે કોઈ પ્રવૃત્તિનો ઇતિહાસ નથી. કાયમી નોંધ બનાવવા માટે પ્રથમ છોડ સ્કેન કરો અથવા પ્લાન્ટ ડૉક્ટરની સલાહ લો.`
                            : lang === 'hi'
                              ? `${currentUser.name} के लिए अभी तक कोई गतिविधि इतिहास नहीं है। स्थायी रिकॉर्ड बनाने के लिए पहला पौधा स्कैन करें या प्लांट डॉक्टर से सलाह लें।`
                              : `No activity history recorded yet for ${currentUser.name}. Perform your first plant health scan or consult the AI Plant Doctor to build your persistent medical ledger.`
                          : lang === 'gu'
                            ? 'તમારો કાયમી છોડ-સ્વાસ્થ્ય ઇતિહાસ જોવા અને નોંધવા માટે સાઇન ઇન કરો.'
                            : lang === 'hi'
                              ? 'अपने स्थायी पौधा-स्वास्थ्य इतिहास को दर्ज करने और देखने के लिए साइन इन करें।'
                              : 'Sign in to record and access your permanent plant health history.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => onOpenScanStudio(activeCropName)}
                        className="inline-flex items-center gap-2 bg-[#245C43] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#1a4431] transition-colors cursor-pointer"
                      >
                        <ScanLine className="w-4 h-4" />
                        <span>{localizedText(lang, 'Scan Your Plant')}</span>
                      </button>
                      <button
                        onClick={() => onOpenDoctor()}
                        className="inline-flex items-center gap-2 bg-white border border-[#8FAF91]/40 text-[#245C43] text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#FAF8F3] transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-[#9A7653]" />
                        <span>{localizedText(lang, 'Consult Plant Doctor')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  activities
                    .filter((a) => historyFilter === 'all' || a.activity_type === historyFilter)
                    .map((act) => {
                      const isScan = act.activity_type === 'plant_scan';
                      const isChat = act.activity_type === 'doctor_chat';
                      const isCare = act.activity_type === 'care_reminder';
                      const isAccount = act.activity_type === 'account_created';
                      const content = typeof act.content === 'object' && act.content !== null ? act.content : {};
                      const dateLocale = lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
                      const dateStr = act.created_at
                        ? new Date(act.created_at).toLocaleString(dateLocale, { dateStyle: 'medium', timeStyle: 'short' })
                        : localizedText(lang, 'Recently');

                      return (
                        <div
                          key={act.id}
                          className="bg-white rounded-2xl border border-[#8FAF91]/35 p-5 shadow-xs hover:border-[#245C43]/60 transition-all text-left space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isScan ? 'bg-[#E8F1E7] text-[#245C43]' : isChat ? 'bg-[#FAF8F3] text-[#9A7653] border border-[#8FAF91]/30' : isCare ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {isScan ? <ScanLine className="w-4 h-4" /> : isChat ? <MessageSquare className="w-4 h-4" /> : isCare ? <Bell className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    isScan ? 'bg-[#E8F1E7] text-[#245C43]' : isChat ? 'bg-[#FAF8F3] text-[#9A7653] border border-[#8FAF91]/30' : isCare ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                                  }`}>
                                    {localizedText(lang, isScan ? 'Plant Scan' : isChat ? 'Doctor Consultation' : isCare ? 'Care Reminder' : 'Account Security')}
                                  </span>
                                  <span className="text-[11px] text-[#546b5e] font-mono flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[#8FAF91]" />
                                    <span>{dateStr}</span>
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-[#17382B] mt-1">{localizedText(lang, act.title)}</h4>
                              </div>
                            </div>

                            {isScan && (
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setSelectedReportScan(content);
                                    setScanModalTab('treatment');
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#245C43] bg-[#E8F1E7] hover:bg-[#8FAF91]/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>{localizedText(lang, 'View Report')}</span>
                                </button>
                                <button
                                  onClick={() => onOpenDoctor(undefined, content)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9A7653] hover:underline cursor-pointer"
                                >
                                  <span>{localizedText(lang, 'Consult Doctor')}</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            {isChat && (
                              <button
                                onClick={() => onOpenDoctor(content.query)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#245C43] hover:underline shrink-0 cursor-pointer"
                              >
                                <span>{localizedText(lang, 'Re-ask')}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Scan Details */}
                          {isScan && (
                            <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/25 text-xs space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                {content.confidence !== undefined && (
                                  <span className="font-mono font-bold text-[#245C43] bg-white px-2 py-0.5 rounded-md border border-[#8FAF91]/30">
                                    {content.confidence}% {localizedText(lang, 'Confidence')}
                                  </span>
                                )}
                                {content.severity && (
                                  <span className={`font-semibold capitalize px-2 py-0.5 rounded-md ${
                                    content.severity === 'high' ? 'bg-red-50 text-red-700' : content.severity === 'moderate' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    {localizedText(lang, 'Severity')}: {localizedText(lang, content.severity)}
                                  </span>
                                )}
                                {content.condition && (
                                  <span className="text-[#17382B] font-medium">
                                    Status: <strong>{content.condition}</strong>
                                  </span>
                                )}
                              </div>
                              {content.treatmentSummary && (
                                <p className="text-[11px] text-[#546b5e] leading-relaxed pt-1 border-t border-[#8FAF91]/20">
                                  <strong>{localizedText(lang, 'Treatment protocol:')}</strong> {localizedText(lang, content.treatmentSummary)}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Doctor Consultation Details */}
                          {isChat && (
                            <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/25 text-xs space-y-2">
                              {content.query && (
                                <div className="text-[#17382B]">
                                  <span className="text-[#9A7653] font-bold text-[10px] uppercase block">User Question:</span>
                                  <p className="italic text-[11px] text-[#245C43] mt-0.5">“{content.query}”</p>
                                </div>
                              )}
                              {content.reply && (
                                <div className="pt-1.5 border-t border-[#8FAF91]/20">
                                  <span className="text-[#245C43] font-bold text-[10px] uppercase block">Doctor Recommendation:</span>
                                  <p className="text-[11px] text-[#395045] leading-relaxed mt-0.5 line-clamp-3">
                                    {content.reply}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Care Details */}
                          {isCare && (
                            <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/25 text-xs text-[#546b5e]">
                              Care reminder completed at {dateStr}. Verified in MySQL ledger.
                            </div>
                          )}

                          {/* Account Details */}
                          {isAccount && (
                            <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/25 text-xs text-[#546b5e]">
                              User account initialized with role: <strong className="text-[#17382B] capitalize">{content.role === 'farmer' ? 'Farmer' : 'Urban Planner'}</strong>. Encrypted in MySQL with bcrypt.
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* ==================================================================== */}
        {/* VIEW 8: OVERVIEW (DEFAULT DASHBOARD VIEW) */}
        {/* ==================================================================== */}
        {activeSidebarNav === 'Overview' && (
          <>
            {/* DASHBOARD HERO AREA: “Today at a Glance” Powered by Weather Model */}
            <section className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 sm:p-8 shadow-xs">
              <div className="mb-5 flex flex-col gap-2 border-b border-[#8FAF91]/25 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-extrabold tracking-widest uppercase text-[#9A7653]">
                  {t.todayGlance}
                </span>
                <span className="text-right text-xs font-mono text-[#546b5e]">
                  {uiCopy(lang, 'Station:')} {currentDistrictId.toUpperCase()} · {t.extra.weatherEstimatedData}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Atmospheric Metrics (5 cols) */}
                <div className="lg:col-span-5 grid min-w-0 grid-cols-3 gap-2 sm:gap-3 bg-[#FAF8F3] p-3 sm:p-4 rounded-2xl border border-[#8FAF91]/30">
                  <div className="min-w-0 space-y-1">
                    <span className="block break-words text-[11px] font-bold leading-tight text-[#546b5e] uppercase">
                      {t.weatherLabel}
                    </span>
                    <span className="block whitespace-nowrap text-lg font-black text-[#17382B] font-mono sm:text-xl">
                      {weather.temperature}
                    </span>
                    <span className="block break-words text-[11px] leading-tight text-[#476353]">{weather.condition[lang]}</span>
                  </div>

                  <div className="min-w-0 space-y-1 border-l border-[#8FAF91]/25 pl-2 sm:pl-3">
                    <span className="block break-words text-[11px] font-bold leading-tight text-[#546b5e] uppercase">
                      {t.humidityLabel}
                    </span>
                    <span className="block whitespace-nowrap text-lg font-black text-[#17382B] font-mono sm:text-xl">
                      {weather.humidity}%
                    </span>
                    <span className="block break-words text-[11px] leading-tight text-[#476353]">{uiCopy(lang, 'Wind:')} {weather.windSpeed}</span>
                  </div>

                  <div className="min-w-0 space-y-1 border-l border-[#8FAF91]/25 pl-2 sm:pl-3">
                    <span className="block break-words text-[11px] font-bold leading-tight text-[#546b5e] uppercase">
                      {t.rainProbLabel}
                    </span>
                    <span className="block whitespace-nowrap text-lg font-black text-[#245C43] font-mono sm:text-xl">
                      {weather.rainProbability}%
                    </span>
                    <span className={`block break-words text-[11px] font-bold leading-tight ${weather.rainProbability >= 60 ? 'text-[#E5A93D]' : 'text-[#245C43]'}`}>
                      {uiCopy(lang, weather.rainProbability >= 60 ? 'Rain expected' : 'Dry conditions')}
                    </span>
                  </div>
                </div>

                {/* SMART CARE RECOMMENDATION BANNER (7 cols) */}
                <div className="lg:col-span-7 bg-[#E8F1E7]/70 p-5 rounded-2xl border border-[#8FAF91]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#245C43] animate-pulse" />
                      <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#245C43]">
                        {t.smartCareTitle}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-[#17382B]">
                      “{weather.smartCareRecommendation.directive[lang]}”
                    </h3>
                    <p className="text-xs text-[#395045] leading-relaxed">
                      {weather.smartCareRecommendation.reason[lang]}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveSidebarNav('Weather & Water')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#245C43] hover:bg-[#1a4431] px-4 py-2.5 rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>{t.viewRecommendation}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* PRIMARY TWO-COLUMN CORE: SIGNATURE HEALTH PULSE + AI PLANT DOCTOR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT 7 COLS: SIGNATURE PLANT HEALTH PULSE CARD */}
              <section className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 sm:p-8 shadow-xs relative overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#8FAF91]/25 pb-4 mb-6">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-widest text-[#9A7653]">
                        {userType === 'farmer' ? t.myFarmCrops : t.myBalconyPots}
                      </div>
                      <h3 className="text-2xl font-black text-[#17382B] font-display mt-0.5">
                        {activeCropName}
                      </h3>
                      <span className="text-xs text-[#546b5e] font-medium">
                        {farmOrBalconyTitle} · {activeLocationLabel}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 bg-[#E8F1E7] text-[#245C43] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#8FAF91]/35">
                      <span className="w-2 h-2 rounded-full bg-[#245C43]" />
                      <span>{t.healthy}</span>
                    </div>
                  </div>

                  {/* Circular Vitality Gauge with Heartbeat Pulse */}
                  <div className="bg-[#FAF8F3] p-6 rounded-2xl border border-[#8FAF91]/30 flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#8FAF91"
                          strokeWidth="10"
                          strokeOpacity="0.25"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#245C43"
                          strokeWidth="10"
                          strokeDasharray={2 * Math.PI * 50}
                          strokeDashoffset={2 * Math.PI * 50 * (1 - 0.87)}
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-[#17382B] font-mono leading-none">
                          87
                        </span>
                        <span className="text-[10px] font-bold text-[#546b5e] uppercase tracking-wider mt-0.5">
                          / 100
                        </span>
                      </div>
                    </div>

                    {/* Score Description */}
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="text-xs font-black uppercase tracking-widest text-[#245C43]">
                        {t.healthPulseLabel}
                      </div>
                      <h4 className="text-base font-extrabold text-[#17382B]">
                        {localizedText(lang, 'Optimal Cellular Turgor & Foliage Respiration')}
                      </h4>
                      <p className="text-xs text-[#476353] leading-relaxed">
                        {localizedText(lang, 'Leaf chlorophyll index reads 94.2%. Pathogen probability is quiet. The plant is currently accumulating sugars for healthy yield.')}
                      </p>
                    </div>
                  </div>

                  {/* Status Breakdown Matrix: Water, Weather, Disease, Soil */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="p-3.5 rounded-xl bg-[#E8F1E7]/70 border border-[#8FAF91]/35">
                      <div className="flex items-center justify-between text-xs font-bold text-[#245C43] mb-1">
                        <span>{t.waterLabel}</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-black text-[#245C43]">{t.optimal}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#E8F1E7]/70 border border-[#8FAF91]/35">
                      <div className="flex items-center justify-between text-xs font-bold text-[#245C43] mb-1">
                        <span>{t.weatherLabel}</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-black text-[#245C43]">{t.favorable}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#E8F1E7]/70 border border-[#8FAF91]/35">
                      <div className="flex items-center justify-between text-xs font-bold text-[#245C43] mb-1">
                        <span>{t.diseaseLabel}</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-black text-[#245C43]">{t.clear}</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#E5A93D]/15 border border-[#E5A93D]/40">
                      <div className="flex items-center justify-between text-xs font-bold text-[#9A7653] mb-1">
                        <span>{t.soilLabel}</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-[#E5A93D]" />
                      </div>
                      <div className="text-xs font-black text-[#E5A93D]">{t.soilAttention} ⚠</div>
                    </div>
                  </div>

                  {/* Bottom Card Actions */}
                  <div className="pt-4 border-t border-[#8FAF91]/25 flex items-center justify-between">
                    <span className="text-xs text-[#546b5e]">
                      {localizedText(lang, 'Specimen ID')}: PL-{activeCropId.substring(0, 2).toUpperCase()}-940 · {currentDistrictId.toUpperCase()}
                    </span>
                    <button
                      onClick={() => onOpenScanStudio(activeCropName)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C43] hover:text-[#17382B] cursor-pointer group"
                    >
                      <span>{t.scanPlantCTA}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* PHASE 3.6: TODAY'S QUICK CARE TASKS WIDGET */}
                <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#245C43]" />
                      <span className="text-xs font-extrabold uppercase tracking-widest text-[#9A7653]">
                        {localizedText(lang, "Today's Care Reminders & Tasks")}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveSidebarNav('Plant Care & Reminders')}
                      className="text-xs font-bold text-[#245C43] hover:underline cursor-pointer"
                    >
                      {localizedText(lang, 'View All →').replace(' →', '')} ({tasks.length}) →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                          task.completed ? 'bg-[#FAF8F3]/60 border-[#8FAF91]/20 line-through text-[#546b5e]' : 'bg-[#FAF8F3] border-[#8FAF91]/30 text-[#17382B]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleToggleTask(task.id, task.completed)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border cursor-pointer ${
                              task.completed ? 'bg-[#245C43] text-white border-[#245C43]' : 'bg-white border-[#8FAF91]/50'
                            }`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <span className="text-xs font-bold">{localizedText(lang, task.title)}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#546b5e] uppercase">
                          {localizedText(lang, task.due_date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SCAN PLANT CTA CARD */}
                <div className="bg-gradient-to-r from-[#1C402E] to-[#245C43] rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="space-y-1 max-w-md">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E5A93D] block">
                      {localizedText(lang, 'OPTICAL DIAGNOSTIC SCAN')}
                    </span>
                    <h3 className="text-xl font-bold font-display">
                      {t.scanTitle}
                    </h3>
                    <p className="text-xs text-[#E8F1E7]/80 leading-relaxed">
                      {t.scanSub}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenScanStudio(activeCropName)}
                    className="inline-flex items-center gap-2 bg-[#E5A93D] hover:bg-[#d6992d] text-[#17382B] text-xs sm:text-sm font-extrabold px-5 py-3 rounded-xl shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.scanPlantCTA} →</span>
                  </button>
                </div>
              </section>

              {/* RIGHT 5 COLS: AI PLANT DOCTOR CARD & SAVED PLANTS LEDGER */}
              <section className="lg:col-span-5 space-y-6">
                {/* AI PLANT DOCTOR CARD */}
                <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#245C43] text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-5 h-5 text-[#E5A93D]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#17382B] font-display">
                        {t.appName}
                      </h3>
                      <div className="text-xs font-bold text-[#9A7653] uppercase tracking-wide">
                        {t.plantDoctorTitle.split('—')[1] || 'Your Plant Doctor'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#E8F1E7]/60 border border-[#8FAF91]/35 mb-5">
                    <p className="text-xs sm:text-sm font-semibold text-[#17382B] leading-relaxed">
                      “{t.plantDoctorSubtitle}”
                    </p>
                    <span className="text-[11px] text-[#546b5e] mt-1 block">
                      {lang === 'gu'
                        ? 'ગુજરાતી, હિન્દી અથવા અંગ્રેજીમાં અનુકૂલનશીલ નિદાન સંવાદ.'
                        : lang === 'hi'
                          ? 'गुजराती, हिंदी या अंग्रेज़ी में अनुकूलित निदान संवाद।'
                          : localizedText(lang, 'Adaptive decision tree diagnostics in Gujarati, Hindi or English.')}
                    </span>
                  </div>

                  {/* 4 Action Buttons */}
                  <div className="space-y-2 mb-4">
                    <button
                      onClick={() => onOpenDoctor(t.actionCheckHealth)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3] hover:bg-[#E8F1E7] border border-[#8FAF91]/30 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Leaf className="w-4 h-4 text-[#245C43]" />
                        <span className="text-xs font-bold text-[#17382B]">{t.actionCheckHealth}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#8FAF91] group-hover:text-[#245C43]" />
                    </button>

                    <button
                      onClick={() => onOpenDoctor(t.actionWatering)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3] hover:bg-[#E8F1E7] border border-[#8FAF91]/30 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Droplets className="w-4 h-4 text-[#245C43]" />
                        <span className="text-xs font-bold text-[#17382B]">{t.actionWatering}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#8FAF91] group-hover:text-[#245C43]" />
                    </button>

                    <button
                      onClick={() => onOpenDoctor(t.actionDisease)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF8F3] hover:bg-[#E8F1E7] border border-[#8FAF91]/30 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-[#E5A93D]" />
                        <span className="text-xs font-bold text-[#17382B]">{t.actionDisease}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#8FAF91] group-hover:text-[#245C43]" />
                    </button>

                    <button
                      onClick={() => onOpenDoctor('Speak')}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-[#245C43] hover:bg-[#1a4431] text-white border border-[#245C43] transition-colors text-left group shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Mic className="w-4 h-4 text-[#E5A93D] animate-pulse" />
                        <div>
                          <span className="text-xs font-bold block">{t.actionSpeak}</span>
                          <span className="text-[10px] text-[#E8F1E7]/80 block">{localizedText(lang, 'Vernacular Voice AI')}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#E8F1E7]" />
                    </button>
                  </div>

                  {/* Conversational Prompt Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (quickQueryText.trim()) {
                        onOpenDoctor(quickQueryText);
                        setQuickQueryText('');
                      }
                    }}
                    className="relative mt-2"
                  >
                    <input
                      type="text"
                      value={quickQueryText}
                      onChange={(e) => setQuickQueryText(e.target.value)}
                      placeholder={t.askAnythingPlaceholder}
                      className="w-full pl-3.5 pr-9 py-2.5 text-xs rounded-xl border border-[#8FAF91]/40 bg-[#FAF8F3] text-[#17382B] focus:outline-none focus:ring-2 focus:ring-[#245C43]"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-2 p-1 text-[#245C43] hover:text-[#17382B] cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* MY PLANTS / MY CROPS SAVED LEDGER */}
                <div className="bg-white rounded-3xl border border-[#8FAF91]/40 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#9A7653]">
                      {userType === 'farmer' ? t.myFarmCrops : t.myBalconyPots}
                    </span>
                    <button
                      onClick={() => setActiveSidebarNav('My Plants')}
                      className="text-xs font-bold text-[#245C43] hover:underline cursor-pointer"
                    >
                      {localizedText(lang, 'View All →')}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(monitoredPlants.length > 0 ? monitoredPlants.slice(0, 3) : savedPlants.slice(0, 3)).map((plant) => (
                      <div
                        key={plant.id}
                        onClick={() => onOpenScanStudio(plant.cropType || plant.name)}
                        className="p-3 rounded-xl bg-[#FAF8F3] hover:bg-[#E8F1E7]/60 border border-[#8FAF91]/30 flex items-center justify-between text-xs cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#E8F1E7] flex items-center justify-center text-base">
                            {(plant.name || '').toLowerCase().includes('tomato') ? '🍅' : (plant.name || '').toLowerCase().includes('cotton') ? '🌾' : '🪴'}
                          </div>
                          <div>
                            <span className="font-bold text-[#17382B] block">{localizedText(lang, plant.name)}</span>
                            <span className="text-[11px] text-[#546b5e]">{localizedText(lang, plant.species || plant.location || 'Monitored')}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-[#245C43] block">
                            {plant.health_score || plant.healthScore || 87} / 100
                          </span>
                          <span className="text-[10px] font-bold text-[#245C43]">
                            {localizedText(lang, plant.health_status || plant.status || 'Healthy')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      {/* Modal: Add Plant */}
      {showAddPlantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#8FAF91]/40 shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#8FAF91]/25 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#245C43]">
                Add Plant to Monitored Ledger
              </span>
              <button onClick={() => setShowAddPlantModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlant} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#17382B] block mb-1">Plant / Crop Name</label>
                <input
                  type="text"
                  required
                  value={newPlantName}
                  onChange={(e) => setNewPlantName(e.target.value)}
                  placeholder={uiCopy(lang, 'e.g. Cherry Tomato / Fenugreek')}
                  className="w-full px-3 py-2 rounded-xl border border-[#8FAF91]/40 bg-[#FAF8F3]"
                />
              </div>

              <div>
                <label className="font-bold text-[#17382B] block mb-1">Botanical Species (Optional)</label>
                <input
                  type="text"
                  value={newPlantSpecies}
                  onChange={(e) => setNewPlantSpecies(e.target.value)}
                  placeholder={uiCopy(lang, 'e.g. Solanum lycopersicum')}
                  className="w-full px-3 py-2 rounded-xl border border-[#8FAF91]/40 bg-[#FAF8F3]"
                />
              </div>

              <div>
                <label className="font-bold text-[#17382B] block mb-1">Growing Location</label>
                <select
                  value={newPlantLocation}
                  onChange={(e) => setNewPlantLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#8FAF91]/40 bg-[#FAF8F3] font-bold text-[#17382B]"
                >
                  <option value="balcony">Balcony Container</option>
                  <option value="terrace">Rooftop Terrace</option>
                  <option value="field">Field Plot</option>
                  <option value="indoor">Indoor Shelf</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#245C43] text-white font-bold rounded-xl mt-3 cursor-pointer hover:bg-[#1a4431]"
              >
                Save Plant
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#8FAF91]/40 shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#8FAF91]/25 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#245C43]">
                Create Plant Care Reminder
              </span>
              <button onClick={() => setShowAddTaskModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#17382B] block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder={uiCopy(lang, 'e.g. Water Tomato root zone')}
                  className="w-full px-3 py-2 rounded-xl border border-[#8FAF91]/40 bg-[#FAF8F3]"
                />
              </div>

              <div>
                <label className="font-bold text-[#17382B] block mb-1">{uiCopy(lang, 'Task Category')}</label>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#8FAF91]/40 bg-[#FAF8F3] font-bold text-[#17382B]"
                >
                  <option value="watering">💧 {localizedText(lang, 'Watering & Irrigation')}</option>
                  <option value="fertilizing">🧪 {localizedText(lang, 'Fertilizer & Nutrient Feeding')}</option>
                  <option value="inspection">🔍 {localizedText(lang, 'Pest & Foliage Inspection')}</option>
                  <option value="pruning">✂️ {localizedText(lang, 'Pruning & Staking')}</option>
                  <option value="harvesting">🧺 {localizedText(lang, 'Harvesting')}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#17382B] block mb-1">{uiCopy(lang, 'Due date')}</label>
                <select
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#8FAF91]/40 bg-[#FAF8F3] font-bold text-[#17382B]"
                >
                  <option value="Today">{uiCopy(lang, 'Today')}</option>
                  <option value="Tomorrow">{uiCopy(lang, 'Tomorrow')}</option>
                  <option value="In 2 Days">{uiCopy(lang, 'In 2 Days')}</option>
                  <option value="This Weekend">{uiCopy(lang, 'This Weekend')}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#245C43] text-white font-bold rounded-xl mt-3 cursor-pointer hover:bg-[#1a4431]"
              >
                {uiCopy(lang, 'Create reminder')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full AI Scan Pathology Report from History */}
      {selectedReportScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#8FAF91]/40 shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#8FAF91]/25 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#9A7653] mb-1">
                  <FileText className="w-4 h-4 text-[#245C43]" />
                  <span>{localizedText(lang, 'Optical AI Diagnostic Report')}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F1E7] text-[#245C43]">
                    {localizedText(lang, 'Archived Scan')}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[#17382B] font-display">
                  {localizedText(lang, selectedReportScan.plantName || 'Plant Specimen')}
                  {selectedReportScan.scientificName && selectedReportScan.scientificName !== 'Unknown' && (
                    <span className="text-sm font-normal italic text-[#546b5e] ml-2">
                      ({selectedReportScan.scientificName})
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReportScan(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Condition & Severity Banner */}
            <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A7653] block">
                  {localizedText(lang, 'Diagnosed Condition')}
                </span>
                <span className="text-xl font-black text-[#17382B]">
                  {selectedReportScan.condition || 'Health Check'}
                </span>
                {selectedReportScan.plantType && selectedReportScan.plantType !== 'None' && (
                  <span className="text-xs text-[#546b5e] block mt-0.5">
                    Category: {selectedReportScan.plantType}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {selectedReportScan.confidence !== undefined && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#546b5e] uppercase block">Confidence</span>
                    <span className="text-2xl font-black text-[#245C43] font-mono">
                      {selectedReportScan.confidence}%
                    </span>
                  </div>
                )}
                {selectedReportScan.severity && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                    selectedReportScan.severity === 'high'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : selectedReportScan.severity === 'moderate'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {localizedText(lang, selectedReportScan.severity)} · {localizedText(lang, 'Severity')}
                  </span>
                )}
              </div>
            </div>

            {/* Observed Symptoms */}
            {Array.isArray(selectedReportScan.symptoms) && selectedReportScan.symptoms.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#17382B] block mb-2">
                  Observed Symptoms
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedReportScan.symptoms.map((symptom: string, i: number) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/25 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#E5A93D] shrink-0" />
                      <span className="text-[#17382B]">{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Multi-Tab Detailed Guidance */}
            <div className="space-y-3">
              <div className="flex items-center gap-1 bg-[#FAF8F3] p-1 rounded-xl border border-[#8FAF91]/30 text-xs font-semibold">
                <button
                  onClick={() => setScanModalTab('treatment')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                    scanModalTab === 'treatment' ? 'bg-[#245C43] text-white' : 'text-[#476353] hover:text-[#17382B]'
                  }`}
                >
                  {localizedText(lang, 'Treatment')}
                </button>
                <button
                  onClick={() => setScanModalTab('prevention')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                    scanModalTab === 'prevention' ? 'bg-[#245C43] text-white' : 'text-[#476353] hover:text-[#17382B]'
                  }`}
                >
                  Prevention
                </button>
                <button
                  onClick={() => setScanModalTab('monitoring')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                    scanModalTab === 'monitoring' ? 'bg-[#245C43] text-white' : 'text-[#476353] hover:text-[#17382B]'
                  }`}
                >
                  Monitoring
                </button>
                <button
                  onClick={() => setScanModalTab('soil')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                    scanModalTab === 'soil' ? 'bg-[#245C43] text-white' : 'text-[#476353] hover:text-[#17382B]'
                  }`}
                >
                  Soil & Care
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#8FAF91]/25 text-xs text-[#17382B] space-y-2">
                {scanModalTab === 'treatment' && (
                  <div>
                    <strong className="block mb-1.5 text-sm">Practical Cultural Protocol</strong>
                    {Array.isArray(selectedReportScan.treatment) && selectedReportScan.treatment.length > 0 ? (
                      <ol className="space-y-1.5 list-decimal pl-4">
                        {selectedReportScan.treatment.map((t: string, i: number) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>{selectedReportScan.treatmentSummary || 'Standard safe organic management advised.'}</p>
                    )}
                  </div>
                )}

                {scanModalTab === 'prevention' && (
                  <div>
                    <strong className="block mb-1.5 text-sm">Long-term Prevention</strong>
                    {Array.isArray(selectedReportScan.prevention) && selectedReportScan.prevention.length > 0 ? (
                      <ul className="space-y-1.5 list-disc pl-4">
                        {selectedReportScan.prevention.map((p: string, i: number) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Maintain proper plant spacing, drip root-irrigation, and sanitize pruning shears.</p>
                    )}
                  </div>
                )}

                {scanModalTab === 'monitoring' && (
                  <div>
                    <strong className="block mb-1.5 text-sm">48–72 Hour Inspection Checkpoints</strong>
                    {Array.isArray(selectedReportScan.monitoringPlan) && selectedReportScan.monitoringPlan.length > 0 ? (
                      <ul className="space-y-1.5 list-disc pl-4">
                        {selectedReportScan.monitoringPlan.map((m: string, i: number) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Check foliage morning and late afternoon for lesion spread or new chlorotic margins.</p>
                    )}
                  </div>
                )}

                {scanModalTab === 'soil' && (
                  <div className="space-y-2">
                    {selectedReportScan.soilRecommendation && (
                      <div>
                        <strong>Substrate & Soil:</strong> {selectedReportScan.soilRecommendation}
                      </div>
                    )}
                    {selectedReportScan.fertilizerRecommendation && (
                      <div>
                        <strong>Fertilizer Advice:</strong> {selectedReportScan.fertilizerRecommendation}
                      </div>
                    )}
                    {selectedReportScan.wateringAdvice && (
                      <div>
                        <strong>Watering Guidance:</strong> {selectedReportScan.wateringAdvice}
                      </div>
                    )}
                    {selectedReportScan.sunlightRequirement && (
                      <div>
                        <strong>Sunlight Requirement:</strong> {selectedReportScan.sunlightRequirement}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#8FAF91]/20">
              <button
                onClick={() => {
                  onOpenDoctor(undefined, selectedReportScan);
                  setSelectedReportScan(null);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#245C43] hover:bg-[#1a4431] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E5A93D]" />
                <span>{uiCopy(lang, 'Consult Plant Doctor with this Scan')}</span>
              </button>

              <button
                onClick={() => setSelectedReportScan(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-[#8FAF91]/40 text-[#17382B] text-xs font-bold rounded-xl hover:bg-[#FAF8F3] transition-colors cursor-pointer"
              >
                {localizedText(lang, 'Return to Dashboard')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#8FAF91]/40 shadow-xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#8FAF91]/25 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#245C43]">
                PlantPulse AI Guide
              </span>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h4 className="text-lg font-bold text-[#17382B]">
              How to navigate your plant health workflow
            </h4>

            <div className="space-y-3 text-xs text-[#395045]">
              <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                <strong className="text-[#17382B] block mb-0.5">1. Scan Your Plant</strong>
                Upload any leaf or shoot photo. The AI analyzes chlorophyll and blight lesions.
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                <strong className="text-[#17382B] block mb-0.5">2. Save to My Plants</strong>
                Add analyzed specimens to your ongoing ledger to monitor recovery over time.
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#8FAF91]/30">
                <strong className="text-[#17382B] block mb-0.5">3. Consult Plant Doctor</strong>
                {localizedText(lang, 'Ask questions in Gujarati, Hindi or English using voice or text.')}
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 bg-[#245C43] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
