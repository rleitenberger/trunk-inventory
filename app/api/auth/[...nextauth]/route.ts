export const dynamic = 'auto';
export const revalidate = false;
export const fetchCache = 'force-no-store';

import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { RouteHandlerContext } from "@/types/authTypes";

const auth = async (req: NextRequest, context: RouteHandlerContext) => {
    return await NextAuth(req, context, authOptions(context));
}

export { auth as GET, auth as POST };