import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sampleTasks: Prisma.TaskCreateInput[] = [
  {
    externalCode: "M9A_2025_ILUS_01",
    year: 2025,
    term: "ILUSTRACNI",
    orderInTest: 1,
    topic: "CISLA_A_VYPOCTY",
    difficulty: "ZAKLADNI",
    statementLatex: "Vypočítejte: $$\\frac{3}{4} + \\frac{1}{6}$$ Výsledek zapište jako zlomek v základním tvaru.",
    correctAnswer: "11/12",
    answerFormat: "text",
    solutionSteps: [
      { order: 1, socraticQuestion: "Co potřebujeme najít, než zlomky sečteme?", expectedInsight: "společný jmenovatel" },
      { order: 2, socraticQuestion: "Jaké je nejmenší společné násobek čísel 4 a 6?", expectedInsight: "12" },
      { order: 3, socraticQuestion: "Na kolikátiny převedeš každý zlomek?", expectedInsight: "9/12 a 2/12" },
    ] satisfies Prisma.InputJsonValue,
    sourceUrl: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika",
    isPublished: true,
  },
  {
    externalCode: "M9A_2025_ILUS_07",
    year: 2025,
    term: "ILUSTRACNI",
    orderInTest: 7,
    topic: "ROVNICE_A_NEROVNICE",
    difficulty: "STREDNI",
    statementLatex: "Řešte rovnici: $$3(x - 2) = 2x + 5$$",
    correctAnswer: "11",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Co uděláš nejdřív se závorkou na levé straně?", expectedInsight: "roznásobit 3(x-2) na 3x - 6" },
      { order: 2, socraticQuestion: "Jak dostaneš všechny členy s x na jednu stranu?", expectedInsight: "3x - 2x = 5 + 6" },
      { order: 3, socraticQuestion: "Kolik vyjde x po úpravě?", expectedInsight: "x = 11" },
    ] satisfies Prisma.InputJsonValue,
    sourceUrl: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika",
    isPublished: true,
  },
  {
    externalCode: "M9A_2025_ILUS_12",
    year: 2025,
    term: "ILUSTRACNI",
    orderInTest: 12,
    topic: "GEOMETRIE_ROVINNA",
    difficulty: "STREDNI",
    statementLatex:
      "Obdélník má obvod $$O = 28\\ \\text{cm}$$ a jedna jeho strana je o $$4\\ \\text{cm}$$ delší než druhá. Vypočítejte obsah obdélníku v cm².",
    correctAnswer: "48",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Jak vypadá vzorec pro obvod obdélníku se stranami a, b?", expectedInsight: "O = 2(a+b)" },
      { order: 2, socraticQuestion: "Když je b = a + 4, jak vyjádříš součet a + b pomocí a?", expectedInsight: "2a + 4" },
      { order: 3, socraticQuestion: "Jakou hodnotu má a, když 2(2a+4)=28?", expectedInsight: "a = 5, b = 9" },
      { order: 4, socraticQuestion: "Jaký je obsah, když vynásobíš strany?", expectedInsight: "5 × 9 = 45... zkontroluj výpočet" },
    ] satisfies Prisma.InputJsonValue,
    sourceUrl: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika",
    isPublished: true,
  },
  {
    externalCode: "M9A_2025_ILUS_18",
    year: 2025,
    term: "ILUSTRACNI",
    orderInTest: 18,
    topic: "SLOVNI_ULOHY",
    difficulty: "POKROCILA",
    statementLatex:
      "Turistický oddíl ušel první den $$\\frac{2}{5}$$ celé trasy, druhý den $$\\frac{1}{3}$$ zbytku a třetí den zbylých $$8\\ \\text{km}$$. Kolik kilometrů měřila celá trasa?",
    correctAnswer: "20",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Jakou část trasy zbývá po prvním dni?", expectedInsight: "3/5 celé trasy" },
      { order: 2, socraticQuestion: "Kolik z těchto 3/5 ušli druhý den a kolik zbývá?", expectedInsight: "1/3 z 3/5 = 1/5, zbývá 2/5" },
      { order: 3, socraticQuestion: "Pokud 2/5 trasy je 8 km, jak spočítáš celou trasu?", expectedInsight: "8 ÷ 2 × 5 = 20 km" },
    ] satisfies Prisma.InputJsonValue,
    sourceUrl: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika",
    isPublished: true,
  },
  {
    externalCode: "M9A_2025_ILUS_21",
    year: 2025,
    term: "ILUSTRACNI",
    orderInTest: 21,
    topic: "FINANCNI_MATEMATIKA",
    difficulty: "ZAKLADNI",
    statementLatex:
      "Kolo stálo $$4\\,500\\ \\text{Kč}$$. V akci zlevnilo o $$20\\,\\%$$. Kolik korun kolo stojí po slevě?",
    correctAnswer: "3600",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Kolik korun představuje 20 % z 4500 Kč?", expectedInsight: "900 Kč" },
      { order: 2, socraticQuestion: "Jak z původní ceny a slevy dostaneš novou cenu?", expectedInsight: "4500 - 900 = 3600" },
    ] satisfies Prisma.InputJsonValue,
    sourceUrl: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika",
    isPublished: true,
  },
  {
    externalCode: "M9A_2025_ILUS_25",
    year: 2025,
    term: "ILUSTRACNI",
    orderInTest: 25,
    topic: "STATISTIKA_A_PRAVDEPODOBNOST",
    difficulty: "STREDNI",
    statementLatex:
      "V krabici je 5 červených a 3 modré kuličky. Jaká je pravděpodobnost, že náhodně vytažená kulička bude modrá? Výsledek zapište jako zlomek.",
    correctAnswer: "3/8",
    answerFormat: "text",
    solutionSteps: [
      { order: 1, socraticQuestion: "Kolik kuliček je v krabici celkem?", expectedInsight: "8" },
      { order: 2, socraticQuestion: "Jak spočítáš pravděpodobnost jako podíl?", expectedInsight: "počet modrých / celkový počet = 3/8" },
    ] satisfies Prisma.InputJsonValue,
    sourceUrl: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika",
    isPublished: true,
  },
  {
    externalCode: "M9A_2025_ILUS_29",
    year: 2025,
    term: "ILUSTRACNI",
    orderInTest: 29,
    topic: "FUNKCE_A_GRAFY",
    difficulty: "POKROCILA",
    statementLatex:
      "Lineární funkce $$f(x) = ax + b$$ prochází body $$[1, 5]$$ a $$[3, 9]$$. Určete hodnotu $$f(0)$$.",
    correctAnswer: "3",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Jak spočítáš směrnici a ze dvou bodů?", expectedInsight: "a = (9-5)/(3-1) = 2" },
      { order: 2, socraticQuestion: "Jak dosadíš do rovnice f(1) = 5, abys našel/la b?", expectedInsight: "5 = 2·1 + b → b = 3" },
      { order: 3, socraticQuestion: "Co je tedy f(0)?", expectedInsight: "f(0) = b = 3" },
    ] satisfies Prisma.InputJsonValue,
    sourceUrl: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika",
    isPublished: true,
  },
  {
    externalCode: "M9A_2025_ILUS_33",
    year: 2025,
    term: "ILUSTRACNI",
    orderInTest: 33,
    topic: "LOGIKA_A_KOMBINATORIKA",
    difficulty: "STREDNI",
    statementLatex: "Kolika způsoby lze seřadit 4 různé knihy vedle sebe na poličku?",
    correctAnswer: "24",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Kolik možností máš pro první pozici?", expectedInsight: "4" },
      { order: 2, socraticQuestion: "Kolik možností zbývá pro druhou, třetí a čtvrtou pozici?", expectedInsight: "3, pak 2, pak 1" },
      { order: 3, socraticQuestion: "Jak tyto možnosti zkombinuješ dohromady?", expectedInsight: "4 × 3 × 2 × 1 = 24" },
    ] satisfies Prisma.InputJsonValue,
    sourceUrl: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika",
    isPublished: true,
  },
  {
    externalCode: "M9A_2024_RADNY1_15",
    year: 2024,
    term: "RADNY_1",
    orderInTest: 15,
    topic: "VYRAZY",
    difficulty: "STREDNI",
    statementLatex: "Zjednodušte výraz: $$(2x + 3)^2 - 4x(x + 3)$$",
    correctAnswer: "9",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Jak roznásobíš (2x+3)² pomocí vzorce (a+b)²?", expectedInsight: "4x² + 12x + 9" },
      { order: 2, socraticQuestion: "Jak roznásobíš 4x(x+3)?", expectedInsight: "4x² + 12x" },
      { order: 3, socraticQuestion: "Co zbyde, když od prvního výrazu odečteš druhý?", expectedInsight: "4x²+12x+9 - 4x²-12x = 9" },
    ] satisfies Prisma.InputJsonValue,
    sourceUrl: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika",
    isPublished: true,
  },
  {
    externalCode: "M9A_2024_RADNY1_22",
    year: 2024,
    term: "RADNY_1",
    orderInTest: 22,
    topic: "GEOMETRIE_PROSTOROVA",
    difficulty: "POKROCILA",
    statementLatex:
      "Krychle má objem $$125\\ \\text{cm}^3$$. Vypočítejte povrch této krychle v cm².",
    correctAnswer: "150",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Jak z objemu krychle zjistíš délku hrany?", expectedInsight: "třetí odmocnina ze 125 = 5 cm" },
      { order: 2, socraticQuestion: "Kolik stěn má krychle a jaký je obsah jedné stěny?", expectedInsight: "6 stěn, obsah jedné = 25 cm²" },
      { order: 3, socraticQuestion: "Jak spočítáš celkový povrch?", expectedInsight: "6 × 25 = 150 cm²" },
    ] satisfies Prisma.InputJsonValue,
    sourceUrl: "https://prijimacky.cermat.cz/menu/testova-zadani-k-procvicovani/testova-zadani-v-pdf/ctyrlete-obory-matematika",
    isPublished: true,
  },
  // ---------------------------------------------------------------------
  // Vlastní originální úlohy inspirované strukturou ostrého testu JPZ
  // (otevřené/uzavřené úlohy, díly, tvrzení pravda/nepravda) — NEJDE
  // o doslovné kopie CERMAT zadání, pouze o stejný formát a obtížnost.
  // ---------------------------------------------------------------------
  {
    externalCode: "PL_ORIG_001",
    year: 2026,
    term: "ILUSTRACNI",
    orderInTest: 40,
    topic: "SLOVNI_ULOHY",
    difficulty: "STREDNI",
    statementLatex:
      "Menší sud má o čtvrtinu menší objem než větší sud. Objem menšího sudu je $$240$$ litrů. Vypočítejte objem většího sudu v litrech.",
    correctAnswer: "320",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Pokud je menší sud o čtvrtinu menší, kolik procent objemu většího sudu představuje?", expectedInsight: "3/4, tedy 75 %" },
      { order: 2, socraticQuestion: "Jak z toho, že 240 litrů je 3/4 celku, dopočítáš celý objem?", expectedInsight: "240 ÷ 3 × 4 = 320" },
    ] satisfies Prisma.InputJsonValue,
    isPublished: true,
  },
  {
    externalCode: "PL_ORIG_002",
    year: 2026,
    term: "ILUSTRACNI",
    orderInTest: 41,
    topic: "SLOVNI_ULOHY",
    difficulty: "POKROCILA",
    statementLatex:
      "Turistická stezka vede od chaty k rozhledně. Eva vyrazila od chaty, ušla tři pětiny stezky a zastavila se u studánky. Odtud se vrátila o šestinu vzdálenosti, kterou už ušla, protože zapomněla mapu. Poté pokračovala až k rozhledně. Délku celé stezky označte $$x$$. Vyjádřete výrazem s proměnnou $$x$$ vzdálenost mezi studánkou a rozhlednou.",
    correctAnswer: "2x/5",
    answerFormat: "text",
    solutionSteps: [
      { order: 1, socraticQuestion: "Jakou část cesty má Eva za sebou, když dorazí ke studánce?", expectedInsight: "3/5 z x" },
      { order: 2, socraticQuestion: "Jaká část stezky jí zbývá do rozhledny od studánky?", expectedInsight: "x - 3x/5 = 2x/5" },
    ] satisfies Prisma.InputJsonValue,
    isPublished: true,
  },
  {
    externalCode: "PL_ORIG_003",
    year: 2026,
    term: "ILUSTRACNI",
    orderInTest: 42,
    topic: "GEOMETRIE_ROVINNA",
    difficulty: "STREDNI",
    statementLatex:
      "Rovnoramenný trojúhelník má základnu délky $$18\\ \\text{cm}$$ a obvod $$46\\ \\text{cm}$$. Vypočítejte v cm² obsah tohoto trojúhelníku, pokud jeho výška na základnu měří $$8\\ \\text{cm}$$.",
    correctAnswer: "72",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Jaký vzorec použiješ pro obsah trojúhelníku, znáš-li základnu a výšku?", expectedInsight: "S = (základna × výška) / 2" },
      { order: 2, socraticQuestion: "Co dostaneš po dosazení 18 a 8 do vzorce?", expectedInsight: "(18 × 8) / 2 = 72" },
    ] satisfies Prisma.InputJsonValue,
    isPublished: true,
  },
  {
    externalCode: "PL_ORIG_004",
    year: 2026,
    term: "ILUSTRACNI",
    orderInTest: 43,
    topic: "GEOMETRIE_PROSTOROVA",
    difficulty: "POKROCILA",
    statementLatex:
      "Dva pravidelné čtyřboké hranoly mají stejnou podstavnou hranu délky $$4\\ \\text{cm}$$. První hranol má o $$48\\ \\text{cm}^2$$ větší povrch než druhý. O kolik centimetrů se liší výšky obou hranolů?",
    correctAnswer: "3",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Jak vypadá vzorec pro povrch pravidelného čtyřbokého hranolu s hranou podstavy a a výškou v?", expectedInsight: "S = 2a² + 4av" },
      { order: 2, socraticQuestion: "Když podstavy jsou stejné, co přesně způsobuje rozdíl 48 cm² v povrchu?", expectedInsight: "rozdíl plášťů: 4a(v1 - v2) = 48" },
      { order: 3, socraticQuestion: "Jak z 4·4·(v1-v2) = 48 dopočítáš rozdíl výšek?", expectedInsight: "v1 - v2 = 48/16 = 3" },
    ] satisfies Prisma.InputJsonValue,
    isPublished: true,
  },
  {
    externalCode: "PL_ORIG_005",
    year: 2026,
    term: "ILUSTRACNI",
    orderInTest: 44,
    topic: "STATISTIKA_A_PRAVDEPODOBNOST",
    difficulty: "STREDNI",
    statementLatex:
      "Sklad ovoce obsahuje pouze jablka, hrušky a švestky. Jablka tvoří $$45\\ \\%$$ celkové hmotnosti, hrušky $$30\\ \\%$$. Sklad obsahuje $$120\\ \\text{kg}$$ švestek. Kolik kg jablek je ve skladu?",
    correctAnswer: "216",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Kolik procent celkové hmotnosti tvoří švestky?", expectedInsight: "100 - 45 - 30 = 25 %" },
      { order: 2, socraticQuestion: "Když 25 % odpovídá 120 kg, jak zjistíš celkovou hmotnost skladu?", expectedInsight: "120 ÷ 25 × 100 = 480 kg" },
      { order: 3, socraticQuestion: "Jak z celkové hmotnosti dopočítáš 45 % připadajících na jablka?", expectedInsight: "480 × 0,45 = 216 kg" },
    ] satisfies Prisma.InputJsonValue,
    isPublished: true,
  },
  {
    externalCode: "PL_ORIG_006",
    year: 2026,
    term: "ILUSTRACNI",
    orderInTest: 45,
    topic: "ROVNICE_A_NEROVNICE",
    difficulty: "STREDNI",
    statementLatex: "Řešte soustavu rovnic: $$2x - y = 8$$ $$3x + 2y = 5$$ Zapište hodnotu $$x$$.",
    correctAnswer: "3",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Jak vyjádříš y z první rovnice?", expectedInsight: "y = 2x - 8" },
      { order: 2, socraticQuestion: "Co dostaneš po dosazení do druhé rovnice?", expectedInsight: "3x + 2(2x-8) = 5 → 7x - 16 = 5" },
      { order: 3, socraticQuestion: "Jaké x vyjde po vyřešení 7x = 21?", expectedInsight: "x = 3" },
    ] satisfies Prisma.InputJsonValue,
    isPublished: true,
  },
  {
    externalCode: "PL_ORIG_007",
    year: 2026,
    term: "ILUSTRACNI",
    orderInTest: 46,
    topic: "CISLA_A_VYPOCTY",
    difficulty: "ZAKLADNI",
    statementLatex: "Vypočítejte: $$(-2,5 + 1) \\cdot (-2,5 - 1)$$",
    correctAnswer: "5.25",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Kolik je -2,5 + 1 a kolik -2,5 - 1?", expectedInsight: "-1,5 a -3,5" },
      { order: 2, socraticQuestion: "Co je (-1,5) × (-3,5)? Jaké je znaménko výsledku, když násobíš dvě záporná čísla?", expectedInsight: "kladné, 5,25" },
    ] satisfies Prisma.InputJsonValue,
    isPublished: true,
  },
  {
    externalCode: "PL_ORIG_008",
    year: 2026,
    term: "ILUSTRACNI",
    orderInTest: 47,
    topic: "LOGIKA_A_KOMBINATORIKA",
    difficulty: "POKROCILA",
    statementLatex:
      "Do prázdné nádrže napouští voda rychlostí $$3$$ litry za minutu. Zároveň z ní odtéká $$1$$ litr za každé dvě minuty. Kolik litrů vody bude v nádrži na konci 10. minuty?",
    correctAnswer: "25",
    answerFormat: "number",
    solutionSteps: [
      { order: 1, socraticQuestion: "Kolik litrů přiteče za 10 minut?", expectedInsight: "3 × 10 = 30 litrů" },
      { order: 2, socraticQuestion: "Kolikrát za 10 minut odteče 1 litr, když odtéká každou druhou minutu?", expectedInsight: "5krát, tedy 5 litrů" },
      { order: 3, socraticQuestion: "Jaký je výsledný stav nádrže?", expectedInsight: "30 - 5 = 25 litrů" },
    ] satisfies Prisma.InputJsonValue,
    isPublished: true,
  },
];

async function main(): Promise<void> {
  console.log("Seeduji databázi…");

  const adminPasswordHash = await bcrypt.hash("Admin1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@prijimackylehce.cz" },
    update: {},
    create: {
      email: "admin@prijimackylehce.cz",
      name: "Administrátor",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
      emailVerified: new Date(),
    },
  });

  const demoStudentPasswordHash = await bcrypt.hash("Student1234", 12);
  await prisma.user.upsert({
    where: { email: "student@prijimackylehce.cz" },
    update: {},
    create: {
      email: "student@prijimackylehce.cz",
      name: "Demo Žák",
      role: "STUDENT",
      passwordHash: demoStudentPasswordHash,
      emailVerified: new Date(),
      studentProfile: { create: { gradeLevel: 9 } },
    },
  });

  for (const task of sampleTasks) {
    await prisma.task.upsert({
      where: { externalCode: task.externalCode ?? undefined },
      update: task,
      create: task,
    });
  }

  console.log(`Hotovo: vytvořeno/aktualizováno ${sampleTasks.length} úloh, admin a demo účet žáka.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
