import { motion } from "framer-motion";
import { Code2, Landmark, BookOpen, Star, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const recommendations = [
  {
    icon: Code2,
    iconBg: "bg-accent/10 text-accent",
    title: "Junior Frontend Developer",
    subtitle: "TechSolutions Inc • Remote",
    tags: ["React", "Tailwind"],
    badge: "95% MATCH",
    badgeClass: "bg-match/10 text-match border-match/20",
    action: "Apply Now",
    actionClass: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  {
    icon: Landmark,
    iconBg: "bg-warning/10 text-warning",
    title: "Assistive Tech Grant 2024",
    subtitle: "Ministry of Empowerment • Financial Aid",
    tags: [],
    badge: "GOVT SCHEME",
    badgeClass: "bg-muted text-muted-foreground",
    description: "Eligible for laptop and screen reader subsidies up to ₹50,000.",
    action: "Check Eligibility",
    actionClass: "bg-card text-foreground border border-border hover:bg-muted",
  },
  {
    icon: BookOpen,
    iconBg: "bg-info/10 text-info",
    title: "Advanced Web Accessibility",
    subtitle: "Free Course • 12 Lessons",
    tags: [],
    badge: "SKILL UP",
    badgeClass: "bg-accent/10 text-accent border-accent/20",
    rating: { stars: 4.9, reviews: "2.1k" },
    action: "Start Learning",
    actionClass: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
];

const SmartRecommendations = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-accent" />
          Smart Recommendations
        </h2>
        <button className="text-sm font-medium text-accent hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Card className="h-full border border-border hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${rec.iconBg}`}>
                    <rec.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={`text-xs font-semibold ${rec.badgeClass}`}>
                    {rec.badge}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">{rec.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{rec.subtitle}</p>
                {rec.tags.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {rec.tags.map((t) => (
                      <span key={t} className="text-xs text-accent font-medium bg-accent/5 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {rec.description && (
                  <p className="text-sm text-match mb-3">{rec.description}</p>
                )}
                {rec.rating && (
                  <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium text-foreground">{rec.rating.stars}</span>
                    <span>({rec.rating.reviews} reviews)</span>
                  </div>
                )}
                <div className="mt-auto">
                  <Button className={`w-full ${rec.actionClass}`}>{rec.action}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SmartRecommendations;
