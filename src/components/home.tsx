import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Moon, 
  Sun, 
  LogOut
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AuthFlow from "./auth/AuthFlow";
import AuthPage from "./auth/AuthPage";
import { useUser } from "@civic/auth/react";
import Dashboard from "./dashboard/Dashboard";
import PatientDashboard from "./dashboard/PatientDashboard";
import EmbeddedWalletCard from "./auth/EmbeddedWalletCard";
import CivicAuthStatus from "./auth/CivicAuthStatus";
import { generateAvatarUrl, getUserDisplayName, extractWalletAddress } from "@/lib/userDataUtils";
import { PermissionsProvider } from "@/hooks/usePermissions";
import { 
  RoleBasedAccess, 
  PatientOnly, 
  ProviderOnly, 
  ResearcherOnly, 
  AdminOnly 
} from "@/components/access/RoleBasedAccess";
import HealthcareVerification from "@/components/verification/HealthcareVerification";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for user preference in localStorage or use system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useUser();
  const { toast } = useToast();

  // User data from auth provider or database
  const [userData, setUserData] = useState(user ? {
    id: user.id || "user-id-placeholder",
    name: getUserDisplayName(user),
    email: user.email || "patient@example.com",
    avatar: generateAvatarUrl(user),
    wallet: extractWalletAddress(user),
    provider: "Civic Auth"
  } : null);

  // Effect to apply dark theme class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Check authentication status with Civic Auth
  useEffect(() => {
    if (user) {
      // Extract wallet address from user object
      const walletAddress = extractWalletAddress(user);
      console.log('Home: Civic Auth user object:', user);
      console.log('Home: Extracted wallet address:', walletAddress);
      
      setIsAuthenticated(true);
      // Update userData when user changes
      setUserData({
        id: user.id || "user-id-placeholder",
        name: getUserDisplayName(user),
        email: user.email || "patient@example.com",
        avatar: generateAvatarUrl(user),
        wallet: walletAddress,
        provider: "Civic Auth"
      });
    } else {
      setIsAuthenticated(false);
      setUserData(null);
    }
  }, [user]);

  // Handle authentication from login flow
  const handleAuthentication = (status: boolean, userData?: any) => {
    setIsAuthenticated(status);
    
    // If userData is provided and authentication is successful, update the userData state
    if (status && userData && !user) {
      const displayName = getUserDisplayName(userData);
      const walletAddress = userData.walletAddress || extractWalletAddress(userData);
      
      setUserData({
        id: "temp-user-id",
        name: displayName,
        email: userData.email || "patient@example.com",
        avatar: generateAvatarUrl(userData),
        wallet: walletAddress,
        provider: userData.provider || "Email"
      });
    }
  };

  // Toggle dark/light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      if (signOut) {
        await signOut();
        console.log('Civic Auth logout successful');
        setIsAuthenticated(false);
        setUserData(null);
        toast({
          title: "Logged out successfully",
          description: "You have been signed out from your account",
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error signing out. Please try again.",
      });
    }
  };

  return (
    <div className={`min-h-screen w-full bg-background text-foreground transition-colors duration-300`}>
      {isAuthenticated ? (
        <div className="flex flex-col h-screen">
          {/* Main content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Main dashboard area */}
            <main className="flex-1 overflow-auto">
              <Dashboard 
                toggleTheme={toggleTheme}
                isDarkMode={isDarkMode}
                userName={userData?.name}
                userAvatar={userData?.avatar}
                userEmail={userData?.email}
                userWallet={userData?.wallet}
                authProvider={userData?.provider}
                onLogout={handleLogout}
              />
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <Toaster />
          
          {/* Top navbar */}
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img 
                  src="/healthcare-identity-logo.svg" 
                  alt="Healthcare Identity" 
                  className="h-10 w-10"
                />
                <div>
                  <h1 className="text-xl font-bold">Healthcare Identity</h1>
                  <p className="text-xs text-muted-foreground">Secure blockchain identity platform</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
              {/* Replace AuthFlow with our new AuthPage component */}
              <AuthPage onAuthenticate={handleAuthentication} />
            </div>
          </main>
          
          <footer className="mt-12 py-8 border-t">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <img 
                    src="/healthcare-identity-logo.svg" 
                    alt="Healthcare Identity" 
                    className="h-8 w-8 mr-3" 
                  />
                  <div>
                    <h3 className="font-bold">Healthcare Identity</h3>
                    <p className="text-xs text-muted-foreground">Secure and private identity management</p>
                  </div>
                </div>
                <div className="text-center md:text-right text-sm text-muted-foreground">
                  <p>© 2025 Healthcare Identity Platform. Powered by Civic Auth.</p>
                  <p className="mt-1">A secure blockchain identity platform.</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default Home;
