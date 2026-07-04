import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setStatus('Error: ' + error.message);
      else setStatus('Connected. Session: ' + (data.session ? 'active' : 'none (expected, not logged in yet)'));
    });
  }, []);

  return <div style={{ padding: 40 }}><h1>DataRey Dashboard</h1><p>{status}</p></div>;
}

export default App;