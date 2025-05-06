import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  ChevronDown, 
  Home, 
  LogOut, 
  Menu, 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  Heart, 
  UserPlus 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/properties" },
    { name: "Saved", href: "/favorites" },
    { name: "Messages", href: "/messages" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary-600 text-2xl font-bold cursor-pointer">FlatFinder</span>
              </Link>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a className={cn(
                    isActive(item.href)
                      ? "border-primary-600 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "border-b-2 px-1 pt-1 text-sm font-medium h-16 flex items-center"
                  )}>
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center">
              {user?.role === 'owner' ? (
                <Link href="/add-property">
                  <Button variant="ghost" size="sm" className="flex items-center text-gray-500">
                    <Plus className="h-4 w-4 mr-2" />
                    List Your Property
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="flex items-center text-gray-500">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Become an Owner
                  </Button>
                </Link>
              )}

              {user ? (
                <>
                  <Button variant="ghost" size="icon" className="ml-4 text-gray-400">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-3 flex items-center">
                        <Avatar className="h-8 w-8">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          ) : (
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="p-2 text-sm">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <Link href="/dashboard">
                        <DropdownMenuItem>
                          <Home className="mr-2 h-4 w-4" />
                          Dashboard
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/favorites">
                        <DropdownMenuItem>
                          <Heart className="mr-2 h-4 w-4" />
                          Saved Properties
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/messages">
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Messages
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/account">
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Account Settings
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex space-x-2 ml-4">
                  <Link href="/auth">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="pt-10">
                  <div className="flex flex-col h-full">
                    {user ? (
                      <div className="flex items-center mb-6 pb-4 border-b">
                        <Avatar className="h-10 w-10">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          ) : (
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2 mb-6 pb-4 border-b">
                        <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full">Sign Up</Button>
                        </Link>
                        <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">Sign In</Button>
                        </Link>
                      </div>
                    )}
                    
                    <nav className="flex flex-col space-y-1">
                      {navigation.map((item) => (
                        <Link key={item.name} href={item.href}>
                          <a 
                            className={cn(
                              isActive(item.href)
                                ? "bg-primary-50 text-primary-600"
                                : "text-gray-700 hover:bg-gray-50",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.name}
                          </a>
                        </Link>
                      ))}
                      
                      <Link href="/search" onClick={() => setMobileMenuOpen(false)}>
                        <a className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                          <Search className="mr-2 h-4 w-4" /> 
                          Search Properties
                        </a>
                      </Link>
                      
                      {user && (
                        <>
                          <div className="h-px bg-gray-200 my-2"></div>
                          
                          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <a className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                              <Home className="mr-2 h-4 w-4" /> 
                              Dashboard
                            </a>
                          </Link>
                          
                          {user.role === 'owner' && (
                            <Link href="/add-property" onClick={() => setMobileMenuOpen(false)}>
                              <a className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                                <Plus className="mr-2 h-4 w-4" /> 
                                List Your Property
                              </a>
                            </Link>
                          )}
                          
                          <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                            <a className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                              <Settings className="mr-2 h-4 w-4" /> 
                              Account Settings
                            </a>
                          </Link>
                          
                          <button 
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                            onClick={() => {
                              handleLogout();
                              setMobileMenuOpen(false);
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" /> 
                            Logout
                          </button>
                        </>
                      )}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
