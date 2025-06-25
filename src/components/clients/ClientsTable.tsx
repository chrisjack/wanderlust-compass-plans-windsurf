import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ClientsSheet } from "./ClientsSheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ClientAvatar } from "./ClientAvatar";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface ClientsTableProps {
  clients: any[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  
  const organizations = Array.from(
    new Set(clients.map(client => client.organisation).filter(Boolean))
  );
  
  const statuses = Array.from(
    new Set(clients.map(client => client.status).filter(Boolean))
  );

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      searchQuery === "" || 
      client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.organisation?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      client.status === statusFilter;
    
    const matchesOrg = 
      orgFilter === "all" || 
      client.organisation === orgFilter;
    
    return matchesSearch && matchesStatus && matchesOrg;
  });

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      
      if (error) throw error;
      
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the client",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            placeholder="Search clients by name or organisation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/3"
          />
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Organisations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organisations</SelectItem>
                {organizations.map(org => (
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Organisation</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow 
                    key={client.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRowClick(client.id)}
                  >
                    <TableCell>
                      <ClientAvatar name={client.name} size="sm" />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/clients/${client.id}`} className="hover:underline text-blue-600">
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{client.organisation || "-"}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || "-"}</TableCell>
                    <TableCell>
                      {client.status && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          {client.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-blue-600"
                        onClick={() => {
                          setEditingClient(client);
                          setIsEditOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-red-600"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <ClientsSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={editingClient}
      />
    </>
  );
}
