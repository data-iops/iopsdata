export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          iOpsData
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          AI-native data workspace. Query, analyze, and visualize your data with natural language.
        </p>
        <div className="flex gap-4">
          <a
            href="/docs"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Get Started
          </a>
          <a
            href="https://github.com/data-iops/iopsdata"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
