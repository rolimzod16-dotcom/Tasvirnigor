import { useEffect, useRef, useState } from "react";
import { useGetHero, useUpdateHero, getGetHeroQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { i18n, t } from "@/lib/i18n";
import { Upload, Video, ImageIcon, Loader2 } from "lucide-react";

type HeroFormValues = {
  titleEn: string;
  titleRu: string;
  titleTj: string;
  subtitleEn: string;
  subtitleRu: string;
  subtitleTj: string;
  ctaPrimaryLabel: string;
  ctaPrimaryLabelRu: string;
  ctaPrimaryLabelTj: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryLabelRu: string;
  ctaSecondaryLabelTj: string;
  ctaSecondaryHref: string;
  effectsEnabled: boolean;
};

const EMPTY: HeroFormValues = {
  titleEn: "",
  titleRu: "",
  titleTj: "",
  subtitleEn: "",
  subtitleRu: "",
  subtitleTj: "",
  ctaPrimaryLabel: "",
  ctaPrimaryLabelRu: "",
  ctaPrimaryLabelTj: "",
  ctaPrimaryHref: "",
  ctaSecondaryLabel: "",
  ctaSecondaryLabelRu: "",
  ctaSecondaryLabelTj: "",
  ctaSecondaryHref: "",
  effectsEnabled: true,
};

export function AdminHero() {
  const { data: hero, isLoading } = useGetHero();
  const updateMutation = useUpdateHero();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lang } = useLanguage();
  const initialized = useRef(false);

  const [form, setForm] = useState<HeroFormValues>(EMPTY);
  const [videoUploading, setVideoUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hero && !initialized.current) {
      setForm({
        titleEn: hero.titleEn ?? "",
        titleRu: hero.titleRu ?? "",
        titleTj: hero.titleTj ?? "",
        subtitleEn: hero.subtitleEn ?? "",
        subtitleRu: hero.subtitleRu ?? "",
        subtitleTj: hero.subtitleTj ?? "",
        ctaPrimaryLabel: hero.ctaPrimaryLabel ?? "",
        ctaPrimaryLabelRu: hero.ctaPrimaryLabelRu ?? "",
        ctaPrimaryLabelTj: hero.ctaPrimaryLabelTj ?? "",
        ctaPrimaryHref: hero.ctaPrimaryHref ?? "",
        ctaSecondaryLabel: hero.ctaSecondaryLabel ?? "",
        ctaSecondaryLabelRu: hero.ctaSecondaryLabelRu ?? "",
        ctaSecondaryLabelTj: hero.ctaSecondaryLabelTj ?? "",
        ctaSecondaryHref: hero.ctaSecondaryHref ?? "",
        effectsEnabled: hero.effectsEnabled,
      });
      setCurrentVideoUrl(hero.videoUrl ?? null);
      setCurrentImageUrl(hero.fallbackImageUrl ?? null);
      initialized.current = true;
    }
  }, [hero]);

  const set = (key: keyof HeroFormValues, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/hero-video", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? "Upload failed");
      }
      const { url } = await res.json();
      setCurrentVideoUrl(url);
      await saveField({ videoUrl: url });
      toast({ title: t(i18n.heroAdmin.videoUploaded, lang) });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Upload failed", variant: "destructive" });
    } finally {
      setVideoUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/hero-image", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error ?? "Upload failed");
      }
      const { url } = await res.json();
      setCurrentImageUrl(url);
      await saveField({ fallbackImageUrl: url });
      toast({ title: t(i18n.heroAdmin.imageUploaded, lang) });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Upload failed", variant: "destructive" });
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const saveField = (patch: Record<string, unknown>) => {
    return new Promise<void>((resolve) => {
      updateMutation.mutate({ data: patch as any }, {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetHeroQueryKey(), updated);
          resolve();
        },
        onError: () => resolve(),
      });
    });
  };

  const handleSave = () => {
    setSaving(true);
    const data = {
      titleEn: form.titleEn || "Film & Animation from Tajikistan",
      titleRu: form.titleRu || null,
      titleTj: form.titleTj || null,
      subtitleEn: form.subtitleEn || null,
      subtitleRu: form.subtitleRu || null,
      subtitleTj: form.subtitleTj || null,
      ctaPrimaryLabel: form.ctaPrimaryLabel || null,
      ctaPrimaryLabelRu: form.ctaPrimaryLabelRu || null,
      ctaPrimaryLabelTj: form.ctaPrimaryLabelTj || null,
      ctaPrimaryHref: form.ctaPrimaryHref || null,
      ctaSecondaryLabel: form.ctaSecondaryLabel || null,
      ctaSecondaryLabelRu: form.ctaSecondaryLabelRu || null,
      ctaSecondaryLabelTj: form.ctaSecondaryLabelTj || null,
      ctaSecondaryHref: form.ctaSecondaryHref || null,
      effectsEnabled: form.effectsEnabled,
    };
    updateMutation.mutate({ data }, {
      onSuccess: (updated) => {
        queryClient.setQueryData(getGetHeroQueryKey(), updated);
        toast({ title: t(i18n.heroAdmin.heroUpdated, lang) });
        setSaving(false);
      },
      onError: () => setSaving(false),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{t(i18n.admin.loading, lang)}</span>
      </div>
    );
  }

  const tabTriggerClass =
    "flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold";

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Media uploads ── */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="font-display text-base">{t(i18n.heroAdmin.videoSection, lang)}</CardTitle>
          <p className="text-muted-foreground text-xs">{t(i18n.heroAdmin.videoHint, lang)}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentVideoUrl && (
            <div className="relative rounded-lg overflow-hidden border border-border/40 bg-black" style={{ aspectRatio: "16/9" }}>
              <video
                src={currentVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,image/gif"
              className="hidden"
              onChange={handleVideoUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={videoUploading}
              onClick={() => videoInputRef.current?.click()}
            >
              {videoUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              {currentVideoUrl
                ? t(i18n.heroAdmin.replaceVideo, lang)
                : t(i18n.heroAdmin.uploadVideo, lang)}
            </Button>
            {currentVideoUrl && (
              <span className="text-xs text-muted-foreground truncate max-w-[240px]">
                {currentVideoUrl.split("/").pop()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="font-display text-base">{t(i18n.heroAdmin.imageSection, lang)}</CardTitle>
          <p className="text-muted-foreground text-xs">{t(i18n.heroAdmin.imageHint, lang)}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentImageUrl && (
            <div className="relative rounded-lg overflow-hidden border border-border/40 bg-muted/30" style={{ maxHeight: "160px" }}>
              <img src={currentImageUrl} alt="Fallback" className="w-full h-full object-contain max-h-[160px]" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={imageUploading}
              onClick={() => imageInputRef.current?.click()}
            >
              {imageUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              {currentImageUrl
                ? t(i18n.heroAdmin.replaceImage, lang)
                : t(i18n.heroAdmin.uploadImage, lang)}
            </Button>
            {currentImageUrl && (
              <span className="text-xs text-muted-foreground truncate max-w-[240px]">
                {currentImageUrl.split("/").pop()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Text fields ── */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="font-display text-base">{t(i18n.heroAdmin.titleSection, lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <Tabs defaultValue="en">
              <TabsList className="w-full rounded-none border-b border-border/50 bg-card/60 h-auto p-1 gap-1">
                <TabsTrigger value="en" className={tabTriggerClass}>{t(i18n.langLabels.english, lang)}</TabsTrigger>
                <TabsTrigger value="ru" className={tabTriggerClass}>{t(i18n.langLabels.russian, lang)}</TabsTrigger>
                <TabsTrigger value="tj" className={tabTriggerClass}>{t(i18n.langLabels.tajik, lang)}</TabsTrigger>
              </TabsList>
              <div className="p-4 space-y-4">
                <TabsContent value="en" className="mt-0 space-y-4">
                  <div className="space-y-1.5">
                    <Label>{t(i18n.heroAdmin.titleEn, lang)} <span className="text-primary text-xs">(EN)</span></Label>
                    <Input value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} placeholder="Film & Animation from Tajikistan" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t(i18n.heroAdmin.subtitleEn, lang)} <span className="text-primary text-xs">(EN)</span></Label>
                    <Textarea value={form.subtitleEn} onChange={(e) => set("subtitleEn", e.target.value)} className="min-h-[80px]" placeholder="Describe your studio in one sentence..." />
                  </div>
                </TabsContent>
                <TabsContent value="ru" className="mt-0 space-y-4">
                  <div className="space-y-1.5">
                    <Label>{t(i18n.heroAdmin.titleEn, lang)} <span className="text-primary text-xs">(RU)</span></Label>
                    <Input value={form.titleRu} onChange={(e) => set("titleRu", e.target.value)} placeholder="Кино и анимация из Таджикистана" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t(i18n.heroAdmin.subtitleEn, lang)} <span className="text-primary text-xs">(RU)</span></Label>
                    <Textarea value={form.subtitleRu} onChange={(e) => set("subtitleRu", e.target.value)} className="min-h-[80px]" />
                  </div>
                </TabsContent>
                <TabsContent value="tj" className="mt-0 space-y-4">
                  <div className="space-y-1.5">
                    <Label>{t(i18n.heroAdmin.titleEn, lang)} <span className="text-primary text-xs">(TJ)</span></Label>
                    <Input value={form.titleTj} onChange={(e) => set("titleTj", e.target.value)} placeholder="Кино ва анимация аз Тоҷикистон" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t(i18n.heroAdmin.subtitleEn, lang)} <span className="text-primary text-xs">(TJ)</span></Label>
                    <Textarea value={form.subtitleTj} onChange={(e) => set("subtitleTj", e.target.value)} className="min-h-[80px]" />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* ── CTA buttons ── */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="font-display text-base">{t(i18n.heroAdmin.ctaSection, lang)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Primary CTA */}
          <div className="space-y-3">
            <p className="text-sm font-medium">{t(i18n.heroAdmin.ctaPrimaryLabel, lang)}</p>
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <Tabs defaultValue="en">
                <TabsList className="w-full rounded-none border-b border-border/50 bg-card/60 h-auto p-1 gap-1">
                  <TabsTrigger value="en" className={tabTriggerClass}>{t(i18n.langLabels.english, lang)}</TabsTrigger>
                  <TabsTrigger value="ru" className={tabTriggerClass}>{t(i18n.langLabels.russian, lang)}</TabsTrigger>
                  <TabsTrigger value="tj" className={tabTriggerClass}>{t(i18n.langLabels.tajik, lang)}</TabsTrigger>
                </TabsList>
                <div className="p-4 space-y-3">
                  <TabsContent value="en" className="mt-0">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t(i18n.heroAdmin.ctaPrimaryLabel, lang)} (EN)</Label>
                      <Input value={form.ctaPrimaryLabel} onChange={(e) => set("ctaPrimaryLabel", e.target.value)} placeholder="View Our Work" />
                    </div>
                  </TabsContent>
                  <TabsContent value="ru" className="mt-0">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t(i18n.heroAdmin.ctaPrimaryLabel, lang)} (RU)</Label>
                      <Input value={form.ctaPrimaryLabelRu} onChange={(e) => set("ctaPrimaryLabelRu", e.target.value)} placeholder="Смотреть проекты" />
                    </div>
                  </TabsContent>
                  <TabsContent value="tj" className="mt-0">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t(i18n.heroAdmin.ctaPrimaryLabel, lang)} (TJ)</Label>
                      <Input value={form.ctaPrimaryLabelTj} onChange={(e) => set("ctaPrimaryLabelTj", e.target.value)} placeholder="Лоиҳаҳоро бубинед" />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t(i18n.heroAdmin.ctaPrimaryHref, lang)}</Label>
              <Input value={form.ctaPrimaryHref} onChange={(e) => set("ctaPrimaryHref", e.target.value)} placeholder="#portfolio" />
            </div>
          </div>

          <Separator className="border-border/40" />

          {/* Secondary CTA */}
          <div className="space-y-3">
            <p className="text-sm font-medium">{t(i18n.heroAdmin.ctaSecondaryLabel, lang)}</p>
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <Tabs defaultValue="en">
                <TabsList className="w-full rounded-none border-b border-border/50 bg-card/60 h-auto p-1 gap-1">
                  <TabsTrigger value="en" className={tabTriggerClass}>{t(i18n.langLabels.english, lang)}</TabsTrigger>
                  <TabsTrigger value="ru" className={tabTriggerClass}>{t(i18n.langLabels.russian, lang)}</TabsTrigger>
                  <TabsTrigger value="tj" className={tabTriggerClass}>{t(i18n.langLabels.tajik, lang)}</TabsTrigger>
                </TabsList>
                <div className="p-4">
                  <TabsContent value="en" className="mt-0">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t(i18n.heroAdmin.ctaSecondaryLabel, lang)} (EN)</Label>
                      <Input value={form.ctaSecondaryLabel} onChange={(e) => set("ctaSecondaryLabel", e.target.value)} placeholder="About Us" />
                    </div>
                  </TabsContent>
                  <TabsContent value="ru" className="mt-0">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t(i18n.heroAdmin.ctaSecondaryLabel, lang)} (RU)</Label>
                      <Input value={form.ctaSecondaryLabelRu} onChange={(e) => set("ctaSecondaryLabelRu", e.target.value)} placeholder="О студии" />
                    </div>
                  </TabsContent>
                  <TabsContent value="tj" className="mt-0">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t(i18n.heroAdmin.ctaSecondaryLabel, lang)} (TJ)</Label>
                      <Input value={form.ctaSecondaryLabelTj} onChange={(e) => set("ctaSecondaryLabelTj", e.target.value)} placeholder="Дар бораи мо" />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t(i18n.heroAdmin.ctaSecondaryHref, lang)}</Label>
              <Input value={form.ctaSecondaryHref} onChange={(e) => set("ctaSecondaryHref", e.target.value)} placeholder="#about" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Effects toggle ── */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium">{t(i18n.heroAdmin.effectsEnabled, lang)}</Label>
              <p className="text-xs text-muted-foreground max-w-sm">{t(i18n.heroAdmin.effectsHint, lang)}</p>
            </div>
            <Switch
              checked={form.effectsEnabled}
              onCheckedChange={(v) => set("effectsEnabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[140px]">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t(i18n.form.saving, lang)}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {t(i18n.form.saveChanges, lang)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
