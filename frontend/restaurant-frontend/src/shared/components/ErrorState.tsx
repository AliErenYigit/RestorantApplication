type ErrorStateProps = {
  title?: string;
  description?: string;
};

export function ErrorState({
  title = "Bir hata oluştu",
  description = "Veriler alınırken beklenmeyen bir problem yaşandı.",
}: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
      <h3 className="text-lg font-semibold text-red-700">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-red-600">{description}</p>
    </div>
  );
}