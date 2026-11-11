import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getUserProfile, logoutUser } from './authService';
import Register from './Register';
import Login from './Login';
import Onboarding from './Onboarding';

export default function App() {
  const [activeTab, setActiveTab] = useState('register');
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Monitor auth state and fetch user profile + onboarding status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoadingProfile(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUserProfile(null);
    setActiveTab('login');
  };

  const handleOnboardingComplete = async () => {
    if (currentUser) {
      const updated = await getUserProfile(currentUser.uid);
      setUserProfile(updated);
    }
  };

  return (
    <div style={{ padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif', maxWidth: '560px', margin: 'auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#ea580c', margin: '0 0 0.25rem 0', fontSize: '1.85rem' }}>🍲 KusinApp</h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
          Smart Filipino Meal Planning & Pantry Management (Sprint 1)
        </p>
      </header>

      {/* If user is logged in, show their status and Onboarding / Dashboard */}
      {currentUser ? (
        <div style={{ border: '1px solid #e5e7eb', padding: '1.25rem', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1f2937' }}>
                {currentUser.displayName || currentUser.email}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                Role: <span style={{ fontWeight: 600, color: '#ea580c' }}>{userProfile?.role || 'user'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.4rem 0.85rem',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Log Out
            </button>
          </div>

          {isLoadingProfile ? (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading profile...</p>
          ) : userProfile?.onboardingCompleted ? (
            /* Dashboard view showing completed onboarding summary */
            <div>
              <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, color: '#047857', fontSize: '0.9rem' }}>
                  ✓ US-03 Onboarding Assessment Complete!
                </div>
                <div style={{ fontSize: '0.8rem', color: '#065f46', marginTop: '2px' }}>
                  Your demographics, BMI baseline, target persona, and health conditions are saved.
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: '1.7', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div><strong>Persona:</strong> {formatPersonaName(userProfile.onboarding?.userPersona)}</div>
                <div><strong>Age & Sex:</strong> {userProfile.onboarding?.age} yrs old, {userProfile.onboarding?.gender}</div>
                <div><strong>Current BMI:</strong> {userProfile.onboarding?.bmi} ({userProfile.onboarding?.bmiCategory})</div>
                <div><strong>Base BMR:</strong> ~{userProfile.onboarding?.bmr} kcal/day</div>
                <div><strong>Specific Weight Goal:</strong> <span style={{ textTransform: 'capitalize' }}>{userProfile.onboarding?.weightGoal}</span> weight</div>
                <div><strong>Household Size:</strong> {userProfile.onboarding?.householdSize} pax</div>
                <div><strong>Cooking Skill:</strong> <span style={{ textTransform: 'capitalize' }}>{userProfile.onboarding?.cookingSkill}</span></div>
                {userProfile.onboarding?.comorbidities?.length > 0 && (
                  <div>
                    <strong>Comorbidities / Conditions:</strong> {userProfile.onboarding.comorbidities.map(c => c.replace('_', ' ')).join(', ')}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setUserProfile((prev) => ({ ...prev, onboardingCompleted: false }));
                }}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Retake Onboarding Assessment
              </button>
            </div>
          ) : (
            /* US-03: Onboarding Assessment Form */
            <Onboarding user={currentUser} onComplete={handleOnboardingComplete} />
          )}
        </div>
      ) : (
        /* If logged out, show Register or Login tabs */
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setActiveTab('register')}
              style={{
                flex: 1,
                padding: '0.6rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: activeTab === 'register' ? '#ea580c' : '#f9fafb',
                color: activeTab === 'register' ? '#ffffff' : '#374151',
                fontWeight: activeTab === 'register' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              Register (US-01)
            </button>
            <button
              onClick={() => setActiveTab('login')}
              style={{
                flex: 1,
                padding: '0.6rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: activeTab === 'login' ? '#ea580c' : '#f9fafb',
                color: activeTab === 'login' ? '#ffffff' : '#374151',
                fontWeight: activeTab === 'login' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              Sign In (US-02)
            </button>
          </div>

          <div style={{ border: '1px solid #e5e7eb', padding: '16px', borderRadius: '12px', backgroundColor: '#ffffff' }}>
            {activeTab === 'register' ? (
              <Register onNavigateToLogin={() => setActiveTab('login')} />
            ) : (
              <Login onNavigateToRegister={() => setActiveTab('register')} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatPersonaName(persona) {
  switch (persona) {
    case 'solo_eater': return 'The Solo Eater (Single Serving)';
    case 'household_provider': return 'The Household Provider (Family)';
    case 'health_targeted_eater': return 'The Health-Targeted Eater (Goal-Focused)';
    default: return persona || 'General User';
  }
}