import * as crypto from "crypto"

export const generateString = (len: number): string =>  {
    const rand = crypto.randomBytes(len);
    return rand.toString('hex')
}

export const generateRandomNDigits = (n) => {
    return Math.floor(Math.random() * (9 * (Math.pow(10, n - 1)))) + (Math.pow(10, n - 1));
}