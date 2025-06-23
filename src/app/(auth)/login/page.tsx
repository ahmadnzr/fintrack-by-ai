import { LoginForm } from "./login-form";
import { APP_NAME } from "@/lib/constants";
import { DollarSign } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col items-center text-center">
        <DollarSign className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold font-headline">{APP_NAME}</h1>
        <p className="text-muted-foreground">
          Welcome back! Please login to your account.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
