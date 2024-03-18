import { sendEmail, sendInviteEmail } from "@/lib/emailer";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest) => {
    if (req.method !== 'POST'){
        return Response.json({ error: 'Method not allowed' });
    }

    if (req.body?.locked){
        return Response.json({
            error: 'Stream is locked.',
            url: req.url,
            sent: false
        });
    }

    const data = await req.json();
    const sent = await handleDataAndSendEmail(data);

    return Response.json(sent);
}


const handleDataAndSendEmail = async (data: any) => {
    const { email, url, orgName } = data;

    const sent = await sendInviteEmail({
        to: email,
        orgName: orgName, 
        url: url
    });

    return sent;
}

export { handler as POST };