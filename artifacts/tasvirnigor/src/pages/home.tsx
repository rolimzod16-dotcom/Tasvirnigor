import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { Portfolio } from "@/components/sections/portfolio";
import { Team } from "@/components/sections/team";
import { Contacts } from "@/components/sections/contacts";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Team />
        <Contacts />
      </main>
      <footer className="py-8 bg-card border-t border-border/50 text-center">
        <p className="text-muted-foreground text-sm font-light">
          © {new Date().getFullYear()} Tasvirnigor Film & Animation Studio. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
