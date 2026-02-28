import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Landmark, CheckCircle2, XCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const SchemesPage = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { profile } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("schemes" as any).select("*").eq("is_active", true);
      setSchemes((data as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const checkEligibility = (scheme: any) => {
    if (!profile) return { eligible: false, score: 0 };
    let score = 0;
    let checks = 0;

    if (scheme.disability_types?.length) {
      checks++;
      if (scheme.disability_types.includes(profile.disability_type) || scheme.disability_types.includes("Any")) score++;
    }
    if (scheme.max_income && scheme.max_income > 0) {
      checks++;
      if (!profile.income || profile.income <= scheme.max_income) score++;
    }
    if (scheme.education_required && scheme.education_required !== "Any") {
      checks++;
      if (profile.education_level) score++;
    }
    checks = Math.max(checks, 1);
    return { eligible: score === checks, score: Math.round((score / checks) * 100) };
  };

  const filtered = schemes.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Scheme Eligibility</h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search schemes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading schemes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((scheme, i) => {
              const { eligible, score } = checkEligibility(scheme);
              return (
                <motion.div key={scheme.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                          <Landmark className="h-5 w-5" />
                        </div>
                        <Badge className={eligible ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                          {eligible ? <><CheckCircle2 className="h-3 w-3 mr-1" />ELIGIBLE</> : <><XCircle className="h-3 w-3 mr-1" />CHECK REQUIRED</>}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{scheme.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{scheme.ministry} • {scheme.category}</p>
                      <p className="text-sm text-foreground mt-2">{scheme.description}</p>
                      <p className="text-sm text-success font-medium mt-2">{scheme.benefits}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {scheme.disability_types?.map((t: string) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                      {score > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-success transition-all" style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-xs font-bold text-success">{score}%</span>
                        </div>
                      )}
                      <Button className="w-full mt-4 bg-primary text-primary-foreground">Check Eligibility</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SchemesPage;
