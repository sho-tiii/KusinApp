import React from "react";

export function IconScale({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3v18" />
      <path d="M6 7h12" />
      <path d="M6 7l-3 6a3 3 0 0 0 6 0L6 7z" fill="currentColor" fillOpacity="0.08" />
      <path d="M18 7l-3 6a3 3 0 0 0 6 0L18 7z" fill="currentColor" fillOpacity="0.08" />
      <path d="M4 21h16" />
    </svg>
  );
}

export function IconSalad({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 21h10a6 6 0 0 0 6-6H1a6 6 0 0 0 6 6z" fill="currentColor" fillOpacity="0.08" />
      <path d="M12 3c-1.5 2-2 4-2 6h4c0-2-.5-4-2-6z" />
      <path d="M6 9c.5-3 2.5-5 4-6" />
      <path d="M18 9c-.5-3-2.5-5-4-6" />
    </svg>
  );
}

export function IconMuscle({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 4h12" />
      <path d="M4 8h16" />
      <path d="M6 8v8a6 6 0 0 0 12 0V8" fill="currentColor" fillOpacity="0.08" />
      <path d="M9 20h6" />
      <path d="M12 16v4" />
    </svg>
  );
}

export function IconUserSingle({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="7" r="4" fill="currentColor" fillOpacity="0.08" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

export function IconUsersFamily({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="9" cy="7" r="3.5" fill="currentColor" fillOpacity="0.08" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <circle cx="17" cy="8.5" r="2.5" />
      <path d="M15 19a5 5 0 0 1 6 0" />
    </svg>
  );
}

export function IconTarget({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.08" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconChefHat({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 14h12v4H6z" />
      <path d="M6 14a4 4 0 0 1-2-7.5 4.5 4.5 0 0 1 8.5-1.5 4.5 4.5 0 0 1 8.5 1.5A4 4 0 0 1 18 14" fill="currentColor" fillOpacity="0.08" />
      <path d="M6 18h12" />
    </svg>
  );
}

export function IconCookingPot({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 10h16v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-8z" fill="currentColor" fillOpacity="0.08" />
      <path d="M2 10h20" />
      <path d="M8 6h8" />
      <path d="M12 4v2" />
      <circle cx="2" cy="13" r="1" />
      <circle cx="22" cy="13" r="1" />
    </svg>
  );
}

export function IconFlame({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3q1 4 4 6a5 5 0 0 1 .5 8 6 6 0 0 1-9 0 6 6 0 0 1 1-9q2.5-2.5 3.5-5z" fill="currentColor" fillOpacity="0.08" />
    </svg>
  );
}

export function IconCheck({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconPlus({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconLock({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" fillOpacity="0.08" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function IconUserPlus({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="10" cy="8" r="4" fill="currentColor" fillOpacity="0.08" />
      <path d="M3 21a7 7 0 0 1 14 0" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  );
}
