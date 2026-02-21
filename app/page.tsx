"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BarChart3, Users, Layout } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Navbar } from "@/app/components/marketing/Navbar";
import { Footer } from "@/app/components/marketing/Footer";
import { Images } from "@/public";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-poppins overflow-x-hidden">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative pt-16 md:pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20"
            >
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Management Made Simple</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#0D0D0D] dark:text-white"
            >
              Maximize Your <span className="text-primary">Project</span> <br /> Potential
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              BuildTracker is a simple, intuitive management platform built to help teams move faster without the friction of complex tools.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
            >
              <Button className="rounded-full px-10 h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 text-lg font-bold transition-all hover:scale-105 active:scale-95">
                Get Started
              </Button>
            </motion.div>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30 dark:opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]"></div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="bg-white dark:bg-muted/10 py-12 border-y border-border">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-12">Trusted by <span className="text-muted-foreground">modern project teams worldwide.</span></p>
            <div className="flex flex-wrap justify-between items-center max-w-4xl mx-auto gap-12">
              <div className="text-center space-y-1">
                <p className="text-2xl font-extrabold text-primary">28+ Teams</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Early Access Waitlist</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-extrabold text-orange-500">Q1 2026</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Launch Date</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-extrabold text-[#4372E9]">SOC 2</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Compliance Ready</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto py-24 px-4 text-center space-y-4">
          <h2 className="text-primary text-4xl font-extrabold tracking-tight">Empower <span className="text-primary">Your Project</span></h2>
          <p className="text-5xl font-extrabold text-[#0D0D0D] dark:text-white">Future with us</p>
        </div>

        {/* Feature: Analytics */}
        <section className="py-12 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto bg-[#F5F5F5] dark:bg-muted/30 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="aspect-[4/3] bg-white dark:bg-card rounded-3xl border border-border shadow-sm flex items-center justify-center"
              >
                <BarChart3 className="w-24 h-24 text-primary opacity-20" />
              </motion.div>
            </div>
            <div className="w-full md:w-1/2 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#0D0D0D] dark:text-white leading-tight">
                  Comprehensive <br /> <span className="text-primary">Project Analytics</span> <br /> Dashboard
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed font-medium">
                  Gain real-time visibility into your operations with a clean, centralized oversight of all your active builds.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-y-6 pt-4 border-t border-border/10">
                {[
                  "Live Project Metrics",
                  "Team Activity Feeds",
                  "Customizable Widgets",
                  "Automated Progress Tracking"
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 text-sm font-bold text-[#0D0D0D] dark:text-white">
                    <div className="w-4 h-4 rounded-full bg-[#0D0D0D] dark:bg-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2A2A2A] "></div>
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature: Tasks */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto bg-[#F5F5F5] dark:bg-muted/30 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 space-y-8">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#0D0D0D] dark:text-white leading-tight">
                <span className="text-primary">Track</span> All Your <br /> Tasks with Ease
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                Manage your workflow without the headache. Whether it&apos;s Kanban, Gantt charts, or simple lists, BuildTracker adapts to you—not the other way around.
              </p>
              <Button className="rounded-xl px-8 h-12 bg-primary hover:bg-primary/90 text-white font-bold group mt-4 shadow-xl shadow-primary/20">
                Explore Features
              </Button>
            </div>
            <div className="w-full md:w-1/2 min-h-[400px]">
              {/* Placeholder for task visualization as seen in design */}
            </div>
          </div>
        </section>

        {/* Feature Grid: Collaborate */}
        <section className="py-24 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center space-y-16">
            <div className="space-y-4">
              <h2 className="text-primary text-4xl font-extrabold">Collaborate</h2>
              <p className="text-5xl font-extrabold text-[#0D0D0D] dark:text-white">Across the Globe</p>
              <p className="text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                Real-time communication tools designed for remote, hybrid, and site-based teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Multi-Organization", icon: <Users className="w-8 h-8 text-primary" />, desc: "Manage multiple teams with role-based permissions and isolated workspaces." },
                { title: "Wiki & Docs", icon: <Layout className="w-8 h-8 text-primary" />, desc: "Built-in documentation system with version control for your SOPs and blueprints." },
                { title: "Analytics & Reports", icon: <BarChart3 className="w-8 h-8 text-primary" />, desc: "Get report and analytics of individual team members and performance of team." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="text-center space-y-6"
                >
                  <div className="bg-[#F5F5F5] dark:bg-muted/30 aspect-square rounded-[2rem] flex items-center justify-center p-8 relative overflow-hidden group">
                    {/* Decorative shapes to match design */}
                    <div className="absolute top-4 right-4 w-40 h-40 bg-white dark:bg-card rounded-2xl shadow-sm border border-border/10 translate-x-4"></div>
                  </div>
                  <div className="space-y-3 px-4">
                    <h3 className="text-xl font-extrabold text-[#0D0D0D] dark:text-white">{item.title}</h3>
                    <p className="text-[11px] text-muted-foreground font-bold leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-primary text-4xl font-extrabold">Security & Trust</h2>
          </div>
          <div className="max-w-7xl mx-auto bg-[#F5F5F5] dark:bg-muted/30 rounded-[3rem] p-12 md:p-24 flex flex-col md:flex-row items-center gap-16 relative">
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-square bg-white dark:bg-card rounded-full shadow-2xl flex items-center justify-center p-20 relative outline outline-[1.5rem] outline-white/20">
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-10">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#0D0D0D] dark:text-white leading-tight">
                  Achieve <span className="text-primary">Operational <br /> Excellence</span>
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed font-medium">
                  We take your data seriously. Your intellectual property is protected by the same standards used by global banks.
                </p>
              </div>
              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="w-8 h-8 rounded-full bg-orange-500 shrink-0 shadow-lg shadow-orange-500/20"></div>
                  <div>
                    <h4 className="font-extrabold text-[#0D0D0D] dark:text-white">Multi-Factor Authentication</h4>
                    <p className="text-xs text-muted-foreground font-bold mt-1">Secure logins for every team member.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="w-8 h-8 rounded-full bg-orange-500 shrink-0 shadow-lg shadow-orange-500/20"></div>
                  <div>
                    <h4 className="font-extrabold text-[#0D0D0D] dark:text-white">End-to-End Encryption</h4>
                    <p className="text-xs text-muted-foreground font-bold mt-1">Your documents and chats are for your eyes only.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto bg-[#F5F5F5] dark:bg-muted/30 rounded-[3rem] p-12 md:p-24 flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 space-y-8">
              <h2 className="text-4xl md:text-6xl font-extrabold text-[#0D0D0D] dark:text-white leading-tight">
                <span className="text-primary">Integrate</span> With Your Favourite Tools
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                BuildTracker plays well with others. Connect your workflow to the apps your team already uses every day.
              </p>
              <Button className="rounded-xl px-10 h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-bold active:scale-95 transition-all">
                Explore Integration
              </Button>
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <div className="w-24 h-24 bg-white dark:bg-card rounded-2xl shadow-xl flex items-center justify-center">
                <Image src={Images.logo} alt="BuildTracker" width={48} height={48} />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto bg-[#F2F6FF] dark:bg-muted/10 rounded-[3rem] p-12 md:p-24 text-center space-y-10 border border-primary/10 relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <h2 className="text-5xl md:text-6xl font-extrabold text-[#0D0D0D] dark:text-white">
                Ready to manage Your <br /> <span className="text-primary">Business Better</span> with us?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stop fighting your software. Start tracking your progress.
              </p>
              <Button className="rounded-full px-12 h-16 bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 text-xl font-bold transition-all hover:scale-110 active:scale-95">
                Get Started
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
