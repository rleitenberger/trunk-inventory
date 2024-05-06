import prisma from "@/lib/prisma"
import { NextRequest } from "next/server";

export const GET = (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const orgId: string|null = searchParams.get('organizationId');
    const zohoOrgId: string|null = searchParams.get('organization_id');
    
    if (!orgId || !zohoOrgId) {
        return Response.json([]);
    }

    const GET_PROJECTS_URL = `https://www.zohoapis.com/books/v3/projects?organization_id=10234695&filter_by=Status.Active`;
}