import AuthForm from "@/components/AuthForm";
import { signup } from "./actions";

export const metadata = {
  title: "Create Account — BetterReads",
};

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
