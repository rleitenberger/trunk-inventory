import type { NextApiRequest, NextApiResponse } from "next/types";

export function GET(
    req: NextApiRequest,
    res: NextApiResponse
) {
    return Response.json({ message: __dirname});
}