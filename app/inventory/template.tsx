import Loader from "@/components/Loader";
import { Suspense } from "react";

export default function InventoryTemplate({ children }: {
    children: React.ReactNode
}) {
    return (

        <Suspense fallback={<Loader size="lg" />}>
            {children}
        </Suspense>
    )
}