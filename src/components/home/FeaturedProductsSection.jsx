import { FEATURED_SECTION } from "@/lib/constants/homeData";
import Categories from "@/components/categories/categories";

export default function FeaturedProductsSection() {
  return (
    <div className="flex flex-col items-center gap-8 my-16 max-md:my-0 max-md:px-8">
      <div className="flex flex-col items-center gap-4 max-md:text-center">
        <h3 className="font-Satisfy font-normal text-3xl text-red">
          {FEATURED_SECTION.subtitle}
        </h3>
        <h4 className="text-darkgray font-semibold text-4xl font-Barlow">
          {FEATURED_SECTION.title}
        </h4>
      </div>
      <Categories />
    </div>
  );
}