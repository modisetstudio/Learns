"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export interface RegisterActionResult {
  success: boolean;
  error?: string;
}

const SALT_ROUNDS = 12;

export async function registerUserAction(input: RegisterInput): Promise<RegisterActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Zkontrolujte prosím zadané údaje." };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: "Účet s tímto e-mailem už existuje." };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await prisma.user.create({
    data: {
      name,
      email,
      role: "STUDENT",
      passwordHash,
      studentProfile: { create: {} },
    },
  });

  return { success: true };
}
