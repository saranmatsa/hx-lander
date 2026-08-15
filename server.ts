import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  getWaitlistCount,
  getPublicRoster,
  registerOrGetCandidateWithToken,
  findCandidateByEmail,
  checkCandidatePosition,
  cancelCandidatePosition,
  setCandidateVerificationCode,
  verifyCandidateCode,
} from './server/db';
import { generateVerificationCode, sendVerificationEmail } from './server/email';

dotenv.config();

function formatJoinedDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'August 15, 2026';
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Direct API: Receive email, insert into MongoDB 'waitlist' collection under 'hxcfd' db, return HX token & candidate ID
  app.post('/api/waitlist', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      const { candidate, token, isNew } = await registerOrGetCandidateWithToken(email);
      res.json({
        success: true,
        isNew,
        token, // Unhashed secure token shown to user once
        candidateId: candidate.candidateId || candidate.id,
        candidate: {
          candidateId: candidate.candidateId || candidate.id,
          email: candidate.email,
          joinedAt: candidate.joinedAt,
          joinedDate: formatJoinedDate(candidate.joinedAt),
          status: candidate.status || 'ACTIVE',
        },
      });
    } catch (err) {
      console.error('Failed to add to waitlist:', err);
      res.status(500).json({ error: 'Internal server error while joining waitlist.' });
    }
  });

  // Check Your Position API: Paste HX access token and view position
  app.post('/api/waitlist/check-position', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token || typeof token !== 'string' || !token.trim()) {
        return res.status(400).json({ error: 'Please enter your HX access token.' });
      }

      const positionInfo = await checkCandidatePosition(token.trim());
      if (!positionInfo) {
        return res.status(404).json({
          error: 'Invalid or unknown HX access code. Please check that you copied the complete token.',
        });
      }

      res.json({
        success: true,
        data: positionInfo,
      });
    } catch (err) {
      console.error('Failed to check position:', err);
      res.status(500).json({ error: 'Internal server error while retrieving position.' });
    }
  });

  // Cancel Position API: Cancel position by token (marks as cancelled, does NOT delete)
  app.post('/api/waitlist/cancel', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token || typeof token !== 'string' || !token.trim()) {
        return res.status(400).json({ error: 'Please provide your HX access token to cancel.' });
      }

      const updated = await cancelCandidatePosition(token.trim());
      if (!updated) {
        return res.status(404).json({
          error: 'Invalid or unknown access token. Unable to cancel position.',
        });
      }

      res.json({
        success: true,
        message: 'Your waitlist position has been cancelled.',
        data: updated,
      });
    } catch (err) {
      console.error('Failed to cancel position:', err);
      res.status(500).json({ error: 'Internal server error while cancelling position.' });
    }
  });

  // Direct Lookup API: Candidate page looks up candidate and returns their HX001-style ID
  app.get('/api/waitlist/candidate', async (req, res) => {
    try {
      const email = req.query.email as string;
      const candidateId = req.query.candidateId as string;

      if (!email && !candidateId) {
        return res.status(400).json({ error: 'Provide either email or candidateId query parameter.' });
      }

      let candidate = null;
      if (email) {
        candidate = await findCandidateByEmail(email);
      }

      if (!candidate && candidateId) {
        const roster = await getPublicRoster();
        const found = roster.find((r) => r.id.toLowerCase() === candidateId.trim().toLowerCase());
        if (found) {
          return res.json({
            success: true,
            candidate: {
              candidateId: found.id,
              status: found.status,
              joinedDate: found.joinedDate,
            },
          });
        }
      }

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found.' });
      }

      res.json({
        success: true,
        candidate: {
          candidateId: candidate.candidateId || candidate.id,
          email: candidate.email,
          joinedAt: candidate.joinedAt,
          joinedDate: formatJoinedDate(candidate.joinedAt),
          status: candidate.status,
        },
      });
    } catch (err) {
      console.error('Failed to lookup candidate:', err);
      res.status(500).json({ error: 'Internal server error during candidate lookup.' });
    }
  });

  // API 1: Live dynamic count of active people who have joined
  app.get('/api/waitlist/count', async (req, res) => {
    try {
      const count = await getWaitlistCount();
      res.json({ count });
    } catch (err) {
      console.error('Failed to get count:', err);
      res.status(500).json({ error: 'Failed to fetch waitlist count' });
    }
  });

  // API 1.5: List of candidates who joined with their special codes
  app.get('/api/waitlist/roster', async (req, res) => {
    try {
      const [roster, count] = await Promise.all([getPublicRoster(), getWaitlistCount()]);
      res.json({ roster, count });
    } catch (err) {
      console.error('Failed to get roster:', err);
      res.status(500).json({ error: 'Failed to fetch roster' });
    }
  });

  // API 2: Join waitlist & generate passwordless token
  app.post('/api/waitlist/join', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      const { candidate, token, isNew } = await registerOrGetCandidateWithToken(email);

      res.json({
        success: true,
        isNew,
        token, // Passwordless secure access token
        candidate: {
          candidateId: candidate.candidateId || candidate.id,
          email: candidate.email,
          joinedAt: candidate.joinedAt,
          joinedDate: formatJoinedDate(candidate.joinedAt),
          status: candidate.status || 'ACTIVE',
        },
        message: 'Successfully joined waitlist.',
      });
    } catch (err) {
      console.error('Failed to join waitlist:', err);
      res.status(500).json({ error: 'Internal server error while joining waitlist.' });
    }
  });

  // API 3: Verify email code fallback
  app.post('/api/waitlist/verify', async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: 'Email and verification code are required.' });
      }

      const result = await verifyCandidateCode(email, code);
      if (!result.success || !result.candidate) {
        return res.status(400).json({ error: result.error || 'Invalid verification code.' });
      }

      const candidate = result.candidate;

      res.json({
        success: true,
        token: result.token,
        candidate: {
          id: candidate.id,
          candidateId: candidate.candidateId || candidate.id,
          status: candidate.status,
          joinedDate: formatJoinedDate(candidate.joinedAt),
          email: candidate.email,
        },
      });
    } catch (err) {
      console.error('Failed to verify code:', err);
      res.status(500).json({ error: 'Internal server error during verification.' });
    }
  });

  // Vite integration:
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HX Engineering server running on port ${PORT}`);
  });
}

startServer();
