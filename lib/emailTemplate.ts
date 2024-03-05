
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
    header: (title:string): string => {
        return `
            <div style="width:100%; height:150px; background-color: #FCA653; text-align:center; padding:25px 0px">
                <img style="margin-left: auto; margin-right:auto;" src="https://static.wixstatic.com/media/762a02_cddc25e83ba24a01b390abc6b21e1281~mv2.png/v1/fill/w_296,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/ORIGINAL_DIRECTEC_LOGO-removebg%20(1)%20(1).png" width="193" height="80" alt="DirecTec LLC" />
                <h2 style="margin-top:20px;">${title}</h2>
            </div>
        `;
    },
    body: {
        transaction: ({ details, transactionId }: {
            details: any[],
            transactionId?: string
        }): string => {
            const table = details?.map(e => {
                const { key, val } = e;

                return `<tr>
                    <td style="padding: 4px 8px; text-align:left;"><b>${key}:</b></td>
                    <td style="padding: 4px 8px; text-align:left;">${val}</td>
                </tr>`;
            }).join("\n");

            const url = transactionId ? `
                <a href="http://localhost:3000/transactions/${transactionId}" style="display:block; width:fit-content; margin:20px auto; text-decoration:none; padding: 10px 20px; border-radius: 14px; background-color:#FCA653;">Click here to view the transaction</a>
            ` : '';

            return `
                <div style="width:100%; background-color: #f1f1f1; text-align: center; padding: 20px 0px;">
                    <table style="margin-left: auto; margin-right: auto;">
                        <tbody>
                            ${table}
                        </tbody>
                    </table>
                    <div>
                        ${url}
                    </div>
                </div>
            `;
        }
    }
}