// app/page.tsx
import CateCard from "@/components/categorycard";
import categories from "@/public/cate-pics/categories";

export default function HomePage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Explore by Category</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <CateCard
            key={cat.title}
            category={cat}

          />
        ))}
      </div>
    </main>
  );
}