"use client";

import {
  useRef,
  useState,
  useCallback,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { Loader2, ArrowLeft, RotateCcw } from "lucide-react";

const OTP_LENGTH = 6;
const MOCK_OTP = "123456";

async function mockVerifyOtp(otp: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 1000));
  if (otp !== MOCK_OTP) {
    throw new Error("Invalid verification code. Please try again.");
  }
}

interface OtpFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function OtpForm({ email, onSuccess, onBack }: OtpFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusAt = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    if (!char && value !== "") return;
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setOtpError(null);
    if (char && index < OTP_LENGTH - 1) focusAt(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        focusAt(index - 1);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) focusAt(index - 1);
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) focusAt(index + 1);
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < OTP_LENGTH; i++) {
      next[i] = pasted[i] ?? "";
    }
    setDigits(next);
    setOtpError(null);
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  async function handleVerify() {
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setOtpError("Please enter the complete 6-digit code.");
      focusAt(digits.findIndex((d) => !d));
      return;
    }
    setIsSubmitting(true);
    setOtpError(null);
    try {
      await mockVerifyOtp(otp);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed.";
      setOtpError(msg);
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => focusAt(0), 50);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsResending(false);
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError(null);
    focusAt(0);
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  const allFilled = digits.every((d) => d !== "");

  return (
    <div className="flex flex-col gap-6" aria-label="OTP verification">
      <p className="text-[13px] text-zinc-500">
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-[#0d3347]">{email}</span>.
        Enter it below.
      </p>

      <div
        role="group"
        aria-label="One-time password inputs"
        className="flex items-center justify-between gap-2"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={digit}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            aria-invalid={!!otpError}
            aria-describedby={otpError ? "otp-error" : undefined}
            disabled={isSubmitting}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={[
              "h-[52px] w-full max-w-[52px] rounded-[10px] border text-center text-[20px] font-bold text-[#0d1b2a] outline-none",
              "transition-all duration-150 caret-transparent",
              "focus:border-[#0d3347] focus:bg-white focus:ring-2 focus:ring-[#0d3347]/10",
              "disabled:cursor-not-allowed disabled:opacity-50",
              otpError
                ? "border-red-300 bg-red-50"
                : digit
                ? "border-[#0d3347]/40 bg-white"
                : "border-zinc-200 bg-[#f4f7fa]",
            ].join(" ")}
          />
        ))}
      </div>

      {otpError && (
        <p
          id="otp-error"
          role="alert"
          className="flex items-center gap-1.5 text-[13px] text-red-500"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-red-400 text-[9px] font-bold text-red-400"
          >
            !
          </span>
          {otpError}
        </p>
      )}

      <button
        type="button"
        onClick={handleVerify}
        disabled={isSubmitting || !allFilled}
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
            Verifying…
          </>
        ) : (
          "Verify code"
        )}
      </button>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 text-[13px] text-zinc-400 transition-colors hover:text-[#0d3347] disabled:pointer-events-none"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Change email
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={isSubmitting || isResending || resendCooldown > 0}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#0d3347] transition-colors hover:text-[#1a5f7a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            : <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );
}
