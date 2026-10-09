/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage.tsx';
import { UserTypeSelection, UserType } from './components/UserTypeSelection.tsx';
import { FarmerOnboarding, FarmerOnboardingData } from './components/FarmerOnboarding.tsx';
import { UrbanOnboarding, UrbanOnboardingData } from './components/UrbanOnboarding.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { ScanStudio, SavedPlantItem } from './components/ScanStudio.tsx';
import { PlantDoctorView } from './components/PlantDoctorView.tsx';
import { AuthModal, AuthUser } from './components/AuthModal.tsx';
import { Language } from './data/translations.ts';

export type ActiveScreen =
  | 'landing'
  | 'select-persona'
  | 'farmer-onboarding'
  | 'urban-onboarding'
  | 'dashboard'
  | 'scan-studio'
  | 'plant-doctor';

export default function App() {
  const [screen, setScreen] = useState<ActiveScreen>('landing');
  const [userType, setUserType] = useState<UserType>('farmer');
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('plantpulse_lang');
      if (saved === 'gu' || saved === 'hi' || saved === 'en') {
        return saved as Language;
      }
    } catch {}
    return 'en';
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('plantpulse_lang', newLang);
    } catch {}
  };
  const [isGuest, setIsGuest] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [doctorInitialQuery, setDoctorInitialQuery] = useState<string | undefined>(undefined);
  const [latestScanContext, setLatestScanContext] = useState<any | null>(null);

  // Onboarded state persistence
  const [farmerData, setFarmerData] = useState<FarmerOnboardingData>({
    state: 'Gujarat',
    districtId: 'rajkot',
    districtName: 'Rajkot',
    village: 'Gondal Rural',
    farmName: 'Plot 4B (Kisan Pro)',
    cropId: 'tomato',
    cropName: 'Tomato',
  });

  const [urbanData, setUrbanData] = useState<UrbanOnboardingData>({
    state: 'Gujarat',
    districtId: 'rajkot',
    districtName: 'Rajkot',
    cityArea: 'Rajkot City (Balcony)',
    growingLocationId: 'balcony',
    growingLocationName: 'Balcony',
    plantId: 'tomato',
    plantName: 'Tomato',
  });

  // Saved Plants Ledger state (Connected with ScanStudio)
  const [savedPlants, setSavedPlants] = useState<SavedPlantItem[]>([
    {
      id: 'sp-1',
      name: 'Tomato (Main Plot)',
      cropType: 'Tomato',
      location: 'Rajkot',
      healthScore: 87,
      issue: 'Clear · High Vitality',
      status: 'Healthy',
      date: 'Today',
    },
    {
      id: 'sp-2',
      name: 'Cotton Block A',
      cropType: 'Cotton',
      location: 'Rajkot',
      healthScore: 91,
      issue: 'No Pests Detected',
      status: 'Healthy',
      date: 'Yesterday',
    },
    {
      id: 'sp-3',
      name: 'Chilli Plot 2',
      cropType: 'Chilli',
      location: 'Rajkot',
      healthScore: 78,
      issue: 'Leaf Curl Warning',
      status: 'Moderate',
      date: '4 Oct',
    },
  ]);

  // Auto-authenticate stored MySQL session token on startup
  useEffect(() => {
    const token = localStorage.getItem('plantpulse_auth_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setAuthToken(token);
            // Apply stored role
            if (data.user.role === 'farmer') {
              setUserType('farmer');
            } else {
              setUserType('urban');
            }
          } else {
            localStorage.removeItem('plantpulse_auth_token');
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user?: AuthUser | null, token?: string | null, asGuest = false) => {
    setIsAuthOpen(false);

    if (asGuest) {
      setIsGuest(true);
      setCurrentUser(null);
      setAuthToken(null);
      if (userType === 'farmer') {
        setScreen('farmer-onboarding');
      } else {
        setScreen('urban-onboarding');
      }
      return;
    }

    if (user && token) {
      setCurrentUser(user);
      setAuthToken(token);
      setIsGuest(false);
      localStorage.setItem('plantpulse_auth_token', token);

      // ROLE-BASED FLOW:
      // The authenticated role from MySQL strictly determines which dashboard the user sees.
      // If role = farmer -> Open Farmer Dashboard
      // If role = urban_planner -> Open Urban Planner Dashboard
      if (user.role === 'farmer') {
        setUserType('farmer');
        setScreen('dashboard');
      } else {
        setUserType('urban');
        setScreen('dashboard');
      }
    }
  };

  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
    } catch (err) {}
    localStorage.removeItem('plantpulse_auth_token');
    setCurrentUser(null);
    setAuthToken(null);
    setIsGuest(false);
    setScreen('landing');
  };

  const handlePersonaSelected = () => {
    // Open auth modal before entering onboarding to establish user credentials or guest session
    setIsAuthOpen(true);
  };

  const handleOpenDoctor = (query?: string, scanContext?: any) => {
    setDoctorInitialQuery(query);
    if (scanContext !== undefined) {
      setLatestScanContext(scanContext);
    }
    setScreen('plant-doctor');
  };

  const handleSavePlantToLedger = (newPlant: SavedPlantItem) => {
    setSavedPlants((prev) => [newPlant, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#17382B] font-sans antialiased selection:bg-[#E8F1E7] selection:text-[#245C43]">
      {/* 1. LANDING PAGE */}
      {screen === 'landing' && (
        <LandingPage
          onGetStarted={() => setScreen('select-persona')}
          onSignIn={() => handleOpenAuth('signin')}
          onExploreGuest={() => {
            setIsGuest(true);
            setScreen('select-persona');
          }}
          onSelectPersona={(persona) => {
            setUserType(persona);
            setScreen('select-persona');
          }}
          lang={lang}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* 2. HOW DO YOU GROW? (USER TYPE SELECTION) */}
      {screen === 'select-persona' && (
        <UserTypeSelection
          selectedType={userType}
          onSelectType={setUserType}
          onContinue={handlePersonaSelected}
          onBack={() => setScreen('landing')}
          onSignIn={() => handleOpenAuth('signin')}
          onContinueGuest={() => {
            setIsGuest(true);
            if (userType === 'farmer') {
              setScreen('farmer-onboarding');
            } else {
              setScreen('urban-onboarding');
            }
          }}
          lang={lang}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* 3A. FARMER ONBOARDING */}
      {screen === 'farmer-onboarding' && (
        <FarmerOnboarding
          initialData={farmerData}
          onComplete={(data) => {
            setFarmerData(data);
            setScreen('dashboard');
          }}
          onBack={() => setScreen('select-persona')}
          lang={lang}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* 3B. URBAN GARDENER ONBOARDING */}
      {screen === 'urban-onboarding' && (
        <UrbanOnboarding
          initialData={urbanData}
          onComplete={(data) => {
            setUrbanData(data);
            setScreen('dashboard');
          }}
          onBack={() => setScreen('select-persona')}
          lang={lang}
          onLanguageChange={handleLanguageChange}
        />
      )}

      {/* 4. PRODUCTION-GRADE DASHBOARD SHELL */}
      {screen === 'dashboard' && (
        <Dashboard
          userType={userType}
          setUserType={setUserType}
          lang={lang}
          onLanguageChange={handleLanguageChange}
          farmerData={farmerData}
          urbanData={urbanData}
          savedPlants={savedPlants}
          onOpenScanStudio={(crop) => {
            if (crop) {
              if (userType === 'farmer') {
                setFarmerData((prev) => ({ ...prev, cropName: crop }));
              } else {
                setUrbanData((prev) => ({ ...prev, plantName: crop }));
              }
            }
            setScreen('scan-studio');
          }}
          onOpenDoctor={handleOpenDoctor}
          onBackToLanding={() => setScreen('landing')}
          onChangePersona={() => {
            if (userType === 'farmer') {
              setScreen('farmer-onboarding');
            } else {
              setScreen('urban-onboarding');
            }
          }}
          isGuest={isGuest}
          onShowAuth={() => handleOpenAuth('signup')}
          currentUser={currentUser}
          authToken={authToken}
          onLogout={handleLogout}
        />
      )}

      {/* 5. DEDICATED OPTICAL SCAN STUDIO */}
      {screen === 'scan-studio' && (
        <div className="min-h-screen bg-[#F7F5EF] py-8">
          <ScanStudio
            userType={userType}
            lang={lang}
            onLanguageChange={handleLanguageChange}
            defaultCrop={userType === 'farmer' ? farmerData.cropName : urbanData.plantName}
            defaultDistrict={userType === 'farmer' ? farmerData.districtName : urbanData.districtName}
            isGuest={isGuest}
            onOpenDoctor={handleOpenDoctor}
            onClose={() => setScreen('dashboard')}
            onSavePlant={handleSavePlantToLedger}
            onShowAuth={() => handleOpenAuth('signup')}
            authToken={authToken}
          />
        </div>
      )}

      {/* 6. INTERACTIVE PLANT DOCTOR CONSULTATION STUDIO */}
      {screen === 'plant-doctor' && (
        <div className="min-h-screen bg-[#F7F5EF] py-8">
          <PlantDoctorView
            userType={userType}
            lang={lang}
            onLanguageChange={handleLanguageChange}
            cropName={userType === 'farmer' ? farmerData.cropName : urbanData.plantName}
            locationName={userType === 'farmer' ? farmerData.districtName : urbanData.districtName}
            initialQuery={doctorInitialQuery}
            latestScanContext={latestScanContext}
            onClearScanContext={() => setLatestScanContext(null)}
            onClose={() => setScreen('dashboard')}
            authToken={authToken}
          />
        </div>
      )}

      {/* GLOBAL SPLIT-SCREEN AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
        initialRole={userType === 'farmer' ? 'farmer' : 'urban_planner'}
        lang={lang}
        onLanguageChange={handleLanguageChange}
      />
    </div>
  );
}
