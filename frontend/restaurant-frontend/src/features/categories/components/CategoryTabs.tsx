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
    <div className="w-full overflow-x-auto">
      <div className="mx-auto flex min-w-max justify-center border-b border-slate-300">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={[
                "relative px-5 py-4 text-base font-medium whitespace-nowrap transition md:px-8 md:text-[18px]",
                isActive
                  ? "text-slate-700"
                  : "text-slate-400 hover:text-slate-600",
              ].join(" ")}
            >
              {category.name}

              {isActive ? (
                <span className="absolute bottom-[-1px] left-0 h-[3px] w-full bg-slate-500" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}