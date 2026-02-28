import { Search, Mic, Bell, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TopBar = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search jobs, schemes, or ask AI..."
          className="pl-10 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-accent"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 font-semibold">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Mic className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-urgent" />
        </Button>
        <div className="flex items-center gap-2 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Rahul Sharma</p>
            <p className="text-xs text-muted-foreground">Delhi, India</p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-accent">
            <AvatarFallback className="bg-accent text-accent-foreground text-sm font-bold">RS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
