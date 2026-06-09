import { useMemo, useState } from "react";
import {
  useListTeamMembers,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  getListTeamMembersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import type { TeamMember } from "@workspace/api-client-react";

// Social platforms supported
const PLATFORMS = ["instagram", "telegram", "youtube", "linkedin", "facebook", "tiktok"] as const;
type Platform = (typeof PLATFORMS)[number];

type TeamMemberFormValues = {
  name: string; nameRu: string | null; nameTj: string | null;
  position: string; positionRu: string | null; positionTj: string | null;
  bio: string | null; bioRu: string | null; bioTj: string | null;
  experience: string | null;
  photoUrl: string;
  isActive: boolean;
  sortOrder: number;
  // Social platforms (flat fields, combined into socialLinks on submit)
  instagram: string; telegram: string; youtube: string;
  linkedin: string; facebook: string; tiktok: string;
};

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram", telegram: "Telegram", youtube: "YouTube",
  linkedin: "LinkedIn", facebook: "Facebook", tiktok: "TikTok",
};

const PLATFORM_PLACEHOLDER: Record<Platform, string> = {
  instagram: "https://instagram.com/username",
  telegram: "https://t.me/username",
  youtube: "https://youtube.com/@channel",
  linkedin: "https://linkedin.com/in/username",
  facebook: "https://facebook.com/username",
  tiktok: "https://tiktok.com/@username",
};

const EMPTY: TeamMemberFormValues = {
  name: "", nameRu: "", nameTj: "",
  position: "", positionRu: "", positionTj: "",
  bio: "", bioRu: "", bioTj: "", experience: "",
  photoUrl: "", isActive: true, sortOrder: 0,
  instagram: "", telegram: "", youtube: "", linkedin: "", facebook: "", tiktok: "",
};

function memberToForm(member: TeamMember): TeamMemberFormValues {
  const sl = (member.socialLinks ?? {}) as Record<string, string>;
  return {
    name: member.name,
    nameRu: member.nameRu ?? "",
    nameTj: member.nameTj ?? "",
    position: member.position,
    positionRu: member.positionRu ?? "",
    positionTj: member.positionTj ?? "",
    bio: member.bio ?? "",
    bioRu: member.bioRu ?? "",
    bioTj: member.bioTj ?? "",
    experience: member.experience ?? "",
    photoUrl: member.photoUrl,
    isActive: member.isActive,
    sortOrder: member.sortOrder,
    instagram: sl.instagram ?? "",
    telegram: sl.telegram ?? "",
    youtube: sl.youtube ?? "",
    linkedin: sl.linkedin ?? "",
    facebook: sl.facebook ?? "",
    tiktok: sl.tiktok ?? "",
  };
}

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

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t(i18n.validation.nameRequired, lang)),
        nameRu: z.string().optional().nullable(),
        nameTj: z.string().optional().nullable(),
        position: z.string().min(1, t(i18n.validation.positionRequired, lang)),
        positionRu: z.string().optional().nullable(),
        positionTj: z.string().optional().nullable(),
        bio: z.string().optional().nullable(),
        bioRu: z.string().optional().nullable(),
        bioTj: z.string().optional().nullable(),
        experience: z.string().optional().nullable(),
        photoUrl: z.string().min(1, t(i18n.validation.photoRequired, lang)),
        isActive: z.boolean().default(true),
        sortOrder: z.coerce.number().default(0),
        instagram: z.string().optional().default(""),
        telegram: z.string().optional().default(""),
        youtube: z.string().optional().default(""),
        linkedin: z.string().optional().default(""),
        facebook: z.string().optional().default(""),
        tiktok: z.string().optional().default(""),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang]
  );

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const resetForm = () => { form.reset(EMPTY); setEditingMember(null); };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    form.reset(memberToForm(member));
    setIsDialogOpen(true);
  };

  const onSubmit = (values: TeamMemberFormValues) => {
    // Build socialLinks object from flat fields
    const socialLinks: Record<string, string> = {};
    for (const p of PLATFORMS) {
      if (values[p]) socialLinks[p] = values[p] as string;
    }

    const data = {
      name: values.name,
      nameRu: values.nameRu || null,
      nameTj: values.nameTj || null,
      position: values.position,
      positionRu: values.positionRu || null,
      positionTj: values.positionTj || null,
      bio: values.bio || null,
      bioRu: values.bioRu || null,
      bioTj: values.bioTj || null,
      experience: values.experience || null,
      photoUrl: values.photoUrl,
      isActive: values.isActive,
      sortOrder: values.sortOrder,
      socialLinks,
    };

    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
          toast({ title: t(i18n.form.memberUpdated, lang) });
          setIsDialogOpen(false); resetForm();
        },
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
          toast({ title: t(i18n.form.memberCreated, lang) });
          setIsDialogOpen(false); resetForm();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t(i18n.form.deleteMemberConfirm, lang))) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() });
          toast({ title: t(i18n.form.memberDeleted, lang) });
        },
      });
    }
  };

  const handleToggleActive = (member: TeamMember) => {
    updateMutation.mutate(
      { id: member.id, data: { isActive: !member.isActive } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTeamMembersQueryKey() }) }
    );
  };

  if (isLoading) return <div className="text-muted-foreground">{t(i18n.form.loadingTeam, lang)}</div>;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">{t(i18n.admin.team, lang)}</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> {t(i18n.form.addMember, lang)}</Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingMember ? t(i18n.form.editMember, lang) : t(i18n.form.addMember, lang)}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                {/* Visibility toggle */}
                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex items-center gap-3 rounded-lg border border-border/40 p-3 bg-background/30">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer mb-0">{t(i18n.form.activeLabel, lang)}</FormLabel>
                  </FormItem>
                )} />

                {/* Photo */}
                <FormField control={form.control} name="photoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.photo, lang)}</FormLabel>
                    <FormControl>
                      <FileUpload value={field.value} onChange={field.onChange} endpoint="/api/upload/team-photo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Multilingual name + position + bio */}
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <Tabs defaultValue="en">
                    <TabsList className="w-full rounded-none border-b border-border/50 bg-card/60 h-auto p-1 gap-1">
                      {(["en", "ru", "tj"] as const).map((lng) => (
                        <TabsTrigger key={lng} value={lng}
                          className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold">
                          {t(i18n.langLabels[lng === "en" ? "english" : lng === "ru" ? "russian" : "tajik"], lang)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <div className="p-4 space-y-4">
                      <TabsContent value="en" className="mt-0 space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.fullName, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="position" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.position, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bio" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.bio, lang)} <span className="text-primary text-xs">(EN)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[90px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                      <TabsContent value="ru" className="mt-0 space-y-4">
                        <FormField control={form.control} name="nameRu" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.fullName, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="positionRu" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.position, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bioRu" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.bio, lang)} <span className="text-primary text-xs">(RU)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[90px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                      <TabsContent value="tj" className="mt-0 space-y-4">
                        <FormField control={form.control} name="nameTj" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.fullName, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="positionTj" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.position, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bioTj" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t(i18n.form.bio, lang)} <span className="text-primary text-xs">(TJ)</span></FormLabel>
                            <FormControl><Textarea {...field} value={field.value ?? ""} className="min-h-[90px]" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* Experience highlights */}
                <FormField control={form.control} name="experience" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.experience, lang)}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        className="min-h-[90px] font-mono text-sm"
                        placeholder={t(i18n.form.experiencePlaceholder, lang)}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">One highlight per line — shown as bullet points on the website.</p>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Social links */}
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <div className="bg-card/60 border-b border-border/50 px-4 py-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t(i18n.form.memberSocialLinks, lang)}
                    </p>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PLATFORMS.map((platform) => (
                      <FormField key={platform} control={form.control} name={platform} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{PLATFORM_LABELS[platform]}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder={PLATFORM_PLACEHOLDER[platform]}
                              className="text-xs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    ))}
                  </div>
                </div>

                {/* Sort order */}
                <FormField control={form.control} name="sortOrder" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(i18n.form.sortOrder, lang)}</FormLabel>
                    <FormControl><Input type="number" {...field} className="w-28" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingMember ? t(i18n.form.updateMember, lang) : t(i18n.form.createMember, lang)}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {teamMembers.map((member) => {
            const sl = (member.socialLinks ?? {}) as Record<string, string>;
            const socialCount = PLATFORMS.filter((p) => sl[p]).length;
            return (
              <div
                key={member.id}
                className={`group relative rounded-xl border overflow-hidden bg-card transition-all
                  hover:border-primary/50 text-center
                  ${member.isActive ? "border-border/50" : "border-border/20 opacity-60"}`}
              >
                <div className="aspect-[3/4] relative">
                  <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover object-top" />
                  {!member.isActive && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <EyeOff className="w-6 h-6 text-white/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                    <Button variant="secondary" size="icon" onClick={() => handleEdit(member)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleActive(member)}
                      title={member.isActive ? "Hide" : "Show"}
                    >
                      {member.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm leading-tight truncate">{member.name}</h3>
                  <p className="text-xs text-primary truncate mt-0.5">{member.position}</p>
                  <div className="flex gap-1 mt-2 justify-center flex-wrap">
                    {member.positionRu && <span className="text-[9px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">RU</span>}
                    {member.positionTj && <span className="text-[9px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">TJ</span>}
                    {socialCount > 0 && <span className="text-[9px] bg-blue-500/10 text-blue-400 rounded px-1.5 py-0.5 font-medium">{socialCount} links</span>}
                    {member.experience && <span className="text-[9px] bg-white/5 text-white/40 rounded px-1.5 py-0.5 font-medium">exp</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
