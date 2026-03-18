import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const valueBlocks = [
  {
    title: "Сфокусированный ассортимент",
    text: "Практичные позиции для шиноремонта и сервиса без перегруженного каталога и случайных товаров.",
  },
  {
    title: "Оптовый формат",
    text: "Работаем под партии и регулярные закупки, чтобы вы получали стабильные условия и понятную экономику.",
  },
  {
    title: "Поставки по России",
    text: "Поддерживаем отгрузки для клиентов в разных регионах РФ с прозрачной коммуникацией на каждом этапе.",
  },
];

const principles = [
  "Точный подбор номенклатуры под задачу клиента.",
  "Понятные условия по объему и срокам.",
  "Оперативная связь в Max и по email.",
  "Фокус на долгосрочном партнерстве, а не на разовой продаже.",
];

const steps = [
  { title: "Запрос", text: "Вы отправляете список позиций или задачу по подбору." },
  { title: "Предложение", text: "Формируем актуальные условия под нужный объем." },
  { title: "Подтверждение", text: "Фиксируем заказ и согласовываем отгрузку." },
  { title: "Поставка", text: "Передаем товар в удобную вам логистическую компанию." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-7 md:space-y-9">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-7 md:p-12 shadow-xl shadow-slate-900/10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />

          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            ВладОПТ
          </span>
          <h1 className="mt-5 max-w-4xl text-3xl md:text-5xl font-display font-bold text-white leading-tight">
            Оптовые поставки для тех, кто ценит скорость, понятные условия и широкий ассортимент
          </h1>
          <p className="mt-5 max-w-3xl text-base md:text-lg text-slate-200/95 leading-relaxed">
            ВладОПТ — оптовый поставщик материалов и инструмента для шиноремонта.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white/95">
              <p className="text-xs uppercase tracking-[0.14em] text-white/70">Формат</p>
              <p className="mt-1 text-sm md:text-base font-semibold">Оптовые поставки</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white/95">
              <p className="text-xs uppercase tracking-[0.14em] text-white/70">География</p>
              <p className="mt-1 text-sm md:text-base font-semibold">Поставки по всей РФ</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white/95">
              <p className="text-xs uppercase tracking-[0.14em] text-white/70">Коммуникация</p>
              <p className="mt-1 text-sm md:text-base font-semibold">Max и email без задержек</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {valueBlocks.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300">
              <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-slate-600 leading-relaxed text-[15px]">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-slate-900">Подход ВладОПТ</h2>
            <ul className="mt-5 space-y-3">
              {principles.map((point) => (
                <li key={point} className="flex items-start gap-3 text-slate-700 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary/80" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-slate-900">Как начинается сотрудничество</h2>
            <div className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Этап {index + 1}</p>
                  <p className="mt-1 text-slate-900 font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-display font-bold text-slate-900">Готовы обсудить поставку?</h3>
              <p className="mt-2 text-slate-600">Оставьте запрос в каталоге, и мы подготовим актуальные условия под ваш объем.</p>
            </div>
            <Link href="/catalog">
              <Button className="h-11 rounded-xl border-none px-6">Перейти в каталог</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
