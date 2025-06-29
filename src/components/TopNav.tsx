import { BellDot, MessageCircle, LogOut, User, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function TopNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = user?.email?.charAt(0).toUpperCase() || 'U';
  
  // Use full_name from user_metadata, fallback to email username, then to 'User'
  const displayName = user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'User';
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  // Get session status for authenticated users
  const { isWarning } = useIdleTimeout({
    timeoutDays: 14,
    warningMinutes: 5,
    onLogout: signOut
  });

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    setComingSoonOpen(true);
  };

  return (
    <div className="bg-background">
      <div className="flex h-16 items-center px-4 gap-4 justify-end">
        <Button variant="ghost" size="icon" asChild={false} onClick={handleComingSoon}>
          <BellDot className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" asChild={false} onClick={handleComingSoon}>
          <MessageCircle className="h-5 w-5" />
        </Button>
        
        {/* Session Status Indicator */}
        {user && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${isWarning ? 'bg-yellow-500' : 'bg-green-500'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isWarning ? 'Session expiring soon' : 'Session active'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <span className="font-medium">{displayName}</span>
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coming Soon</DialogTitle>
            <DialogDescription>
              This section is currently being worked on and will be available soon.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
