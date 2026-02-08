import AuthForm from "@/components/AuthForm";
import { login } from "./actions";

export const metadata = {
  title: "Sign In — BetterReads",
};

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
