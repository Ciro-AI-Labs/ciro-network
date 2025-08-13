'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProtectedPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.replace(next);
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-gray-900/50 border border-gray-700 p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-4">Protected Area</h1>
        <p className="text-sm text-gray-400 mb-4">Enter the access password to continue.</p>
        <input
          type="password"
          className="w-full p-3 rounded bg-black border border-gray-700 mb-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition-colors p-3 rounded font-semibold">
          Unlock
        </button>
      </form>
    </div>
  );
}

