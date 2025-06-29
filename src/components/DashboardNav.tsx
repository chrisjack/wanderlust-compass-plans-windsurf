import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TripForm } from "@/components/TripForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Home,
  Users,
  Import,
  Plane,
  Settings,
  Menu,
  X,
  HelpCircle,
  Library,
  ListTodo,
  CalendarIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    title: "All trips",
    href: "/trips",
    icon: Plane
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users
  },
  {
    title: "Import",
    href: "/import",
    icon: Import
  },
  {
    title: "Library",
    href: "/library",
    icon: Library
  },
  {
    title: "Planner",
    href: "/planner",
    icon: CalendarIcon
  }
];

const bottomNavItems = [
  {
    title: "Support",
    href: "/support",
    icon: HelpCircle
  }
];

export function DashboardNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const { toast } = useToast();

  // List of routes to block
  const blockedRoutes = ["/trips", "/clients", "/import", "/library", "/alerts", "/messages"];

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (blockedRoutes.includes(href)) {
      e.preventDefault();
      setComingSoonOpen(true);
      setIsOpen(false);
    }
  };

  const handleCreateTripClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setComingSoonOpen(true);
  };

  const handleCreateTrip = async (data: any) => {
    try {
      const { error } = await supabase
        .from('trips')
        .insert([data])

      if (error) throw error

      toast({
        title: "Success",
        description: "Trip created successfully",
      })
      setIsCreateOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      {/* Mobile menu toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar navigation */}
      <div
        className={cn(
          "bg-white w-64 min-h-screen fixed inset-y-0 left-0 z-40 lg:translate-x-0 transform transition-transform duration-200 ease-in-out border-r",
          "lg:m-4 lg:rounded-xl lg:shadow-lg lg:border lg:mb-4 lg:pb-4",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-6 flex flex-col items-center">
            <img 
              src="/plans-logo.svg" 
              alt="Plans Logo" 
              className="h-14 mx-auto"
            />
            <Button 
              className="w-full mt-6 bg-primary hover:bg-primary/90"
              onClick={handleCreateTripClick}
            >
              New trip
              <span className="ml-2">+</span>
            </Button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = window.location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={e => handleNavClick(item.href, e)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="px-2 py-4 border-t">
            {bottomNavItems.map((item) => {
              const isActive = window.location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Coming Soon Dialog */}
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

      {/* Create Trip Sheet (disabled) */}
      {/*
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="right" className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Create Trip</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <TripForm
              onSubmit={handleCreateTrip}
              onCancel={() => setIsCreateOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
      */}
    </>
  );
}
