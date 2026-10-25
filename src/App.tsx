import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUser, useClerk, AuthenticateWithRedirectCallback } from '@clerk/react';
import { Sidebar } from './components/layout/Sidebar';
import type { NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientListView } from './components/patients/PatientListView';
import { PatientDetailView } from './components/patients/PatientDetailView';
import { DietPlannerView } from './components/diet/DietPlannerView';
import { PrintableDietView } from './components/diet/PrintableDietView';
import { PrintableSupplementsView } from './components/supplements/PrintableSupplementsView';
import { PrintableAnthropometryView } from './components/patients/PrintableAnthropometryView';
import { PrintableAnamnesisView } from './components/patients/PrintableAnamnesisView';
import { PrintableOverviewView } from './components/patients/PrintableOverviewView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { FoodDatabaseView } from './components/foods/FoodDatabaseView';
import { SupplementPrescriptionsView } from './components/supplements/SupplementPrescriptionsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthView } from './components/auth/AuthView';
import { PatientModal } from './components/modals/PatientModal';
import { AppointmentModal } from './components/modals/AppointmentModal';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { getSubscriptionStatus, activateProPlan } from './services/subscription';
import confetti from 'canvas-confetti';

import type {
  Patient,
  Anamnesis,
  Anthropometry,
  DietPlan,
  Appointment,
  Supplement,
  EvolutionPhoto,
  ClinicProfile,
  AppointmentStatus,
  EnergyCalculation,
  User
} from './types';

import { supabase } from './services/supabase';
import {
  getCurrentUser,
  setCurrentSession,
  logoutUser
} from './services/auth';

import {
  getPatients,
  savePatient,
  deletePatient,
  getAnamnesis,
  saveAnamnesis,
  getAnthropometry,
  addAnthropometry,
  deleteAnthropometry,
  getDietPlans,
  saveDietPlan,
  getAppointments,
  saveAppointment,
  deleteAppointment,
  getSupplements,
  saveSupplement,
  deleteSupplement,
  getEvolutionPhotos,
  saveEvolutionPhoto,
  deleteEvolutionPhoto,
  getClinicProfile,
  saveClinicProfile,
  checkSupabaseConnection
} from './services/db';

export function App() {
  // Clerk Authentication
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  // Local Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());

  // Sync Supabase Google OAuth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || 'raphacalixto10@gmail.com';
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
        const userObj: User = {
          id: session.user.id,
          name,
          email,
          createdAt: session.user.created_at || new Date().toISOString(),
        };
        setCurrentUser((prev) => {
          if (prev?.id === userObj.id) return prev;
          return userObj;
        });
        setCurrentSession(userObj);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email || 'raphacalixto10@gmail.com';
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
        const userObj: User = {
          id: session.user.id,
          name,
          email,
          createdAt: session.user.created_at || new Date().toISOString(),
        };
        setCurrentUser((prev) => {
          if (prev?.id === userObj.id) return prev;
          return userObj;
        });
        setCurrentSession(userObj);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync Clerk authenticated user into local state
  useEffect(() => {
    if (isClerkLoaded && isClerkSignedIn && clerkUser) {
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        'raphacalixto10@gmail.com';
      const name =
        clerkUser.fullName ||
        clerkUser.firstName ||
        (email ? email.split('@')[0] : 'Raphael');

      const userObj: User = {
        id: clerkUser.id,
        name,
        email,
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      };

      setCurrentUser((prev) => {
        if (prev?.id === userObj.id) return prev;
        return userObj;
      });
      setCurrentSession(userObj);
    }
  }, [isClerkLoaded, isClerkSignedIn, clerkUser]);

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(true);

  // Core Data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile>(getClinicProfile());

  // Patient Sub-resources cache
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAnamnesis, setPatientAnamnesis] = useState<Anamnesis | null>(null);
  const [patientAnthropometry, setPatientAnthropometry] = useState<Anthropometry[]>([]);
  const [patientDietPlans, setPatientDietPlans] = useState<DietPlan[]>([]);
  const [patientSupplements, setPatientSupplements] = useState<Supplement[]>([]);
  const [patientPhotos, setPatientPhotos] = useState<EvolutionPhoto[]>([]);
  const [allSupplementsMap, setAllSupplementsMap] = useState<Record<string, Supplement[]>>({});

  // Modals & Navigation state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [appointmentInitialDate, setAppointmentInitialDate] = useState<string | undefined>(undefined);

  // Diet Planner specific state
  const [dietPlanToEdit, setDietPlanToEdit] = useState<DietPlan | null>(null);
  const [dietPlanToPrint, setDietPlanToPrint] = useState<{ patient: Patient; plan: DietPlan } | null>(null);
  const [printableDoc, setPrintableDoc] = useState<
    | { type: 'diet'; patient: Patient; plan: DietPlan }
    | { type: 'supplements'; patient: Patient; supplements: Supplement[] }
    | { type: 'anthropometry'; patient: Patient; assessment?: Anthropometry; history?: Anthropometry[] }
    | { type: 'anamnesis'; patient: Patient; anamnesis: Anamnesis }
    | {
        type: 'overview';
        patient: Patient;
        anamnesis: Anamnesis | null;
        anthropometryList: Anthropometry[];
        dietPlans: DietPlan[];
        supplements: Supplement[];
      }
    | null
  >(null);
  const [energyCalcForPlanner, setEnergyCalcForPlanner] = useState<EnergyCalculation | null>(null);

  // Subscription & Trial state
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionTriggerReason, setSubscriptionTriggerReason] = useState<'limit_reached' | 'trial_expired' | 'manual'>('manual');

  // Load active user's data
  const loadUserData = useCallback(async () => {
    const [pts, apts, conn] = await Promise.all([
      getPatients(),
      getAppointments(),
      checkSupabaseConnection(),
    ]);
    setPatients(pts);
    setAppointments(apts);
    setClinicProfile(getClinicProfile());
    setSupabaseConnected(conn.connected);

    // Keep selectedPatient reference updated with fresh data without resetting to null
    setSelectedPatient((prev) => {
      if (!prev) return null;
      return pts.find((p) => p.id === prev.id) || prev;
    });

    // Load supplements for all patients
    const supMap: Record<string, Supplement[]> = {};
    for (const p of pts) {
      supMap[p.id] = await getSupplements(p.id);
    }
    setAllSupplementsMap(supMap);
  }, []);

  const [subscriptionRefreshKey, setSubscriptionRefreshKey] = useState(0);

  // Realtime subscription & trial status calculation
  const subscriptionStatus = useMemo(() => {
    return getSubscriptionStatus(currentUser, patients.length);
  }, [currentUser, patients.length, subscriptionRefreshKey]);

  const handlePlanActivated = () => {
    setSubscriptionRefreshKey((k) => k + 1);
    loadUserData();
  };

  // Detecção de retorno automático do Asaas (?payment=success ou ?asaas=success)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' || params.get('asaas') === 'success') {
      if (currentUser) {
        activateProPlan(currentUser, 'annual');
        handlePlanActivated();
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {}
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [currentUser]);

  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const isNewUser = prevUserIdRef.current !== currentUser.id;
      prevUserIdRef.current = currentUser.id;

      if (isNewUser) {
        setPatients([]);
        setAppointments([]);
        setSelectedPatient(null);
        setDietPlanToEdit(null);
        setDietPlanToPrint(null);
        setPrintableDoc(null);
      }
      loadUserData();
    } else {
      prevUserIdRef.current = null;
      setPatients([]);
      setAppointments([]);
      setSelectedPatient(null);
    }
  }, [currentUser, loadUserData]);

  // When selected patient changes, load sub-resources
  useEffect(() => {
    if (selectedPatient) {
      async function loadPatientDetails() {
        if (!selectedPatient) return;
        const [anam, anthro, plans, sups, photos] = await Promise.all([
          getAnamnesis(selectedPatient.id),
          getAnthropometry(selectedPatient.id),
          getDietPlans(selectedPatient.id),
          getSupplements(selectedPatient.id),
          getEvolutionPhotos(selectedPatient.id),
        ]);
        setPatientAnamnesis(anam);
        setPatientAnthropometry(anthro);
        setPatientDietPlans(plans);
        setPatientSupplements(sups);
        setPatientPhotos(photos);
      }
      loadPatientDetails();
    }
  }, [selectedPatient]);

  // ==================== MOBILE & BROWSER NATIVE BACK BUTTON INTEGRATION ====================
  const isPopStateRef = useRef(false);

  const pushNavState = useCallback(
    (newState: {
      tab: NavTab;
      patientId?: string | null;
      isDietEdit?: boolean;
      isPrint?: boolean;
      modal?: 'patient' | 'appointment' | null;
    }) => {
      if (isPopStateRef.current) return;
      try {
        const stateObj = {
          tab: newState.tab,
          patientId: newState.patientId || null,
          isDietEdit: !!newState.isDietEdit,
          isPrint: !!newState.isPrint,
          modal: newState.modal || null,
        };

        const currentHistoryState = window.history.state;
        if (
          currentHistoryState &&
          currentHistoryState.tab === stateObj.tab &&
          currentHistoryState.patientId === stateObj.patientId &&
          currentHistoryState.isDietEdit === stateObj.isDietEdit &&
          currentHistoryState.isPrint === stateObj.isPrint &&
          currentHistoryState.modal === stateObj.modal
        ) {
          return;
        }

        window.history.pushState(stateObj, '');
      } catch (e) {}
    },
    []
  );

  // Initialize initial history entry on load
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.history.state) {
      window.history.replaceState(
        { tab: 'dashboard', patientId: null, isDietEdit: false, isPrint: false, modal: null },
        ''
      );
    }
  }, []);

  const patientsRef = useRef(patients);
  patientsRef.current = patients;

  // Listen to popstate (Mobile Native Back button, Gesture back, Browser Back)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      isPopStateRef.current = true;

      if (!state) {
        // Fallback to root dashboard
        setCurrentTab('dashboard');
        setSelectedPatient(null);
        setDietPlanToEdit(null);
        setDietPlanToPrint(null);
        setPrintableDoc(null);
        setIsPatientModalOpen(false);
        setIsAppointmentModalOpen(false);
      } else {
        // Modals
        setIsPatientModalOpen(state.modal === 'patient');
        setIsAppointmentModalOpen(state.modal === 'appointment');

        // Print & Edit sub-views
        if (!state.isPrint) {
          setDietPlanToPrint(null);
          setPrintableDoc(null);
        }
        if (!state.isDietEdit && state.tab !== 'diet_planner') {
          setDietPlanToEdit(null);
        }

        // Selected patient
        if (state.patientId) {
          setSelectedPatient((prev) => {
            if (prev?.id === state.patientId) return prev;
            return patientsRef.current.find((p) => p.id === state.patientId) || prev;
          });
        } else {
          setSelectedPatient(null);
        }

        // Active tab
        if (state.tab) {
          setCurrentTab(state.tab);
        }
      }

      setTimeout(() => {
        isPopStateRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Always scroll to top when changing tabs, opening patient records, or entering planner
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (typeof document !== 'undefined') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [currentTab, selectedPatient, dietPlanToEdit, dietPlanToPrint]);

  // Handle Tab Selection
  const handleSelectTab = (tab: NavTab) => {
    setDietPlanToPrint(null);
    setDietPlanToEdit(null);
    if (tab !== 'patients') {
      setSelectedPatient(null);
    }
    setCurrentTab(tab);
    pushNavState({
      tab,
      patientId: tab === 'patients' && selectedPatient ? selectedPatient.id : null,
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Safe back navigation helper
  const handleSafeBack = (fallback: () => void) => {
    if (window.history.length > 1 && window.history.state) {
      window.history.back();
    } else {
      fallback();
    }
  };

  // Patient Actions
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentTab('patients');
    pushNavState({ tab: 'patients', patientId: patient.id });
  };

  const handleOpenNewPatientModal = (patient?: Patient | null) => {
    // Se estiver adicionando um NOVO paciente, valida o limite do trial (5 pacientes) e dias restantes
    if (!patient && !subscriptionStatus.canAddPatient) {
      setSubscriptionTriggerReason(subscriptionStatus.isExpired ? 'trial_expired' : 'limit_reached');
      setIsSubscriptionModalOpen(true);
      return;
    }

    setPatientToEdit(patient || null);
    setIsPatientModalOpen(true);
    pushNavState({
      tab: currentTab,
      patientId: selectedPatient?.id,
      modal: 'patient',
    });
  };

  const handleOpenAppointmentModal = (apt?: Appointment | null, initialDate?: string) => {
    setAppointmentToEdit(apt || null);
    setAppointmentInitialDate(initialDate);
    setIsAppointmentModalOpen(true);
    pushNavState({
      tab: currentTab,
      patientId: selectedPatient?.id,
      modal: 'appointment',
    });
  };

  const handleSavePatient = async (patientData: Partial<Patient> & { name: string }) => {
    const saved = await savePatient(patientData);
    const updatedPatients = await getPatients();
    setPatients(updatedPatients);

    if (selectedPatient && selectedPatient.id === saved.id) {
      setSelectedPatient(saved);
    }

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleDeletePatient = async (id: string) => {
    await deletePatient(id);
    const updated = await getPatients();
    setPatients(updated);
    if (selectedPatient?.id === id) {
      setSelectedPatient(null);
    }
  };

  // Anamnesis Actions
  const handleSaveAnamnesis = async (anam: Anamnesis) => {
    const saved = await saveAnamnesis(anam);
    setPatientAnamnesis(saved);
  };

  // Anthropometry Actions
  const handleAddAnthropometry = async (data: Anthropometry) => {
    await addAnthropometry(data);
    if (selectedPatient) {
      const list = await getAnthropometry(selectedPatient.id);
      setPatientAnthropometry(list);
    }
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleDeleteAnthropometry = async (id: string) => {
    if (selectedPatient) {
      await deleteAnthropometry(selectedPatient.id, id);
      const list = await getAnthropometry(selectedPatient.id);
      setPatientAnthropometry(list);
    }
  };

  // Evolution Photos Actions (Antes & Depois)
  const handleAddEvolutionPhoto = async (photo: EvolutionPhoto) => {
    await saveEvolutionPhoto(photo);
    if (selectedPatient) {
      const list = await getEvolutionPhotos(selectedPatient.id);
      setPatientPhotos(list);
    }
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleDeleteEvolutionPhoto = async (id: string) => {
    if (selectedPatient) {
      await deleteEvolutionPhoto(selectedPatient.id, id);
      const list = await getEvolutionPhotos(selectedPatient.id);
      setPatientPhotos(list);
    }
  };

  // Diet Plan Actions
  const handleSaveDietPlan = async (plan: DietPlan) => {
    const saved = await saveDietPlan(plan);
    if (selectedPatient) {
      const plans = await getDietPlans(selectedPatient.id);
      setPatientDietPlans(plans);
    }
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  const handleOpenDietPlanner = (
    patient: Patient,
    plan?: DietPlan,
    energyCalc?: EnergyCalculation
  ) => {
    setSelectedPatient(patient);
    setDietPlanToEdit(plan || null);
    setEnergyCalcForPlanner(energyCalc || null);
    setDietPlanToPrint(null);
    setPrintableDoc(null);
    setCurrentTab('diet_planner');
    pushNavState({
      tab: 'diet_planner',
      patientId: patient.id,
      isDietEdit: !!plan,
    });
  };

  const handlePrintDietPlan = (patient: Patient, plan: DietPlan) => {
    setPrintableDoc({ type: 'diet', patient, plan });
    setDietPlanToPrint({ patient, plan });
    pushNavState({
      tab: currentTab,
      patientId: patient.id,
      isPrint: true,
    });
  };

  const handlePrintSupplements = (patient: Patient, supplements: Supplement[]) => {
    setPrintableDoc({ type: 'supplements', patient, supplements });
    pushNavState({
      tab: currentTab,
      patientId: patient.id,
      isPrint: true,
    });
  };

  const handlePrintAnthropometry = (
    patient: Patient,
    assessment?: Anthropometry,
    history?: Anthropometry[]
  ) => {
    setPrintableDoc({ type: 'anthropometry', patient, assessment, history });
    pushNavState({
      tab: currentTab,
      patientId: patient.id,
      isPrint: true,
    });
  };

  const handlePrintAnamnesis = (patient: Patient, anamnesis: Anamnesis) => {
    setPrintableDoc({ type: 'anamnesis', patient, anamnesis });
    pushNavState({
      tab: currentTab,
      patientId: patient.id,
      isPrint: true,
    });
  };

  const handlePrintOverview = (patient: Patient) => {
    setPrintableDoc({
      type: 'overview',
      patient,
      anamnesis: patientAnamnesis,
      anthropometryList: patientAnthropometry,
      dietPlans: patientDietPlans,
      supplements: patientSupplements,
    });
    pushNavState({
      tab: currentTab,
      patientId: patient.id,
      isPrint: true,
    });
  };

  // Appointments Actions
  const handleSaveAppointment = async (
    data: Partial<Appointment> & { patientName: string; date: string; time: string }
  ) => {
    await saveAppointment(data);
    const updated = await getAppointments();
    setAppointments(updated);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleDeleteAppointment = async (id: string) => {
    await deleteAppointment(id);
    const updated = await getAppointments();
    setAppointments(updated);
  };

  const handleUpdateAppointmentStatus = async (id: string, newStatus: AppointmentStatus) => {
    const apt = appointments.find((a) => a.id === id);
    if (apt) {
      await saveAppointment({ ...apt, status: newStatus });
      const updated = await getAppointments();
      setAppointments(updated);
    }
  };

  // Supplement Actions
  const handleSaveSupplement = async (sup: Supplement) => {
    await saveSupplement(sup);
    const updated = await getSupplements(sup.patientId);
    setAllSupplementsMap((prev) => ({ ...prev, [sup.patientId]: updated }));
    if (selectedPatient?.id === sup.patientId) {
      setPatientSupplements(updated);
    }
  };

  const handleDeleteSupplement = async (patientId: string, id: string) => {
    await deleteSupplement(patientId, id);
    const updated = await getSupplements(patientId);
    setAllSupplementsMap((prev) => ({ ...prev, [patientId]: updated }));
    if (selectedPatient?.id === patientId) {
      setPatientSupplements(updated);
    }
  };

  // Clinic Profile Actions
  const handleSaveClinicProfile = (profile: ClinicProfile) => {
    const saved = saveClinicProfile(profile);
    setClinicProfile(saved);
  };

  const handleCheckConnection = async () => {
    const res = await checkSupabaseConnection();
    setSupabaseConnected(res.connected);
  };

  const handleLogout = async () => {
    logoutUser();
    setCurrentUser(null);
    setPatients([]);
    setAppointments([]);
    setSelectedPatient(null);
    setPatientAnamnesis(null);
    setPatientAnthropometry([]);
    setPatientDietPlans([]);
    setPatientSupplements([]);
    setPatientPhotos([]);
    setAllSupplementsMap({});
    try {
      if (clerkSignOut) {
        await clerkSignOut();
      }
    } catch (e) {}
  };

  // If in SSO callback from Google / Clerk redirect
  if (typeof window !== 'undefined' && window.location.pathname === '/sso-callback') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Autenticando com Google...</p>
        <AuthenticateWithRedirectCallback signInForceRedirectUrl="/" signUpForceRedirectUrl="/" />
      </div>
    );
  }

  // If not logged in, show Auth View
  if (!currentUser) {
    return (
      <AuthView
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  // If in printable view mode
  if (printableDoc || dietPlanToPrint) {
    const doc =
      printableDoc ||
      (dietPlanToPrint
        ? ({ type: 'diet' as const, patient: dietPlanToPrint.patient, plan: dietPlanToPrint.plan })
        : null);

    if (doc?.type === 'diet') {
      return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
          <PrintableDietView
            patient={doc.patient}
            plan={doc.plan}
            clinicProfile={clinicProfile}
            onBack={() => {
              setPrintableDoc(null);
              setDietPlanToPrint(null);
            }}
          />
        </div>
      );
    }

    if (doc?.type === 'supplements') {
      return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
          <PrintableSupplementsView
            patient={doc.patient}
            supplements={doc.supplements}
            clinicProfile={clinicProfile}
            onBack={() => {
              setPrintableDoc(null);
              setDietPlanToPrint(null);
            }}
          />
        </div>
      );
    }

    if (doc?.type === 'anthropometry') {
      return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
          <PrintableAnthropometryView
            patient={doc.patient}
            assessment={doc.assessment}
            history={doc.history}
            clinicProfile={clinicProfile}
            onBack={() => {
              setPrintableDoc(null);
              setDietPlanToPrint(null);
            }}
          />
        </div>
      );
    }

    if (doc?.type === 'anamnesis') {
      return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
          <PrintableAnamnesisView
            patient={doc.patient}
            anamnesis={doc.anamnesis}
            clinicProfile={clinicProfile}
            onBack={() => {
              setPrintableDoc(null);
              setDietPlanToPrint(null);
            }}
          />
        </div>
      );
    }

    if (doc?.type === 'overview') {
      return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
          <PrintableOverviewView
            patient={doc.patient}
            anamnesis={doc.anamnesis}
            anthropometryList={doc.anthropometryList}
            dietPlans={doc.dietPlans}
            supplements={doc.supplements}
            clinicProfile={clinicProfile}
            onBack={() => {
              setPrintableDoc(null);
              setDietPlanToPrint(null);
            }}
          />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        clinicProfile={clinicProfile}
        currentUser={currentUser}
        onLogout={handleLogout}
        supabaseConnected={supabaseConnected}
        subscriptionStatus={subscriptionStatus}
        onOpenSubscriptionModal={() => {
          setSubscriptionTriggerReason('manual');
          setIsSubscriptionModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Top Navbar */}
        <Navbar
          onNewPatient={() => handleOpenNewPatientModal(null)}
          onNewAppointment={() => handleOpenAppointmentModal(null)}
          subscriptionStatus={subscriptionStatus}
          onOpenSubscriptionModal={() => {
            setSubscriptionTriggerReason('manual');
            setIsSubscriptionModalOpen(true);
          }}
        />

        {/* Dynamic Page Views */}
        <main className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {/* Dashboard Tab */}
          {currentTab === 'dashboard' && (
            <DashboardView
              patients={patients}
              appointments={appointments}
              dietPlansCount={patientDietPlans.length || 0}
              clinicProfile={clinicProfile}
              onNavigate={handleSelectTab}
              onSelectPatient={handleSelectPatient}
              onNewPatient={() => handleOpenNewPatientModal(null)}
              onNewAppointment={() => handleOpenAppointmentModal(null)}
            />
          )}

          {/* Patients Tab */}
          {currentTab === 'patients' && (
            <>
              {selectedPatient ? (
                <PatientDetailView
                  patient={selectedPatient}
                  patients={patients}
                  onBack={() => handleSafeBack(() => setSelectedPatient(null))}
                  onEditPatient={(p) => handleOpenNewPatientModal(p)}
                  onOpenDietPlanner={handleOpenDietPlanner}
                  onPrintDietPlan={handlePrintDietPlan}
                  onPrintOverview={handlePrintOverview}
                  onPrintAnamnesis={handlePrintAnamnesis}
                  onPrintAnthropometry={handlePrintAnthropometry}
                  onPrintSupplements={handlePrintSupplements}
                  anamnesis={patientAnamnesis}
                  onSaveAnamnesis={handleSaveAnamnesis}
                  anthropometryList={patientAnthropometry}
                  onAddAnthropometry={handleAddAnthropometry}
                  onDeleteAnthropometry={handleDeleteAnthropometry}
                  dietPlans={patientDietPlans}
                  supplements={patientSupplements}
                  onSaveSupplement={handleSaveSupplement}
                  onDeleteSupplement={handleDeleteSupplement}
                  appointments={appointments}
                  onSaveAppointment={handleSaveAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  photos={patientPhotos}
                  onAddPhoto={handleAddEvolutionPhoto}
                  onDeletePhoto={handleDeleteEvolutionPhoto}
                />
              ) : (
                <PatientListView
                  patients={patients}
                  onSelectPatient={handleSelectPatient}
                  onNewPatient={() => handleOpenNewPatientModal(null)}
                  onEditPatient={(p) => handleOpenNewPatientModal(p)}
                  onDeletePatient={handleDeletePatient}
                  onOpenDietPlanner={(p) => handleOpenDietPlanner(p)}
                />
              )}
            </>
          )}

          {/* Diet Planner Tab */}
          {currentTab === 'diet_planner' && (
            <DietPlannerView
              patients={patients}
              selectedPatient={selectedPatient}
              initialPlan={dietPlanToEdit}
              initialEnergyCalc={energyCalcForPlanner}
              onSavePlan={handleSaveDietPlan}
              onPrintPlan={handlePrintDietPlan}
              onSelectPatientChange={(p) => setSelectedPatient(p)}
              onBack={() =>
                handleSafeBack(() => {
                  if (selectedPatient) {
                    setCurrentTab('patients');
                  } else {
                    setCurrentTab('dashboard');
                  }
                })
              }
            />
          )}

          {/* Schedule Tab */}
          {currentTab === 'schedule' && (
            <ScheduleView
              appointments={appointments}
              patients={patients}
              clinicProfile={clinicProfile}
              onNewAppointment={(initialDate) => handleOpenAppointmentModal(null, initialDate)}
              onEditAppointment={(apt) => handleOpenAppointmentModal(apt)}
              onDeleteAppointment={handleDeleteAppointment}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {/* Foods Database Tab */}
          {currentTab === 'foods' && <FoodDatabaseView />}

          {/* Supplements Tab */}
          {currentTab === 'supplements' && (
            <SupplementPrescriptionsView
              patients={patients}
              supplements={allSupplementsMap}
              onSaveSupplement={handleSaveSupplement}
              onDeleteSupplement={handleDeleteSupplement}
              onPrintSupplements={handlePrintSupplements}
            />
          )}

          {/* Settings Tab */}
          {currentTab === 'settings' && (
            <SettingsView
              clinicProfile={clinicProfile}
              onSaveClinicProfile={handleSaveClinicProfile}
              currentUser={currentUser}
              onLogout={handleLogout}
              supabaseConnected={supabaseConnected}
              onCheckConnection={handleCheckConnection}
              subscriptionStatus={subscriptionStatus}
              onOpenSubscriptionModal={() => {
                setSubscriptionTriggerReason('manual');
                setIsSubscriptionModalOpen(true);
              }}
              onPlanActivated={handlePlanActivated}
            />
          )}
        </main>
      </div>

      {/* MOBILE / TABLET BOTTOM NAV & MENU */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        clinicProfile={clinicProfile}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNewPatient={() => handleOpenNewPatientModal(null)}
        onNewAppointment={() => handleOpenAppointmentModal(null)}
      />

      {/* GLOBAL MODALS */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => handleSafeBack(() => setIsPatientModalOpen(false))}
        onSave={handleSavePatient}
        patientToEdit={patientToEdit}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => handleSafeBack(() => setIsAppointmentModalOpen(false))}
        onSave={handleSaveAppointment}
        patients={patients}
        appointmentToEdit={appointmentToEdit}
        initialDate={appointmentInitialDate}
      />

      {/* SUBSCRIPTION & TRIAL MODAL */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentUser={currentUser}
        subscriptionStatus={subscriptionStatus}
        triggerReason={subscriptionTriggerReason}
        onPlanActivated={handlePlanActivated}
      />
    </div>
  );
}

export default App;
