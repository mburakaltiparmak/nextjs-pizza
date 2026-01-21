import {
    SearchBar,
    CategoryFilter,
    SearchFilterContainer,
} from "@/components/admin/searchAndFilter";

export const ProductFilters = ({
    searchTerm,
    filterCategory,
    categories,
    onSearchChange,
    onCategoryChange,
}) => {
    return (
        <SearchFilterContainer>
            <SearchBar
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Ürün ara..."
            />
            <CategoryFilter
                category={categories}
                value={filterCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
            />
        </SearchFilterContainer>
    );
};
