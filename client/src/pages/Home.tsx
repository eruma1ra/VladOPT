import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0">
          {/* landing page hero industrial pipes valves background */}
          <img 
            src="https://pixabay.com/get/g4359e64b48222cfe8f8f49c9b2f0a5f6c18f0b66152f291e32d17b7786e998fbb17a885d0581ffb8f4f5c3519d5060fa852469088ec403cc6ef992fe46f8d377_1280.jpg" 
            alt="Industrial pipeline background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Trusted B2B Supplier
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Wholesale Supply of <span className="text-primary">Industrial Valves</span> & Pipeline Fittings
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Direct supplies from top manufacturers. Exceptional quality, reliable logistics, and personalized wholesale pricing for serious partners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link href="/catalog" className="inline-flex">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-1 transition-all">
                  Browse Catalog
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/about" className="inline-flex">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white transition-all">
                  About Partnership
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Core Product Categories</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Explore our extensive range of certified industrial components built for extreme durability and performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Gate Valves", desc: "High-pressure gate valves for industrial applications", img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=800&auto=format&fit=crop" },
              { title: "Pipeline Connectors", desc: "Flanges, tees, and heavy-duty pipe fittings", img: "https://images.unsplash.com/photo-1621644783324-4db2c969b2d8?q=80&w=800&auto=format&fit=crop" },
              { title: "Measurement Tools", desc: "Precision gauges and diagnostic equipment", img: "https://images.unsplash.com/photo-1580983546054-93e506692790?q=80&w=800&auto=format&fit=crop" }
            ].map((cat, i) => (
              <Link key={i} href="/catalog" className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-900 shadow-xl shadow-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block">
                <img src={cat.img} alt={cat.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <h3 className="text-2xl font-display font-bold text-white mb-2">{cat.title}</h3>
                  <p className="text-slate-300 text-sm">{cat.desc}</p>
                  <div className="mt-4 inline-flex items-center text-primary font-medium text-sm group-hover:text-primary-foreground transition-colors">
                    View selection <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How to Order */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">How to start working with us</h2>
              <p className="text-slate-600 mb-10 text-lg">We've optimized our procurement process to save you time. Our managers handle the complexity so you can focus on your business.</p>
              
              <div className="space-y-8">
                {[
                  { icon: CheckCircle2, title: "1. Select Products", desc: "Browse our catalog and submit a wholesale request for the items you need." },
                  { icon: ShieldCheck, title: "2. Confirm Terms & Pricing", desc: "Our manager contacts you with a custom price list based on your volume." },
                  { icon: Truck, title: "3. Delivery & Fulfillment", desc: "Contract signed, payment received, and we ship directly to your facility." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <step.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h4>
                      <p className="text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform translate-x-4 translate-y-4" />
              {/* landing page industrial worker looking at clipboard */}
              <img 
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1000&auto=format&fit=crop" 
                alt="Industrial warehouse process" 
                className="relative z-10 rounded-3xl shadow-2xl border-4 border-white object-cover aspect-square"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
