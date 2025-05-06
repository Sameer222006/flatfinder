import { Link, useLocation } from "wouter";
import { Home, Search, MapPin, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "Map", href: "/properties", icon: MapPin },
    { name: "Saved", href: "/favorites", icon: Heart },
    { name: "Profile", href: "/dashboard", icon: User },
  ];
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <a className={cn(
              "flex flex-col items-center justify-center py-3",
              isActive(item.href) ? "text-primary-600" : "text-gray-500"
            )}>
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
