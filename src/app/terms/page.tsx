
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      <section className="text-center">
        <ScrollText className="mx-auto h-16 w-16 text-accent mb-4" />
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">Terms of Service</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Zizo's BabyVerse website (the "Service") operated by ZizoCorp Galactic ("us", "we", or "our").
        </p>
      </section>

      <Card className="shadow-glow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl"><ShieldCheck className="mr-2 text-primary"/> Agreement to Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground prose prose-sm max-w-none">
          <p>
            By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
            This is a conceptual document for a fictional application.
          </p>

          <h3 className="font-semibold text-primary">1. Accounts (Conceptual)</h3>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h3 className="font-semibold text-primary">2. AI Assistant "Zizi" (Conceptual)</h3>
          <p>
            Our AI Assistant, Zizi, provides information and product recommendations based on the data you provide and its programming. While Zizi aims to be helpful and accurate, its advice should not be considered a substitute for professional medical or childcare advice. Always consult with a qualified professional for any health concerns or before making any decisions related to your child's well-being. We are not liable for any decisions made based on Zizi's suggestions.
          </p>
          
          <h3 className="font-semibold text-primary">3. Products and Purchases (Conceptual)</h3>
          <p>
            We endeavor to display as accurately as possible the colors and images of our products. We cannot guarantee that your computer monitor's display of any color will be accurate. All descriptions of products or product pricing are subject to change at anytime without notice, at our sole discretion. We reserve the right to discontinue any product at any time.
          </p>
          
          <h3 className="font-semibold text-primary">4. Intellectual Property (Conceptual)</h3>
          <p>
            The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of ZizoCorp Galactic and its licensors. The Service is protected by copyright, trademark, and other laws of both the local star system and foreign galaxies. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of ZizoCorp Galactic.
          </p>

          <h3 className="font-semibold text-primary">5. Limitation Of Liability (Conceptual)</h3>
          <p>
            In no event shall ZizoCorp Galactic, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h3 className="font-semibold text-primary">6. Governing Law (Conceptual)</h3>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the Galactic Federation of Planets, without regard to its conflict of law provisions.
          </p>

          <h3 className="font-semibold text-primary">7. Changes to Terms</h3>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 Earth days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h3 className="font-semibold text-primary">8. Contact Us</h3>
          <p>
            If you have any questions about these Terms, please contact us via our <a href="/contact" className="text-accent hover:underline">Contact Page</a>.
          </p>
          <p className="text-xs pt-4 border-t mt-4">Last updated: Stardate {new Date().toLocaleDateString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
