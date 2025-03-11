import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ExternalLink, ArrowRight } from "lucide-react";
import { SiHubspot, SiLinkedin } from "react-icons/si";
import { BsPersonBadge } from "react-icons/bs";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-background flex flex-col items-center pt-8 px-4">
      <div className="w-full max-w-5xl mx-auto text-center py-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Reqmasters Spider
        </h1>
        <p className="text-2xl text-muted-foreground mb-8">
          Das interne Automatisierungstool der Reqmasters GmbH
        </p>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          Reqmasters Spider ist die zentrale Plattform für alle internen Prozesse und Automatisierungen. 
          Nutze das Dashboard, um einen schnellen Überblick aktuelle Projektezeiten und Trends zu erhalten.
        </p>

        <Button asChild size="lg" className="mb-12">
          <Link href="/dashboard" className="gap-2">
            Zum Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <QuickLinkCard 
            title="Personio"
            description="Zeiterfassung, Urlaub & Personalverwaltung"
            icon={<Image src="/icons/personio-icon.png" alt="Personio" width={20} height={20} className="object-contain" />}
            linkText="Zu Personio"
            linkUrl="https://reqmasters.personio.de/"
            iconBgColor="bg-white"
            iconColor="text-black"
          />
          
          <QuickLinkCard 
            title="HubSpot"
            description="CRM, Vertrieb & Kundenkommunikation"
            icon={<SiHubspot className="h-5 w-5" />}
            linkText="Zu HubSpot"
            linkUrl="https://app.hubspot.com/login"
            iconBgColor="bg-[#FF7A59]"
            iconColor="text-white"
          />
          
          <QuickLinkCard 
            title="SharePoint"
            description="Dokumente & Unternehmensressourcen"
            icon={<Image src="/icons/sharepoint-icon.png" alt="SharePoint" width={20} height={20} className="object-contain" />}
            linkText="Zum SharePoint"
            linkUrl="https://asappittest.sharepoint.com/sites/SharepointPortal"
            iconBgColor="bg-white"
            iconColor="text-black"
          />
          
          <QuickLinkCard 
            title="LinkedIn"
            description="Professionelles Netzwerk & Unternehmensseite"
            icon={<SiLinkedin className="h-5 w-5" />}
            linkText="Zu LinkedIn"
            linkUrl="https://www.linkedin.com/company/reqmasters/"
            iconBgColor="bg-[#0A66C2]"
            iconColor="text-white"
          />
        </div>
      </div>
    </main>
  );
}

interface QuickLinkCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkText: string;
  linkUrl: string;
  iconBgColor?: string;
  iconColor?: string;
}

function QuickLinkCard({ 
  title, 
  description, 
  icon, 
  linkText, 
  linkUrl,
  iconBgColor = "bg-gray-100",
  iconColor = "text-gray-700"
}: QuickLinkCardProps) {
  return (
    <Card className="overflow-hidden border border-border transition-all duration-200 hover:shadow-lg hover:border-gray-400">
      <div className="p-6 bg-background flex items-center gap-3 border-b border-border">
        <div className={`p-2 rounded-full ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button variant="outline" size="sm" className="w-full hover:bg-gray-100" asChild>
          <Link href={linkUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
            {linkText}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
