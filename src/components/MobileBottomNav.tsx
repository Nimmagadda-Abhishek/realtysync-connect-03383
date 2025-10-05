import { Home, Search, Heart, User, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSavedProperties } from "@/contexts/SavedPropertiesContext";
import { Badge } from "./ui/badge";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { savedPropertyIds } = useSavedProperties();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/saved", icon: Heart, label: "Saved", badge: savedPropertyIds.length },
    { path: "/register", icon: User, label: "Profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" fill={active ? "currentColor" : "none"} />
                {item.badge && item.badge > 0 ? (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-primary text-[10px] text-primary-foreground">
                    {item.badge > 9 ? "9+" : item.badge}
                  </Badge>
                ) : null}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
