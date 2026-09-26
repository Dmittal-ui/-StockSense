"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof schema>;

async function mockSendOtp(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _email: string,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000));
}

interface ForgotPasswordFormProps {
  onSuccess: (email: string) => void;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    await mockSendOtp(values.email);
    onSuccess(values.email);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Forgot password form">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fp-email" className="text-[13px] font-semibold text-zinc-600">
            Email address
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              id="fp-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-describedby={errors.email ? "fp-email-error" : undefined}
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              className={[
                "h-[46px] w-full rounded-[10px] border bg-[#f4f7fa] pl-10 pr-4 text-[14px] text-zinc-900 outline-none",
                "placeholder:text-zinc-400 transition-all duration-150",
                "hover:bg-[#eef2f6] hover:border-zinc-300",
                "focus:border-[#0d3347] focus:bg-white focus:ring-2 focus:ring-[#0d3347]/10",
                "disabled:cursor-not-allowed disabled:opacity-50",
                errors.email
                  ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50"
                  : "border-zinc-200",
              ].join(" ")}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p id="fp-email-error" role="alert" className="text-[12px] text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            "group relative flex h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-[10px]",
            "bg-[#0d3347] text-[14px] font-semibold tracking-wide text-white",
            "shadow-[0_4px_14px_rgba(13,51,71,0.35)] transition-all duration-150",
            "hover:-translate-y-[1px] hover:bg-[#0e3d55] hover:shadow-[0_6px_20px_rgba(13,51,71,0.45)]",
            "active:translate-y-0 active:shadow-[0_2px_8px_rgba(13,51,71,0.3)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d3347]",
            "disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -skew-x-12 translate-x-[-150%] bg-white/10 transition-transform duration-500 group-hover:translate-x-[200%]"
          />
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending code…
            </>
          ) : (
            "Send verification code"
          )}
        </button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-[13px] text-zinc-400 underline-offset-4 transition-colors hover:text-[#0d3347] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
