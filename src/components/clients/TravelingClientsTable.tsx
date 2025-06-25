
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plane } from "lucide-react";

interface TravelingClientsTableProps {
  clients: any[];
}

export function TravelingClientsTable({ clients }: TravelingClientsTableProps) {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Currently Traveling Clients</CardTitle>
        <p className="text-sm text-gray-500">Clients who are currently on trips</p>
      </CardHeader>
      <CardContent>
        {clients.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Organisation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || "-"}</TableCell>
                  <TableCell>{client.organisation || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full">
              <Plane className="h-8 w-8 text-gray-400" />
            </div>
            <p className="mt-4 text-gray-500">No clients are currently traveling</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
