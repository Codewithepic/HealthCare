import React, { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Share2,
  Lock,
  Shield,
  Calendar,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Provider {
  id: string;
  name: string;
  organization: string;
  avatar: string;
}

interface MedicalRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  provider: Provider;
  description: string;
  accessLevel: "private" | "shared";
  sharedWith: Provider[];
}

const MedicalRecordsList = ({
  records = defaultRecords,
}: {
  records?: MedicalRecord[];
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Filter records based on search query and active tab
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.provider.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "shared")
      return matchesSearch && record.accessLevel === "shared";
    if (activeTab === "private")
      return matchesSearch && record.accessLevel === "private";
    return matchesSearch;
  });

  // Sort records by date
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const toggleRecordExpansion = (id: string) => {
    setExpandedRecordId(expandedRecordId === id ? null : id);
  };

  const handleShareRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShareDialogOpen(true);
  };
  
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [viewDetailsRecord, setViewDetailsRecord] = useState<MedicalRecord | null>(null);
  
  const handleViewDetails = (record: MedicalRecord) => {
    setViewDetailsRecord(record);
    setViewDetailsDialogOpen(true);
  };
  
  const handleAuthorizeSharing = async () => {
    if (!selectedRecord) return;
    
    // Show loading state
    const loadingToast = alert("Creating blockchain attestation...");
    
    try {
      // Simulate blockchain attestation creation (would call your verificationService in reality)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would call a function to create blockchain attestation
      // For example:
      // const attestation = await createSharingAttestation(
      //   walletAddress,
      //   selectedRecord.id,
      //   selectedProvider.id,
      //   accessDuration
      // );
      
      // Generate a mock attestation ID - in a real app this would come from the blockchain
      const attestationId = `share-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      // For demo, we'll just update the UI to simulate the share action
      const selectedProvider = {
        id: "p1", 
        name: "Dr. Sarah Johnson",
        organization: "City Hospital",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
      };
      
      // In a real implementation, we would update the database with the sharing permission
      console.log(`Created attestation ${attestationId} for sharing record ${selectedRecord.id} with provider ${selectedProvider.id}`);
      
      // Show success message
      alert(`Record shared successfully!\nAttestation ID: ${attestationId}`);
      
      // Close dialog
      setShareDialogOpen(false);
    } catch (error) {
      // Handle errors
      console.error("Error sharing record:", error);
      alert("Failed to share record. Please try again.");
    }
  };

  return (
    <div className="w-full bg-background p-4 rounded-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold">Medical Records</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList>
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1"
            >
              Date{" "}
              {sortOrder === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {sortedRecords.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No medical records found
              </p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedRecords.map((record) => (
              <Collapsible
                key={record.id}
                open={expandedRecordId === record.id}
                onOpenChange={() => toggleRecordExpansion(record.id)}
                className="border rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Badge
                        variant={
                          record.accessLevel === "private"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {record.accessLevel === "private" ? (
                          <Lock className="h-3 w-3 mr-1" />
                        ) : (
                          <Share2 className="h-3 w-3 mr-1" />
                        )}
                        {record.accessLevel.charAt(0).toUpperCase() +
                          record.accessLevel.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-medium">{record.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {record.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{record.type}</Badge>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {expandedRecordId === record.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="p-4 pt-0 border-t">
                    <div className="grid gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Provider</h4>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={record.provider.avatar}
                              alt={record.provider.name}
                            />
                            <AvatarFallback>
                              {record.provider.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {record.provider.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {record.provider.organization}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Description
                        </h4>
                        <p className="text-sm">{record.description}</p>
                      </div>

                      {record.accessLevel === "shared" && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">
                            Shared With
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {record.sharedWith.map((provider) => (
                              <div
                                key={provider.id}
                                className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"
                              >
                                <Avatar className="h-5 w-5">
                                  <AvatarImage
                                    src={provider.avatar}
                                    alt={provider.name}
                                  />
                                  <AvatarFallback>
                                    {provider.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{provider.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(record)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleShareRecord(record)}
                        >
                          <Share2 className="h-4 w-4 mr-1" /> Share Record
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Medical Record</DialogTitle>
            <DialogDescription>
              Select healthcare providers to share this record with. You can
              revoke access at any time.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge>{selectedRecord.type}</Badge>
                <h3 className="font-medium">{selectedRecord.title}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Provider</label>
                  <Select defaultValue="provider1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provider1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" />
                            <AvatarFallback>SJ</AvatarFallback>
                          </Avatar>
                          <span>Dr. Sarah Johnson - City Hospital</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="provider2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=michael" />
                            <AvatarFallback>MC</AvatarFallback>
                          </Avatar>
                          <span>Dr. Michael Chen - Medical Center</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="provider3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=emily" />
                            <AvatarFallback>ER</AvatarFallback>
                          </Avatar>
                          <span>Dr. Emily Rodriguez - Health Partners</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Access Duration</label>
                  <Select defaultValue="30days">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 days</SelectItem>
                      <SelectItem value="30days">30 days</SelectItem>
                      <SelectItem value="90days">90 days</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Access Level</label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="border rounded-md p-3 flex items-center space-x-2 cursor-pointer hover:bg-accent">
                      <input type="radio" name="accessLevel" id="readonly" defaultChecked />
                      <label htmlFor="readonly" className="cursor-pointer">
                        <div className="font-medium">Read Only</div>
                        <div className="text-sm text-muted-foreground">
                          Provider can only view this record
                        </div>
                      </label>
                    </div>
                    
                    <div className="border rounded-md p-3 flex items-center space-x-2 cursor-pointer hover:bg-accent">
                      <input type="radio" name="accessLevel" id="full" />
                      <label htmlFor="full" className="cursor-pointer">
                        <div className="font-medium">Full Access</div>
                        <div className="text-sm text-muted-foreground">
                          Provider can edit this record
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4 bg-muted rounded-md border border-border">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <p className="text-sm font-medium">Blockchain Security</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This sharing action will be recorded as a blockchain attestation, 
                    creating an immutable record of your consent. 
                    You may revoke access at any time.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAuthorizeSharing}>
              <Shield className="h-4 w-4 mr-1" /> Authorize Sharing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogDescription>
              Detailed information about this medical record
            </DialogDescription>
          </DialogHeader>

          {viewDetailsRecord && (
            <div className="py-4 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{viewDetailsRecord.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{viewDetailsRecord.type}</Badge>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {viewDetailsRecord.date}
                    </div>
                  </div>
                </div>
                <Badge variant={viewDetailsRecord.accessLevel === "private" ? "outline" : "secondary"}>
                  {viewDetailsRecord.accessLevel === "private" ? (
                    <Lock className="h-3 w-3 mr-1" />
                  ) : (
                    <Share2 className="h-3 w-3 mr-1" />
                  )}
                  {viewDetailsRecord.accessLevel.charAt(0).toUpperCase() + viewDetailsRecord.accessLevel.slice(1)}
                </Badge>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Provider Information</h4>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <Avatar>
                    <AvatarImage src={viewDetailsRecord.provider.avatar} alt={viewDetailsRecord.provider.name} />
                    <AvatarFallback>{viewDetailsRecord.provider.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{viewDetailsRecord.provider.name}</p>
                    <p className="text-sm text-muted-foreground">{viewDetailsRecord.provider.organization}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <div className="p-3 bg-muted rounded-md">
                  <p>{viewDetailsRecord.description}</p>
                </div>
              </div>

              {viewDetailsRecord.accessLevel === "shared" && viewDetailsRecord.sharedWith.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Shared With</h4>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {viewDetailsRecord.sharedWith.map(provider => (
                        <div key={provider.id} className="flex items-center gap-2 p-2 bg-background rounded-md">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={provider.avatar} alt={provider.name} />
                            <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{provider.name}</p>
                            <p className="text-xs text-muted-foreground">{provider.organization}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">
                  This record is secured using blockchain technology
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button 
              variant="secondary"
              onClick={() => {
                setViewDetailsDialogOpen(false);
                if (viewDetailsRecord) handleShareRecord(viewDetailsRecord);
              }}
            >
              <Share2 className="h-4 w-4 mr-1" /> Share Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Default mock data
const defaultRecords: MedicalRecord[] = [
  {
    id: "1",
    title: "Annual Physical Examination",
    type: "Examination",
    date: "2023-10-15",
    provider: {
      id: "p1",
      name: "Dr. Sarah Johnson",
      organization: "City Hospital",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    description:
      "Routine annual physical examination with blood work and vitals. All results within normal ranges.",
    accessLevel: "shared",
    sharedWith: [
      {
        id: "p2",
        name: "Dr. Michael Chen",
        organization: "Medical Center",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      },
    ],
  },
  {
    id: "2",
    title: "COVID-19 Vaccination",
    type: "Immunization",
    date: "2023-08-22",
    provider: {
      id: "p3",
      name: "Dr. Emily Rodriguez",
      organization: "Health Partners",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    },
    description:
      "COVID-19 booster vaccination (Moderna). No adverse reactions reported.",
    accessLevel: "private",
    sharedWith: [],
  },
  {
    id: "3",
    title: "Dermatology Consultation",
    type: "Consultation",
    date: "2023-11-05",
    provider: {
      id: "p4",
      name: "Dr. James Wilson",
      organization: "Dermatology Specialists",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
    },
    description:
      "Consultation for skin rash on left arm. Diagnosed as contact dermatitis. Prescribed topical corticosteroid.",
    accessLevel: "shared",
    sharedWith: [
      {
        id: "p1",
        name: "Dr. Sarah Johnson",
        organization: "City Hospital",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      },
      {
        id: "p5",
        name: "Dr. Lisa Park",
        organization: "Allergy Center",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
      },
    ],
  },
  {
    id: "4",
    title: "Blood Test Results",
    type: "Laboratory",
    date: "2023-09-18",
    provider: {
      id: "p1",
      name: "Dr. Sarah Johnson",
      organization: "City Hospital",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    description:
      "Complete blood count and metabolic panel. Slightly elevated cholesterol levels noted.",
    accessLevel: "private",
    sharedWith: [],
  },
  {
    id: "5",
    title: "Dental Cleaning",
    type: "Dental",
    date: "2023-07-30",
    provider: {
      id: "p6",
      name: "Dr. Robert Taylor",
      organization: "Smile Dental Care",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
    },
    description:
      "Routine dental cleaning and examination. No cavities detected.",
    accessLevel: "private",
    sharedWith: [],
  },
];

export default MedicalRecordsList;
