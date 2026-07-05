import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setStatus('sending');


    const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: window.location.origin + '/dashboard',
    shouldCreateUser: false, // invite-only: block auto-signup for unknown emails
  },
});

    if (error) {
      setStatus('error: ' + error.message);
    } else {
      setStatus('sent');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 20 }}>
      <h1>DataRey</h1>
      <p>Sign in with your email — invite-only during our pilot.</p>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 10 }}
        />
        <button type="submit" disabled={status === 'sending'} style={{ width: '100%', padding: 10 }}>
          {status === 'sending' ? 'Sending...' : 'Send magic link'}
        </button>
      </form>
      {status === 'sent' && <p>Check your email for a sign-in link.</p>}
      {status?.startsWith('error') && <p style={{ color: 'red' }}>{status}</p>}
    </div>
  );
}