import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import supabase from '../lib/supabase';
import { ContractorInfo } from '../types';

interface AuthContextState {
  session: Session | null;
  profile: ContractorInfo | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextState>({
  session: null,
  profile: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ContractorInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session) {
        fetchProfile(data.session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, sess) => {
      setSession(sess);
      if (sess) {
        fetchProfile(sess.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as ContractorInfo);
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
