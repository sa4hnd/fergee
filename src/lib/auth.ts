import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from './firebase';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
