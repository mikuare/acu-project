import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserCredentialsContextType {
  isUserAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const UserCredentialsContext = createContext<UserCredentialsContextType | undefined>(undefined);

export const UserCredentialsProvider = ({ children }: { children: ReactNode }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedAuth = localStorage.getItem('regularUserAuth');
    if (storedAuth) {
      try {
        const { username: storedUsername, timestamp } = JSON.parse(storedAuth);
        // Check if the session is less than 24 hours old
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (now - timestamp < twentyFourHours) {
          setIsUserAuthenticated(true);
          setUsername(storedUsername);
        } else {
          // Session expired
          localStorage.removeItem('regularUserAuth');
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('regularUserAuth');
      }
    }
  }, []);

  const login = async (inputUsername: string, inputPassword: string): Promise<boolean> => {
    try {
      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Fetch the user credentials from Supabase
      const { data, error } = await supabase
        .from('user_credentials')
        .select('*')
        .eq('username', inputUsername)
        .single();

      if (error || !data) {
        console.error('Error fetching user credentials:', error);
        return false;
      }

      // Simple password check (in production, use proper hashing)
      if (data.password === inputPassword) {
        setIsUserAuthenticated(true);
        setUsername(inputUsername);
        
        // Store in localStorage with timestamp
        localStorage.setItem('regularUserAuth', JSON.stringify({
          username: inputUsername,
          timestamp: Date.now()
        }));
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsUserAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('regularUserAuth');
  };

  return (
    <UserCredentialsContext.Provider value={{ isUserAuthenticated, username, login, logout }}>
      {children}
    </UserCredentialsContext.Provider>
  );
};

export const useUserCredentials = () => {
  const context = useContext(UserCredentialsContext);
  if (context === undefined) {
    throw new Error('useUserCredentials must be used within a UserCredentialsProvider');
  }
  return context;
};

