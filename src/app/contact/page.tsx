
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Send, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Placeholder for submission logic
    console.log("Contact form submitted:", formData);
    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. We'll get back to you from our space station soon!",
    });
    setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
  };

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <section className="text-center">
        <Mail className="mx-auto h-16 w-16 text-accent mb-4 animate-bounce" />
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">Get In Touch With BabyVerse Command</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have a question, a brilliant idea, or need to report a rogue asteroid? Our communication channels are open!
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-glow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl"><Send className="mr-2 text-primary"/> Send Us a Message</CardTitle>
            <CardDescription>Fill out the form below and our team will respond faster than light speed (almost).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Captain Parent" required />
                </div>
                <div>
                  <Label htmlFor="email">Your Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="parent@starfleet.com" required />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="Question about HyperDiapers" required />
              </div>
              <div>
                <Label htmlFor="message">Your Message</Label>
                <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Tell us what's on your mind..." rows={5} required />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <MessageSquare className="mr-2 h-5 w-5"/> Launch Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 shadow-card-glow">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Other Ways to Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start">
              <MapPin className="h-6 w-6 text-accent mr-4 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-primary">Our Galactic HQ (Conceptual)</h3>
                <p className="text-muted-foreground">123 Cosmos Avenue, Starship Nursery, Milky Way Galaxy</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-6 w-6 text-accent mr-4 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-primary">Holographic Comms</h3>
                <p className="text-muted-foreground">+1 (555) BABY-VERSE (Toll-Free)</p>
                <p className="text-xs text-muted-foreground">Mon - Fri, 9 AM - 5 PM Cosmic Standard Time</p>
              </div>
            </div>
             <div className="flex items-start">
              <Mail className="h-6 w-6 text-accent mr-4 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-primary">Support Stargate</h3>
                <p className="text-muted-foreground">support@zizosbabyverse.com</p>
              </div>
            </div>
            {/* Add social media links here if desired */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
