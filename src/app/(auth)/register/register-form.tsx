"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerUserAction } from "@/lib/actions/auth.actions";

export function RegisterForm(): React.JSX.Element {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput): Promise<void> {
    const result = await registerUserAction(data);
    if (!result.success) {
      toast.error(result.error ?? "Registraci se nepodařilo dokončit.");
      return;
    }
    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (signInResult?.error) {
      toast.success("Účet vytvořen. Přihlaste se prosím.");
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input label="Jméno a příjmení" required errorMessage={errors.name?.message} {...register("name")} />
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            errorMessage={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Heslo"
            type="password"
            autoComplete="new-password"
            required
            helperText="Alespoň 8 znaků, jedno velké písmeno a jedna číslice"
            errorMessage={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Potvrzení hesla"
            type="password"
            autoComplete="new-password"
            required
            errorMessage={errors.passwordConfirmation?.message}
            {...register("passwordConfirmation")}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Vytvořit účet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
