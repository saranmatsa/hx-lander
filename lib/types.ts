export interface InteractiveSimulationConfig {
  meshDensity: number;
  flowVelocity: number;
  turbulenceModel: 'k-omega' | 'k-epsilon' | 'LES' | 'DNS';
  angleOfAttack: number;
  subDomain: 'CFD' | 'MBSE';
}

export interface PositionData {
  candidateId: string;
  emailMasked: string;
  originalPosition: number;
  position: number | null;
  peopleAhead: number;
  totalActive: number;
  movedUpSpots: number;
  hasMovedUp: boolean;
  joinedDate: string;
  joinedAt: string;
  status: 'ACTIVE' | 'CANCELLED';
  isCancelled: boolean;
  cancelledAt?: string;
}

export interface JoinedCandidate {
  candidateId: string;
  email: string;
  joinedAt: string;
  joinedDate?: string;
  status: string;
}