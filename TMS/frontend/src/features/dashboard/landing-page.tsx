import { ArrowRight, CheckCircle2, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export function LandingPage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <section className="relative min-h-screen px-6 py-8 editorial-grid">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-sm font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Sparkles size={18} />
            </span>
            Jira Lite
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-medium text-muted-foreground sm:block">Login</Link>
            <Button variant="outline">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 pb-16 pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:pt-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-6 inline-flex rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-soft dark:bg-white/5">
              Linear speed. Spring Boot control.
            </p>
            <h1 className="max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-7xl lg:text-8xl">
              Manage work with clarity.
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-muted-foreground">
              Collaborative workspaces, projects and tasks powered by Spring Boot.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="indigo">
                <Link to="/register" className="flex items-center gap-2">Get Started <ArrowRight size={18} /></Link>
              </Button>
              <Button size="lg" variant="outline">
                <Link to="/demo" className="flex items-center gap-2">View Demo <Play size={18} /></Link>
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative">
            <div className="absolute inset-8 rounded-[2rem] bg-primary/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
              <div className="rounded-[1.5rem] border border-border bg-zinc-950 p-5 text-white">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Acme Product</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {["TODO", "BUILD", "REVIEW", "DONE"].map((label, index) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="mb-4 text-xs text-zinc-400">{label}</p>
                      {Array.from({ length: index === 0 ? 3 : 2 }).map((_, taskIndex) => (
                        <div key={taskIndex} className="mb-3 rounded-xl border border-white/10 bg-white/[0.07] p-3">
                          <span className="mb-3 block h-2 rounded-full bg-white/30" />
                          <span className="block h-2 w-2/3 rounded-full bg-indigo-300/70" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="-mt-20 px-6 pb-24">
        <Card className="mx-auto max-w-7xl overflow-hidden border-white/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-4 rounded-2xl border border-border bg-background p-6 md:grid-cols-3">
            {["Workspaces with roles", "Optimistic task updates", "Searchable, pageable API"].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="text-primary" size={18} />
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
