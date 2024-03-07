import { sendEmail } from "@/lib/emailer";

export async function GET() {
    sendEmail({
        to: 'rleitenberger@directecllc.com',
        subject: undefined,
        details: [
            {
                key: 'Transaction Type',
                val: 'pull'
            },
            {
                key:'Reason',
                val: 'Exchanged for a different part'
            },
            {
                key: 'Item returned',
                val: 'Item833324'
            },
            {
                key: 'Location returned',
                val: 'Parts Room'
            },
            {
                key: 'Item Name',
                val: 'Item 123'
            },
            {
                key: 'Quantity',
                val: '3'
            },
            {
                key: 'From',
                val: 'Customer Location'
            },
            {
                key: 'To',
                val: 'Parts Room'
            },
            {
                key: 'Date',
                val: '3/5/2024',
            },
            {
                key: 'Time',
                val: '9:34 AM'
            }
        ]
    });

    return Response.json({
        success: 'success'
    });
}