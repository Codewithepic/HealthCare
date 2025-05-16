import React, { useState } from "react";
import {
  Shield,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Provider {
  id: string;
  name: string;
  specialty: string;
  organization: string;
  accessLevel: "full" | "partial" | "none";
  lastAccessed?: string;
  avatar?: string;
}

interface AccessRequest {
  id: string;
  providerId: string;
  providerName: string;
  providerSpecialty: string;
  providerOrganization: string;
  requestDate: string;
  requestReason: string;
  accessType: "full" | "partial";
  status: "pending";
  avatar?: string;
}

const ProviderAccessManager = () => {
  const [activeTab, setActiveTab] = useState("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(
    null,
  );
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  // Mock data for providers with current access
  const [providers, setProviders] = useState<Provider[]>([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      organization: "Heart Health Medical Center",
      accessLevel: "full",
      lastAccessed: "2023-06-15",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Neurology",
      organization: "Central Neuroscience Institute",
      accessLevel: "partial",
      lastAccessed: "2023-06-10",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialty: "Primary Care",
      organization: "Community Health Partners",
      accessLevel: "full",
      lastAccessed: "2023-06-18",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    },
    {
      id: "4",
      name: "Dr. James Wilson",
      specialty: "Orthopedics",
      organization: "Advanced Orthopedic Center",
      accessLevel: "partial",
      lastAccessed: "2023-06-05",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
    },
  ]);

  // Mock data for pending access requests
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([
    {
      id: "req1",
      providerId: "5",
      providerName: "Dr. Lisa Thompson",
      providerSpecialty: "Endocrinology",
      providerOrganization: "Diabetes Care Center",
      requestDate: "2023-06-17",
      requestReason:
        "Need to review medical history for diabetes treatment plan",
      accessType: "partial",
      status: "pending",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
    },
    {
      id: "req2",
      providerId: "6",
      providerName: "Dr. Robert Kim",
      providerSpecialty: "Pulmonology",
      providerOrganization: "Respiratory Health Institute",
      requestDate: "2023-06-16",
      requestReason: "Follow-up on recent respiratory symptoms and treatment",
      accessType: "full",
      status: "pending",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
    },
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilterSpecialty(value);
  };

  const handleAccessChange = (
    provider: Provider,
    newLevel: "full" | "partial" | "none",
  ) => {
    setSelectedProvider(provider);
    setConfirmDialogOpen(true);
  };

  const confirmAccessChange = () => {
    if (selectedProvider) {
      const updatedProviders = providers.map((p) =>
        p.id === selectedProvider.id
          ? { ...p, accessLevel: selectedProvider.accessLevel }
          : p,
      );
      setProviders(updatedProviders);
      setConfirmDialogOpen(false);
      setSelectedProvider(null);
    }
  };

  const handleRequestAction = (
    request: AccessRequest,
    action: "approve" | "deny",
  ) => {
    setSelectedRequest(request);
    setRequestDialogOpen(true);
  };

  const confirmRequestAction = (action: "approve" | "deny") => {
    if (selectedRequest) {
      if (action === "approve") {
        // Add provider to the list with approved access
        const newProvider: Provider = {
          id: selectedRequest.providerId,
          name: selectedRequest.providerName,
          specialty: selectedRequest.providerSpecialty,
          organization: selectedRequest.providerOrganization,
          accessLevel: selectedRequest.accessType,
          lastAccessed: new Date().toISOString().split("T")[0],
          avatar: selectedRequest.avatar,
        };
        setProviders([...providers, newProvider]);
      }

      // Remove the request from pending list
      setAccessRequests(
        accessRequests.filter((req) => req.id !== selectedRequest.id),
      );
      setRequestDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterSpecialty === "all" || provider.specialty === filterSpecialty;
    return matchesSearch && matchesFilter;
  });

  const specialties = Array.from(new Set(providers.map((p) => p.specialty)));

  return (
    <div className="w-full h-full bg-background p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Provider Access Manager</h1>
            <p className="text-muted-foreground">
              Manage healthcare provider access to your medical records
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" /> Blockchain Secured
            </Badge>
          </div>
        </div>

        <Tabs
          defaultValue="current"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="current" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" /> Current Access
                <Badge variant="secondary" className="ml-1">
                  {providers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending Requests
                <Badge variant="secondary" className="ml-1">
                  {accessRequests.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search providers..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Select
                value={filterSpecialty}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter specialty" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="current" className="space-y-4">
            {filteredProviders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <UserX className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No providers found</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    {searchQuery || filterSpecialty
                      ? "No providers match your search criteria."
                      : "You haven't granted access to any healthcare providers yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredProviders.map((provider) => (
                  <Card key={provider.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={provider.avatar}
                              alt={provider.name}
                            />
                            <AvatarFallback>
                              {provider.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{provider.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {provider.specialty} • {provider.organization}
                            </p>
                            <div className="flex items-center mt-1">
                              <Badge
                                variant={
                                  provider.accessLevel === "full"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {provider.accessLevel === "full"
                                  ? "Full Access"
                                  : "Partial Access"}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-2">
                                Last accessed: {provider.lastAccessed}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Partial</span>
                            <Switch
                              checked={provider.accessLevel === "full"}
                              onCheckedChange={() =>
                                handleAccessChange(
                                  provider,
                                  provider.accessLevel === "full"
                                    ? "partial"
                                    : "full",
                                )
                              }
                            />
                            <span className="text-sm font-medium">Full</span>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Revoke Access
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Revoke Access
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to revoke{" "}
                                  {provider.name}'s access to your medical
                                  records? This action will be recorded on the
                                  blockchain and cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    setProviders(
                                      providers.filter(
                                        (p) => p.id !== provider.id,
                                      ),
                                    );
                                  }}
                                >
                                  Yes, Revoke Access
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {accessRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No pending requests</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    You don't have any pending access requests from healthcare
                    providers.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {accessRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={request.avatar}
                              alt={request.providerName}
                            />
                            <AvatarFallback>
                              {request.providerName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">
                                {request.providerName}
                              </h3>
                              <Badge variant="outline" className="ml-2 text-xs">
                                New Request
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.providerSpecialty} •{" "}
                              {request.providerOrganization}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Requested on {request.requestDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestAction(request, "deny")}
                          >
                            Deny
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleRequestAction(request, "approve")
                            }
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 bg-muted/50 p-3 rounded-md">
                        <p className="text-sm font-medium">Request Reason:</p>
                        <p className="text-sm mt-1">{request.requestReason}</p>
                        <div className="flex items-center mt-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground mr-1" />
                          <p className="text-xs text-muted-foreground">
                            Requesting{" "}
                            {request.accessType === "full" ? "full" : "partial"}{" "}
                            access to your medical records
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirm Access Change Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Access Change</DialogTitle>
            <DialogDescription>
              {selectedProvider && (
                <>
                  You are about to change {selectedProvider.name}'s access level
                  to
                  <span className="font-medium">
                    {selectedProvider.accessLevel === "full"
                      ? " full"
                      : " partial"}
                  </span>
                  . This change will be recorded on the blockchain.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmAccessChange}>Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Action Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Request Action</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Are you sure you want to grant {selectedRequest.providerName}
                  <span className="font-medium">
                    {selectedRequest.accessType === "full"
                      ? " full"
                      : " partial"}
                  </span>{" "}
                  access to your medical records? This action will be recorded
                  on the blockchain.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRequestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => confirmRequestAction("approve")}>
              Approve Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderAccessManager;
