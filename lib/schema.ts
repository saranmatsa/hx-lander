import { ObjectId } from 'mongodb';

/**
 * Waitlist candidate document schema for MongoDB.
 * Database: "hxcfd"
 * Collection: "waitlist"
 */
export interface WaitlistCandidateDocument {
  _id?: ObjectId;
  /** Normalized email address of the candidate */
  email: string;
  /** Sequential Candidate ID (e.g. "HX001", "HX127") */
  candidateId: string;
  /** ISO string of when the candidate joined */
  joinedAt: string;
  /** Numeric sequential index for sorting and position ranking */
  index?: number;
  /** Status of the candidate: ACTIVE | CANCELLED | WAITLISTED | VERIFIED | INVITED */
  status: 'ACTIVE' | 'CANCELLED' | 'WAITLISTED' | 'VERIFIED' | 'INVITED';
  /** SHA-256 hash of the cryptographically secure access token (raw token is never stored) */
  tokenHash?: string;
  /** ISO string of when position was cancelled, if applicable */
  cancelledAt?: string;
  /** Optional verification code for email */
  verificationCode?: string;
  /** Expiration timestamp for verification code */
  codeExpiresAt?: number;
  /** Verification status */
  isVerified?: boolean;
}

/**
 * Backward-compatible alias
 */
export type CandidateDocument = WaitlistCandidateDocument;

/**
 * Sequence counter schema definition.
 * Collection: "counters"
 */
export interface CounterDocument {
  _id: 'candidateIndex' | string;
  seq: number;
}

/**
 * MongoDB JSON Schema Validator definition for `waitlist` collection
 */
export const waitlistMongoSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['email', 'candidateId', 'joinedAt', 'status'],
    properties: {
      _id: { bsonType: 'objectId' },
      email: {
        bsonType: 'string',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        description: 'Valid email address is required',
      },
      candidateId: {
        bsonType: 'string',
        pattern: '^HX[0-9]+$',
        description: 'Unique sequential identifier starting with HX (e.g. HX001)',
      },
      joinedAt: {
        bsonType: 'string',
        description: 'ISO formatted join date string',
      },
      index: {
        bsonType: 'int',
        description: 'Sequential order index number',
      },
      status: {
        enum: ['ACTIVE', 'CANCELLED', 'WAITLISTED', 'VERIFIED', 'INVITED'],
        description: 'Waitlist status',
      },
      tokenHash: {
        bsonType: 'string',
        description: 'SHA-256 hash of the passwordless access token',
      },
      cancelledAt: {
        bsonType: 'string',
        description: 'ISO formatted cancellation timestamp',
      },
      verificationCode: {
        bsonType: 'string',
      },
      codeExpiresAt: {
        bsonType: ['long', 'double', 'int'],
      },
      isVerified: {
        bsonType: 'bool',
      },
    },
  },
};