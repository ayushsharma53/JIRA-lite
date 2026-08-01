import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Boxes } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { api } from "../../lib/api";

import { useAuth } from "./auth-context";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const isRegister = mode === "register";
  const currentSchema = isRegister ? registerSchema : loginSchema;

  const form = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: { email: "", password: "", name: "" }
  });

  async function onSubmit(values: any) {
    const { data } = await api.post(`/api/auth/${mode}`, values);
    login(data.user);
    navigate("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-12 editorial-grid">
      <Card className="glass w-full max-w-md border-white/70 p-8 dark:border-white/10">
        <Link to="/" className="mb-10 flex items-center gap-3 text-sm font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Boxes size={18} />
          </span>
          Jira Lite
        </Link>
        <h1 className="text-4xl font-semibold tracking-normal">{isRegister ? "Create your workspace." : "Welcome back."}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isRegister ? "Start with a calm, fast task system for your team." : "Use a seeded account or your own workspace credentials."}
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {isRegister && <Input placeholder="Name" {...form.register("name")} />}
          <Input placeholder="Email" type="email" {...form.register("email")} />
          <Input placeholder="Password" type="password" {...form.register("password")} />
          <Button className="w-full" variant="indigo" size="lg" disabled={form.formState.isSubmitting}>
            {isRegister ? "Create account" : "Sign in"} <ArrowRight size={18} />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <Link className="font-medium text-primary" to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create account"}
          </Link>
        </p>
        {!isRegister && <p className="mt-4 text-center text-xs text-muted-foreground">Seed login: avery@example.com / password</p>}
      </Card>
    </main>
  );
}
