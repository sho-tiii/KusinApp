import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getUserProfile, logoutUser } from './authService';
import Register from './Register';
import Login from './Login';
import Onboarding from './Onboarding';

const PERSONA_LABELS = {
  solo_eater: 'The Solo Eater',
  household_provider: 'The Household Provider',
  health_targeted_eater: 'The Health-Targeted Eater',
};

const GOAL_LABELS = {
  maintain: 'Maintain Weight',
  lose: 'Lose Weight',
  gain: 'Gain Weight / Muscle',
};

const CONDITION_LABELS = {
  none: 'None',
  hypertension: 'Hypertension',
  diabetes: 'Diabetes',
  high_cholesterol: 'High Cholesterol',
  hyperuricemia_gout: 'Gout',
  gerd_acid_reflux: 'Acid Reflux / GERD',
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

export default function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isRetaking, setIsRetaking] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);
      if (user) {
        setIsLoadingProfile(true);
        try {
          setUserProfile(await getUserProfile(user.uid));
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
    setIsRetaking(false);
    setActiveTab('login');
  };

  const handleOnboardingComplete = async () => {
    if (currentUser) setUserProfile(await getUserProfile(currentUser.uid));
    setIsRetaking(false);
  };

  const displayName = currentUser?.displayName || userProfile?.displayName || currentUser?.email || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const showOnboarding = currentUser && !isLoadingProfile && (!userProfile?.onboardingCompleted || isRetaking);
  const ob = userProfile?.onboarding;

  return (
    <div className="k-page">
      <header className="k-nav">
        <div className="k-brand">
          <img
            src="/assets/kusinapp-logo-horizontal.png"
            alt="KusinApp"
            className="k-brand-img"
          />
        </div>

        {currentUser && (
          <div className="k-nav-actions">
            <div className="k-user">
              <span className="k-avatar" aria-hidden="true">{initials || 'K'}</span>
              <div className="k-user-meta">
                <div className="k-user-name">{displayName}</div>
                <div className="k-user-role">{capitalize(userProfile?.role || 'user')}</div>
              </div>
            </div>
            <button
              type="button"
              className="k-btn k-btn--ghost-danger k-btn--sm"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        )}
      </header>

      <main className="k-main">
        {!currentUser && (
          <div className="k-card">
            <div className="k-tabs" role="tablist" aria-label="Account access">
              <button
                type="button"
                role="tab"
                className="k-tab"
                aria-selected={activeTab === 'login'}
                onClick={() => setActiveTab('login')}
              >
                Log In
              </button>
              <button
                type="button"
                role="tab"
                className="k-tab"
                aria-selected={activeTab === 'register'}
                onClick={() => setActiveTab('register')}
              >
                Sign Up
              </button>
            </div>

            {activeTab === 'register' ? (
              <Register onNavigateToLogin={() => setActiveTab('login')} />
            ) : (
              <Login onNavigateToRegister={() => setActiveTab('register')} />
            )}
          </div>
        )}

        {currentUser && isLoadingProfile && (
          <div className="k-card">
            <div className="k-loading">Loading your profile…</div>
          </div>
        )}

        {showOnboarding && (
          <div className="k-card k-card--wide">
            <Onboarding
              user={currentUser}
              initialData={isRetaking ? ob : undefined}
              onComplete={handleOnboardingComplete}
              onCancel={isRetaking ? () => setIsRetaking(false) : undefined}
            />
          </div>
        )}

        {currentUser && !isLoadingProfile && !showOnboarding && (
          <div className="k-card k-card--wide">
            <div className="k-card-head">
              <span className="k-eyebrow">Mabuhay, {displayName.split(' ')[0]}!</span>
              <h1 className="k-title">Your KusinApp Profile</h1>
              <p className="k-subtitle">Your onboarding assessment is saved and ready for meal planning.</p>
            </div>

            <div className="k-alert k-alert--success" role="status">
              ✓ Onboarding complete — your health profile is synced to your account.
            </div>

            <div className="k-metrics">
              <div className="k-metric">
                <div className="k-metric-label">BMI</div>
                <div className="k-metric-value">{ob?.bmi ?? '—'}</div>
                <div className="k-metric-sub" style={{ color: 'var(--k-amber-700)' }}>{ob?.bmiCategory}</div>
              </div>
              <div className="k-metric">
                <div className="k-metric-label">Base BMR</div>
                <div className="k-metric-value">~{ob?.bmr ?? '—'}</div>
                <div className="k-metric-sub" style={{ color: 'var(--k-muted)' }}>kcal / day</div>
              </div>
              <div className="k-metric">
                <div className="k-metric-label">Goal</div>
                <div className="k-metric-value" style={{ fontSize: '1rem', marginTop: 8 }}>
                  {GOAL_LABELS[ob?.weightGoal] || '—'}
                </div>
              </div>
            </div>

            <ul className="k-summary-list">
              <li><span>Profile Persona</span><span>{PERSONA_LABELS[ob?.userPersona] || '—'}</span></li>
              <li><span>Age & Sex</span><span>{ob?.age} yrs · {capitalize(ob?.gender)}</span></li>
              <li><span>Height & Weight</span><span>{ob?.heightCm} cm · {ob?.weightKg} kg</span></li>
              <li><span>Household Size</span><span>{ob?.householdSize} pax</span></li>
              <li><span>Cooking Skill</span><span>{capitalize(ob?.cookingSkill)}</span></li>
              <li>
                <span>Health Conditions</span>
                <span>{(ob?.comorbidities || ['none']).map((c) => CONDITION_LABELS[c] || c).join(', ')}</span>
              </li>
            </ul>

            <button
              type="button"
              className="k-btn k-btn--outline k-btn--block"
              style={{ marginTop: 20 }}
              onClick={() => setIsRetaking(true)}
            >
              ↻ Retake Onboarding Assessment
            </button>
          </div>
        )}
      </main>

      <footer className="k-footer">
        © 2026 KusinApp · Lasang Pinoy sa Bawat Luto.
      </footer>
    </div>
  );
}