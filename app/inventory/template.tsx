import Loader from "@/components/Loader";
import { Suspense } from "react";

export default function InventoryTemplate({ children }: {
    children: React.ReactNode
}) {
    return (

        <Suspense fallback={
            <div className="flex items-center justify-center h-full w-full">
                <Loader size="lg" />
            </div>
        }>
            {children}
        </Suspense>
    )
}