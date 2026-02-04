import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-[-10rem] h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-12rem] right-[-6rem] h-80 w-80 rounded-full bg-secondary/20 blur-[140px]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Image
              src="/brand/iopsdata-logo.svg"
              alt="iOpsData"
              width={120}
              height={120}
              priority
            />
            <div>
              <h1 className="text-2xl font-semibold">Welcome to iOpsData</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                AI-native data workspace built for modern operators.
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
