"use client";

import { useRef, useState } from "react";
import { Camera, Check, RefreshCw, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useChat } from "@/context/chat-context";
import type { PresenceStatus } from "@/types/settings";

export function ProfileSection() {
  const { userProfile, updateUserProfile, resetUserProfile } = useChat();

  const [name, setName] = useState(userProfile.name);
  const [username, setUsername] = useState(userProfile.username);
  const [bio, setBio] = useState(userProfile.bio);
  const [statusMessage, setStatusMessage] = useState(userProfile.statusMessage);
  const [presenceStatus, setPresenceStatus] = useState<PresenceStatus>(userProfile.presenceStatus);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(userProfile.avatarUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; username?: string }>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isDirty =
    name !== userProfile.name ||
    username !== userProfile.username ||
    bio !== userProfile.bio ||
    statusMessage !== userProfile.statusMessage ||
    presenceStatus !== userProfile.presenceStatus ||
    avatarPreview !== userProfile.avatarUrl;

  const validate = () => {
    const errs: { name?: string; username?: string } = {};
    if (!name.trim()) errs.name = "Display name is required.";
    if (!username.trim()) errs.username = "Username is required.";
    else if (!/^[a-zA-Z0-9._-]+$/.test(username.trim())) {
      errs.username = "Username can only contain letters, numbers, dots, hyphens, and underscores.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    updateUserProfile({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
      statusMessage: statusMessage.trim(),
      presenceStatus,
      avatarUrl: avatarPreview,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCancel = () => {
    setName(userProfile.name);
    setUsername(userProfile.username);
    setBio(userProfile.bio);
    setStatusMessage(userProfile.statusMessage);
    setPresenceStatus(userProfile.presenceStatus);
    setAvatarPreview(userProfile.avatarUrl);
    setErrors({});
  };

  const handleReset = () => {
    resetUserProfile();
    setTimeout(() => {
      setName("Nguyen Minh");
      setUsername("nguyen.minh");
      setBio(
        "Lead Software Architect & Senior Full-Stack Engineer passionate about high-performance web applications and sleek UI.",
      );
      setStatusMessage("Building real-time chat app");
      setPresenceStatus("online");
      setAvatarPreview(
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      );
      setErrors({});
    }, 50);
  };

  const presenceConfig: Record<
    PresenceStatus,
    {
      label: string;
      dot: string;
      badgeVariant: "default" | "secondary" | "outline" | "destructive";
    }
  > = {
    online: { label: "Online", dot: "bg-emerald-500", badgeVariant: "default" },
    away: { label: "Away", dot: "bg-amber-500", badgeVariant: "secondary" },
    busy: { label: "Busy", dot: "bg-rose-500", badgeVariant: "destructive" },
    offline: { label: "Offline", dot: "bg-slate-400", badgeVariant: "outline" },
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header & Avatar Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border bg-card p-4 sm:p-6 shadow-2xs">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-border shadow-xs">
            {avatarPreview && <AvatarImage src={avatarPreview} alt={name} />}
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background ${presenceConfig[presenceStatus].dot}`}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
            aria-label="Upload custom avatar image"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-foreground">{name}</h3>
            <Badge variant={presenceConfig[presenceStatus].badgeVariant} className="text-[10px]">
              {presenceConfig[presenceStatus].label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">@{username}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {userProfile.role} • Joined {userProfile.joinedDate}
          </p>
        </div>

        {avatarPreview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAvatarPreview(undefined)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Remove Avatar
          </Button>
        )}
      </div>

      {/* Presence Status Selector */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-3 shadow-2xs">
        <Label className="text-xs font-semibold text-foreground">Presence Status</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["online", "away", "busy", "offline"] as PresenceStatus[]).map((status) => {
            const isSelected = presenceStatus === status;
            const cfg = presenceConfig[status];
            return (
              <button
                key={status}
                type="button"
                onClick={() => setPresenceStatus(status)}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                }`}
                aria-label={`Set status to ${cfg.label}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Personal Status Message */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <Label htmlFor="status-input" className="text-xs font-semibold text-foreground">
            Personal Status
          </Label>
          <span className="text-[10px] text-muted-foreground">{statusMessage.length}/50</span>
        </div>
        <div className="relative">
          <Input
            id="status-input"
            maxLength={50}
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            placeholder="What's on your mind?"
            className="text-xs sm:text-sm pr-8"
          />
          {statusMessage && (
            <button
              type="button"
              onClick={() => setStatusMessage("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear personal status"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Information Form */}
      <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Profile Information
        </h4>

        {/* Display Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name-input" className="text-xs font-medium text-foreground">
            Display Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="text-xs sm:text-sm"
          />
          {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="username-input" className="text-xs font-medium text-foreground">
            Username <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">@</span>
            <Input
              id="username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="pl-7 text-xs sm:text-sm"
            />
          </div>
          {errors.username && <p className="text-[11px] text-destructive">{errors.username}</p>}
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio-input" className="text-xs font-medium text-foreground">
              Bio
            </Label>
            <span className="text-[10px] text-muted-foreground">{bio.length}/200</span>
          </div>
          <textarea
            id="bio-input"
            maxLength={200}
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself..."
            className="w-full rounded-md border border-input bg-background p-2.5 text-xs sm:text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </Button>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <Check className="h-3.5 w-3.5" /> Saved!
            </span>
          )}
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-xs"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={!isDirty} className="text-xs font-semibold">
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}
