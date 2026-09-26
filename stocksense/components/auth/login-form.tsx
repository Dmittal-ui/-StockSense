"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, Check } from "lucide-react";
import { toast } from "sonner";
import { setMockSession } from "@/lib/mock-auth";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

async function mockLogin(
  email: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  password: string,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  if (email === "fail@example.com") {
    throw new Error("Invalid email or password. Please try again.");
  }
}

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id: string;
}

function CustomCheckbox({ checked, onChange, disabled, id }: CustomCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[4px] border transition-all duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d3347]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        checked
          ? "border-[#0d3347] bg-[#0d3347]"
          : "border-zinc-300 bg-white hover:border-[#0d3347]/50",
      ].join(" ")}
    >
      {checked && (
        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} aria-hidden="true" />
      )}
    </button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  function handleRememberMe(checked: boolean) {
    setRememberMe(checked);
    setValue("rememberMe", checked);
  }

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await mockLogin(values.email, values.password);
      setMockSession({
        email: values.email,
        name: values.email.split("@")[0],
      });
      toast.success("Signed in successfully!", {
        description: "Welcome back to StockSense.",
      });
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setServerError(message);
      toast.error("Login failed", { description: message });
    }
  }

  const inputBase = [
    "h-[46px] w-full rounded-[10px] border bg-[#f4f7fa] pl-10 pr-4 text-[14px] text-zinc-900 outline-none",
    "placeholder:text-zinc-400 transition-all duration-150",
    "hover:bg-[#eef2f6] hover:border-zinc-300",
    "focus:border-[#0d3347] focus:bg-white focus:ring-2 focus:ring-[#0d3347]/10",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" ");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Login form">
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
          <label htmlFor="email" className="text-[13px] font-semibold text-zinc-600">
            Email address
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              className={[
                inputBase,
                errors.email
                  ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200/50"
                  : "border-zinc-200",
              ].join(" ")}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p id="email-error" role="alert" className="flex items-center gap-1 text-[12px] text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] font-semibold text-zinc-600">
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-invalid={!!errors.password}
              disabled={isSubmitting}
              className={[
                inputBase,
                "pr-11",
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
            <p id="password-error" role="alert" className="text-[12px] text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="remember-me" className="flex cursor-pointer select-none items-center gap-2">
            <CustomCheckbox
              id="remember-me"
              checked={rememberMe}
              onChange={handleRememberMe}
              disabled={isSubmitting}
            />
            <span className="text-[13px] text-zinc-500">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-[13px] font-medium text-[#0d3347] underline-offset-4 transition-colors hover:text-[#1a5f7a] hover:underline"
          >
            Forgot password?
          </Link>
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
              Signing in…
            </>
          ) : (
            "Log in"
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-100" />
          <span className="text-[12px] text-zinc-400">or continue with</span>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={[
              "flex h-[44px] items-center justify-center gap-2.5 rounded-[10px]",
              "border border-zinc-200 bg-white text-[13px] font-medium text-zinc-700",
              "shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150",
              "hover:-translate-y-[1px] hover:border-zinc-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300",
            ].join(" ")}
          >
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] shrink-0" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button
            type="button"
            className={[
              "flex h-[44px] items-center justify-center gap-2.5 rounded-[10px]",
              "border border-zinc-200 bg-white text-[13px] font-medium text-zinc-700",
              "shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150",
              "hover:-translate-y-[1px] hover:border-zinc-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300",
            ].join(" ")}
          >
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] shrink-0" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
            </svg>
            Facebook
          </button>
        </div>
      </div>

      <p className="mt-7 text-center text-[13px] text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#0d3347] underline-offset-4 transition-colors hover:text-[#1a5f7a] hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </form>
  );
}
