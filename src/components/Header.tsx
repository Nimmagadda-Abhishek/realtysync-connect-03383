import { Link, useLocation } from "react-router-dom";
import { Home, Heart, Building2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useSavedProperties } from "@/contexts/SavedPropertiesContext";
import { useUser } from "@/contexts/UserContext";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const Header = () => {
  const { savedPropertyIds } = useSavedProperties();
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`hidden md:block sticky top-0 z-40 transition-all duration-300 ${
        scrolled || !isHomePage
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-3 group animate-slide-in-left">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-gradient-to-r from-primary to-accent p-3 rounded-xl transform group-hover:scale-110 transition-transform">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className={`text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ${
            scrolled || !isHomePage ? '' : 'text-white'
          }`}>
            PropConnect
          </span>
        </Link>

        <nav className="flex items-center gap-6 animate-slide-in-right">
          <Link
            to="/"
            className={`relative font-medium transition-all duration-300 group ${
              scrolled || !isHomePage
                ? 'text-foreground hover:text-primary'
                : 'text-white hover:text-white/80'
            }`}
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            to="/search"
            className={`relative font-medium transition-all duration-300 group ${
              scrolled || !isHomePage
                ? 'text-foreground hover:text-primary'
                : 'text-white hover:text-white/80'
            }`}
          >
            Properties
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            to="/saved"
            className={`relative flex items-center gap-2 font-medium transition-all duration-300 group ${
              scrolled || !isHomePage
                ? 'text-foreground hover:text-primary'
                : 'text-white hover:text-white/80'
            }`}
          >
            <Heart className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Saved</span>
            {savedPropertyIds.length > 0 && (
              <Badge className="bg-gradient-to-r from-primary to-accent text-white animate-scale-in">
                {savedPropertyIds.length}
              </Badge>
            )}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            to="/add-property"
            className={`relative font-medium transition-all duration-300 group ${
              scrolled || !isHomePage
                ? 'text-foreground hover:text-primary'
                : 'text-white hover:text-white/80'
            }`}
          >
            Add Property
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full" />
          </Link>
          <Button
            variant="outline"
            className="relative overflow-hidden group border-2 hover:border-primary transition-all duration-300"
            onClick={() => navigate("/agent-register")}
          >
            <span className="relative z-10">Join as Agent</span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity" />
          </Button>
          {isLoggedIn ? (
            <Link to="/profile">
              <Button
                variant="outline"
                className="relative overflow-hidden group border-2 hover:border-primary transition-all duration-300"
              >
                <span className="relative z-10">Profile</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity" />
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button
                className="relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
