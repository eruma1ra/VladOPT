import "dotenv/config";
import pg from "pg";

type CategorySeed = { name: string; slug: string };
type BrandSeed = { name: string; slug: string };
type ProductSeed = {
  sku: string;
  name: string;
  descriptionShort: string;
  categorySlug: string;
  brandSlug: string;
  images: string[];
  attributes: Record<string, string>;
  availability: "in_stock" | "preorder" | "out_of_stock";
};
type NewsSeed = {
  title: string;
  content: string;
  image: string | null;
  status: "active" | "archived" | "limited_offer";
  isFeatured: boolean;
};

const categories: CategorySeed[] = [
  { name: "Вентили", slug: "ventili" },
  { name: "Трубы и фитинги", slug: "truby-i-fitingi" },
  { name: "Инструменты", slug: "instrumenty" },
];

const brands: BrandSeed[] = [
  { name: "ВладОПТ", slug: "vladopt" },
  { name: "TechValve", slug: "techvalve" },
  { name: "ProTool", slug: "protool" },
];

const products: ProductSeed[] = [
  {
    sku: "VLV-001",
    name: "Вентиль шаровой латунный Ду15",
    descriptionShort: "Надежный вентиль для бытовых и промышленных систем водоснабжения.",
    categorySlug: "ventili",
    brandSlug: "techvalve",
    images: ["https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=1200&auto=format&fit=crop"],
    attributes: {
      Материал: "Латунь",
      Диаметр: "15 мм",
      Давление: "PN40",
      Присоединение: "ВР/НР",
    },
    availability: "in_stock",
  },
  {
    sku: "VLV-002",
    name: "Вентиль балансировочный фланцевый",
    descriptionShort: "Для точной гидравлической балансировки систем отопления.",
    categorySlug: "ventili",
    brandSlug: "techvalve",
    images: ["https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=1200&auto=format&fit=crop"],
    attributes: {
      Материал: "Сталь",
      Присоединение: "Фланцевое",
      Диаметр: "50 мм",
      Исполнение: "Промышленное",
    },
    availability: "preorder",
  },
  {
    sku: "FIT-014",
    name: "Муфта переходная 1\"x3/4\"",
    descriptionShort: "Фитинг для надежного перехода между диаметрами в трубопроводе.",
    categorySlug: "truby-i-fitingi",
    brandSlug: "vladopt",
    images: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1200&auto=format&fit=crop"],
    attributes: {
      Материал: "Латунь",
      Резьба: "Внутренняя",
      Покрытие: "Никель",
    },
    availability: "in_stock",
  },
  {
    sku: "PIP-032",
    name: "Труба PPR армированная 32 мм",
    descriptionShort: "Для систем отопления и горячего водоснабжения.",
    categorySlug: "truby-i-fitingi",
    brandSlug: "vladopt",
    images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"],
    attributes: {
      Длина: "4 м",
      Диаметр: "32 мм",
      Назначение: "ГВС/Отопление",
    },
    availability: "in_stock",
  },
  {
    sku: "TOOL-101",
    name: "Набор гаечных ключей 12 предметов",
    descriptionShort: "Профессиональный набор для монтажных и сервисных работ.",
    categorySlug: "instrumenty",
    brandSlug: "protool",
    images: ["https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=1200&auto=format&fit=crop"],
    attributes: {
      Материал: "Cr-V сталь",
      Количество: "12",
      Кейс: "Да",
    },
    availability: "in_stock",
  },
  {
    sku: "TOOL-225",
    name: "Труборез профессиональный 6–42 мм",
    descriptionShort: "Точный и быстрый рез пластиковых и металлопластиковых труб.",
    categorySlug: "instrumenty",
    brandSlug: "protool",
    images: ["https://images.unsplash.com/photo-1581147036324-c1c2a42f104f?q=80&w=1200&auto=format&fit=crop"],
    attributes: {
      Диапазон: "6-42 мм",
      Корпус: "Алюминий",
      Лезвие: "Закаленная сталь",
    },
    availability: "out_of_stock",
  },
];

const newsItems: NewsSeed[] = [
  {
    title: "Запустили регулярные поставки по Приморскому краю",
    content:
      "Мы обновили график логистики и запустили еженедельные отгрузки по ключевым направлениям Приморского края.\\n\\nЭто сокращает срок поставки популярных позиций до 2-4 рабочих дней и позволяет быстрее закрывать потребности объектов в сезон.",
    image: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=1400&auto=format&fit=crop",
    status: "active",
    isFeatured: true,
  },
  {
    title: "Новая партия латунной запорной арматуры уже на складе",
    content:
      "На склад поступила расширенная линейка латунных вентилей с рабочим давлением PN40.\\n\\nДобавили позиции с разными типами присоединений и диаметрами от Ду15 до Ду50. Подходит для монтажных компаний и оптовых закупок.",
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=1400&auto=format&fit=crop",
    status: "active",
    isFeatured: false,
  },
  {
    title: "Спецусловия на инструментальные наборы до конца месяца",
    content:
      "Для постоянных партнеров действует специальное предложение на комплекты профессионального инструмента.\\n\\nУточняйте доступные позиции и условия у менеджера по телефону или через форму запроса.",
    image: "https://images.unsplash.com/photo-1486946255434-2466348c2166?q=80&w=1400&auto=format&fit=crop",
    status: "limited_offer",
    isFeatured: false,
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  try {
    for (const category of categories) {
      await pool.query(
        `
        insert into categories (name, slug)
        values ($1, $2)
        on conflict (slug) do update set name = excluded.name
        `,
        [category.name, category.slug]
      );
    }

    for (const brand of brands) {
      await pool.query(
        `
        insert into brands (name, slug)
        values ($1, $2)
        on conflict (slug) do update set name = excluded.name
        `,
        [brand.name, brand.slug]
      );
    }

    const categoryRows = await pool.query<{ id: number; slug: string }>("select id, slug from categories");
    const brandRows = await pool.query<{ id: number; slug: string }>("select id, slug from brands");

    const categoryBySlug = new Map(categoryRows.rows.map((row) => [row.slug, row.id]));
    const brandBySlug = new Map(brandRows.rows.map((row) => [row.slug, row.id]));

    for (const product of products) {
      const categoryId = categoryBySlug.get(product.categorySlug);
      const brandId = brandBySlug.get(product.brandSlug);

      if (!categoryId || !brandId) {
        throw new Error(`Missing category/brand for product ${product.sku}`);
      }

      await pool.query(
        `
        insert into products (
          sku,
          name,
          description_short,
          category_id,
          brand_id,
          images,
          attributes,
          availability
        ) values ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8)
        on conflict (sku) do update set
          name = excluded.name,
          description_short = excluded.description_short,
          category_id = excluded.category_id,
          brand_id = excluded.brand_id,
          images = excluded.images,
          attributes = excluded.attributes,
          availability = excluded.availability
        `,
        [
          product.sku,
          product.name,
          product.descriptionShort,
          categoryId,
          brandId,
          JSON.stringify(product.images),
          JSON.stringify(product.attributes),
          product.availability,
        ]
      );
    }

    for (const item of newsItems) {
      await pool.query("delete from news where title = $1", [item.title]);
      await pool.query(
        `
        insert into news (title, content, image, status, is_featured)
        values ($1, $2, $3, $4, $5)
        `,
        [item.title, item.content, item.image, item.status, item.isFeatured]
      );
    }

    const counts = await pool.query<{
      categories_count: string;
      brands_count: string;
      products_count: string;
      news_count: string;
    }>(`
      select
        (select count(*) from categories)::text as categories_count,
        (select count(*) from brands)::text as brands_count,
        (select count(*) from products)::text as products_count,
        (select count(*) from news)::text as news_count
    `);

    const c = counts.rows[0];
    console.log(
      `Seed complete: categories=${c.categories_count}, brands=${c.brands_count}, products=${c.products_count}, news=${c.news_count}`
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
