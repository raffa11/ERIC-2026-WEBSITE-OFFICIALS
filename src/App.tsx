/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider } from './components/LanguageContext';
import { AlertProvider, useAlert } from './components/AlertModal';
import Navbar from './components/Navbar';
import ScrollReveal from './components/ScrollReveal';
import Hero from './components/Hero';
import CountriesSection from './components/CountriesSection';
import AboutEric from './components/AboutEric';
import Divisions from './components/Divisions';
import BenefitsSection from './components/BenefitsSection';
import EventJourney from './components/EventJourney';
import TimelineSection from './components/TimelineSection';
import GallerySection from './components/GallerySection';
import SponsorsSection from './components/SponsorsSection';
import AdminDashboard from './components/AdminDashboard';
import MyRegistrationsModal from './components/MyRegistrationsModal';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

// Modals
import LoginModal from './components/LoginModal';
import RegistrationModal from './components/RegistrationModal';

import { Registration, RICSubmission, ADMIN_EMAILS } from './types';
import { 
  dbFetchRegistrations, 
  dbUpsertRegistration, 
  dbDeleteRegistration, 
  getSupabaseAuth
} from './lib/supabase';
import RICSubmissionFlow from './components/RICSubmissionFlow';
import RICAdminPanel from './components/RICAdminPanel';
import { ricUpsertLocal, ricFetchAllLocal } from './lib/ricStorage';
import { syncRICToSheet } from './lib/ricSheet';
import { RIC_DIVISION_IDS } from './types';

function AppContent() {
  const { showAlert } = useAlert();

  // Authentication states
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; method: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // View & panel states
  const [currentView, setCurrentView] = useState<'landing' | 'admin-dashboard'>('landing');
  const [isMyRegsModalOpen, setIsMyRegsModalOpen] = useState(false);

  // Registration states
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState('rov-underwater');
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // RIC Submission states
  const [isRICOpen, setIsRICOpen] = useState(false);
  const [ricSubmissions, setRicSubmissions] = useState<RICSubmission[]>([]);
  const [activeRICReg, setActiveRICReg] = useState<{ id: string; teamName: string; divisionId: string } | null>(null);

  // Load state on mount
  useEffect(() => {
    const init = async () => {
      let userEmail: string | undefined;

      // 1. Try Supabase session first
      const auth = getSupabaseAuth();
      if (auth) {
        const { data: { session } } = await auth.getSession();
        if (session?.user) {
          const u = session.user;
          const user = {
            name: u.user_metadata?.full_name || u.email?.split('@')[0].toUpperCase() || '',
            email: u.email || '',
            method: u.app_metadata?.provider || 'email'
          };
          setCurrentUser(user);
          localStorage.setItem('eric_active_user', JSON.stringify(user));
          userEmail = user.email;
        }
      }

      // 2. Fallback to localStorage if no Supabase session
      if (!userEmail) {
        const storedUser = localStorage.getItem('eric_active_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setCurrentUser(parsed);
            userEmail = parsed.email;
          } catch (e) {
            localStorage.removeItem('eric_active_user');
          }
        }
      }

      // 3. Load registrations (from localStorage + Supabase)
      try {
        const data = await dbFetchRegistrations(userEmail);
        const filtered = data.filter((r: any) => r && r.id && r.leader && r.leader.email && !r.id.toString().startsWith('seed-'));
        setRegistrations(filtered);
      } catch (err) {
        console.error('Failed to load registrations:', err);
      }

      // 4. Load RIC submissions from localStorage
      try {
        const ricData = await ricFetchAllLocal();
        setRicSubmissions(ricData);
      } catch (err) {
        console.error('Failed to load RIC submissions:', err);
      }
    };
    init();
  }, []);

  // Re-fetch registrations when user logs in — with background merge support
  const refreshRegistrations = useCallback(async (email?: string) => {
    const applyData = (data: Registration[]) => {
      const filtered = data.filter((r: any) => r && r.id && r.leader && r.leader.email && !r.id.toString().startsWith('seed-'));
      setRegistrations(filtered);
    };

    try {
      const data = await dbFetchRegistrations(email, (merged) => {
        applyData(merged);
      });
      applyData(data);
    } catch (err) {
      console.error('Failed to refresh registrations:', err);
    }
  }, []);

  // Login handler
  const handleLoginSuccess = async (user: { name: string; email: string; method: string }) => {
    setCurrentUser(user);
    localStorage.setItem('eric_active_user', JSON.stringify(user));
    setIsLoginModalOpen(false);
    await refreshRegistrations(user.email);
  };

  // Logout handler
  const handleLogout = async () => {
    const auth = getSupabaseAuth();
    if (auth) {
      await auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('eric_active_user');
    setCurrentView('landing');
    setIsMyRegsModalOpen(false);
  };

  // Registration callback
  const handleRegistrationSuccess = async (newReg: Registration) => {
    setRegistrations(prev => {
      const exists = prev.findIndex(r => r.id === newReg.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = newReg;
        return updated;
      }
      return [...prev, newReg];
    });

    // Immediately persist to localStorage so My Registration works even before Sheets sync
    try {
      await dbUpsertRegistration(newReg, currentUser?.email);
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      showAlert({ message: 'Registrasi tersimpan, gagal menyinkronkan ke penyimpanan lokal: ' + err, type: 'warning' });
    }

    // Silently refresh from server in the background to pick up any server-side data
    refreshRegistrations(currentUser?.email).catch(() => {});
  };

  // Update registrations list directly (e.g., from edit or delete)
  const handleUpdateRegistrations = async (newRegs: Registration[]) => {
    // Determine which registration was deleted
    const oldIds = registrations.map(r => r.id);
    const newIds = newRegs.map(r => r.id);
    const deletedIds = oldIds.filter(id => !newIds.includes(id));

    setRegistrations(newRegs);

    try {
      // 1. Delete removed registrations
      for (const id of deletedIds) {
        await dbDeleteRegistration(id);
      }
      // 2. Upsert modified or added registrations
      for (const reg of newRegs) {
        await dbUpsertRegistration(reg, currentUser?.email);
      }
    } catch (err) {
      console.error('Failed to sync changes with Supabase:', err);
    }
  };

  // RIC Submission handler
  const handleRICSubmissionSave = async (submission: RICSubmission) => {
    setRicSubmissions(prev => {
      const exists = prev.findIndex(s => s.id === submission.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = submission;
        return updated;
      }
      return [...prev, submission];
    });

    // Persist to localStorage + sync to sheet
    try {
      await ricUpsertLocal(submission);
      const ok = await syncRICToSheet(submission);
      if (!ok) console.warn('RIC sync to sheet returned false');
    } catch (err) {
      console.error('Failed to save RIC submission:', err);
    }
  };

  const handleOpenRIC = (reg: { id: string; teamName: string; divisionId: string }) => {
    setActiveRICReg(reg);
    setIsRICOpen(true);
  };

  const handleCloseRIC = () => {
    setIsRICOpen(false);
    setActiveRICReg(null);
  };

  // RIC Admin update handler
  const handleRICAdminUpdate = async (subs: RICSubmission[], stageIdx?: number, changedSubId?: string) => {
    setRicSubmissions(subs);
    for (const sub of subs) {
      try {
        await ricUpsertLocal(sub);
      } catch (err) {
        console.error('Failed to persist RIC locally:', err);
      }
    }
    if (changedSubId && stageIdx !== undefined) {
      const changed = subs.find(s => s.id === changedSubId);
      if (changed) {
        const ok = await syncRICToSheet(changed, stageIdx);
        if (!ok) console.warn('RIC admin sync to sheet returned false for', changed.id);
      }
    } else {
      for (const sub of subs) {
        try {
          const ok = await syncRICToSheet(sub);
          if (!ok) console.warn('RIC sync to sheet returned false for', sub.id);
        } catch (err) {
          console.error('Failed to sync RIC update:', err);
        }
      }
    }
  };

    // Division selection from cards
    const handleSelectDivision = (divisionId: string) => {
      // If not logged in, prompt them to login first to maintain a clean authorized roster flow
      if (!currentUser) {
        showAlert({ message: 'Please sign in first to register for a competition division.', type: 'warning' });
        setIsLoginModalOpen(true);
        return;
      }
    
    setSelectedDivisionId(divisionId);
    setIsRegistrationModalOpen(true);
  };

  return (
    <LanguageProvider>
      <div className="font-sans antialiased text-white bg-[#050505] min-h-screen selection:bg-[#FFD700] selection:text-[#050505]">
        
        {/* Floating Top Nav bar */}
        <Navbar 
          currentUser={currentUser}
          onLogout={handleLogout}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onAdminDashboardClick={() => setCurrentView('admin-dashboard')}
          onMyRegistrationsClick={() => setIsMyRegsModalOpen(true)}
          currentView={currentView}
          onBackToHome={() => setCurrentView('landing')}
        />

        {currentView === 'admin-dashboard' ? (
          <AdminDashboard
            currentUser={currentUser}
            registrations={registrations}
            onUpdateRegistrations={handleUpdateRegistrations}
            onBackToHome={() => setCurrentView('landing')}
            ricSubmissions={ricSubmissions}
            onUpdateRICSubmissions={handleRICAdminUpdate}
          />
        ) : (
          <>
            <Hero />
            <ScrollReveal>
              <CountriesSection />
            </ScrollReveal>
            <ScrollReveal>
              <AboutEric />
            </ScrollReveal>
            <ScrollReveal>
              <BenefitsSection />
            </ScrollReveal>
            <ScrollReveal>
              <Divisions onSelectDivision={handleSelectDivision} />
            </ScrollReveal>
            <ScrollReveal>
              <EventJourney />
            </ScrollReveal>
            <ScrollReveal>
              <TimelineSection />
            </ScrollReveal>
            <ScrollReveal>
              <GallerySection />
            </ScrollReveal>
            <ScrollReveal>
              <SponsorsSection />
            </ScrollReveal>
            <ScrollReveal>
              <ContactSection />
            </ScrollReveal>
          </>
        )}

        <Footer />

        <LoginModal 
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        <RegistrationModal 
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          initialDivisionId={selectedDivisionId}
          currentUser={currentUser}
          onRegistrationSuccess={handleRegistrationSuccess}
        />

        <MyRegistrationsModal
          isOpen={isMyRegsModalOpen}
          onClose={() => setIsMyRegsModalOpen(false)}
          currentUser={currentUser}
          registrations={registrations}
          onUpdateRegistrations={handleUpdateRegistrations}
          onRegisterNewTeamClick={() => {
            const divisionsSection = document.querySelector('#divisions-section');
            if (divisionsSection) {
              divisionsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onOpenRIC={handleOpenRIC}
        />

        {activeRICReg && (
          <RICSubmissionFlow
            isOpen={isRICOpen}
            onClose={handleCloseRIC}
            submission={ricSubmissions.find(s => s.registrationId === activeRICReg.id) || null}
            registrationId={activeRICReg.id}
            teamName={activeRICReg.teamName}
            leaderEmail={currentUser?.email || ''}
            divisionId={activeRICReg.divisionId}
            onSave={handleRICSubmissionSave}
          />
        )}

      </div>
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <AlertProvider>
      <AppContent />
    </AlertProvider>
  );
}
