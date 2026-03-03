"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BarChart3, Users, Layout, CheckCircle2, PlaySquare, ChartColumn } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Navbar } from "@/app/components/marketing/Navbar";
import { Footer } from "@/app/components/marketing/Footer";
import { Images } from "@/public";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-poppins overflow-x-hidden">
      <Navbar />

      <main className="pt-20 ">
        {/* Hero Section */}
        <section className="relative pt-16 md:pt-24 pb-20 px-4 md:px-8 overflow-hidden pl-0 md:pl-20">
          <div className=" mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full lg:w-1/2 text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20"
              >
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Management Made Simple
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-[5.5rem] font-black tracking-tight text-[#0D0D0D] dark:text-white leading-[1.1]"
              >
                Maximize <br /> Your{" "}
                <span className="text-primary">Project</span> <br /> Potential
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium"
              >
                BuildTracker is a simple, intuitive management platform built to
                help teams move faster without the friction of complex tools.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="pt-4"
              >
                <Button className="rounded-full px-12 h-14 bg-primary hover:bg-primary/90 text-white text-lg font-bold transition-all hover:scale-105 active:scale-95">
                  Get Started
                </Button>
              </motion.div>
            </div>

            <div className="w-full lg:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative z-10"
              >
                <Image
                  src={Images.screenshot}
                  alt="BuildTracker Dashboard"
                  className="w-full h-auto "
                />
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="bg-muted dark:bg-muted/10 py-8 md:py-12 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <p className="text-center text-lg md:text-xl font-bold text-primary mb-8 md:mb-12">
              Trusted by{" "}
              <span className="text-foreground">
                modern project teams worldwide.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center max-w-4xl mx-auto gap-8 md:gap-12">
              <div className="text-center space-y-1">
                <p className="text-2xl font-extrabold text-primary">
                  28+ Teams
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Early Access Waitlist
                </p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-extrabold text-orange-500">
                  Q1 2026
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Launch Date
                </p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-extrabold text-[#4372E9]">SOC 2</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Compliance Ready
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto py-16 md:py-24 px-4 md:px-8 text-center space-y-3 md:space-y-4">
          <h2 className="text-primary text-3xl md:text-4xl font-extrabold tracking-tight">
            Empower <span className="text-primary">Your Project</span>
          </h2>
          <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0D0D0D] dark:text-white">
            Future with us
          </p>
        </div>

        {/* Feature: Analytics */}
        <section className="px-4 md:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto bg-muted dark:bg-muted/30 rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 lg:p-24 flex flex-col md:flex-row items-center gap-8 md:gap-16 lg:gap-24">
            <div className="w-full md:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <Image
                  src={Images.analytics}
                  alt="Project Analytics Dashboard"
                  className="w-full h-auto max-w-md md:max-w-none"
                />
              </motion.div>
            </div>
            <div className="w-full md:w-1/2 space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-[#0D0D0D] dark:text-white leading-[1.1]">
                  Comprehensive <br />{" "}
                  <span className="text-primary">Project Analytics</span>{" "}
                  Dashboard
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  Gain real-time visibility into your operations with a clean,
                  centralized oversight of all your active builds.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-y-6 pt-4">
                {[
                  "Live Project Metrics",
                  "Team Activity Feeds",
                  "Customizable Widgets",
                  "Automated Progress Tracking",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 text-lg  text-[#0D0D0D] dark:text-white"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#0D0D0D] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full "></div>
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature: Tasks */}
        <section className="py-12 md:py-16 lg:py-24 px-4 md:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto bg-muted dark:bg-muted/30 rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 lg:p-24 flex flex-col md:flex-row items-center gap-8 md:gap-16 lg:gap-24">
            <div className="w-full md:w-1/2 space-y-8 order-2 md:order-1">
              <h2 className="text-4xl md:text-6xl font-black text-[#0D0D0D] dark:text-white leading-[1.1]">
                <span className="text-primary">Track</span> All Your <br />{" "}
                Tasks with Ease
              </h2>
              <p className="text-xl text-foreground leading-relaxed font-medium">
                Manage your workflow without the headache. Whether it&apos;s
                Kanban, Gantt charts, or simple lists, BuildTracker adapts to
                you—not the other way around.
              </p>
              <Button className="rounded-full px-12 h-14 bg-primary hover:bg-primary/90 text-white font-black group mt-4 transition-all hover:scale-105 active:scale-95">
                Explore Features
              </Button>
            </div>
            <div className="w-full md:w-1/2 min-h-[400px] order-1 md:order-2">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <Image
                  src={Images.task}
                  alt="Task Tracking Board"
                  className="w-full h-auto"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Grid: Collaborate */}
        <section className="py-16 md:py-24 px-4 md:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center space-y-12 md:space-y-16">
            <div className="space-y-4">
              <h2 className="text-primary text-4xl md:text-5xl font-black">
                Collaborate
              </h2>
              <p className="text-4xl md:text-6xl font-black text-[#0D0D0D] dark:text-white">
                Across the Globe
              </p>
              <p className="text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                Real-time communication tools designed for remote, hybrid, and
                site-based teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Multi-Organization",
                  color: "bg-primary",
                  desc: "Manage multiple teams with role-based permissions and isolated workspaces.",
                  image: Images.workspace,
                },
                {
                  title: "Wiki & Docs",
                  color: "bg-orange-400",
                  desc: "Built-in documentation system with version control for your SOPs and blueprints.",
                  image: Images.folderScreenshot,
                },
                {
                  title: "Analytics & Reports",
                  color: "bg-purple-500",
                  desc: "Get report and analytics of individual team members and performance of team.",
                  image: Images.rate,
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="text-center group"
                >
                  <div className="bg-muted rounded-xl relative overflow-hidden mb-8 h-fit">
                    <Image
                      src={item.image}
                      alt={item.title}
                      className="pl-15 pr-8 pt-12 w-auto h-full object-contain object-bottom"
                    />
                  </div>
                  <div className="space-y-3 px-4">
                    <h3 className="text-2xl font-black text-[#0D0D0D] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-12 md:py-16 lg:py-24 px-4 md:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center mb-12 md:mb-16">
            <h2 className="text-primary text-4xl md:text-5xl font-black">
              Security & Trust
            </h2>
          </div>
          <div className="max-w-7xl mx-auto rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 lg:p-24 flex flex-col md:flex-row items-center gap-8 md:gap-16 lg:gap-32 bg-muted">
            <div className="w-full md:w-1/2 relative flex justify-center">
              <div className="w-40 h-40 md:w-56 md:h-56 bg-blue-50 dark:bg-muted/20 rounded-full flex items-center justify-center relative">
                <Image
                  src={Images.auth}
                  alt="Security & Authentication"
                  className="w-32 h-32 md:w-44 md:h-44 object-contain"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl font-black text-[#0D0D0D] dark:text-white leading-[1.1]">
                  Achieve{" "}
                  <span className="text-primary">
                    Operational <br /> Excellence
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  We take your data seriously. Your intellectual property is
                  protected by the same standards used by global banks.
                </p>
              </div>
              <div className="space-y-10">
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 rounded-full bg-orange-400 shrink-0 shadow-xl shadow-orange-400/20 flex items-center justify-center">
                    <Layout className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#0D0D0D] dark:text-white">
                      Multi-Factor Authentication
                    </h4>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      Secure logins for every team member.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 rounded-full bg-orange-400 shrink-0 shadow-xl shadow-orange-400/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-[#0D0D0D] dark:text-white">
                      End-to-End Encryption
                    </h4>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      Your documents and chats are for your eyes only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-12 md:py-16 lg:py-24 px-4 md:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto bg-muted dark:bg-muted/30 rounded-2xl md:rounded-[3.5rem] p-6 md:p-12 lg:p-24 flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="w-full md:w-1/2 space-y-6 md:space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-[#0D0D0D] dark:text-white leading-[1.1]">
                <span className="text-primary">Integrate</span> With Your
                Favourite Tools
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
                BuildTracker plays well with others. Connect your workflow to
                the apps your team already uses every day.
              </p>
              <Button className="rounded-full px-12 h-14 bg-primary hover:bg-primary/90 text-white font-black active:scale-95 transition-all hover:scale-105">
                Explore Integration
              </Button>
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center relative">
              <Image
                src={Images.integration}
                alt="BuildTracker"
                width={500}
                height={120}
              />
            </div>
          </div>
        </section>

        {/* Ready to manage Section */}
        <section className="py-16 md:py-24 px-4 md:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto mb-12 md:mb-16">
            <div className="bg-blue-50 dark:bg-muted/20 rounded-2xl md:rounded-[3.5rem] flex flex-col md:flex-row items-center gap-6 md:gap-12 lg:gap-24 relative overflow-hidden">
              <div className="w-full md:w-2/5 relative overflow-hidden hidden md:block h-64 md:h-auto">
                <Image
                  src={Images.tiltRight}
                  alt="Team Management"
                  className="w-full h-full object-cover object-bottom-left"
                />
              </div>
              <div className="w-full md:w-3/5 space-y-6 md:space-y-8 z-10 order-1 md:order-2 p-6 md:p-0">
                <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-[#0D0D0D] dark:text-white leading-[1.1]">
                  Ready to manage Your <br />{" "}
                  <span className="text-primary">Team Better</span> with us?
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium">
                  Stop fighting your software. Start tracking your progress.
                </p>
                <Button className="rounded-full px-12 h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-black active:scale-95 transition-all hover:scale-105">
                  Get Started
                </Button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-orange-500 rounded-2xl md:rounded-[3rem] p-8 md:p-12 lg:p-20 text-white space-y-6 md:space-y-8 group overflow-hidden relative">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <ChartColumn className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl md:text-5xl font-black">
                  Start Tracking Progress
                </h3>
                <p className="text-white/80 font-medium">
                  BuildTracker optimize your productivity & workflow.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-full px-12 h-14 bg-orange-500 border-white text-white hover:bg-white hover:text-orange-500 font-black transition-all"
              >
                Get Started
              </Button>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            </div>
            <div className="bg-purple-600 rounded-2xl md:rounded-[3rem] p-8 md:p-12 lg:p-20 text-white space-y-6 md:space-y-8 group overflow-hidden relative">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <PlaySquare className="w-10 h-10" />
              </div>
              <div className="space-y-3 md:space-y-4 px-4 md:px-0">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black">
                  Watch <br /> Demo
                </h3>
                <p className="text-base md:text-lg text-white/80 font-medium">
                  BuildTracker plays well with your team. Watch BuildTracker
                  Now.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-full px-12 h-14 border-white bg-purple-600 text-white hover:bg-white hover:text-purple-600 font-black transition-all"
              >
                Watch Now
              </Button>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
