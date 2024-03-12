
export const hashBcrypt = async (password: string) => {
    const bcrypt = require('bcrypt');
    const rounds = 10;

    return await bcrypt.hash(password, rounds);
}

export const compareBcrypt = async (password: string, hash: string) => {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hash);
}