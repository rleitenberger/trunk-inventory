export interface TransactionResponse {
    transactionId: string;
    sentEmails: boolean;
    accepted: string[];
    rejected: string[];
}