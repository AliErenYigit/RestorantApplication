type LoadingStateProps = {
  message?: string;
};

export function LoadingState({
  message = "İçerikler yükleniyor...",
}: LoadingStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  );
}