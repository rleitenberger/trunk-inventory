import AppWrapper from "@/components/wrappers/AppWrapper";

export default async function Template({ children }: { children: React.ReactNode}) {
    return (
        <AppWrapper>
            {children}
        </AppWrapper>
    )
}