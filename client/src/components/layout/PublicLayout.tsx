import { Link, useLocation } from "wouter";
import { Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const handleTopRouteClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const isTopRoute = href === "/" || href === "/catalog";
    if (!isTopRoute) {
      setMobileMenuOpen(false);
      return;
    }

    if (location === href) {
      event.preventDefault();
      scrollToTop();
      setMobileMenuOpen(false);
      return;
    }

    requestAnimationFrame(scrollToTop);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    { href: "/news", label: "Новости" },
    { href: "/about", label: "О компании" },
    { href: "/contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50/50">
      {/* Main Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group" onClick={(event) => handleTopRouteClick(event, "/")}>
            <img
              src="/branding/vladopt-logo-transparent.png"
              alt="Влад-Опт Маркет"
              className="h-9 sm:h-10 md:h-12 w-auto object-contain"
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={(event) => handleTopRouteClick(event, link.href)}
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

          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right mr-4">
              <a href="tel:+79247308283" className="block font-display font-bold text-lg text-slate-900 hover:text-primary transition-colors">
                +7 (924) 730-82-83
              </a>
              <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Владивосток
              </span>
            </div>
            <Link href="/catalog" className="inline-flex" onClick={(event) => handleTopRouteClick(event, "/catalog")}>
              <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all border-none">
                Каталог
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
              mobileMenuOpen
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-[calc(100%-0.35rem)] left-3 right-3 rounded-2xl border border-slate-200/70 bg-white/95 backdrop-blur-xl p-3 shadow-2xl shadow-slate-900/15 flex flex-col gap-2 animate-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={(event) => handleTopRouteClick(event, link.href)}
                className={`flex items-center rounded-xl px-3 py-3 font-medium transition-colors ${
                  location === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-1 rounded-xl bg-slate-50 p-3 flex flex-col gap-3">
              <a href="tel:+79247308283" className="flex items-center gap-3 p-2.5 rounded-lg font-display font-bold text-lg text-slate-900">
                <Phone className="w-5 h-5 text-primary" />
                +7 (924) 730-82-83
              </a>
              <Link href="/catalog" className="inline-flex" onClick={(event) => handleTopRouteClick(event, "/catalog")}>
                <Button className="w-full rounded-xl border-none" size="lg">Перейти в каталог</Button>
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
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/branding/vladopt-logo-transparent.png"
                  alt="Логотип Влад-Опт"
                  className="w-8 h-8 rounded-md object-cover object-left"
                  loading="lazy"
                  decoding="async"
                />
                <span className="font-display font-bold text-xl text-white">ВладОПТ</span>
              </div>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Оптовый поставщик инструмента и материалов для шиноремонта.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Навигация</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-primary transition-colors">Главная</Link></li>
                <li><Link href="/catalog" className="hover:text-primary transition-colors">Каталог</Link></li>
                <li><Link href="/news" className="hover:text-primary transition-colors">Новости</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">О компании</Link></li>
                <li><Link href="/contacts" className="hover:text-primary transition-colors">Контакты</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Контакты</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-slate-600" />
                  <span>Владивосток, Приморский край</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-600" />
                  <a href="tel:+79247308283" className="hover:text-white transition-colors">+7 (924) 730-82-83</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-600" />
                  <a href="tel:+79146610768" className="hover:text-white transition-colors">+7 (914) 661-07-68</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <a href="mailto:sale@vladopt.ru" className="hover:text-white transition-colors">sale@vladopt.ru</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <a href="mailto:sp@vladopt.ru" className="hover:text-white transition-colors">sp@vladopt.ru</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>&copy; ВладОПТ. Все права защищены.</p>
            <a href="/admin" className="hover:text-slate-400 transition-colors">
              Вход для персонала
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
