export interface TransactionResponse {
    transactionId: string;
    sentEmails: boolean;
    accepted: string[];
    rejected: string[];
}

export interface ZohoAuthResponse {
    verified: boolean;
    redirectUrl?: string;
    accessToken?: string;
    error?: string;
}

export interface ExportResponse { 
    fileName: string;
    content: string;
}