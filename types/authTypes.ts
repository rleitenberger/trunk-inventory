import { ISODateString } from "next-auth";

export interface RegisterFields {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    organizationId?: string;
    inviteId: string;
}

export interface LoginFields {
    usernameOrEmail: string;
    password:string;
}

export interface RouteHandlerContext {
    params: { nextauth: string[] }
}

export interface ModifiedSession {
    user?: {
        id?: string | null;
        name?: string | null
        email?: string | null
        image?: string | null
        sessionToken?: string | null
      }
      expires: ISODateString,
}