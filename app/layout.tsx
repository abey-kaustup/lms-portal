import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SCIPL Elevate | Corporate LMS Portal",
  description: "Enterprise Onboarding & Employee Induction Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} light h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var _t1 = window.sessionStorage;
                  var _t2 = window.localStorage;
                } catch(e) {
                  function createMemStore() {
                    var s = {};
                    return {
                      getItem: function(k) { return s[k] || null; },
                      setItem: function(k, v) { s[k] = String(v); },
                      removeItem: function(k) { delete s[k]; },
                      clear: function() { s = {}; },
                      key: function(i) { return Object.keys(s)[i] || null; },
                      get length() { return Object.keys(s).length; }
                    };
                  }
                  try { Object.defineProperty(window, 'sessionStorage', { value: createMemStore(), configurable: true, writable: true }); } catch(err) {}
                  try { Object.defineProperty(window, 'localStorage', { value: createMemStore(), configurable: true, writable: true }); } catch(err) {}
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${poppins.className} min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 transition-colors`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
