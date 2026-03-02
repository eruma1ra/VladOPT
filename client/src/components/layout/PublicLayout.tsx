import { Link, useLocation } from "wouter";
import { PackageSearch, Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/catalog", label: "Catalog" },
    { href: "/about", label: "About Us" },
    { href: "/contacts", label: "Contacts" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 py-2 px-4 text-xs font-medium hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Moscow, Industrial Zone 4</span>
            <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> wholesale@vladopt.ru</span>
          </div>
          <div className="flex items-center gap-2">
            <span>B2B Wholesale Only</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-primary/20">
              <PackageSearch className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl tracking-tight text-slate-900 leading-none">ВладОПТ</h1>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Industrial Supply</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`font-medium text-sm transition-colors hover:text-primary relative py-2 ${
                  location === link.href ? "text-primary" : "text-slate-600"
                }`}
              >
                {link.label}
                {location === link.href && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-right mr-4">
              <a href="tel:+78005553535" className="block font-display font-bold text-lg text-slate-900 hover:text-primary transition-colors">
                8 (800) 555-35-35
              </a>
              <span className="text-xs text-slate-500">Mon-Fri 9:00 - 18:00</span>
            </div>
            <Link href="/catalog" className="inline-flex">
              <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Browse Catalog
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 p-4 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`p-3 rounded-lg font-medium ${
                  location === link.href ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4">
              <a href="tel:+78005553535" className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg font-display font-bold text-lg text-slate-900">
                <Phone className="w-5 h-5 text-primary" />
                8 (800) 555-35-35
              </a>
              <Link href="/catalog" className="inline-flex" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-xl" size="lg">Browse Catalog</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4 opacity-50 grayscale">
                <PackageSearch className="w-6 h-6" />
                <span className="font-display font-bold text-xl text-white">ВладОПТ</span>
              </div>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Leading wholesale supplier of industrial valves, pipeline fittings, and professional tools for B2B clients across the region.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/catalog" className="hover:text-primary transition-colors">Catalog</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Company</Link></li>
                <li><Link href="/contacts" className="hover:text-primary transition-colors">Contacts & Map</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contact Info</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-slate-600" />
                  <span>Moscow, Industrial Zone 4, Building 12</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-600" />
                  <a href="tel:+78005553535" className="hover:text-white transition-colors">8 (800) 555-35-35</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <a href="mailto:wholesale@vladopt.ru" className="hover:text-white transition-colors">wholesale@vladopt.ru</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>&copy; {new Date().getFullYear()} ВладОПТ. All rights reserved.</p>
            <a href="/api/login" className="hover:text-slate-400 transition-colors">
              Admin Login
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
