import { KVP } from "./common";

export const email = {
    wrapper: (content: string): string => {
        return `
            <html>
                <body>
                    ${content}
                </body>
            </html>
        `;
    },
    header: `
        <div style="width:100%; height:100px; text-align:center; padding:10px 0px;">
            <img style="margin-left: auto; margin-right:auto;" src="https://static.wixstatic.com/media/762a02_cddc25e83ba24a01b390abc6b21e1281~mv2.png/v1/fill/w_296,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ORIGINAL_DIRECTEC_LOGO-removebg%20(1)%20(1).png" width="193" height="80" alt="DirecTec LLC" />
        </div>
    `,
    body: {
        transaction: (details: KVP[]): string => {
            const table = details.map(e => {
                const { key, value } = e;

                return `<tr>
                    <td style="padding: 4px 8px; text-align:left;"><b>${key}:</b></td>
                    <td style="padding: 4px 8px; text-align:left;">${value}</td>
                </tr>`;
            }).join("\n");

            return `
                <div style="width:100%; background-color: #f1f1f1; text-align: center; padding: 20px 0px; border-radius: 10px;">
                    <table style="margin-left: auto; margin-right: auto;">
                        <tbody>
                            ${table}
                        </tbody>
                    </table>
                </div>
            `;
        }
    },
    linkButton: (url: string, buttonText: string) => {
        return `
            <div style="text-align: center;>
                <a href="${url}" style="display:block; width:fit-content; max-width:200px; text-align: center; margin:20px auto; text-decoration:none; padding: 10px 20px; border-radius: 10px; background-color:#FCA653; color: #000000;">${buttonText}</a>
            </div>
        `;
    }
}