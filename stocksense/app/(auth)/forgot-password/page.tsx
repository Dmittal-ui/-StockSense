"use client";

import { useState } from "react";
import { AuthPanel } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { OtpForm } from "@/components/auth/otp-form";
import { NewPasswordForm, ResetSuccessView } from "@/components/auth/reset-password-form";

type FlowState = "email" | "otp" | "newPassword" | "success";

const STEPS: { state: FlowState; label: string }[] = [
  { state: "email", label: "Email" },
  { state: "otp", label: "Verify" },
  { state: "newPassword", label: "Reset" },
  { state: "success", label: "Done" },
];

function StepIndicator({ current }: { current: FlowState }) {
  const currentIndex = STEPS.findIndex((s) => s.state === current);
  return (
    <div className="mb-8 flex items-center gap-0" aria-label="Progress">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.state} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                  done
                    ? "bg-[#0d3347] text-white"
                    : active
                    ? "border-2 border-[#0d3347] bg-white text-[#0d3347]"
                    : "border-2 border-zinc-200 bg-white text-zinc-400",
                ].join(" ")}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={[
                  "text-[10px] font-medium",
                  active ? "text-[#0d3347]" : done ? "text-zinc-500" : "text-zinc-300",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "mb-4 h-px w-10 transition-colors",
                  done ? "bg-[#0d3347]" : "bg-zinc-200",
                ].join(" ")}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const HEADINGS: Record<FlowState, { title: string; subtitle: string }> = {
  email: {
    title: "Forgot password?",
    subtitle: "Enter your email and we'll send you a verification code",
  },
  otp: {
    title: "Check your email",
    subtitle: "Enter the 6-digit code we sent you",
  },
  newPassword: {
    title: "Create new password",
    subtitle: "Choose a strong password for your account",
  },
  success: {
    title: "All done!",
    subtitle: "",
  },
};

export default function ForgotPasswordPage() {
  const [flowState, setFlowState] = useState<FlowState>("email");
  const [email, setEmail] = useState("");

  const { title, subtitle } = HEADINGS[flowState];

  return (
    <div className="flex min-h-svh bg-white">
      <div className="flex w-full flex-col lg:w-[45%]">
        <div className="px-10 pt-9">
          <div className="flex items-center gap-2.5">
            <div className="relative h-7 w-7 shrink-0">
              <div className="absolute inset-0 rounded-[6px] bg-[#0d3347]" />
              <div className="absolute inset-[3px] rounded-[4px] bg-[#1a5f7a]" />
              <div className="absolute inset-[6px] rounded-[2px] bg-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[#0d3347]">
              StockSense
            </span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-10 py-10 sm:px-14">
          <div className="w-full max-w-[368px]">
            <StepIndicator current={flowState} />
            {flowState !== "success" && (
              <div className="mb-8">
                <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#0d1b2a]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-[14px] text-zinc-400">{subtitle}</p>
                )}
              </div>
            )}
            {flowState === "email" && (
              <ForgotPasswordForm
                onSuccess={(resolvedEmail) => {
                  setEmail(resolvedEmail);
                  setFlowState("otp");
                }}
              />
            )}
            {flowState === "otp" && (
              <OtpForm
                email={email}
                onSuccess={() => setFlowState("newPassword")}
                onBack={() => setFlowState("email")}
              />
            )}
            {flowState === "newPassword" && (
              <NewPasswordForm onSuccess={() => setFlowState("success")} />
            )}
            {flowState === "success" && <ResetSuccessView />}
          </div>
        </div>
      </div>
      <AuthPanel />
    </div>
  );
}
