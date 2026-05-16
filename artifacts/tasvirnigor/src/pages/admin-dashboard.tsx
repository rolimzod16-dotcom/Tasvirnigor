import { useGetAdminMe, useAdminLogout } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Film, Users, Info, Phone, Shield } from "lucide-react";
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">Loading Dashboard</p>
        </div>
      </div>
    );
  }

  if (!adminMe?.authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 bg-card/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-display font-bold text-xl text-primary tracking-tight">Tasvirnigor</div>
            <div className="h-4 w-px bg-border" />
            <span className="text-muted-foreground text-sm font-medium">CMS</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-card/60 border border-border/40 rounded-lg px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">Administrator</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logoutMutation.mutate(undefined, {
                  onSuccess: () => setLocation("/admin")
                });
              }}
              className="gap-2"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-foreground mb-1">Content Management</h1>
          <p className="text-muted-foreground text-sm">Manage your studio's website content from here.</p>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-card/40 border border-border/40 h-auto p-1 flex-wrap gap-1">
            <TabsTrigger value="projects" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-projects">
              <Film className="w-4 h-4" /> Projects
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-team">
              <Users className="w-4 h-4" /> Team
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-about">
              <Info className="w-4 h-4" /> About
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-contacts">
              <Phone className="w-4 h-4" /> Contacts
            </TabsTrigger>
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
