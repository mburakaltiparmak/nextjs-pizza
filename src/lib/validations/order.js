import { z } from "zod";
import DOMPurify from "dompurify";

// Helper to sanitize input if needed, though Zod + React is usually safe from XSS.
// Transformation added to match existing behavior in AddressForm.
const sanitize = (val) => (typeof val === "string" ? DOMPurify.sanitize(val) : val);

export const guestInfoSchema = z.object({
    name: z.string().min(1, { message: "İsim gereklidir" }).transform(sanitize),
    surname: z.string().min(1, { message: "Soyisim gereklidir" }).transform(sanitize),
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }).transform(sanitize),
    phoneNumber: z.string().min(10, { message: "Geçerli bir telefon numarası giriniz" }).transform(sanitize),
});

export const addressSchema = z.object({
    fullAddress: z.string().min(5, { message: "Adres en az 5 karakter olmalıdır" }).transform(sanitize),
    city: z.string().min(2, { message: "Şehir gereklidir" }).transform(sanitize),
    district: z.string().min(2, { message: "İlçe gereklidir" }).transform(sanitize),
    postalCode: z.string().optional().transform(val => val ? sanitize(val) : val),
    addressTitle: z.string().optional().transform(val => val ? sanitize(val) : val),
    phoneNumber: z.string().optional().transform(val => val ? sanitize(val) : val),
    recipientName: z.string().min(3, { message: "Alıcı adı gereklidir" }).transform(sanitize),
    saveAddress: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});

// For the first step "Full Name" simple validation
export const personalInfoSchema = z.object({
    fullname: z.string().min(1, { message: "İsim ve soyisim gereklidir" }).transform(sanitize),
});
