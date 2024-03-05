import { env } from "process";
import { email } from "./emailTemplate";

const nodemailer=require('nodemailer');

export const sendEmail = async ({ to, subject, details }: {
    to: string,
    subject?: string,
    details?: any[]
}): Promise<object> => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure:false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const info = await transporter.sendMail({
        from: 'DirecTec LLC <no-reply@directecllc.com>',
        to: to,
        subject: subject || 'Inventory Update',
        html: email.wrapper(
            `${email.header(`A new transaction was created`)}
            ${email.body.transaction({
                details: details || [],
                transactionId: 'transaction1'
            })}`
        )
    });

    const { accepted, rejected } = info;
    return rejected.length === 0 ? {
        sent: true
    } : {
        sent: false,
        accepted: accepted,
        rejected: rejected
    };
}