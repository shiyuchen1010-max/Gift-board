import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

function localSyncPlugin() {
  return {
    name: 'local-workspace-sync',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/save-workspace' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk.toString() });
          req.on('end', () => {
            try {
              const { manualReviews, gifts } = JSON.parse(body);
              const webRoot = process.cwd();
              const projectRoot = path.resolve(webRoot, '..');

              const REVIEW_TARGETS = [
                ['gift_analysis_config', 'manual_badge_reviews.json'],
                ['gift_analysis_web', 'public', 'data', 'manual_badge_reviews.json'],
                ['docs', 'data', 'manual_badge_reviews.json'],
              ];
              const GIFT_TARGETS = [
                ['gift_analysis_web', 'public', 'data', 'gifts.json'],
                ['docs', 'data', 'gifts.json'],
              ];
              const REPORT_TARGETS = [
                ['gift_analysis_web', 'public', 'data', 'badge_recognition_report.json'],
                ['docs', 'data', 'badge_recognition_report.json'],
              ];
              const BINDINGS_TARGET = ['gift_analysis_config', 'gift_badge_bindings.json'];

              const readJson = (target: string[]) => {
                const fullPath = path.join(projectRoot, ...target);
                try {
                  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                } catch {
                  return null;
                }
              };

              const writeJson = (target: string[], data: any) => {
                const fullPath = path.join(projectRoot, ...target);
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n');
                return target.join('/');
              };

              // Import our patching logic from the ts file.
              // Wait, we can't easily import TS files here because vite config runs in Node.
              // But we can reproduce the simplified logic for report patching!
              const pendingReviewCount = manualReviews.filter((item: any) => item.reviewStatus === 'pending').length;
              const reviewedCount = manualReviews.length - pendingReviewCount;
              
              const buildNextReport = (existing: any) => ({
                ...existing,
                giftCount: gifts.length,
                reviewQueueCount: manualReviews.length,
                pendingReviewCount,
                reviewedCount,
                lowConfidence: manualReviews.filter((item: any) => item.predictedHasBadge && item.predictedConfidence < 0.6),
              });

              const buildNextBindings = (existing: any[]) => {
                const reviewMap = new Map(manualReviews.map((item: any) => [item.giftId, item]));
                return existing.map(binding => {
                  const review = reviewMap.get(binding.giftId);
                  if (!review) return binding;
                  return {
                    ...binding,
                    badgeType: review.finalBadgeType,
                    hasBadge: review.finalHasBadge,
                    confidence: review.reviewStatus === 'pending' ? review.predictedConfidence : 1.0,
                    source: review.reviewStatus === 'confirmed' ? 'manual-confirmed' : review.reviewStatus === 'corrected' ? 'manual-corrected' : review.predictedSource,
                    bbox: review.bbox,
                    bestScore: review.bestScore,
                    reviewRequired: true,
                    reviewStatus: review.reviewStatus,
                  };
                });
              };

              const writtenFiles: string[] = [];

              for (const target of REVIEW_TARGETS) {
                writtenFiles.push(writeJson(target, manualReviews));
              }

              for (const target of GIFT_TARGETS) {
                writtenFiles.push(writeJson(target, gifts));
              }

              const existingBindings = readJson(BINDINGS_TARGET);
              if (existingBindings) {
                writtenFiles.push(writeJson(BINDINGS_TARGET, buildNextBindings(existingBindings)));
              }

              const publicReport = readJson(REPORT_TARGETS[0]);
              writtenFiles.push(writeJson(REPORT_TARGETS[0], buildNextReport(publicReport || {})));
              
              const docsReport = readJson(REPORT_TARGETS[1]);
              writtenFiles.push(writeJson(REPORT_TARGETS[1], buildNextReport(docsReport || {})));

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ writtenFiles }));
            } catch (error: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: error.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Gift-board/' : '/',
  plugins: [react(), localSyncPlugin()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
}));

