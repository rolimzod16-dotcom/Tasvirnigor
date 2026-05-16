import { useState } from "react";
import { useListTeamMembers, useCreateTeamMember, useUpdateTeamMember, useDeleteTeamMember, getListTeamMembersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import type { TeamMember } from "@workspace/api-client-react";

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position (EN) is required"),
  positionRu: z.string().optional().nullable(),
  positionTj: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  bioRu: z.string().optional().nullable(),
  bioTj: z.string().optional().nullable(),
  photoUrl: z.string().min(1, "Photo is required"),
  sortOrder: z.coerce.number().default(0),
});

type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

const EMPTY: TeamMemberFormValues = {
  name: "", position: "", positionRu: "", positionTj: "",
  bio: "", bioRu: "", bioTj: "",
  photoUrl: "", sortOrder: 0,
};

export function AdminTeam() {
  const { data: teamMembers = [], isLoading } = useListTeamMembers();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lang } = useLanguage();

  const createMutation = useCreateTeamMember();
  const updateMutation = useUpdateTeamMember();
  const deleteMutation = useDeleteTeamMember();

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: EMPTY,
  });

  const resetForm = () => {
    form.reset(EMPTY);
    setEditingMember(null);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    form.reset({
      name: member.name,
      position: member.position,
      positionRu: member.positionRu ?? "",
      positionTj: member.positionTj ?? "",
      bio: member.bio ?? "",
      bioRu: member.bioRu ?? "",
      bioTj: member.bioTj ?? "",
      photoUrl: member.photoUrl,
      sortOrder: member.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: TeamMemberFormValues) => {
    const data = {
      ...values,
      positionRu: values.positionRu || null,
      positionTj: values.positionTj || null,
      bio: values.bio || null,
      bioRu: values.bioRu || null,
      bioTj: values.bioTj || null,
    };
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
          toast({ title: "Team member updated successfully" });
          setIsDialogOpen(false);
          resetForm();
        },
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
          toast({ title: "Team member created successfully" });
          setIsDialogOpen(false);
          resetForm();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
          toast({ title: "Team member deleted" });
        },
      });
    }
  };

  if (isLoading) return <div className="text-muted-foreground">Loading team members...</div>;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">{t(i18n.admin.team, lang)}</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Member</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editingMember ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="photoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo</FormLabel>
                    <FormControl>
                      <FileUpload value={field.value} onChange={field.onChange} endpoint="/api/upload/team-photo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} placeholder="Name is the same in all languages" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Multilingual content tabs */}
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <Tabs defaultValue="en">
                    <TabsList className="w-full rounded-none border-b border-border/50 bg-card/60 h-auto p-1 gap-1">
                      <TabsTrigger value="en" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold">
                        {t(i18n.langLabels.english, lang)}
                      </TabsTrigger>
                      <TabsTrigger value="ru" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold">
                        {t(i18n.langLabels.russian, lang)}
                      </TabsTrigger>
                      <TabsTrigger value="tj" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold">
                        {t(i18n.langLabels.tajik, lang)}
                      </TabsTrigger>
                    </TabsList>
                    <div className="p-4 space-y-4">
                      <TabsContent value="en" className="mt-0 space-y-4">
                        <FormField control={form.control} name="position" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position <span className="text-primary text-xs">(EN)</span></FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bio" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio <span className="text-primary text-xs">(EN)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[100px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                      <TabsContent value="ru" className="mt-0 space-y-4">
                        <FormField control={form.control} name="positionRu" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position <span className="text-primary text-xs">(RU)</span></FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bioRu" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio <span className="text-primary text-xs">(RU)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[100px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                      <TabsContent value="tj" className="mt-0 space-y-4">
                        <FormField control={form.control} name="positionTj" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position <span className="text-primary text-xs">(TJ)</span></FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bioTj" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio <span className="text-primary text-xs">(TJ)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[100px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                <FormField control={form.control} name="sortOrder" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingMember ? "Update Member" : "Create Member"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="group relative rounded-lg border border-border/50 overflow-hidden bg-card transition-all hover:border-primary/50 text-center">
              <div className="aspect-[3/4] relative">
                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <Button variant="secondary" size="icon" onClick={() => handleEdit(member)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(member.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg leading-tight">{member.name}</h3>
                <p className="text-sm text-primary">{member.position}</p>
                <div className="flex gap-1.5 mt-2 justify-center">
                  {member.positionRu && <span className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">RU</span>}
                  {member.positionTj && <span className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">TJ</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
