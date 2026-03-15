import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Building2, Heart, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { icon: GraduationCap, name: "National Institute for the Visually Handicapped", type: "Training Center", address: "116, Rajpur Road, Dehradun", distance: "2.3 km" },
  { icon: Heart, name: "Amar Jyoti Charitable Trust", type: "NGO", address: "Karkardooma, Delhi", distance: "5.1 km" },
  { icon: Building2, name: "Office of Chief Commissioner for PwD", type: "Government Office", address: "Sarojini House, New Delhi", distance: "8.7 km" },
  { icon: Heart, name: "Blind Relief Association", type: "NGO", address: "Lal Bahadur Shastri Marg, Delhi", distance: "4.2 km" },
  { icon: GraduationCap, name: "Skill Development Centre for PwD", type: "Training Center", address: "Sector 62, Noida", distance: "15.3 km" },
  { icon: Building2, name: "District Disability Rehabilitation Centre", type: "Government Office", address: "Civil Lines, Delhi", distance: "6.8 km" },
];

const NearbyPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          icon={<MapPin className="h-5 w-5 text-white" />}
          title="Nearby Services"
          subtitle="Find disability support services, NGOs, and government offices near you"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s, i) => (
            <Card key={i} className="border border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent flex-shrink-0">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{s.name}</h3>
                    <p className="text-sm text-accent font-medium">{s.type}</p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {s.address}
                    </p>
                    <p className="text-sm font-medium text-foreground mt-1">{s.distance} away</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-primary text-primary-foreground">Get Directions</Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NearbyPage;
