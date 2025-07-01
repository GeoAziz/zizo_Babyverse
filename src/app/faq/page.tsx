
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Lightbulb } from "lucide-react";

const faqs = [
  {
    id: "faq1",
    question: "What is Zizo's BabyVerse?",
    answer: "Zizo's BabyVerse is a futuristic, AI-enhanced marketplace for baby products. We offer a curated selection of high-quality items and leverage AI, through our assistant Zizi, to provide personalized recommendations and support for parents."
  },
  {
    id: "faq2",
    question: "How does the AI Assistant (Zizi) work?",
    answer: "You provide Zizi with some basic information about your baby (e.g., age, weight, preferences, allergies). Zizi then uses this information to suggest product bundles and answer your baby-related questions, drawing from a vast knowledge base of baby care and product information."
  },
  {
    id: "faq3",
    question: "Are your products safe and eco-friendly?",
    answer: "Yes! Product safety and sustainability are core to our mission. Many of our products feature eco-friendly materials and all items meet rigorous safety standards. Look for the 'Eco-Friendly' tag on product pages."
  },
  {
    id: "faq4",
    question: "What are 'Cosmic Standard Time' shipping estimates?",
    answer: "Our shipping estimates are generally given in Earth days. 'Cosmic Standard Time' is a fun, thematic way we refer to our operations. We aim for efficient delivery across the galaxy (i.e., your doorstep)!"
  },
  {
    id: "faq5",
    question: "How do I track my order?",
    answer: "Once your order is 'Dispatched' from our spaceport, you'll receive a tracking number. You can use this on our (conceptual) order tracking page or the carrier's website. For now, order status can be checked in your mock 'Order History' if you have an account."
  },
  {
    id: "faq6",
    question: "What is your return policy?",
    answer: "We offer a 30-Earth-day return policy for most items in their original, unopened condition. Some exclusions apply (e.g., personalized items, opened food products). Please consult our full (conceptual) Terms of Service or contact support for details."
  }
];

export default function FaqPage() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <section className="text-center">
        <HelpCircle className="mx-auto h-16 w-16 text-accent mb-4 animate-pulse" />
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Navigating the cosmos of parenthood? We've answered some common queries from fellow space explorers.
        </p>
      </section>

      <Card className="shadow-glow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Common Inquiries</CardTitle>
          <CardDescription>Find quick answers to your questions below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem value={faq.id} key={faq.id}>
                <AccordionTrigger className="text-left hover:text-accent font-semibold">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-primary"><Lightbulb className="mr-2"/> Can't Find Your Answer?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            If your question isn't covered here, please don't hesitate to <a href="/contact" className="text-accent hover:underline font-semibold">contact our support crew</a>.
            We're always happy to help you navigate the BabyVerse! You can also try asking Zizi, our AI Assistant.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
