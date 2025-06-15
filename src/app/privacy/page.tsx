
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4 space-y-8">
      <section className="text-center">
        <Lock className="mx-auto h-16 w-16 text-accent mb-4" />
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">Privacy Policy for Zizo's BabyVerse</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your privacy is critically important to us. At ZizoCorp Galactic, we have a few fundamental principles about the data we (conceptually) handle for Zizo's BabyVerse.
        </p>
      </section>

      <Card className="shadow-glow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl"><FileText className="mr-2 text-primary"/> Our Commitment to Your Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground prose prose-sm max-w-none">
          <p>
            This Privacy Policy describes how your personal information is (conceptually) collected, used, and shared when you visit or make a purchase from Zizo's BabyVerse (the "Site").
            This is a conceptual document for a fictional application.
          </p>

          <h3 className="font-semibold text-primary">1. Information We Collect (Conceptual)</h3>
          <p>
            When you visit the Site, we (conceptually) automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.
          </p>
          <p>
            When you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information (like credit card numbers - though this is all mock), email address, and phone number. We refer to this information as “Order Information.”
          </p>
          <p>
            When you interact with our AI Assistant, Zizi, we collect the information you provide about your baby (e.g., name, age, weight, allergies, preferences) and your questions. This is used to personalize Zizi's responses and recommendations.
          </p>

          <h3 className="font-semibold text-primary">2. How We Use Your Information (Conceptual)</h3>
          <p>
            We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
          </p>
          <p>
            We use the information provided to Zizi to:
            <ul>
              <li>Provide personalized product recommendations and advice.</li>
              <li>Improve Zizi's capabilities and the overall user experience.</li>
              <li>(Conceptually) Aggregate anonymized data for research and development of new baby-centric technologies.</li>
            </ul>
          </p>
          <p>
            We use Device Information to help us screen for potential risk and fraud, and more generally to improve and optimize our Site.
          </p>

          <h3 className="font-semibold text-primary">3. Sharing Your Information (Conceptual)</h3>
          <p>
            We (conceptually) share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use a fictional e-commerce platform to power our online store. We also might use a fictional analytics provider to help us understand how our customers use the Site.
          </p>
          <p>
            Finally, we may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
          </p>

          <h3 className="font-semibold text-primary">4. Data Security (Conceptual)</h3>
          <p>
            We take reasonable precautions to protect your information. However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security. All payment transactions are mock and no real financial data is processed or stored.
          </p>

          <h3 className="font-semibold text-primary">5. Your Rights (Conceptual)</h3>
          <p>
            If you are a resident of certain star systems, you may have certain rights regarding your personal information, such as the right to access, correct, update, or request deletion of your personal information.
          </p>

          <h3 className="font-semibold text-primary">6. Changes to This Policy</h3>
          <p>
            We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
          </p>

          <h3 className="font-semibold text-primary">7. Contact Us</h3>
          <p>
            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at privacy-officer@zizosbabyverse.com or by mail using the details provided on our <a href="/contact" className="text-accent hover:underline">Contact Page</a>.
          </p>
           <p className="text-xs pt-4 border-t mt-4">Last updated: Stardate {new Date().toLocaleDateString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
