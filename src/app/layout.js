import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: {
    default: "EduSaaS — School Management Platform for Bangladesh",
    template: "%s | EduSaaS",
  },
  description:
    "The all-in-one SaaS platform for schools, colleges, madrasahs, and coaching centres in Bangladesh. Manage students, teachers, attendance, exams, fees and more.",
  keywords: [
    "school management system",
    "saas",
    "bangladesh",
    "education software",
    "student management",
  ],
  authors: [{ name: "EduSaaS Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://edusaas.app",
    siteName: "EduSaaS",
    title: "EduSaaS — School Management Platform",
    description: "The all-in-one SaaS platform for educational institutions.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
