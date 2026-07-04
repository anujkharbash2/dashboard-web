import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const { session } = useAuth();
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (!session) return;
    supabase.from('accounts').select('*').single().then(({ data, error }) => {
      if (error) console.error(error);
      else setAccount(data);
    });
  }, [session]);

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <a href="/keys">Manage API Keys</a>
      <p>Logged in as: {session?.user?.email}</p>
      {account && <p>Account plan: {account.plan} | ID: {account.id}</p>}
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  );
}