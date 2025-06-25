import { BellDot, MessageCircle, LogOut, User } from "lucide-react";
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

export function TopNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = user?.email?.charAt(0).toUpperCase() || 'U';
  
  // Use full_name from user_metadata, fallback to email username, then to 'User'
  const displayName = user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'User';

  return (
    <div className="bg-background">
      <div className="flex h-16 items-center px-4 gap-4 justify-end">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/alerts">
            <BellDot className="h-5 w-5" />
          </Link>
        </Button>
        
        <Button variant="ghost" size="icon" asChild>
          <Link to="/messages">
            <MessageCircle className="h-5 w-5" />
          </Link>
        </Button>

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
    </div>
  );
}
