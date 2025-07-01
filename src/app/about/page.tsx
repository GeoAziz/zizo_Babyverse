
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Rocket, Lightbulb } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <section className="text-center">
        <Rocket className="mx-auto h-16 w-16 text-accent mb-4 animate-pulse" />
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">About Zizo's BabyVerse</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to the future of parenting! Zizo's BabyVerse was conceived from a dream to make the journey of parenthood
          an exciting, informed, and joyful adventure into a new dimension of care.
        </p>
      </section>

      <Card className="shadow-glow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl"><Lightbulb className="mr-2 text-primary"/> Our Cosmic Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Our mission is to empower parents with cutting-edge AI tools and a curated selection of high-quality,
            futuristic baby products. We aim to simplify decision-making, provide personalized insights, and deliver
            products that are safe, innovative, and sustainable for your little stars and the planet they'll inherit.
          </p>
          <p>
            We believe that technology, when thoughtfully applied, can enhance the beautiful chaos of raising children.
            From AI-powered product recommendations by Zizi, our friendly baby assistant, to eco-conscious materials
            sourced from across the galaxy (sustainably, of course!), every aspect of BabyVerse is designed with you and your baby in mind.
          </p>
        </CardContent>
      </Card>

      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl font-headline font-semibold text-primary mb-4">Meet the Interstellar Team (Concept)</h2>
          <p className="text-muted-foreground mb-4">
            Behind BabyVerse is a dedicated crew of dreamers, developers, designers, and (most importantly) parents.
            We're passionate about creating a seamless and delightful experience for families navigating the universe of baby care.
          </p>
          <p className="text-muted-foreground">
            Our "team" is constantly exploring new frontiers in baby tech, product safety, and AI assistance to bring you
            the best the cosmos has to offer.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <Image
            src="https://placehold.co/600x400.png"
            alt="Conceptual image of the BabyVerse team"
            width={600}
            height={400}
            className="object-cover"
            data-ai-hint="team collaboration"
          />
        </div>
      </section>

       <Card className="bg-accent/10 border-accent">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-accent"><Users className="mr-2"/> Join Our Parent Galaxy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Zizo's BabyVerse is more than just a marketplace; it's a community. We invite you to join our growing galaxy of parents,
            share your experiences, and embark on this incredible journey with us.
          </p>
           <p className="text-muted-foreground">
            Explore, discover, and let Zizi guide you through the wonders of modern parenting. Welcome aboard!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
