import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MongoClient, Db } from 'mongodb';
import { WaitlistCandidateDocument } from '../mongodb/schema';

export type Candidate = WaitlistCandidateDocument & {
  /** Alias for candidateId */
  id: string;
  joinedDate?: string;
};

export interface WaitlistData {
  lastIndex: number;
  candidates: Candidate[];
}

export interface PublicRosterItem {
  id: string;
  position: number;
  originalPosition: number;
  movedUpSpots: number;
  hasMovedUp: boolean;
  status: string;
  joinedDate: string;
  isVerified: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'waitlist.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate cryptographically secure random token: HX- + 36 random alphanumeric characters
export function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(36);
  let randomStr = '';
  for (let i = 0; i < 36; i++) {
    randomStr += chars[bytes[i] % chars.length];
  }
  return `HX-${randomStr}`;
}

// SHA-256 hash function for storing only token hashes in MongoDB
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

// Local fallback store
function initLocalData(): WaitlistData {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (typeof parsed.lastIndex === 'number' && Array.isArray(parsed.candidates)) {
        return parsed;
      }
    } catch (e) {
      console.error('Error reading local waitlist data', e);
    }
  }

  const initialData: WaitlistData = {
    lastIndex: 0,
    candidates: [],
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

let localStore: WaitlistData = initLocalData();

function saveLocalStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save local waitlist store', err);
  }
}

// MongoDB Connection Pool
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnecting = false;

export async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (mongoDb) {
    return mongoDb;
  }

  if (isMongoConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (mongoDb) return mongoDb;
  }

  try {
    isMongoConnecting = true;
    const dbName = process.env.MONGODB_DB_NAME || 'hxcfd';
    mongoClient = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db(dbName);
    console.log(`[MongoDB] Connected successfully to database: ${dbName}`);

    // Create unique indexes on collection: waitlist
    await mongoDb.collection('waitlist').createIndex({ email: 1 }, { unique: true });
    await mongoDb.collection('waitlist').createIndex({ candidateId: 1 }, { unique: true });
    await mongoDb.collection('waitlist').createIndex({ tokenHash: 1 }, { sparse: true });

    // Initialize sequence counter if not exists
    const counter = await mongoDb.collection('counters').findOne({ _id: 'candidateIndex' as any });
    if (!counter) {
      await mongoDb.collection('counters').insertOne({
        _id: 'candidateIndex' as any,
        seq: localStore.lastIndex,
      });
    }

    isMongoConnecting = false;
    return mongoDb;
  } catch (error) {
    isMongoConnecting = false;
    console.error('[MongoDB] Connection error, using robust fallback storage:', error);
    return null;
  }
}

export function formatCandidateId(num: number): string {
  if (num < 1000) {
    return `HX${String(num).padStart(3, '0')}`;
  }
  return `HX${num}`;
}

export async function getWaitlistCount(): Promise<number> {
  const db = await getMongoDb();
  if (db) {
    try {
      const activeCount = await db.collection('waitlist').countDocuments({
        status: { $ne: 'CANCELLED' },
      });
      return activeCount;
    } catch (err) {
      console.error('[MongoDB] Error getting count:', err);
    }
  }

  const activeCandidates = localStore.candidates.filter((c) => c.status !== 'CANCELLED');
  return activeCandidates.length;
}

export async function getCancelledCount(): Promise<number> {
  const db = await getMongoDb();
  if (db) {
    try {
      return await db.collection('waitlist').countDocuments({
        status: 'CANCELLED',
      });
    } catch (err) {
      console.error('[MongoDB] Error getting cancelled count:', err);
    }
  }
  return localStore.candidates.filter((c) => c.status === 'CANCELLED').length;
}

export async function getPublicRoster(): Promise<PublicRosterItem[]> {
  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Today';
    }
  };

  const db = await getMongoDb();
  if (db) {
    try {
      const allDbCandidates = await db
        .collection<WaitlistCandidateDocument>('waitlist')
        .find({ status: { $ne: 'CANCELLED' } })
        .sort({ index: 1, _id: 1 })
        .toArray();

      const resultWithPositions: PublicRosterItem[] = allDbCandidates.map((cand, idx) => {
        const dynamicPos = idx + 1;
        const originalPos = cand.index || dynamicPos;
        const movedUp = Math.max(0, originalPos - dynamicPos);
        return {
          id: cand.candidateId,
          position: dynamicPos,
          originalPosition: originalPos,
          movedUpSpots: movedUp,
          hasMovedUp: movedUp > 0,
          status: cand.status || 'ACTIVE',
          joinedDate: formatDate(cand.joinedAt),
          isVerified: !!cand.isVerified,
        };
      });

      return resultWithPositions.sort((a, b) => {
        const numA = parseInt(a.id.replace('HX', ''), 10) || 0;
        const numB = parseInt(b.id.replace('HX', ''), 10) || 0;
        return numB - numA;
      });
    } catch (err) {
      console.error('[MongoDB] Error reading public roster:', err);
    }
  }

  // Local fallback - only real candidates
  const activeCandidates = localStore.candidates.filter((c) => c.status !== 'CANCELLED');
  activeCandidates.sort((a, b) => (a.index || 0) - (b.index || 0));

  const resultWithPositions: PublicRosterItem[] = activeCandidates.map((cand, idx) => {
    const dynamicPos = idx + 1;
    const originalPos = cand.index || dynamicPos;
    const movedUp = Math.max(0, originalPos - dynamicPos);
    return {
      id: cand.candidateId || cand.id,
      position: dynamicPos,
      originalPosition: originalPos,
      movedUpSpots: movedUp,
      hasMovedUp: movedUp > 0,
      status: cand.status || 'ACTIVE',
      joinedDate: formatDate(cand.joinedAt),
      isVerified: !!cand.isVerified,
    };
  });

  return resultWithPositions.sort((a, b) => {
    const numA = parseInt((a.id || '').replace('HX', ''), 10) || 0;
    const numB = parseInt((b.id || '').replace('HX', ''), 10) || 0;
    return numB - numA;
  });
}

export async function findCandidateByEmail(email: string): Promise<Candidate | null> {
  const normalized = email.trim().toLowerCase();
  const db = await getMongoDb();
  if (db) {
    try {
      const doc = await db.collection<WaitlistCandidateDocument>('waitlist').findOne({ email: normalized });
      if (doc) {
        return {
          ...doc,
          id: doc.candidateId,
          joinedDate: doc.joinedAt,
        };
      }
      return null;
    } catch (err) {
      console.error('[MongoDB] Error finding candidate in waitlist:', err);
    }
  }

  const found = localStore.candidates.find((c) => c.email.toLowerCase() === normalized);
  return found || null;
}

export async function findCandidateByTokenHash(tokenHash: string): Promise<Candidate | null> {
  const db = await getMongoDb();
  if (db) {
    try {
      const doc = await db.collection<WaitlistCandidateDocument>('waitlist').findOne({ tokenHash });
      if (doc) {
        return {
          ...doc,
          id: doc.candidateId,
          joinedDate: doc.joinedAt,
        };
      }
      return null;
    } catch (err) {
      console.error('[MongoDB] Error finding candidate by tokenHash:', err);
    }
  }

  const found = localStore.candidates.find((c) => c.tokenHash === tokenHash);
  return found || null;
}

export async function registerOrGetCandidateWithToken(
  email: string
): Promise<{ candidate: Candidate; token: string; isNew: boolean }> {
  const normalized = email.trim().toLowerCase();
  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);

  const existing = await findCandidateByEmail(normalized);

  if (existing) {
    const db = await getMongoDb();
    if (db) {
      try {
        await db.collection('waitlist').updateOne(
          { email: normalized },
          { $set: { tokenHash, status: existing.status === 'CANCELLED' ? 'ACTIVE' : existing.status } }
        );
      } catch (err) {
        console.error('[MongoDB] Error updating candidate tokenHash:', err);
      }
    }

    existing.tokenHash = tokenHash;
    if (existing.status === 'CANCELLED') {
      existing.status = 'ACTIVE';
    }
    saveLocalStore();

    return { candidate: existing, token: rawToken, isNew: false };
  }

  const db = await getMongoDb();
  if (db) {
    try {
      const counterResult = await db.collection('counters').findOneAndUpdate(
        { _id: 'candidateIndex' as any },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
      );

      const newIndex = (counterResult as any)?.seq || (await db.collection('waitlist').countDocuments()) + 1;
      const candidateId = formatCandidateId(newIndex);
      const joinedAt = new Date().toISOString();

      const newDoc: WaitlistCandidateDocument = {
        email: normalized,
        candidateId,
        joinedAt,
        index: newIndex,
        status: 'ACTIVE',
        tokenHash,
        isVerified: true,
      };

      await db.collection('waitlist').insertOne(newDoc);
      console.log(`[MongoDB - hxcfd.waitlist] Registered candidate with token: ${candidateId} (${normalized})`);

      const candidate: Candidate = {
        ...newDoc,
        id: candidateId,
        joinedDate: joinedAt,
      };

      return { candidate, token: rawToken, isNew: true };
    } catch (err) {
      console.error('[MongoDB] Error inserting candidate into waitlist collection:', err);
    }
  }

  // Local fallback
  localStore.lastIndex += 1;
  const newIndex = localStore.lastIndex;
  const candidateId = formatCandidateId(newIndex);
  const joinedAt = new Date().toISOString();

  const newCandidate: Candidate = {
    id: candidateId,
    candidateId,
    index: newIndex,
    email: normalized,
    joinedAt,
    joinedDate: joinedAt,
    status: 'ACTIVE',
    tokenHash,
    isVerified: true,
  };

  localStore.candidates.push(newCandidate);
  saveLocalStore();

  return { candidate: newCandidate, token: rawToken, isNew: true };
}

export interface PositionInfo {
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

export async function checkCandidatePosition(token: string): Promise<PositionInfo | null> {
  const tokenClean = token.trim();
  if (!tokenClean) return null;

  const th = hashToken(tokenClean);
  const candidate = await findCandidateByTokenHash(th);
  if (!candidate) {
    return null;
  }

  const isCancelled = candidate.status === 'CANCELLED';
  const originalPos = candidate.index || parseInt((candidate.candidateId || candidate.id).replace('HX', ''), 10) || 1;
  const joinedDateFormatted = new Date(candidate.joinedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const maskEmail = (email: string) => {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const name = parts[0];
    const visible = name.slice(0, Math.min(2, name.length));
    return `${visible}***@${parts[1]}`;
  };

  const db = await getMongoDb();
  if (db) {
    try {
      const totalActive = await db.collection('waitlist').countDocuments({
        status: { $ne: 'CANCELLED' },
      });

      if (isCancelled) {
        return {
          candidateId: candidate.candidateId || candidate.id,
          emailMasked: maskEmail(candidate.email),
          originalPosition: originalPos,
          position: null,
          peopleAhead: 0,
          totalActive,
          movedUpSpots: 0,
          hasMovedUp: false,
          joinedDate: joinedDateFormatted,
          joinedAt: candidate.joinedAt,
          status: 'CANCELLED',
          isCancelled: true,
          cancelledAt: candidate.cancelledAt,
        };
      }

      const candIndex = candidate.index || 1;
      const peopleAhead = await db.collection('waitlist').countDocuments({
        status: { $ne: 'CANCELLED' },
        index: { $lt: candIndex },
      });

      const currentPos = peopleAhead + 1;
      const movedUp = Math.max(0, originalPos - currentPos);

      return {
        candidateId: candidate.candidateId || candidate.id,
        emailMasked: maskEmail(candidate.email),
        originalPosition: originalPos,
        position: currentPos,
        peopleAhead,
        totalActive,
        movedUpSpots: movedUp,
        hasMovedUp: movedUp > 0,
        joinedDate: joinedDateFormatted,
        joinedAt: candidate.joinedAt,
        status: 'ACTIVE',
        isCancelled: false,
      };
    } catch (err) {
      console.error('[MongoDB] Error checking position in MongoDB:', err);
    }
  }

  // Local fallback
  const activeCandidates = localStore.candidates.filter((c) => c.status !== 'CANCELLED');
  const totalActive = activeCandidates.length;

  if (isCancelled) {
    return {
      candidateId: candidate.candidateId || candidate.id,
      emailMasked: maskEmail(candidate.email),
      originalPosition: originalPos,
      position: null,
      peopleAhead: 0,
      totalActive,
      movedUpSpots: 0,
      hasMovedUp: false,
      joinedDate: joinedDateFormatted,
      joinedAt: candidate.joinedAt,
      status: 'CANCELLED',
      isCancelled: true,
      cancelledAt: candidate.cancelledAt,
    };
  }

  const candIndex = candidate.index || 1;
  const peopleAhead = activeCandidates.filter((c) => (c.index || 1) < candIndex).length;
  const currentPos = peopleAhead + 1;
  const movedUp = Math.max(0, originalPos - currentPos);

  return {
    candidateId: candidate.candidateId || candidate.id,
    emailMasked: maskEmail(candidate.email),
    originalPosition: originalPos,
    position: currentPos,
    peopleAhead,
    totalActive,
    movedUpSpots: movedUp,
    hasMovedUp: movedUp > 0,
    joinedDate: joinedDateFormatted,
    joinedAt: candidate.joinedAt,
    status: 'ACTIVE',
    isCancelled: false,
  };
}

export async function cancelCandidatePosition(token: string): Promise<PositionInfo | null> {
  const tokenClean = token.trim();
  if (!tokenClean) return null;

  const th = hashToken(tokenClean);
  const candidate = await findCandidateByTokenHash(th);
  if (!candidate) {
    return null;
  }

  const cancelledAt = new Date().toISOString();

  const db = await getMongoDb();
  if (db) {
    try {
      await db.collection('waitlist').updateOne(
        { tokenHash: th },
        {
          $set: {
            status: 'CANCELLED',
            cancelledAt,
          },
        }
      );
    } catch (err) {
      console.error('[MongoDB] Error cancelling position in MongoDB:', err);
    }
  }

  candidate.status = 'CANCELLED';
  candidate.cancelledAt = cancelledAt;
  saveLocalStore();

  return checkCandidatePosition(tokenClean);
}

// Backward-compatible exports
export const registerOrGetCandidate = registerOrGetCandidateWithToken;
export async function setCandidateVerificationCode(email: string, code: string, expiresInMinutes = 10): Promise<Candidate | null> {
  const normalized = email.trim().toLowerCase();
  const codeExpiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const db = await getMongoDb();
  if (db) {
    try {
      const res = await db.collection<WaitlistCandidateDocument>('waitlist').findOneAndUpdate(
        { email: normalized },
        { $set: { verificationCode: code, codeExpiresAt } },
        { returnDocument: 'after' }
      );
      if (res) return { ...res, id: res.candidateId };
    } catch (err) {
      console.error('[MongoDB] Error setting verification code:', err);
    }
  }
  const candidate = localStore.candidates.find((c) => c.email.toLowerCase() === normalized);
  if (!candidate) return null;
  candidate.verificationCode = code;
  candidate.codeExpiresAt = codeExpiresAt;
  saveLocalStore();
  return candidate;
}

export async function verifyCandidateCode(email: string, code: string): Promise<{ success: boolean; candidate?: Candidate; token?: string; error?: string }> {
  const candidate = await findCandidateByEmail(email);
  if (!candidate) return { success: false, error: 'Candidate not found with this email.' };
  if (!candidate.verificationCode || !candidate.codeExpiresAt) {
    return { success: false, error: 'No verification code requested. Please request a new code.' };
  }
  if (Date.now() > candidate.codeExpiresAt) {
    return { success: false, error: 'Verification code has expired. Please request a new one.' };
  }
  if (candidate.verificationCode !== code.trim()) {
    return { success: false, error: 'Incorrect verification code. Please check and try again.' };
  }

  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);

  const db = await getMongoDb();
  if (db) {
    try {
      await db.collection('waitlist').updateOne(
        { email: candidate.email },
        {
          $set: { isVerified: true, status: 'ACTIVE', tokenHash },
          $unset: { verificationCode: '', codeExpiresAt: '' },
        }
      );
    } catch (err) {
      console.error('[MongoDB] Error updating verification status:', err);
    }
  }

  candidate.isVerified = true;
  candidate.status = 'ACTIVE';
  candidate.tokenHash = tokenHash;
  candidate.verificationCode = undefined;
  candidate.codeExpiresAt = undefined;
  saveLocalStore();

  return { success: true, candidate, token: rawToken };
}
