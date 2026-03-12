import type { Category } from "../types/category";

type CategoryTabsProps = {
  categories: Category[];
  activeCategoryId: number | null;
  onSelectCategory: (categoryId: number) => void;
};

export function CategoryTabs({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={[
                "rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-[#14b8a6] text-white shadow-md shadow-teal-100"
                  : "border border-cyan-100 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-cyan-50 hover:text-slate-900",
              ].join(" ")}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}