import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const valueBlocks = [
  {
    title: "Прямые поставки",
    text: "Работаем напрямую с заводами в Китае без посредников.",
  },
  {
    title: "Оптовый формат",
    text: "Работаем под заказ и регулярные поставки. Вы получаете стабильные условия и понятную экономику.",
  },
  {
    title: "Поставки по России",
    text: "Поддерживаем отгрузки для клиентов в разных регионах России с прозрачной коммуникацией на каждом этапе.",
  },
];

const principles = [
  "Консультация и подбор номенклатуры под задачу клиента.",
  "Оперативная отгрузка товара со склада во Владивостоке.",
  "Возможность поставки партии товара под заказ из Китая.",
  "Фокус на долгосрочное сотрудничество, а не на разовой продаже.",
];

const steps = [
  {
    title: "Знакомство",
    text: "Вы отправляете запрос на предоставление прайс листа.",
  },
  {
    title: "Формирование заявки",
    text: "После получения прайс-листа Вы формируете заявку и высылаете ее в наш адрес по электронной почте.",
  },
  {
    title: "Подтверждение",
    text: "Обрабатываем заказ, формируем счёт на оплату и согласовываем варианты отгрузки.",
  },
  {
    title: "Поставка",
    text: "После поступления оплаты на наш расчётный счёт, отгружаем товар через согласованную транспортную компанию в течении 3-х рабочих дней.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-7 md:space-y-9">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-7 md:p-12 shadow-xl shadow-slate-900/10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />

          <h1 className="mt-5 max-w-4xl text-3xl md:text-5xl font-display font-bold text-white leading-tight">
            Оптовые поставки для тех, кто ценит скорость, понятные условия и
            широкий ассортимент
          </h1>
          <p className="mt-5 max-w-3xl text-base md:text-lg text-slate-200/95 leading-relaxed">
            ВладОПТ — оптовый поставщик инструмента и материалов для
            шиноремонта.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white/95">
              <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                Формат
              </p>
              <p className="mt-1 text-sm md:text-base font-semibold">
                Крупный и мелкий опт
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white/95">
              <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                География
              </p>
              <p className="mt-1 text-sm md:text-base font-semibold">
                Поставки по всей России
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white/95">
              <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                Коммуникация
              </p>
              <p className="mt-1 text-sm md:text-base font-semibold">
                Телефон, email, Max
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {valueBlocks.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300"
            >
              <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-slate-600 leading-relaxed text-[15px]">
                {item.text}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-slate-900">
              Подход ВладОПТ
            </h2>
            <ul className="mt-5 space-y-3">
              {principles.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-slate-700 leading-relaxed"
                >
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary/80" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-slate-900">
              Как начинается сотрудничество
            </h2>
            <div className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                    Этап {index + 1}
                  </p>
                  <p className="mt-1 text-slate-900 font-semibold">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-display font-bold text-slate-900">
                Готовы обсудить условия сотрудничества?
              </h3>
              <p className="mt-2 text-slate-600">
                Оставьте запрос в каталоге, и мы подготовим актуальные условия
                под Ваш объем.
              </p>
            </div>
            <Link href="/catalog">
              <Button className="h-11 rounded-xl border-none px-6">
                Перейти в каталог
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
