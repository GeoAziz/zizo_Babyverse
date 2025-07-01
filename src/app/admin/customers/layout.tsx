import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Customer Management",
  description: "Manage and analyze customer data",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}