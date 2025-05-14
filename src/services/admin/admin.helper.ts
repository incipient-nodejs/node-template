import jwt from "jsonwebtoken";
import path from "path";
import { SendMail } from "../../helper/mail.helper";


export const generateRandomPassword = (length: number = 9): string => {
    const charset = {
        lower: 'abcdefghijklmnopqrstuvwxyz',
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numbers: '0123456789',
        special: '!@#$%^&*()-_=+[]{}|;:,.<>?'
    };

    let password = '';
    password += charset.lower.charAt(Math.floor(Math.random() * charset.lower.length));
    password += charset.upper.charAt(Math.floor(Math.random() * charset.upper.length));
    password += charset.numbers.charAt(Math.floor(Math.random() * charset.numbers.length));
    password += charset.special.charAt(Math.floor(Math.random() * charset.special.length));

    const allChars = Object.values(charset).join('');
    for (let i = password.length; i < length; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    return password.split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}

export const generateTokenForEmailVerification = (userId: string) => {
    try {
        const maxAge = 48 * 60 * 60; //valid for 48 hours
        const secretKey = process.env.JWT_SECRET_KEY as string;
        return `${jwt.sign({ userId }, secretKey, { expiresIn: maxAge })}`;
    } catch (error) {
        throw error;
    }
};


export async function generateCodeForPlatform(userId: string) {
    try {
        return generateTokenForEmailVerification(userId);
    } catch (error) {
        throw new Error("Unable to get the platform");
    }
}



export async function sendEmailForVerification(fullName: string, email: string, userId: string, password: string) {
    try {

        const token = await generateCodeForPlatform(userId);

        let mailObj = {};

        mailObj = { name: fullName, password: password, code: token, verificationUrl: `${process.env.FRONTEND_BASE_URL}/verify?userId=${userId}&code=${token}` };

        let templatePath;
        templatePath = path.resolve(
            __dirname,
            "../../../views/adminRegister.template.ejs"
        );

        await SendMail(templatePath, "Welcome to Crush Cost", email, mailObj);
    } catch (error) {
        throw error;
    }
}