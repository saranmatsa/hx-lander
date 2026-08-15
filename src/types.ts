export interface WaitlistSubmission {
  id: string;
  fullName: string;
  email: string;
  company: string;
  role: string;
  interests: ('CFD' | 'MBSE' | 'Integration' | 'Cloud Computation')[];
  teamSize: string;
  createdAt: string;
}

export interface InteractiveSimulationConfig {
  meshDensity: number;
  flowVelocity: number;
  turbulenceModel: 'k-epsilon' | 'k-omega' | 'LES' | 'DNS';
  angleOfAttack: number;
  subDomain: 'CFD' | 'MBSE';
}

export interface MetricCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}
