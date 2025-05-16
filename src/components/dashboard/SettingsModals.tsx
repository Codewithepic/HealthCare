import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Lock,
  Shield,
  Smartphone,
  LogOut,
  Check,
  AlertCircle,
  X,
  User,
} from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose }: ModalProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      // You would show a success notification here in a real app
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Change Password
          </DialogTitle>
          <DialogDescription>
            Create a new strong password for your account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmNewPassword} 
                onChange={(e) => setConfirmNewPassword(e.target.value)} 
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const TwoFactorAuthModal = ({ isOpen, onClose }: ModalProps) => {
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"setup" | "verify" | "complete">("setup");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleToggleTwoFactor = (checked: boolean) => {
    setEnableTwoFactor(checked);
    if (checked) {
      setStep("verify");
    } else {
      setStep("setup");
    }
  };

  const handleVerify = () => {
    setIsLoading(true);
    // Simulate API verification
    setTimeout(() => {
      setIsLoading(false);
      setStep("complete");
    }, 1500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable 2FA</h4>
              <p className="text-sm text-muted-foreground">
                Add a security code to your sign in process
              </p>
            </div>
            <Switch 
              checked={enableTwoFactor} 
              onCheckedChange={handleToggleTwoFactor} 
            />
          </div>
          
          {enableTwoFactor && step === "verify" && (
            <div className="border rounded p-4 mt-4 space-y-4 bg-muted/30">
              <div className="text-center">
                <div className="bg-background inline-block p-4 rounded-lg border mx-auto">
                  {/* This would be a real QR code in a production app */}
                  <div className="bg-gray-200 w-32 h-32 mx-auto flex items-center justify-center relative">
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-2">
                      {Array(16).fill(0).map((_, i) => (
                        <div 
                          key={i} 
                          className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm mt-2">Scan with Google Authenticator or similar app</p>
              </div>
              
              <div>
                <Label>Verification Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    placeholder="Enter code from app" 
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <Button onClick={handleVerify} disabled={isLoading || !verificationCode}>
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="border rounded p-4 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Two-factor authentication has been enabled for your account
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ManageDevicesModal = ({ isOpen, onClose }: ModalProps) => {
  const [devices, setDevices] = useState([
    { id: 1, name: "Windows PC", lastActive: "Now", current: true },
    { id: 2, name: "iPhone 13", lastActive: "2 hours ago", current: false },
    { id: 3, name: "MacBook Pro", lastActive: "Yesterday", current: false },
    { id: 4, name: "iPad Air", lastActive: "3 days ago", current: false },
  ]);
  
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signingOutDeviceId, setSigningOutDeviceId] = useState<number | null>(null);

  const handleSignOutDevice = (deviceId: number) => {
    setIsSigningOut(true);
    setSigningOutDeviceId(deviceId);
    
    // Simulate API call
    setTimeout(() => {
      setDevices(devices.filter(device => device.id !== deviceId));
      setIsSigningOut(false);
      setSigningOutDeviceId(null);
    }, 1000);
  };
  
  const handleSignOutAll = () => {
    setIsSigningOut(true);
    
    // Simulate API call
    setTimeout(() => {
      setDevices(devices.filter(device => device.current));
      setIsSigningOut(false);
    }, 1500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" /> Manage Devices
          </DialogTitle>
          <DialogDescription>
            View and manage devices that have access to your account
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-80 overflow-y-auto">
          {devices.map((device) => (
            <div 
              key={device.id} 
              className={`flex justify-between items-center p-3 rounded border ${device.current ? 'border-primary bg-primary/5' : ''}`}
            >
              <div>
                <div className="font-medium flex items-center">
                  {device.name}
                  {device.current && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Current</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Last active: {device.lastActive}</div>
              </div>
              {!device.current && (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isSigningOut && signingOutDeviceId === device.id}
                  onClick={() => handleSignOutDevice(device.id)}
                >
                  {isSigningOut && signingOutDeviceId === device.id ? "Signing Out..." : "Sign Out"}
                </Button>
              )}
            </div>
          ))}

          {devices.length === 1 && (
            <div className="text-center text-sm text-muted-foreground">
              No other devices are currently signed in
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between items-center">
          <Button 
            type="button" 
            variant="destructive"
            disabled={devices.length <= 1 || isSigningOut}
            onClick={handleSignOutAll}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSigningOut ? "Signing Out All..." : "Sign Out All Devices"}
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const PrivacySettingsModal = ({ isOpen, onClose }: ModalProps) => {
  const [shareData, setShareData] = useState(true);
  const [receiveEmails, setReceiveEmails] = useState(true);
  const [allowAnalytics, setAllowAnalytics] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleSave = () => {
    setIsLoading(true);
    setSuccess(false);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Privacy Settings
          </DialogTitle>
          <DialogDescription>
            Control how your data is used and who can see your information
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Share data with providers</h4>
              <p className="text-sm text-muted-foreground">
                Allow approved healthcare providers to access your medical records
              </p>
            </div>
            <Switch checked={shareData} onCheckedChange={setShareData} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email notifications</h4>
              <p className="text-sm text-muted-foreground">
                Receive important updates about your healthcare
              </p>
            </div>
            <Switch checked={receiveEmails} onCheckedChange={setReceiveEmails} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Usage analytics</h4>
              <p className="text-sm text-muted-foreground">
                Help improve our platform with anonymous usage data
              </p>
            </div>
            <Switch checked={allowAnalytics} onCheckedChange={setAllowAnalytics} />
          </div>

          {success && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-2 text-sm flex items-center text-green-800 dark:text-green-200">
              <Check className="h-4 w-4 mr-2" />
              Your privacy settings have been saved
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const EditProfileModal = ({ isOpen, onClose }: ModalProps) => {
  const [formData, setFormData] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Anytown, USA"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your personal information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name"
                value={formData.name} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address"
                value={formData.address} 
                onChange={handleChange} 
              />
            </div>
            
            {success && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-2 text-sm flex items-center text-green-800 dark:text-green-200">
                <Check className="h-4 w-4 mr-2" />
                Profile information updated successfully
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
