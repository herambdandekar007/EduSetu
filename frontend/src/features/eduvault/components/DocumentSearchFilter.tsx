import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Star,
  Archive,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { DOCUMENT_CATEGORIES } from "../constants/categories";

export interface FilterState {
  query: string;
  category: string;
  type: string;
  status: string;
  onlyFavorites: boolean;
  onlyArchived: boolean;
  sortBy: "date_desc" | "date_asc" | "name_asc" | "size_desc";
}

export const DocumentSearchFilter = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalResults,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalResults: number;
}) => {
  const [searchInput, setSearchInput] = useState(filters.query);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ ...filters, query: searchInput });
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleResetFilters = () => {
    setSearchInput("");
    onFilterChange({
      query: "",
      category: "all",
      type: "all",
      status: "all",
      onlyFavorites: false,
      onlyArchived: false,
      sortBy: "date_desc",
    });
  };

  const hasActiveFilters =
    filters.query ||
    filters.category !== "all" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.onlyFavorites ||
    filters.onlyArchived;

  return (
    <div className="space-y-4">
      {/* Top Search Bar + View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, category, institution, tags, or document number..."
            className="pl-10 pr-10 h-11 rounded-2xl bg-card/60 border-border/80 text-xs focus:ring-2 focus:ring-primary/30"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort and View Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({ ...filters, sortBy: e.target.value as FilterState["sortBy"] })
            }
            className="h-11 rounded-2xl border border-border/80 bg-card/60 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="size_desc">File Size (Largest)</option>
          </select>

          {/* Grid / List switcher */}
          <div className="flex items-center p-1 bg-card/60 border border-border/80 rounded-2xl">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-xl text-xs transition-all ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-xl text-xs transition-all ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Quick Filter Chips */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onFilterChange({ ...filters, category: "all" })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              filters.category === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border/70 bg-card/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            All Categories
          </button>
          {DOCUMENT_CATEGORIES.map((c) => {
            const active = filters.category === c.name;
            return (
              <button
                key={c.id}
                onClick={() => onFilterChange({ ...filters, category: c.name })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "border border-border/70 bg-card/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Filter Badges & Reset Button */}
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetFilters}
            className="text-xs text-muted-foreground hover:text-foreground gap-1 shrink-0 h-8"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>

      {/* Sub-Filters row: Status, Favorites, Archive */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-xs">
        <span className="text-muted-foreground font-medium mr-1">Filter by:</span>

        {/* Verification Status */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="h-8 rounded-xl border border-border/70 bg-card/40 px-2 text-xs text-foreground focus:outline-none"
        >
          <option value="all">All Verification Statuses</option>
          <option value="verified">Verified Only</option>
          <option value="pending">Pending Verification</option>
          <option value="unverified">Unverified Only</option>
          <option value="rejected">Rejected Only</option>
        </select>

        {/* Favorites button toggle */}
        <Button
          size="sm"
          variant={filters.onlyFavorites ? "default" : "outline"}
          onClick={() => onFilterChange({ ...filters, onlyFavorites: !filters.onlyFavorites })}
          className={`h-8 rounded-xl text-xs gap-1.5 ${
            filters.onlyFavorites ? "bg-amber-500 hover:bg-amber-600 text-white" : ""
          }`}
        >
          <Star className={`h-3 w-3 ${filters.onlyFavorites ? "fill-white" : ""}`} /> Favorites
        </Button>

        {/* Archive toggle */}
        <Button
          size="sm"
          variant={filters.onlyArchived ? "default" : "outline"}
          onClick={() => onFilterChange({ ...filters, onlyArchived: !filters.onlyArchived })}
          className="h-8 rounded-xl text-xs gap-1.5"
        >
          <Archive className="h-3 w-3" /> Archived
        </Button>

        <span className="ml-auto text-xs text-muted-foreground">
          Showing <strong>{totalResults}</strong> document{totalResults === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
};
