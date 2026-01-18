import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, { message: "Email gereklidir" }).email({ message: "Geçerli bir email adresi giriniz" }),
    password: z.string().min(1, { message: "Şifre gereklidir" }),
    rememberMe: z.boolean().optional(),
});

export const registerBaseSchema = z.object({
    name: z.string().min(1, { message: "İsim gereklidir" }),
    surname: z.string().min(1, { message: "Soyisim gereklidir" }),
    email: z.string().email({ message: "Geçerli bir email adresi giriniz" }),
    phoneNumber: z.string().regex(/^\d{1,11}$/, { message: "Geçerli bir telefon numarası giriniz" }),
    password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
    confirmPassword: z.string().min(6, { message: "Şifre tekrarı en az 6 karakter olmalıdır" }),
});

export const registerSchema = registerBaseSchema.refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Geçerli bir email adresi giriniz" }),
});
