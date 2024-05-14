import { hash, compare } from "bcrypt";

export const hashBcrypt = async (password: string) => {
    const rounds = 10;

    return await hash(password, 10);
}

export const compareBcrypt = async (password: string, hash: string) => {
    return await compare(password, hash);
}