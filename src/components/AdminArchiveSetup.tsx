import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ensureArchiveColumnsForAllUsers, getArchiveColumnStats } from '@/lib/admin-archive-setup';

export function AdminArchiveSetup() {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<{
    totalUsers: number;
    usersWithArchive: number;
    usersWithoutArchive: number;
  } | null>(null);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    createdCount: number;
    errorCount: number;
  } | null>(null);
  const { toast } = useToast();

  const handleRunSetup = async () => {
    setIsRunning(true);
    try {
      const result = await ensureArchiveColumnsForAllUsers();
      setLastResult(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Warning",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error running Archive setup:', error);
      toast({
        title: "Error",
        description: "Failed to run Archive setup",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleGetStats = async () => {
    try {
      const statsData = await getArchiveColumnStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error getting stats:', error);
      toast({
        title: "Error",
        description: "Failed to get Archive column statistics",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Archive Column Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This utility ensures that all users have an Archive column in their planner.
            Use this to set up Archive columns for existing users.
          </p>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleRunSetup} 
              disabled={isRunning}
              variant="default"
            >
              {isRunning ? "Running..." : "Run Archive Setup for All Users"}
            </Button>
            
            <Button 
              onClick={handleGetStats} 
              variant="outline"
            >
              Get Statistics
            </Button>
          </div>

          {lastResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Last Run Result:</h4>
              <p className="text-sm">{lastResult.message}</p>
              <p className="text-sm text-gray-600 mt-1">
                Created: {lastResult.createdCount} | Errors: {lastResult.errorCount}
              </p>
            </div>
          )}

          {stats && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Archive Column Statistics:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Users:</span> {stats.totalUsers}
                </div>
                <div>
                  <span className="font-medium">With Archive:</span> {stats.usersWithArchive}
                </div>
                <div>
                  <span className="font-medium">Without Archive:</span> {stats.usersWithoutArchive}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 