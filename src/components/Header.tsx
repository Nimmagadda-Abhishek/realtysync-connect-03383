import { Link } from "react-router-dom";
import { Home, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useSavedProperties } from "@/contexts/SavedPropertiesContext";
import { useUser } from "@/contexts/UserContext";
import { Badge } from "./ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const Header = () => {
  const { savedPropertyIds } = useSavedProperties();
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const handleSearchClick = () => {
    navigate("/search");
  };

  return (
    <header className="hidden md:block border-b border-border bg-card sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Home className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold">PropConnect</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Input
            type="text"
            placeholder="Search by location, title, or keyword..."
            value={searchText}
            onClick={handleSearchClick}
            readOnly
            className="w-64"
          />
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/search" className="text-foreground hover:text-primary transition-colors">
            Properties
          </Link>
          <Link to="/saved" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <Heart className="h-4 w-4" />
            <span>Saved</span>
            {savedPropertyIds.length > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {savedPropertyIds.length}
              </Badge>
            )}
          </Link>
          {isLoggedIn ? (
            <Link to="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button variant="outline">Sign Up</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
