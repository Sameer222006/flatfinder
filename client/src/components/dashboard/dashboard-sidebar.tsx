import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Plus, 
  MessageSquare,
  Heart,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  Menu
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  ownerOnly?: boolean;
}

export function DashboardSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOwner = user?.role === 'owner';

  const navigation: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Profile", href: "/account", icon: User },
    { name: "My Properties", href: "/dashboard/properties", icon: Home, ownerOnly: true },
    { name: "Add Property", href: "/add-property", icon: Plus, ownerOnly: true },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Favorites", href: "/favorites", icon: Heart },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const filteredNavigation = navigation.filter(item => !item.ownerOnly || isOwner);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden p-4 border-b flex items-center justify-between bg-white">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pt-12">
            {user && (
              <div className="flex items-center space-x-3 mb-8">
                <Avatar>
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            )}
            <nav className="flex flex-col space-y-1">
              {filteredNavigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a 
                    className={cn(
                      location === item.href
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-600 hover:bg-gray-50",
                      "flex items-center px-3 py-2 rounded-md group"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon 
                      className={cn(
                        location === item.href
                          ? "text-primary-600"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 h-5 w-5 flex-shrink-0"
                      )}
                    />
                    <span>{item.name}</span>
                  </a>
                </Link>
              ))}
              
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md group"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                <span>Logout</span>
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="px-6 pb-3 border-b border-gray-200">
            <Link href="/">
              <a className="text-primary-600 text-xl font-bold">FlatFinder</a>
            </Link>
          </div>
          {user && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Avatar>
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{isOwner ? 'Property Owner' : 'Tenant'}</p>
                </div>
              </div>
            </div>
          )}
          <div className="mt-5 flex-1 flex flex-col px-3">
            <nav className="flex-1 space-y-1">
              {filteredNavigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a 
                    className={cn(
                      location === item.href
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-600 hover:bg-gray-50",
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium group"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        location === item.href
                          ? "text-primary-600"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 h-5 w-5 flex-shrink-0"
                      )}
                    />
                    <span>{item.name}</span>
                  </a>
                </Link>
              ))}
            </nav>
          </div>

          <div className="px-3 pb-3">
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-600" 
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
