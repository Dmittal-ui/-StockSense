import { LoginForm } from "@/components/auth/login-form";
import { AuthPanel } from "@/components/auth/auth-card";

export const metadata = {
  title: "Sign in — StockSense",
  description: "Sign in to your StockSense account.",
};

export default function LoginPage() {
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
            <div className="mb-8">
              <h1 className="text-[30px] font-bold leading-tight tracking-tight text-[#0d1b2a]">
                Welcome Back!
              </h1>
              <p className="mt-1.5 text-[14px] text-zinc-400">
                Please enter your login details below
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
      <AuthPanel />
    </div>
  );
}
