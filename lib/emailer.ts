import { env } from "process";
import { email } from "./emailTemplate";
import { KVP } from "./common";

const nodemailer=require('nodemailer');

export const sendEmail = async ({ to, subject, details, fields, url }: {
    to: string[];
    subject?: string;
    details: KVP[];
    fields?: KVP[];
    url?: string;
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
            `${email.header}
            <h2>Transaction Details</h2>
            ${email.body.transaction(details)}
            ${fields && (
                `<h2>Fields</h2>${email.body.transaction(fields)}`
            )}
            ${url && email.linkButton(url, 'Click here to view the transaction')}`
        )
    });

    const { accepted, rejected } = info;
    return {
        sentEmails: rejected.length === 0,
        accepted: accepted,
        rejected: rejected
    };
}

export const sendInviteEmail = async ({ to, orgName, url }: {
    to: string;
    orgName: string;
    url: string;
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
        subject: `${orgName} Inventory Invite`,
        html: email.wrapper(
            `${email.header}
            <h2>You've been invited to join ${orgName}</h2>
            ${url && email.linkButton(url, 'Click here to sign up')}`
        )
    });

    const { accepted, rejected } = info;
    return {
        sentEmails: rejected.length === 0,
        accepted: accepted,
        rejected: rejected
    };
}