import { motion } from "framer-motion";
import { AlertTriangle, Briefcase, CheckCircle2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const alerts = [
  {
    icon: AlertTriangle,
    iconColor: "text-urgent",
    borderColor: "border-l-urgent",
    title: "Scheme Deadline",
    desc: "Assistive Device Grant applications close in 2 days.",
    time: "URGENT",
    timeColor: "text-urgent",
  },
  {
    icon: Briefcase,
    iconColor: "text-accent",
    borderColor: "border-l-accent",
    title: "New Job Match",
    desc: "3 new Frontend roles match your profile in New Delhi.",
    time: "3 HOURS AGO",
    timeColor: "text-muted-foreground",
  },
  {
    icon: CheckCircle2,
    iconColor: "text-success",
    borderColor: "border-l-success",
    title: "Profile Verified",
    desc: "Your disability certificate has been verified for 2024.",
    time: "YESTERDAY",
    timeColor: "text-muted-foreground",
  },
  {
    icon: MessageSquare,
    iconColor: "text-info",
    borderColor: "border-l-info",
    title: "Mentor Message",
    desc: "Anil K. responded to your career inquiry.",
    time: "2 DAYS AGO",
    timeColor: "text-muted-foreground",
  },
];

const RecentAlerts = () => {
  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground">Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={`flex items-start gap-3 rounded-lg border-l-4 ${alert.borderColor} bg-card p-3`}
          >
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted ${alert.iconColor}`}>
              <alert.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.desc}</p>
              <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${alert.timeColor}`}>{alert.time}</p>
            </div>
          </motion.div>
        ))}
        <button className="w-full text-center text-sm font-medium text-muted-foreground hover:text-accent mt-2 transition-colors">
          VIEW HISTORY
        </button>
      </CardContent>
    </Card>
  );
};

export default RecentAlerts;
