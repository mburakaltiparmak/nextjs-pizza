import { Skeleton } from "@/components/ui/Skeleton"

export function ProductCardSkeleton() {
    return (
        <div className="group relative bg-white rounded-xl overflow-hidden drop-shadow-md border border-lightgray">
            {/* Image Container */}
            <div className="flex items-center justify-center py-8">
                <Skeleton className="h-36 w-36 rounded-full" />
            </div>

            {/* Product Info */}
            <div className="p-5">
                {/* Name */}
                <Skeleton className="h-6 w-3/4 mb-2" />

                {/* Rating */}
                <div className="flex items-center mb-4 gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-4" />
                </div>

                {/* Description */}
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />

                {/* Price & Add to Cart */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-12" />
                    </div>

                    <Skeleton className="h-10 w-28 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
