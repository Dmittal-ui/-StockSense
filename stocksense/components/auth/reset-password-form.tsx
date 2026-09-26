"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const schema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof schema>;

async function mockResetPassword(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _password: string,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000));
}

const inputBase = [
  "h-[46px] w-full rounded-[10px] border bg-[#f4f7fa] pl-10 pr-11 text-[14px] text-zinc-900 outline-none",
  "placeholder:text-zinc-400 transition-all duration-150",
  "hover:bg-[#eef2f6] hover:border-zinc-300",
  "focus:border-[#0d3347] focus:bg-white focus:ring-2 focus:ring-[#0d3347]/10",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

interface NewPasswordProps {
  onSuccess: () => void;
}

export function NewPasswordForm({ onSuccess }: NewPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    await mockResetPassword(values.password);
    toast.success("Password reset successfully!");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Reset password form">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="rp-password" className="text-[13px] font-semibold text-zinc-600">
            New password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              id="rp-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              aria-describedby={errors.password ? "rp-password-error" : undefined}
              aria-invalid={!!errors.password}
              disabled={isSubmitting}
              className={[
                inputBase,
                errors.password
                  ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50"
                  : "border-zinc-200",
              ].join(" ")}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isSubmitting}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400 transition-colors hover:text-zinc-600 disabled:pointer-events-none"
            >
              {showPassword
                ? <EyeOff className="h-[16px] w-[16px]" aria-hidden="true" />
                : <Eye className="h-[16px] w-[16px]" aria-hidden="true" />}
            </button>
          </div>
          {errors.password && (
            <p id="rp-password-error" role="alert" className="text-[12px] text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="rp-confirm" className="text-[13px] font-semibold text-zinc-600">
            Confirm new password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              id="rp-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              aria-describedby={errors.confirmPassword ? "rp-confirm-error" : undefined}
              aria-invalid={!!errors.confirmPassword}
              disabled={isSubmitting}
              className={[
                inputBase,
                errors.confirmPassword
                  ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50"
                  : "border-zinc-200",
              ].join(" ")}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              disabled={isSubmitting}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400 transition-colors hover:text-zinc-600 disabled:pointer-events-none"
            >
              {showConfirm
                ? <EyeOff className="h-[16px] w-[16px]" aria-hidden="true" />
                : <Eye className="h-[16px] w-[16px]" aria-hidden="true" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="rp-confirm-error" role="alert" className="text-[12px] text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            "group relative mt-1 flex h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-[10px]",
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
              Resetting password…
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </div>
    </form>
  );
}

export function ResetSuccessView() {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
        <CheckCircle2 className="h-8 w-8 text-emerald-500" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-[#0d1b2a]">
          Password reset!
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
          Your password has been reset successfully.
          <br />
          You can now sign in with your new password.
        </p>
      </div>
      <Link
        href="/login"
        className={[
          "group relative flex h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-[10px]",
          "bg-[#0d3347] text-[14px] font-semibold tracking-wide text-white",
          "shadow-[0_4px_14px_rgba(13,51,71,0.35)] transition-all duration-150",
          "hover:-translate-y-[1px] hover:bg-[#0e3d55] hover:shadow-[0_6px_20px_rgba(13,51,71,0.45)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d3347]",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -skew-x-12 translate-x-[-150%] bg-white/10 transition-transform duration-500 group-hover:translate-x-[200%]"
        />
        Back to sign in
      </Link>
    </div>
  );
}
