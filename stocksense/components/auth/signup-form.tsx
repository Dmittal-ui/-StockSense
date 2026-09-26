"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Check } from "lucide-react";
import { toast } from "sonner";

const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
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

type SignupFormValues = z.infer<typeof signupSchema>;

async function mockSignup(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _data: SignupFormValues,
): Promise<void> {
  await new Promise((r) => setTimeout(r, 1200));
}

const inputBase = [
  "h-[46px] w-full rounded-[10px] border bg-[#f4f7fa] pl-10 pr-4 text-[14px] text-zinc-900 outline-none",
  "placeholder:text-zinc-400 transition-all duration-150",
  "hover:bg-[#eef2f6] hover:border-zinc-300",
  "focus:border-[#0d3347] focus:bg-white focus:ring-2 focus:ring-[#0d3347]/10",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

const inputError = "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50";
const inputOk = "border-zinc-200";

function FieldIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <Icon
      className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-zinc-400"
      aria-hidden="true"
    />
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[12px] text-red-500">
      {message}
    </p>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SignupFormValues) {
    setServerError(null);
    try {
      await mockSignup(values);
      toast.success("Account created!", {
        description: "Welcome to StockSense. Please sign in.",
      });
      router.push("/login");
    } catch {
      const msg = "Something went wrong. Please try again.";
      setServerError(msg);
      toast.error("Signup failed", { description: msg });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Sign up form">
      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-red-400 text-center text-[9px] font-bold leading-[12px] text-red-400">
            !
          </div>
          <span>{serverError}</span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-[13px] font-semibold text-zinc-600">
            Full name
          </label>
          <div className="relative">
            <FieldIcon icon={User} />
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              aria-invalid={!!errors.fullName}
              disabled={isSubmitting}
              className={[inputBase, errors.fullName ? inputError : inputOk].join(" ")}
              {...register("fullName")}
            />
          </div>
          <FieldError id="fullName-error" message={errors.fullName?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="su-email" className="text-[13px] font-semibold text-zinc-600">
            Email address
          </label>
          <div className="relative">
            <FieldIcon icon={Mail} />
            <input
              id="su-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-describedby={errors.email ? "su-email-error" : undefined}
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              className={[inputBase, errors.email ? inputError : inputOk].join(" ")}
              {...register("email")}
            />
          </div>
          <FieldError id="su-email-error" message={errors.email?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="su-password" className="text-[13px] font-semibold text-zinc-600">
            Password
          </label>
          <div className="relative">
            <FieldIcon icon={Lock} />
            <input
              id="su-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              aria-describedby={errors.password ? "su-password-error" : undefined}
              aria-invalid={!!errors.password}
              disabled={isSubmitting}
              className={[inputBase, "pr-11", errors.password ? inputError : inputOk].join(" ")}
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
          <FieldError id="su-password-error" message={errors.password?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-[13px] font-semibold text-zinc-600">
            Confirm password
          </label>
          <div className="relative">
            <FieldIcon icon={Lock} />
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              aria-invalid={!!errors.confirmPassword}
              disabled={isSubmitting}
              className={[inputBase, "pr-11", errors.confirmPassword ? inputError : inputOk].join(" ")}
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
          <FieldError id="confirmPassword-error" message={errors.confirmPassword?.message} />
        </div>

        <ul className="-mt-1 flex flex-col gap-1" aria-label="Password requirements">
          {["At least 8 characters", "One uppercase letter", "One number"].map((label) => (
            <li key={label} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Check className="h-3 w-3 text-zinc-300" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>

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
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </div>

      <p className="mt-7 text-center text-[13px] text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#0d3347] underline-offset-4 transition-colors hover:text-[#1a5f7a] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
