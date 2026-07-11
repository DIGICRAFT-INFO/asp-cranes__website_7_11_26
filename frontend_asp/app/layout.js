import "./globals.css";

export const metadata = {
  title: "ASP Cranes",
  description: "Professional Crane Rental Services",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
