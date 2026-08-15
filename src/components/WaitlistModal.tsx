import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm, ValidationError } from '@formspree/react';
import { X, Check, ShieldCheck, Sparkles, ArrowRight, Building, Mail, User, Layers, Cpu, Loader2 } from 'lucide-react';
import { HxSymbol } from './HxLogo';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultInterest?: 'CFD' | 'MBSE';
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  defaultInterest = 'CFD',
}) => {
  const [state, handleSubmit] = useForm('mjybyyvg');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Aerospace Engineer');
  const [interests, setInterests] = useState<string[]>([defaultInterest]);

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== item));
      }
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setCompany('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl shadow-black/80"
          >
            {/* Header pattern bar */}
            <div className="h-1 w-full bg-gradient-to-r from-zinc-700 via-white to-zinc-700" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-900"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8">
              {!state.succeeded ? (
                <>
                  <div className="flex items-center space-x-3 mb-2">
                    <HxSymbol className="h-5 w-auto text-white" />
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      Early Access Reservation
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">
                    Join the HX Platform Waitlist
                  </h2>
                  <p className="text-sm text-zinc-400 mb-6">
                    Get priority deployment for GPU-accelerated CFD physics solvers and cloud-native MBSE tools.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="interests" value={interests.join(', ')} />

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Dr. Alex Vance"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                        />
                      </div>
                      <ValidationError prefix="Full Name" field="fullName" errors={state.errors} className="text-xs text-red-400 mt-1" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
                        Work Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@aerospace-systems.com"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                        />
                      </div>
                      <ValidationError prefix="Email" field="email" errors={state.errors} className="text-xs text-red-400 mt-1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
                          Organization / Company
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            name="company"
                            id="company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="AeroDynamics Corp"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1.5 uppercase tracking-wider">
                          Primary Engineering Role
                        </label>
                        <select
                          name="role"
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
                        >
                          <option value="Aerospace Engineer">Aerospace / Defense Engineer</option>
                          <option value="CFD Specialist">CFD / Fluid Dynamics Specialist</option>
                          <option value="Systems Architect">Systems Architect / MBSE Lead</option>
                          <option value="Automotive & Motorsport">Automotive & Motorsport Lead</option>
                          <option value="Research & Academia">Research / University Fellow</option>
                          <option value="Engineering Executive">VP / Director of Engineering</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-2 uppercase tracking-wider">
                        Interested Modules
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'CFD', label: 'HX CFD Engine', icon: Cpu, desc: 'GPU-accelerated Navier-Stokes' },
                          { id: 'MBSE', label: 'HX MBSE Architecture', icon: Layers, desc: 'Digital Twin & Requirements' },
                          { id: 'Thermal', label: 'HX Thermal Solvers', icon: Sparkles, desc: 'Conduction & Radiation' },
                          { id: 'Cloud', label: 'Cloud Execution Cluster', icon: ShieldCheck, desc: 'On-demand supercomputing' },
                        ].map((item) => {
                          const isSelected = interests.includes(item.id);
                          const Icon = item.icon;
                          return (
                            <button
                              type="button"
                              key={item.id}
                              onClick={() => toggleInterest(item.id)}
                              className={`flex items-start p-3 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'bg-zinc-900 border-zinc-400 text-white'
                                  : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              <Icon className={`w-4 h-4 mt-0.5 mr-2 shrink-0 ${isSelected ? 'text-white' : 'text-zinc-500'}`} />
                              <div>
                                <div className="text-xs font-medium">{item.label}</div>
                                <div className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={state.submitting}
                        className="w-full bg-white hover:bg-zinc-200 text-black font-semibold text-sm py-3 px-6 rounded-lg uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-white/10 disabled:opacity-50"
                      >
                        {state.submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Submitting to Waitlist...</span>
                          </>
                        ) : (
                          <>
                            <span>Reserve Priority Queue Spot</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-center text-zinc-500">
                      Powered by Formspree. No spam guarantee. Zero commitment.
                    </p>
                  </form>
                </>
              ) : (
                <div className="text-center py-4 space-y-5">
                  <div className="w-16 h-16 bg-zinc-900 border border-zinc-700 text-white rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Check className="w-8 h-8 text-white" />
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      Reservation Confirmed
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1">
                      You're on the Waitlist!
                    </h2>
                    <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto">
                      Thank you<span className="text-white font-medium">{fullName ? `, ${fullName}` : ''}</span>. Your submission has been securely recorded via Formspree.
                    </p>
                  </div>

                  <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl text-left max-w-md mx-auto space-y-2">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Status</span>
                      <span className="font-mono text-emerald-400 font-semibold">Submitted & Confirmed</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Assigned Priority Tier</span>
                      <span className="font-semibold text-white">Tier 1 Early Access</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Selected Solvers</span>
                      <span className="text-zinc-300">{interests.join(', ')}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500">
                    We will notify <span className="text-zinc-300">{email || 'you'}</span> as soon as your access slot opens.
                  </p>

                  <button
                    onClick={handleReset}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-mono uppercase tracking-wider py-2.5 rounded-lg transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
