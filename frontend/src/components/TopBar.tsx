import { Search, Mic, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const TopBar = () => {
  const { profile } = useAuth();
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-md">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search jobs, schemes, or ask AI..."
          className="h-9 rounded-xl border-0 bg-muted/70 pl-10 transition-all focus-visible:ring-2 focus-visible:ring-primary/40"
        />
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground">
          <Mic className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-urgent animate-pulse" />
        </Button>

        <div className="ml-2 flex items-center gap-2.5 border-l border-border pl-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-foreground">{profile?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground">{profile?.city || "India"}</p>
          </div>
          <Avatar className="h-9 w-9 ring-2 ring-primary/25 ring-offset-1 ring-offset-background">
            <AvatarFallback
              className="text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, hsl(250,84%,54%), hsl(278,80%,60%))" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
