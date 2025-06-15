'use server';

import { z } from 'zod';

export interface ContactFormState {
  message: string | null;
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
    general?: string[];
  };
  isSuccess?: boolean;
  submittedData?: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
}

const ContactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(1, { message: "Subject is required." }),
  message: z.string().min(5, { message: "Message must be at least 5 characters long." }),
});

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = ContactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the form for errors.",
      errors: validatedFields.error.flatten().fieldErrors,
      isSuccess: false,
    };
  }

  const { name, email, subject, message } = validatedFields.data;

  console.log("Server Action: Contact form data received on server:", { name, email, subject, message });

  try {
    // Simulate server-side processing like sending an email or saving to DB
    // For example: await sendEmail({ to: 'admin@babyverse.com', from: email, subject, body: message });
    
    return {
      message: `Thank you, ${name}! Your message about "${subject}" has been received. We'll get back to you soon at ${email}.`,
      submittedData: validatedFields.data,
      errors: undefined,
      isSuccess: true,
    };
  } catch (error) {
    console.error("Error processing contact form via Server Action:", error);
    return {
      message: "An unexpected error occurred on the server. Please try again later.",
      errors: { general: ["Server error, please try again."] },
      isSuccess: false,
    };
  }
}
