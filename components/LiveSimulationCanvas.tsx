'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Cpu, Zap, Activity, ShieldCheck, Database, Layers, ArrowUpRight } from 'lucide-react';
import { InteractiveSimulationConfig } from '@/lib/types';

interface LiveSimulationCanvasProps {
  activeModule: 'CFD' | 'MBSE';
}

export const LiveSimulationCanvas: React.FC<LiveSimulationCanvasProps> = ({ activeModule }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [config, setConfig] = useState<InteractiveSimulationConfig>({
    meshDensity: 120,
    flowVelocity: 2.8,
    turbulenceModel: 'k-omega',
    angleOfAttack: 12,
    subDomain: activeModule,
  });

  // Calculate live dynamic metrics for realistic readout
  const machNumber = (config.flowVelocity * 0.28).toFixed(2);
  const reynoldsNumber = (config.flowVelocity * 1.42).toFixed(1);
  const reynoldsExponent = '6';
  const residualConvergence = (1e-6 * (150 - config.meshDensity + 10)).toExponential(2);
  const liftToDragRatio = (18.4 - Math.abs(config.angleOfAttack - 8) * 0.6).toFixed(1);

  return (
    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden text-zinc-100">
      {/* Simulation Header / Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold">
              HX {activeModule} Solver Cluster #09
            </span>
          </div>

          <span className="hidden sm:inline text-zinc-600">|</span>

          <span className="hidden sm:inline font-mono text-[11px] text-zinc-400">
            GPU Accelerators: 8x H100 SXM5 (99.4% load)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-mono text-white transition-colors border border-zinc-700"
          >
            {isPlaying ? (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>PAUSE SOLVER</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>RESUME</span>
              </>
            )}
          </button>

          <button
            onClick={() =>
              setConfig({
                meshDensity: 120,
                flowVelocity: 2.8,
                turbulenceModel: 'k-omega',
                angleOfAttack: 12,
                subDomain: activeModule,
              })
            }
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded transition-colors"
            title="Reset Parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas + Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Visualizer Display Area */}
        <div className="lg:col-span-3 relative min-h-[320px] md:min-h-[420px] bg-black p-4 flex flex-col justify-between overflow-hidden">
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
              backgroundSize: `${config.meshDensity / 4}px ${config.meshDensity / 4}px`,
            }}
          />

          {/* Animated CFD / MBSE Physics Graphic */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            {activeModule === 'CFD' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Airfoil SVG geometry */}
                <svg
                  viewBox="0 0 800 400"
                  className="w-full h-full max-w-2xl opacity-90 transition-transform duration-300"
                  style={{ transform: `rotate(${-config.angleOfAttack}deg)` }}
                >
                  <defs>
                    <linearGradient id="pressureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Streamlines */}
                  {[60, 110, 150, 180, 220, 260, 300, 340].map((y, i) => (
                    <motion.path
                      key={i}
                      d={`M 0 ${y} Q 300 ${y - (i < 4 ? 40 + config.angleOfAttack * 2 : -20)}, 800 ${y + (i > 4 ? 30 : -10)}`}
                      stroke="url(#streamGrad)"
                      strokeWidth={1.5 + (i % 3)}
                      strokeDasharray="12 6"
                      fill="none"
                      animate={
                        isPlaying
                          ? { strokeDashoffset: [0, -100] }
                          : { strokeDashoffset: 0 }
                      }
                      transition={{
                        repeat: Infinity,
                        duration: 3 / config.flowVelocity,
                        ease: 'linear',
                      }}
                    />
                  ))}

                  {/* Main Airfoil Shape */}
                  <path
                    d="M 250 200 C 350 140, 520 180, 620 200 C 520 215, 350 220, 250 200 Z"
                    fill="#09090b"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />

                  {/* Shockwave / Pressure contour gradient field */}
                  <path
                    d="M 250 200 C 320 110, 480 130, 620 200 C 480 230, 320 240, 250 200 Z"
                    fill="url(#pressureGrad)"
                    className="opacity-40 blur-sm"
                  />

                  {/* Pressure nodes */}
                  <circle cx="280" cy="180" r="4" fill="#ef4444" className="animate-ping" />
                  <circle cx="450" cy="170" r="3" fill="#38bdf8" />
                  <circle cx="580" cy="195" r="3" fill="#10b981" />
                </svg>
              </div>
            ) : (
              /* MBSE Architecture View */
              <div className="relative w-full h-full max-w-xl flex items-center justify-center p-6">
                <div className="grid grid-cols-3 gap-6 w-full">
                  {[
                    { title: 'SYS.01 Requirements', status: 'VERIFIED', node: 'REQ-901' },
                    { title: 'SYS.02 Architecture', status: 'ACTIVE', node: 'ARCH-404' },
                    { title: 'SYS.03 Allocation', status: 'SYNCED', node: 'ALLOC-108' },
                    { title: 'CFD Boundary Bind', status: 'CONNECTED', node: 'SOLVER-90' },
                    { title: 'Thermal Digital Twin', status: 'COMPUTING', node: 'TWIN-88' },
                    { title: 'Verification Matrix', status: '100% PASSED', node: 'VERIF-01' },
                  ].map((node, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-lg flex flex-col justify-between space-y-2 backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                        <span>{node.node}</span>
                        <span className="text-emerald-400 font-bold">{node.status}</span>
                      </div>
                      <div className="text-xs font-semibold text-white">{node.title}</div>
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white transition-all duration-500"
                          style={{ width: `${60 + (index * 8) % 40}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Overlay HUD Readouts */}
          <div className="relative z-10 flex flex-wrap justify-between items-start gap-2">
            <div className="bg-black/80 backdrop-blur-md border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono space-y-1">
              <div className="text-zinc-500 uppercase text-[10px]">Active Domain</div>
              <div className="text-white font-bold flex items-center space-x-1.5">
                <span>HX {activeModule} Solvers</span>
                <span className="bg-zinc-800 text-[10px] px-1.5 py-0.5 rounded text-zinc-300">
                  v4.8-Enterprise
                </span>
              </div>
            </div>

            <div className="bg-black/80 backdrop-blur-md border border-zinc-800 px-3 py-2 rounded-lg text-xs font-mono space-y-1 text-right">
              <div className="text-zinc-500 uppercase text-[10px]">Residual L2 Convergence</div>
              <div className="text-emerald-400 font-bold">{residualConvergence}</div>
            </div>
          </div>

          {/* Bottom telemetry overlay */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-2.5 rounded-lg text-xs font-mono">
              <div className="text-zinc-500 text-[10px]">MACH NUMBER</div>
              <div className="text-base font-semibold text-white mt-0.5">{machNumber} Ma</div>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-2.5 rounded-lg text-xs font-mono">
              <div className="text-zinc-500 text-[10px]">REYNOLDS (Re)</div>
              <div className="text-base font-semibold text-white mt-0.5">
                {reynoldsNumber} × 10<sup>{reynoldsExponent}</sup>
              </div>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-2.5 rounded-lg text-xs font-mono">
              <div className="text-zinc-500 text-[10px]">LIFT / DRAG (L/D)</div>
              <div className="text-base font-semibold text-emerald-400 mt-0.5">{liftToDragRatio}</div>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 p-2.5 rounded-lg text-xs font-mono">
              <div className="text-zinc-500 text-[10px]">MESH CELLS</div>
              <div className="text-base font-semibold text-white mt-0.5">
                {(config.meshDensity * 184000).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls Panel */}
        <div className="p-4 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 space-y-5 text-xs">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-3 font-semibold flex items-center justify-between">
              <span>Solver Parameters</span>
              <Activity className="w-3.5 h-3.5 text-zinc-500" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1.5 font-mono">
                  <span>Mesh Resolution</span>
                  <span className="text-white font-semibold">{config.meshDensity}k cells</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="250"
                  value={config.meshDensity}
                  onChange={(e) => setConfig({ ...config, meshDensity: Number(e.target.value) })}
                  className="w-full accent-white bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1.5 font-mono">
                  <span>Inlet Velocity (Mach)</span>
                  <span className="text-white font-semibold">{config.flowVelocity} M</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={config.flowVelocity}
                  onChange={(e) => setConfig({ ...config, flowVelocity: Number(e.target.value) })}
                  className="w-full accent-white bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1.5 font-mono">
                  <span>Angle of Attack (α)</span>
                  <span className="text-white font-semibold">{config.angleOfAttack}°</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="25"
                  value={config.angleOfAttack}
                  onChange={(e) => setConfig({ ...config, angleOfAttack: Number(e.target.value) })}
                  className="w-full accent-white bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5 font-mono">Turbulence Model</label>
                <select
                  value={config.turbulenceModel}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      turbulenceModel: e.target.value as any,
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-2 text-white font-mono focus:outline-none focus:border-zinc-500"
                >
                  <option value="k-omega">k-omega SST (Transonic)</option>
                  <option value="k-epsilon">k-epsilon Standard</option>
                  <option value="LES">Large Eddy Simulation (LES)</option>
                  <option value="DNS">Direct Numerical Simulation</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              HX Cluster Integration
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
                <span className="flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Hardware Mode</span>
                </span>
                <span className="text-white">FP64 Tensor Core</span>
              </div>

              <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
                <span className="flex items-center space-x-1.5">
                  <Database className="w-3.5 h-3.5 text-zinc-500" />
                  <span>CAD Model Sync</span>
                </span>
                <span className="text-emerald-400 font-semibold">STEP / IGES 100%</span>
              </div>

              <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Compliance</span>
                </span>
                <span className="text-zinc-300">ITAR / AS9100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};