import { useGetAdminMe, useAdminLogout } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Film, Users, Info, Phone } from "lucide-react";
import { AdminProjects } from "./admin/admin-projects";
import { AdminTeam } from "./admin/admin-team";
import { AdminAbout } from "./admin/admin-about";
import { AdminContacts } from "./admin/admin-contacts";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: adminMe, error, isLoading } = useGetAdminMe({
    query: {
      retry: false,
    }
  });
  const logoutMutation = useAdminLogout();

  useEffect(() => {
    if (error) {
      setLocation("/admin");
    }
  }, [error, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-display">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminMe?.authenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-display font-bold text-xl text-primary">Tasvirnigor CMS</div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logoutMutation.mutate(undefined, {
                  onSuccess: () => setLocation("/admin")
                });
              }}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="projects" className="gap-2"><Film className="w-4 h-4" /> Projects</TabsTrigger>
            <TabsTrigger value="team" className="gap-2"><Users className="w-4 h-4" /> Team</TabsTrigger>
            <TabsTrigger value="about" className="gap-2"><Info className="w-4 h-4" /> About</TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2"><Phone className="w-4 h-4" /> Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-0 outline-none">
            <AdminProjects />
          </TabsContent>

          <TabsContent value="team" className="mt-0 outline-none">
            <AdminTeam />
          </TabsContent>

          <TabsContent value="about" className="mt-0 outline-none">
            <AdminAbout />
          </TabsContent>

          <TabsContent value="contacts" className="mt-0 outline-none">
            <AdminContacts />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
