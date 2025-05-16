import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@civic/auth/react";
import { useWalletAddress } from "@/hooks/useWalletAddress";
import { PermissionsProvider } from "@/hooks/usePermissions";
import { 
  RoleBasedAccess, 
  PatientOnly, 
  ProviderOnly, 
  ResearcherOnly, 
  AdminOnly 
} from "@/components/access/RoleBasedAccess";
import PatientDashboard from "@/components/dashboard/PatientDashboard";
import HealthcareVerification from "@/components/verification/HealthcareVerification";

export const RoleAccessDemo = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const { walletAddress, isLoading: isWalletLoading } = useWalletAddress();
  
  useEffect(() => {
    if (!isWalletLoading && !walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to access all features.",
        variant: "destructive",
      });
    }
  }, [walletAddress, isWalletLoading, toast]);

  return (
    <PermissionsProvider walletAddress={walletAddress}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Role-Based Access Control</h1>
        
        {!walletAddress ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Please log in with Civic Auth to access the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Connect your blockchain wallet to verify your healthcare identity.
                </p>
                {/* Login button would go here, but user should use the main login flow */}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="max-w-xl mx-auto">
              <HealthcareVerification 
                userData={{}} 
                onVerificationComplete={(verified, role) => {
                  if (verified) {
                    toast({
                      title: "Verification Complete",
                      description: `You've been verified as a healthcare ${role.toLowerCase()}.`,
                    });
                  }
                }} 
              />
            </div>
            
            <Tabs defaultValue="patient" className="max-w-6xl mx-auto">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="patient">Patient View</TabsTrigger>
                <TabsTrigger value="provider">Provider View</TabsTrigger>
                <TabsTrigger value="researcher">Researcher View</TabsTrigger>
                <TabsTrigger value="admin">Admin View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="patient" className="space-y-8">
                <PatientDashboard />
              </TabsContent>
              
              <TabsContent value="provider">
                <ProviderOnly>
                  <Card>
                    <CardHeader>
                      <CardTitle>Healthcare Provider Dashboard</CardTitle>
                      <CardDescription>Manage patients, records, and appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">This content is only visible to verified healthcare providers.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Patient Management</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>View and manage your patients' records</p>
                            <Button className="mt-4" variant="outline">View Patient List</Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Create Medical Records</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Create and update medical records for patients</p>
                            <Button className="mt-4" variant="outline">Create New Record</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </ProviderOnly>
              </TabsContent>
              
              <TabsContent value="researcher">
                <ResearcherOnly>
                  <Card>
                    <CardHeader>
                      <CardTitle>Research Portal</CardTitle>
                      <CardDescription>Access to anonymized health data for research</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">This content is only visible to verified researchers.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Data Analysis Tools</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Access anonymized datasets for research purposes</p>
                            <Button className="mt-4" variant="outline">Access Datasets</Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Research Participation</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Manage research studies and participant enrollment</p>
                            <Button className="mt-4" variant="outline">Manage Studies</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </ResearcherOnly>
              </TabsContent>
              
              <TabsContent value="admin">
                <AdminOnly>
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Control Panel</CardTitle>
                      <CardDescription>System management and oversight</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">This content is only visible to verified administrators.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">User Management</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Manage users, roles, and permissions</p>
                            <Button className="mt-4" variant="outline">Manage Users</Button>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">System Settings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Configure platform settings and integrations</p>
                            <Button className="mt-4" variant="outline">System Configuration</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </AdminOnly>
              </TabsContent>
            </Tabs>
            
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-xl font-semibold">Role-Based Access Examples</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RoleBasedAccess allowedRoles={['PATIENT', 'PROVIDER']}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Medical Records Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This card is visible to both patients and providers.</p>
                    </CardContent>
                  </Card>
                </RoleBasedAccess>
                
                <RoleBasedAccess allowedRoles={['PROVIDER', 'RESEARCHER', 'ADMIN']}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Research Data Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This card is visible to providers, researchers and admins.</p>
                    </CardContent>
                  </Card>
                </RoleBasedAccess>
                
                <RoleBasedAccess allowedRoles={['PROVIDER']} featureId="medical_records_edit">
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Medical Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This card requires the medical_records_edit feature permission.</p>
                    </CardContent>
                  </Card>
                </RoleBasedAccess>
                
                <RoleBasedAccess allowedRoles={['ADMIN']} featureId="user_management">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This card requires admin role and user_management permission.</p>
                    </CardContent>
                  </Card>
                </RoleBasedAccess>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionsProvider>
  );
};

export default RoleAccessDemo;
