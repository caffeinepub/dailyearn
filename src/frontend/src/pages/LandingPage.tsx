import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Gamepad2,
  Play,
  Shield,
  Star,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: Play,
    title: "Watch & Earn",
    desc: "Watch short videos and ads to earn instant rewards directly to your balance.",
    reward: "$0.50/video",
  },
  {
    icon: ClipboardList,
    title: "Complete Surveys",
    desc: "Share your opinions on products and services. Quick 5-minute surveys.",
    reward: "$2.00/survey",
  },
  {
    icon: UserPlus,
    title: "Invite Friends",
    desc: "Earn big by referring your friends. Each verified invite earns you a bonus.",
    reward: "$3.00/invite",
  },
  {
    icon: Gamepad2,
    title: "Play Mini Games",
    desc: "Fun bite-sized games that reward you for playing and completing levels.",
    reward: "$1.00/game",
  },
];

const stats = [
  { value: "$10", label: "Daily Earning Goal", icon: DollarSign },
  { value: "50K+", label: "Active Earners", icon: Users },
  { value: "$2M+", label: "Total Paid Out", icon: TrendingUp },
  { value: "4.9★", label: "User Rating", icon: Star },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Stay-at-home Mom",
    text: "I earn $10 every single day doing small tasks during my kids' nap time. EarnDaily has been a game changer!",
    avatar: "SJ",
  },
  {
    name: "Marcus Chen",
    role: "College Student",
    text: "I pay for my monthly subscription services just from EarnDaily. Super easy and the payouts are fast.",
    avatar: "MC",
  },
  {
    name: "Priya Patel",
    role: "Freelancer",
    text: "The streak bonuses are amazing. I've been on a 30-day streak and my earnings have nearly doubled!",
    avatar: "PP",
  },
];

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen gradient-bg font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gold-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gold">EARN</span>
              <span className="text-foreground">DAILY</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="hover:text-foreground transition-colors"
            >
              Reviews
            </a>
          </nav>
          <Button
            data-ocid="landing.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="gold-gradient text-gold-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {isLoggingIn ? "Connecting..." : "Start Earning"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-card border-gold/30 text-gold font-medium px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Earn up to $10 every day
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Turn Your Time Into <span className="text-gold">Real Money</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Complete simple daily tasks — watch videos, fill surveys, play
              games, invite friends — and earn up to{" "}
              <strong className="text-foreground">$10 every single day</strong>,
              paid straight to your wallet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                data-ocid="hero.primary_button"
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                className="gold-gradient text-gold-foreground font-bold text-lg px-8 py-6 glow-gold hover:opacity-90 transition-opacity"
              >
                {isLoggingIn ? "Connecting..." : "Start Earning Free"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-border text-foreground hover:bg-card text-lg px-8 py-6"
              >
                See How It Works
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Free to join · Instant payouts
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="card-panel p-6 text-center">
                <stat.icon className="w-6 h-6 text-gold mx-auto mb-3" />
                <div className="text-3xl font-extrabold text-gold">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ways to Earn</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Multiple earning activities means you can always hit your daily
              $10 goal.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-panel p-6 hover:border-gold/40 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-gold-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {f.desc}
                </p>
                <span className="text-gold font-bold text-sm">{f.reward}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to start earning today
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up for free in seconds using Internet Identity — no personal data required.",
                icon: UserPlus,
              },
              {
                step: "02",
                title: "Complete Tasks",
                desc: "Browse your personalized daily task list. Complete tasks to earn instant rewards.",
                icon: CheckCircle2,
              },
              {
                step: "03",
                title: "Withdraw Earnings",
                desc: "Hit $10 and withdraw to PayPal, Bank Transfer, or Crypto instantly.",
                icon: DollarSign,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl card-panel border-gold/30 flex items-center justify-center mx-auto mb-6">
                  <span className="text-gold font-extrabold text-2xl">
                    {item.step}
                  </span>
                </div>
                <item.icon className="w-8 h-8 text-gold mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Real People, Real Earnings
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands earning daily
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-panel p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-gold-foreground font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {t.role}
                    </div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{t.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-6 glow-gold">
              <Trophy className="w-8 h-8 text-gold-foreground" />
            </div>
            <h2 className="text-4xl font-extrabold mb-4">
              Ready to Earn <span className="text-gold">$10 Today?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join 50,000+ earners. Free to join, instant payouts, no hidden
              fees.
            </p>
            <Button
              data-ocid="cta.primary_button"
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              className="gold-gradient text-gold-foreground font-bold text-lg px-10 py-7 glow-gold hover:opacity-90 transition-opacity"
            >
              {isLoggingIn ? "Connecting..." : "Create Free Account"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-success" /> Secure & Private
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" /> 100% Free
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-gold" /> Instant Payouts
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex gap-4">
              <a
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </a>
              <a
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                FAQ
              </a>
              <a
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
            </div>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              © {new Date().getFullYear()} Built with ❤️ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
