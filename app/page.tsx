"use client";

import { motion } from "motion/react";
import { FeatureBentoGrid } from "./_components/FeatureBentoGrid";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const { user } = useUser();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
                🩺 Revolutionize Patient Care with{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Voice Agents
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl">
                Deliver instant, accurate medical assistance through natural voice conversations. 
                Automate appointment scheduling, symptom triage, and follow-up care—24/7.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href={user ? '/dashboard' : '/sign-in'}>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg">
                    {user ? 'Go to Dashboard' : 'Get Started Free'}
                  </Button>
                </Link>
                {!user && (
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                    Watch Demo
                  </Button>
                )}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-30"></div>
                <div className="relative rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-2xl">
                  {/* Voice AI Interface Mockup */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 border border-blue-100 dark:border-gray-600">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">🎤</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">AI Medical Assistant</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Dr. Sarah Johnson</p>
                      </div>
                      <div className="ml-auto">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>

                    {/* Voice Waveform */}
                    <div className="flex items-center justify-center gap-1 mb-6">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-blue-500 rounded-full"
                          animate={{
                            height: [8, 24, 8],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                          style={{ height: 8 }}
                        />
                      ))}
                    </div>

                    {/* Status */}
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Listening...</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Voice-powered medical consultations</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3 mt-6">
                      <button className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                        <span className="text-white text-sm">⏹️</span>
                      </button>
                      <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                        <span className="text-white text-sm">🎤</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { number: "10K+", label: "Consultations" },
              { number: "99%", label: "Accuracy Rate" },
              { number: "24/7", label: "Availability" },
              { number: "50+", label: "Specialists" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stat.number}</div>
                <div className="mt-2 text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Why Healthcare Providers Trust Our AI
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Save time, reduce costs, and enhance patient experience with 24/7 intelligent voice support designed for medical use.
            </p>
          </motion.div>
          <FeatureBentoGrid />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Healthcare Practice?
            </h2>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              Join thousands of healthcare providers using AI voice agents for better patient outcomes.
            </p>
            <div className="mt-8">
              <Link href={user ? '/dashboard' : '/sign-in'}>
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                  {user ? 'Access Dashboard' : 'Start Free Trial'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const Navbar = () => {
  const { user } = useUser();
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">🩺 AIHealthAssis</h1>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <Link href={'/sign-in'}>
                <Button variant="outline" className="hidden sm:inline-flex">
                  Login
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <UserButton />
                <Link href={'/dashboard'}>
                  <Button>Dashboard</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">🩺 AIHealthAssis</h3>
            <p className="text-gray-400 max-w-md">
              Revolutionizing healthcare with AI-powered voice agents for better patient outcomes and efficient medical consultations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="mailto:vedangt17@gmail.com" className="hover:text-white transition-colors">Email</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 AIHealthAssis. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <img width={24} src="/facebook_icon.svg" alt="Facebook" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <img width={24} src="/twitter_icon.svg" alt="Twitter" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <img width={24} src="/google_plus_icon.svg" alt="Google" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
