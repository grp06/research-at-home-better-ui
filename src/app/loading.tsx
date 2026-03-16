export default function Loading() {
  return (
    <main className="grain min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-5">
        <div className="paper-panel h-56 rounded-[2rem] border border-white/60" />
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="paper-panel h-[640px] rounded-[2rem] border border-white/60" />
          <div className="paper-panel h-[920px] rounded-[2rem] border border-white/60" />
        </div>
      </div>
    </main>
  );
}
