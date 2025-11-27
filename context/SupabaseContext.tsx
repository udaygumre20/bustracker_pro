import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// @ts-ignore - Supabase is loaded from a script tag in index.html
const SupabaseGlobal = window.supabase;

// A simple mock client for demonstration purposes when Supabase is not configured
const createMockSupabaseClient = (): any => {
  const mockChannel = {
    on: (event: string, filter: any, callback: (payload: any) => void) => {
      console.log(`[MOCK] Registered listener for event "${filter.event}"`);
      return mockChannel;
    },
    subscribe: (callback?: (status: string) => void) => {
      console.log(`[MOCK] Subscribed to channel.`);
      if (callback) callback('SUBSCRIBED');
      return mockChannel;
    },
    send: (payload: any) => {
      console.log(`[MOCK] Sending payload:`, payload);
    },
    unsubscribe: () => {
      console.log(`[MOCK] Unsubscribed from channel.`);
      return Promise.resolve('ok');
    }
  };

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      signInWithPassword: () => Promise.resolve({ error: new Error("Mock mode: Supabase not configured.") }),
      signOut: () => Promise.resolve({ error: null }),
    },
    channel: (name: string) => {
      console.log(`[MOCK] Accessing channel: ${name}`);
      return mockChannel;
    },
    removeChannel: (channel: any) => {
      console.log(`[MOCK] Removing channel.`);
      if (channel && channel.unsubscribe) {
        channel.unsubscribe();
      }
    },
  };
};

interface SupabaseContextType {
  supabase: any | null;
  isMock: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [supabase, setSupabase] = useState<any | null>(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey && SupabaseGlobal) {
      setSupabase(SupabaseGlobal.createClient(supabaseUrl, supabaseAnonKey));
      setIsMock(false);
      console.log("Supabase client initialized.");
    } else {
      console.warn("Supabase credentials not found. Running in mock mode.");
      setSupabase(createMockSupabaseClient());
      setIsMock(true);
    }
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, isMock }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
