export default function About() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-16 shadow-sm border border-slate-100">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-8">О компании ВладОПТ</h1>
          
          <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
            <p className="text-xl text-slate-800 font-medium mb-8">
              ВладОПТ — ведущий B2B поставщик промышленной трубопроводной арматуры, вентилей и профессионального технического инструмента. Более десяти лет мы являемся надежным звеном между крупнейшими производителями и промышленными потребителями.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Наша миссия</h2>
            <p>
              Мы верим, что промышленные закупки должны быть предсказуемыми, прозрачными и абсолютно надежными. Простои стоят денег, поэтому наша основная задача — гарантировать, что нужные компоненты прибудут на ваш объект именно тогда, когда они необходимы.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Почему выбирают нас?</h2>
            <ul className="space-y-4 my-8 list-none pl-0">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mt-1 mr-4">1</span>
                <div>
                  <strong className="text-slate-900 block mb-1">Прямые отношения с производителями</strong>
                  Мы работаем без посредников. Напрямую сотрудничая с заводами, мы обеспечиваем лучшие оптовые цены для наших партнеров.
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mt-1 mr-4">2</span>
                <div>
                  <strong className="text-slate-900 block mb-1">Строгий контроль качества</strong>
                  Каждая партия вентилей и фитингов проходит тщательную документальную и физическую проверку перед отгрузкой.
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mt-1 mr-4">3</span>
                <div>
                  <strong className="text-slate-900 block mb-1">Индивидуальная логистика</strong>
                  От небольших специализированных заказов до многотонных поставок — наша логистическая команда планирует оптимальный маршрут до вашего объекта.
                </div>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Оптовые условия</h2>
            <p>
              Мы работаем исключительно в сегменте B2B. Цены являются динамическими и зависят от объема — чем больше вы заказываете, тем выгоднее становится ваш индивидуальный тариф.
            </p>
            <p>
              Чтобы начать сотрудничество, просто запросите цену через наш каталог или свяжитесь с нашим отделом продаж через Telegram или по электронной почте.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
