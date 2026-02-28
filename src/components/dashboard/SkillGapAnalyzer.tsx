import { motion } from "framer-motion";
import { RefreshCw, Sparkles, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const skills = [
  {
    name: "JavaScript / ES6",
    current: 80,
    gap: "GAP: 15% (FOCUS ON ASYNC/AWAIT)",
    color: "bg-accent",
  },
  {
    name: "React & Redux",
    current: 65,
    gap: "GAP: 25% (LEARN REDUX TOOLKIT)",
    color: "bg-accent",
  },
  {
    name: "Web Accessibility (a11y)",
    current: 100,
    gap: "TARGET MET: INDUSTRY LEADER",
    color: "bg-success",
    complete: true,
  },
];

const SkillGapAnalyzer = () => {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-foreground">Skill Gap Analyzer</CardTitle>
            <p className="text-sm text-muted-foreground">Current vs. Target: Full Stack Developer</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-foreground">{skill.name}</span>
              <span className={`text-sm font-bold ${skill.complete ? "text-success" : "text-foreground"}`}>
                {skill.current}%
                {skill.complete && <Sparkles className="inline h-3.5 w-3.5 ml-1 text-success" />}
              </span>
            </div>
            <Progress value={skill.current} className={`h-2.5 ${skill.complete ? "[&>div]:bg-success" : "[&>div]:bg-accent"}`} />
            <p className={`text-xs mt-1 font-medium uppercase tracking-wide ${skill.complete ? "text-success" : "text-muted-foreground"}`}>
              {skill.gap}
            </p>
          </motion.div>
        ))}

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-4 rounded-lg bg-muted p-4 flex gap-3"
        >
          <Lightbulb className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <span className="font-bold">AI Insight:</span> You're very close! Improving your Node.js knowledge by 20% will unlock 15 more high-paying job opportunities this month.
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default SkillGapAnalyzer;
