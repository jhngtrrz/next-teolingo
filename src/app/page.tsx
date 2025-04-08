import BibleApp from "@/features/bible/components/BibleApp";

export default function Home() {
  return (
    <div className="grid grid-rows-[60px_1fr_30px] items-center justify-items-center min-h-screen p-4 pb-12 gap-6 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <header className="row-start-1 w-full max-w-5xl text-center">
        <h1 className="text-2xl font-bold mb-2">Biblia Interlineal</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Antiguo Testamento en hebreo con traducción interlineal</p>
      </header>

      <main className="flex flex-col w-full max-w-5xl row-start-2 items-center sm:items-start">
        <BibleApp />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
