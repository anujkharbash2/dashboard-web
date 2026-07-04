import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const { session } = useAuth();

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <p>Logged in as: {session?.user?.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  );
}