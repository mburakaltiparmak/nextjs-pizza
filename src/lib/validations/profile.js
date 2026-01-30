import { z } from "zod";

export const profileSchema = z.object({
    name: z.string().min(1, { message: "İsim gereklidir" }),
    surname: z.string().min(1, { message: "Soyisim gereklidir" }),
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
});
