"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput): Promise<void> {
    const result = await signIn("credentials", { ...data, redirect: false });
    if (result?.error) {
      toast.error("Nesprávný e-mail nebo heslo.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
            autoComplete="current-password"
            required
            errorMessage={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Přihlásit se
          </Button>
        </form>

        <div className="relative py-2 text-center text-xs text-muted-foreground">
          <span className="bg-card px-2">nebo</span>
          <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => void signIn("google", { callbackUrl })}
        >
          Pokračovat s Google
        </Button>
      </CardContent>
    </Card>
  );
}
