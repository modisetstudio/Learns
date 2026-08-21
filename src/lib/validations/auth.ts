import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Zadejte e-mail").email("Zadejte platný e-mail"),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Zadejte jméno a příjmení").max(80),
    email: z.string().min(1, "Zadejte e-mail").email("Zadejte platný e-mail"),
    password: z
      .string()
      .min(8, "Heslo musí mít alespoň 8 znaků")
      .regex(/[A-Z]/, "Heslo musí obsahovat alespoň jedno velké písmeno")
      .regex(/[0-9]/, "Heslo musí obsahovat alespoň jednu číslici"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Hesla se neshodují",
    path: ["passwordConfirmation"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
