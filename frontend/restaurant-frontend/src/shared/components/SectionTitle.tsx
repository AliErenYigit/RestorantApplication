type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}