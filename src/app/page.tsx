import Link from "next/link";
import { CheckCircle2, MessageCircle, Timer as TimerIcon, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KaTeXRenderer } from "@/components/ui/katex-renderer";
import { APP_NAME } from "@/constants";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "AI tutor, který nevyzradí výsledek",
    description:
      "Sokratovská metoda: místo hotové odpovědi dostane dítě návodné otázky, díky kterým dojde k řešení samo — a skutečně se to naučí.",
  },
  {
    icon: TimerIcon,
    title: "Ostrý simulátor zkoušky",
    description: "70minutový časový limit, stejné rozložení jako u CERMAT testu, nácvik reálného tempa a stresu.",
  },
  {
    icon: TrendingUp,
    title: "Přehled tvého pokroku",
    description: "Vidíš, kolik úloh jsi vyřešil/a, jakou máš úspěšnost po tématech a jak dlouhou sérii dní držíš.",
  },
];

const SAMPLE_TASK_LATEX =
  "Vypočítejte: $$\\frac{3}{4} + \\frac{1}{6} = \\; ?$$ Výsledek zapište jako zlomek v základním tvaru.";

export default function LandingPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <span className="font-display text-lg font-bold text-primary-700">{APP_NAME}</span>
          <nav className="flex items-center gap-3">
            <Button asChild size="sm">
              <Link href="/dashboard">Vstoupit do aplikace</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="container grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            Ať matematiku k přijímačkám{" "}
            <span className="text-primary-600">pochopíš</span>, nejen odkoukáš.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            AI tutor tě vede k řešení úloh z ostrých CERMAT testů krok za krokem — bez toho, aby ti
            rovnou prozradil výsledek. Cvičíš přesně to, co tě čeká u zkoušky.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">Začít procvičovat</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#jak-to-funguje">Jak to funguje</Link>
            </Button>
          </div>
          <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
            {["Databáze ostrých úloh CERMAT 2015–2026", "Bez reklam, žádné rozptylování", "Zrušitelné kdykoliv"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500" aria-hidden="true" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <Card className="border-2 border-primary-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Ukázka úlohy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <KaTeXRenderer content={SAMPLE_TASK_LATEX} className="text-base" />
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium text-primary-700">AI tutor:</p>
              <p className="mt-1 text-muted-foreground">
                „Než sečteme zlomky, co musíme nejdřív najít? Zkus se zamyslet nad jmenovateli obou zlomků.“
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="jak-to-funguje" className="border-t border-border bg-muted/40 py-16">
        <div className="container">
          <h2 className="text-center font-display text-2xl font-bold md:text-3xl">Jak Přijímačky Lehce pomáhají</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary-600" aria-hidden="true" />
                  <CardTitle className="mt-2 text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. Nezávislá příprava na JPZ, není spojena s CERMAT.
        </div>
      </footer>
    </main>
  );
}
