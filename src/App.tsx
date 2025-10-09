import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SavedPropertiesProvider } from "./contexts/SavedPropertiesContext";
import { UserProvider } from "./contexts/UserContext";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { Header } from "./components/Header";
import Home from "./pages/Home";
import Search from "./pages/Search";
import PropertyDetails from "./pages/PropertyDetails";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SavedProperties from "./pages/SavedProperties";
import CategoryProperties from "./pages/CategoryProperties";
import ListingTypeProperties from "./pages/ListingTypeProperties";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <SavedPropertiesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen w-full">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/saved" element={<SavedProperties />} />
                <Route path="/properties/sale" element={<ListingTypeProperties />} />
                <Route path="/properties/resale" element={<ListingTypeProperties />} />
                <Route path="/properties/rent" element={<ListingTypeProperties />} />
                <Route path="/properties/:category" element={<CategoryProperties />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MobileBottomNav />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </SavedPropertiesProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
