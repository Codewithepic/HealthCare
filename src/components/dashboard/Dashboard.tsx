import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Settings,
  FileText,
  Users,
  CloudOff,
  Cloud,
  Menu,
  CalendarDays,
  Moon,
  Sun,
  User,
  Shield,  Lock,
  LogOut,
  Wallet
}from "lucide-react";
import MedicalRecordsList from "../records/MedicalRecordsList";
import ProviderAccessManager from "../access/ProviderAccessManager";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import {
  ChangePasswordModal,
  TwoFactorAuthModal,
  ManageDevicesModal,
  PrivacySettingsModal,
  EditProfileModal
} from "./SettingsModals";
import HealthcareVerification from "../verification/HealthcareVerification";
import EmbeddedWalletCard from "../auth/EmbeddedWalletCard";
import CivicAuthStatus from "../auth/CivicAuthStatus";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "access_request" | "record_update" | "system";
  timestamp: Date;
  read: boolean;
}

interface DashboardProps {
  userName?: string;
  userAvatar?: string;
  userEmail?: string;
  userWallet?: string | null;
  authProvider?: string;
  isOnline?: boolean;
  notifications?: Notification[];
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  onLogout?: () => void;
}

const Dashboard = ({
  userName = "Healthcare User",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=healthcare-user",
  userEmail,
  userWallet,
  authProvider,
  isOnline = true,
  isDarkMode = false,
  toggleTheme = () => {},
  onLogout = () => {},
  notifications = [
    {
      id: "1",
      title: "Access Request",
      message: "Dr. Smith requests access to your medical records",
      type: "access_request",
      timestamp: new Date(),
      read: false,
    },
    {
      id: "2",
      title: "Record Updated",
      message: "Your lab results have been added to your records",
      type: "record_update",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      read: true,
    },
    {
      id: "3",
      title: "System Update",
      message: "Platform security update completed",
      type: "system",
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      read: true,
    },
  ],
}: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("records");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [textSize, setTextSize] = useState("medium");

  // Function to handle text size changes
  const handleTextSizeChange = (size: string) => {
    setTextSize(size);
    document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
    
    switch (size) {
      case "small":
        document.documentElement.classList.add("text-sm");
        break;
      case "medium":
        document.documentElement.classList.add("text-base");
        break;
      case "large":
        document.documentElement.classList.add("text-lg");
        break;
      default:
        break;
    }
  };

  // Various modal state handlers
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showManageDevicesModal, setShowManageDevicesModal] = useState(false);
  const [showPrivacySettingsModal, setShowPrivacySettingsModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Function to sync data
  const [isSyncing, setIsSyncing] = useState(false);
  const handleSyncData = () => {
    setIsSyncing(true);
    // Simulate syncing process
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  // Function to handle caching preference
  const [cachingPreference, setCachingPreference] = useState("essential");
  
  // Welcome banner visibility control
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  
  // Effect to hide welcome banner after 5 seconds
  useEffect(() => {
    if (showWelcomeBanner) {
      const timer = setTimeout(() => {
        setShowWelcomeBanner(false);
      }, 5000); // 5 seconds
      
      // Clean up the timer on component unmount
      return () => clearTimeout(timer);
    }
  }, [showWelcomeBanner]);

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read,
  ).length;
  return (
    <div className="flex flex-col h-screen bg-background">      {/* Welcome Banner */}
      {showWelcomeBanner && (
        <div className="bg-[#0f172a] text-white p-4">
          <div className="container mx-auto">
            <h2 className="text-xl font-semibold">Welcome, {userName || userEmail?.split('@')[0] || "Healthcare User"}!</h2>
            <p className="text-sm opacity-80">You're now logged in to your secure healthcare identity portal</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="border-b bg-background p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <img 
              src="/healthcare-identity-logo.svg" 
              alt="Healthcare Identity" 
              className="h-8 w-8 mr-2" 
            />
            <h1 className="text-xl font-bold">Healthcare Identity Platform</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-background border rounded-md shadow-lg z-50">
                <div className="p-3 border-b">
                  <h3 className="font-medium">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b hover:bg-muted cursor-pointer ${!notification.read ? "bg-muted/50" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge
                          variant={notification.read ? "outline" : "default"}
                          className="text-xs"
                        >
                          {notification.read ? "Read" : "New"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full">
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="cursor-pointer">
                  <Avatar>
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback>{userName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback>{userName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-semibold">{userName}</h4>
                    <p className="text-xs text-muted-foreground">Patient ID: #P-283791</p>
                    <div className="text-xs space-y-1 mt-2">
                      {userWallet && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Wallet:</span>
                          <span className="font-mono" title={userWallet}>
                            {userWallet.substring(0, 6)}...{userWallet.substring(userWallet.length - 4)}
                          </span>
                        </div>
                      )}
                      {authProvider && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Auth Method:</span>
                          <span className="capitalize">{authProvider}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Insurance:</span>
                        <span>BlueCross #BC-4419</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Last Visit:</span>
                        <span>May 15, 2023</span>
                      </div>
                    </div>
                    <div className="flex items-center pt-2">
                      <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-xs text-muted-foreground">
                        Member since March 2020
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs flex items-center justify-center"
                        onClick={() => {
                          setActiveTab("verification");
                          setShowMobileMenu(true);
                        }}
                      >
                        <Shield className="mr-2 h-3 w-3" />
                        Verify Identity
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs flex items-center justify-center"
                        onClick={onLogout}
                      >
                        <LogOut className="mr-2 h-3 w-3" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <div>
              <div className="font-medium">{userName}</div>
              <div className="text-sm text-muted-foreground flex items-center">
                <span className={`mr-1.5 h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile unless toggled */}
        <aside
          className={`${showMobileMenu ? "block" : "hidden"} md:block w-64 border-r bg-background p-4 overflow-y-auto`}
        >
          <div className="flex items-center mb-6 pl-2">
            <img 
              src="/healthcare-identity-logo.svg" 
              alt="Healthcare Identity" 
              className="h-10 w-10 mr-3" 
            />
            <span className="text-lg font-semibold">Healthcare ID</span>
          </div>
          
          <nav className="space-y-2">
            <Button
              variant={activeTab === "records" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("records")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Medical Records
            </Button>            <Button              variant={activeTab === "access" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("access")}
            >
              <Users className="mr-2 h-4 w-4" />
              Provider Access
            </Button>
            <Button
              variant={activeTab === "verification" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("verification")}
            >
              <Shield className="mr-2 h-4 w-4" />
              Identity Verification
            </Button>
            <Button
              variant={activeTab === "wallet" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("wallet")}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Embedded Wallet
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
          
          {/* Logout button */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Blockchain status */}
          <div className="mt-8 p-3 border rounded-md bg-muted/30">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Wallet className="mr-1.5 h-4 w-4 text-primary" />
              Embedded Wallet
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Connected to {authProvider === 'civic' ? 'Solana DevNet' : 'Blockchain'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Identity {userWallet ? 'Verified with Civic Auth' : 'Pending'}</span>
            </div>
            {userWallet && (
              <div className="flex items-center gap-2 text-xs mt-1 overflow-hidden">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="truncate" title={userWallet}>Wallet: {userWallet.substring(0, 8)}...</span>
              </div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              Last synced: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === "records" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Medical Records</h2>
              <MedicalRecordsList />
            </div>
          )}

          {activeTab === "access" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Provider Access Management
              </h2>
              <ProviderAccessManager />
            </div>
          )}

          {activeTab === "verification" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Healthcare Identity Verification
              </h2>
              <div className="text-sm text-muted-foreground mb-4">
                Verify your healthcare role using your blockchain identity. This secure verification process
                enables you to access role-specific features and permissions.
              </div>
              <HealthcareVerification 
                userData={{
                  name: userName,
                  email: userEmail,
                  wallet_address: userWallet,
                  provider: authProvider
                }}
                onVerificationComplete={(verified, role) => {
                  console.log("Verification complete:", verified, role);
                  // In a real app, we would update the user's profile with their verified role
                }}
              />
            </div>
          )}

          {activeTab === "wallet" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Healthcare Embedded Wallet
              </h2>
              <div className="text-sm text-muted-foreground mb-4">
                Your secure embedded wallet powered by Civic Auth. This wallet provides seamless blockchain 
                integration for your healthcare identity and credentials without requiring separate wallet management.
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <EmbeddedWalletCard />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Auth Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CivicAuthStatus />
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Healthcare Credentials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      Your healthcare credentials are securely stored and managed through your embedded wallet. 
                      These verifiable credentials can be used to prove your identity and healthcare role 
                      while maintaining your privacy and data security.
                    </div>
                    
                    <div className="mt-4 grid gap-3">
                      {/* Example credentials - in a real app these would be actual verifiable credentials */}
                      <div className="p-3 border rounded-md flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Healthcare Professional</div>
                          <div className="text-xs text-muted-foreground">Verified by Civic Auth • Valid until Dec 2023</div>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-md flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Patient Medical Access</div>
                          <div className="text-xs text-muted-foreground">Verified by Civic Auth • Valid until Jan 2024</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Account Settings</h2>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 items-center">
                        <label className="text-sm font-medium">Name</label>
                        <p className="text-sm">{userName}</p>
                      </div>
                      <div className="grid grid-cols-2 items-center">
                        <label className="text-sm font-medium">Email</label>
                        <p className="text-sm">{userEmail || "sarah.johnson@example.com"}</p>
                      </div>
                      <div className="grid grid-cols-2 items-center">
                        <label className="text-sm font-medium">Phone</label>
                        <p className="text-sm">+1 (555) 123-4567</p>
                      </div>
                      {userWallet && (
                        <div className="grid grid-cols-2 items-center">
                          <label className="text-sm font-medium">Wallet Address</label>
                          <p className="text-sm truncate" title={userWallet}>
                            {userWallet.substring(0, 6)}...{userWallet.substring(userWallet.length - 4)}
                          </p>
                        </div>
                      )}
                      {authProvider && (
                        <div className="grid grid-cols-2 items-center">                          <label className="text-sm font-medium">Auth Provider</label>
                          <div className="text-sm">
                            <Badge variant="outline" className="capitalize">
                              {authProvider}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <div className="pt-2 flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => setShowEditProfileModal(true)}
                        >
                          <User className="h-4 w-4 mr-1" /> Edit Profile
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
                          onClick={onLogout}
                        >
                          <LogOut className="h-4 w-4 mr-1" /> Sign Out
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-primary" />
                      Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium block mb-2">Theme</label>
                        <Tabs 
                          defaultValue={isDarkMode ? "dark" : "light"}
                          onValueChange={(value) => {
                            if (value === "dark" && !isDarkMode) toggleTheme();
                            if (value === "light" && isDarkMode) toggleTheme();
                          }}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger 
                              value="light" 
                              className={!isDarkMode ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                            >
                              <Sun className="h-4 w-4 mr-2" /> Light
                            </TabsTrigger>
                            <TabsTrigger 
                              value="dark" 
                              className={isDarkMode ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
                            >
                              <Moon className="h-4 w-4 mr-2" /> Dark
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">Text Size</label>
                        <Tabs 
                          defaultValue={textSize}
                          onValueChange={handleTextSizeChange}
                        >
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="small">Small</TabsTrigger>
                            <TabsTrigger value="medium">Medium</TabsTrigger>
                            <TabsTrigger value="large">Large</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Privacy & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setShowChangePasswordModal(true)}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setShowTwoFactorModal(true)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Two-Factor Authentication
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setShowManageDevicesModal(true)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Devices
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setShowPrivacySettingsModal(true)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Privacy Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <CloudOff className="h-5 w-5 text-primary" />
                      Offline Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">
                          Data Caching
                        </label>
                        <p className="text-xs text-muted-foreground mb-3">
                          Control which data is available when offline
                        </p>
                        <Tabs 
                          defaultValue={cachingPreference}
                          onValueChange={setCachingPreference}
                        >
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="minimal">Minimal</TabsTrigger>
                            <TabsTrigger value="essential">Essential</TabsTrigger>
                            <TabsTrigger value="all">All Data</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleSyncData}
                        disabled={isSyncing}
                      >
                        <Cloud className="h-4 w-4 mr-2" />
                        {isSyncing ? "Syncing..." : "Sync Data Now"}
                      </Button>
                      
                      {isSyncing && (
                        <div className="space-y-2 pt-1">
                          <Progress value={45} className="h-2" />
                          <p className="text-xs text-muted-foreground text-center">Syncing data...</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add modals */}
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />
      <TwoFactorAuthModal 
        isOpen={showTwoFactorModal} 
        onClose={() => setShowTwoFactorModal(false)} 
      />
      <ManageDevicesModal 
        isOpen={showManageDevicesModal} 
        onClose={() => setShowManageDevicesModal(false)} 
      />
      <PrivacySettingsModal 
        isOpen={showPrivacySettingsModal} 
        onClose={() => setShowPrivacySettingsModal(false)} 
      />
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
    </div>
  );
};

export default Dashboard;
