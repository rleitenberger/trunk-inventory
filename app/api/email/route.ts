import { sendEmail } from "@/lib/emailer";
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
    const { emails, type, reason, locations, item, fields, transaction } = data;

    if (!emails || !emails.length){
        return {
            sentEmails: false,
            approved: [],
            rejected: []
        }
    }

    const now = new Date();
    const date = now.toLocaleDateString();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const time = formattedHours + ':' + formattedMinutes + ' ' + ampm;

    let details = [
        {
            key: 'Transaction ID',
            value: transaction.id
        },
        {
            key: 'Transaction Type',
            value: type
        },
        {
            key: 'From',
            value: locations.from
        },
        {
            key: 'To',
            value: locations.to
        },
        {
            key: 'Item',
            value: item.name || '[No SKU set]'
        },
        {
            key: 'SKU',
            value: item.sku
        },
        {
            key: 'Quantity',
            value: item.qty
        },
        {
            key: 'Date',
            value: date
        },
        {
            key: 'Time',
            value: time
        },
        {
            key:'Reason',
            value: reason.name
        },
    ];

    let args = {
        to: emails,
        subject: undefined,
        details: details,
        fields: fields,
        url: transaction.url
    };

    const sent =true//= await sendEmail(args);

    return sent;
}

export { handler as POST };