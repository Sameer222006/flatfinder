import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PropertyListingPage from "@/pages/property-listing-page";
import PropertySearchPage from "@/pages/property-search-page";
import PropertyDetailsPage from "@/pages/property-details-page";
import DashboardPage from "@/pages/dashboard-page";
import MessagesPage from "@/pages/messages-page";
import FavoritesPage from "@/pages/favorites-page";
import AddPropertyPage from "@/pages/add-property-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/properties" component={PropertyListingPage} />
      <Route path="/search" component={PropertySearchPage} />
      <Route path="/properties/:id" component={PropertyDetailsPage} />
      
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/favorites" component={FavoritesPage} />
      <ProtectedRoute path="/add-property" component={AddPropertyPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
