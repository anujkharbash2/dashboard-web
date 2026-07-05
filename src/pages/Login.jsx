import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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
        shouldCreateUser: false,
      },
    });

    setStatus(error ? 'error: ' + error.message : 'sent');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <p className="font-medium text-center mb-1">DataRey</p>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sign in with your email — invite-only during our pilot.
          </p>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending...' : 'Send magic link'}
            </Button>
          </form>
          {status === 'sent' && (
            <p className="text-sm text-center text-muted-foreground mt-4">
              Check your email for a sign-in link.
            </p>
          )}
          {status?.startsWith('error') && (
            <p className="text-sm text-center text-destructive mt-4">{status}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}