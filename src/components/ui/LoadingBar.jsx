"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

function LoadingBarLogic() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        NProgress.start();
        const timeout = setTimeout(() => {
            NProgress.done();
        }, 300); // Small artificial delay to smooth out the bar

        return () => {
            clearTimeout(timeout);
            NProgress.done();
        }
    }, [pathname, searchParams]);

    return null;
}

export function LoadingBar() {
    return (
        <Suspense fallback={null}>
            <LoadingBarLogic />
        </Suspense>
    );
}
