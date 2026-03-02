import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";

export default function Contacts() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-12 text-center">Contact Information</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Head Office</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Address</h4>
                  <p className="text-slate-600">Industrial Zone 4, Building 12<br/>Moscow, Russia</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Sales Department</h4>
                  <a href="tel:+78005553535" className="text-lg font-medium text-slate-800 hover:text-primary transition-colors">8 (800) 555-35-35</a>
                  <p className="text-sm text-slate-500 mt-1">Toll-free across the region</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                  <a href="mailto:wholesale@vladopt.ru" className="text-slate-600 hover:text-primary transition-colors">wholesale@vladopt.ru</a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Working Hours</h4>
                  <p className="text-slate-600">Monday - Friday: 09:00 - 18:00</p>
                  <p className="text-slate-600">Weekend: Closed (Orders processed on Monday)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 shadow-xl text-white flex flex-col justify-center text-center items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <MessageCircle className="w-16 h-16 text-primary mb-6" />
            <h2 className="text-3xl font-display font-bold mb-4">Fastest Response via Telegram</h2>
            <p className="text-slate-300 mb-8 max-w-md">
              Skip the email queues. Our sales managers monitor our official Telegram channel constantly during business hours.
            </p>
            <a 
              href="https://t.me/example_vladopt" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0088cc] hover:bg-[#0077b5] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0088cc]/30 flex items-center gap-3 z-10"
            >
              Open Telegram Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
