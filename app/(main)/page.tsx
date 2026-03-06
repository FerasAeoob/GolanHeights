  // app/page.tsx
  import 'tailwindcss'
  import CategoryCard from "@/components/home/categorycard";
  import categories from "@/public/cate-pics/categories";

  export default function HomePage() {
    return (
      <>

        <div>

          {/* hero section */}
          <div>

          </div>
          {/* categories section */}
          <div >
            <ul >
              {Object.entries(categories).map(([key, value]) => (
                  <li key={key}>
                    <CategoryCard category={value} />
                  </li>
              ))}
            </ul>

          </div>
          {/* featured section */}
          <div>


          </div>





        </div>


      </>
    );
  }