export interface RegisterFields {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginFields {
    usernameOrEmail: string;
    password:string;
}

export interface RouteHandlerContext {
    params: { nextauth: string[] }
}