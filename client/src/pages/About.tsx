export default function About() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-slate-100">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-8">About ВладОПТ</h1>
          
          <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
            <p className="text-xl text-slate-800 font-medium mb-8">
              ВладОПТ is a premier B2B supplier of industrial pipeline fittings, valves, and professional technical tools. For over a decade, we have been a reliable link between major manufacturers and industrial consumers.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Our Mission</h2>
            <p>
              We believe that industrial procurement should be predictable, transparent, and absolutely reliable. Downtime costs money, which is why our primary focus is on ensuring that the right components arrive at your facility exactly when they are needed.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Why Partner With Us?</h2>
            <ul className="space-y-4 my-8 list-none pl-0">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mt-1 mr-4">1</span>
                <div>
                  <strong className="text-slate-900 block mb-1">Direct Manufacturer Relationships</strong>
                  We skip the middleman. By working directly with factories, we secure the best possible wholesale pricing for our partners.
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mt-1 mr-4">2</span>
                <div>
                  <strong className="text-slate-900 block mb-1">Rigorous Quality Control</strong>
                  Every batch of valves and fittings undergoes strict documentary and physical checks before dispatch.
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mt-1 mr-4">3</span>
                <div>
                  <strong className="text-slate-900 block mb-1">Tailored Logistics</strong>
                  From small specialized orders to multi-truck deliveries, our logistics team plans the optimal route to your site.
                </div>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Wholesale Terms</h2>
            <p>
              We operate exclusively on a B2B basis. Our minimum order value ensures that we can dedicate the necessary resources to manage your supply chain effectively. Pricing is dynamic and scales with volume - the more you order, the better your specific tier becomes.
            </p>
            <p>
              To get started, simply request a quote through our catalog or reach out to our management team via Telegram or email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
