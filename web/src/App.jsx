import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';

export default function App() {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '420px', margin: 'auto' }}>
      <h2>KusinApp Web Portal (Sprint 1 Testing)</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('register')}
          style={{ fontWeight: activeTab === 'register' ? 'bold' : 'normal' }}>
          Registration (US-01)
        </button>
        <button 
          onClick={() => setActiveTab('login')}
          style={{ fontWeight: activeTab === 'login' ? 'bold' : 'normal' }}>
          Login (US-02)
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
        {activeTab === 'register' ? <Register /> : <Login />}
      </div>
    </div>
  );
}