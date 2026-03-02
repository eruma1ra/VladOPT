import { storage } from "./storage";

async function seed() {
  console.log("Seeding database...");
  const categories = await storage.getCategories();
  if (categories.length === 0) {
    const valvesCat = await storage.createCategory({ name: "Вентили", slug: "ventili" });
    const toolsCat = await storage.createCategory({ name: "Инструменты", slug: "instrumenty" });
    const pipesCat = await storage.createCategory({ name: "Трубы и фитинги", slug: "truby-i-fitingi" });

    const brandA = await storage.createBrand({ name: "ВладОПТ", slug: "vladopt" });
    const brandB = await storage.createBrand({ name: "TechValve", slug: "techvalve" });

    await storage.createProduct({
      sku: "V-001",
      name: "Вентиль шаровой латунный Ду 15",
      descriptionShort: "Надежный шаровой вентиль для систем водоснабжения.",
      categoryId: valvesCat.id,
      brandId: brandA.id,
      availability: "in_stock",
      isVisible: true,
      images: ["https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=600&auto=format&fit=crop"],
      attributes: {
        "Материал": "Латунь",
        "Диаметр": "15 мм",
        "Тип": "Шаровой",
      }
    });

    await storage.createProduct({
      sku: "V-002",
      name: "Вентиль балансировочный фланцевый",
      descriptionShort: "Фланцевый вентиль для точной балансировки.",
      categoryId: valvesCat.id,
      brandId: brandB.id,
      availability: "in_stock",
      isVisible: true,
      images: ["https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=600&auto=format&fit=crop"],
      attributes: {
        "Материал": "Сталь",
        "Подключение": "Фланцевое",
      }
    });

    await storage.createProduct({
      sku: "T-001",
      name: "Набор ключей гаечных 12 шт",
      descriptionShort: "Профессиональный набор гаечных ключей.",
      categoryId: toolsCat.id,
      brandId: brandA.id,
      availability: "in_stock",
      isVisible: true,
      images: ["https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=600&auto=format&fit=crop"],
      attributes: {
        "Количество": "12 шт",
        "Материал": "Хром-ванадиевая сталь",
      }
    });

    console.log("Database seeded successfully.");
  } else {
    console.log("Database already seeded.");
  }
}

seed().catch(console.error).finally(() => process.exit(0));
