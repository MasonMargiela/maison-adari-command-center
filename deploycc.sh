#!/usr/bin/env bash
set -euo pipefail
cd /Users/user/maison-adari-command-center
git diff --quiet
git diff --cached --quiet
git fetch origin
git rebase origin/main
npm run build
git push origin main
COMMIT_SHA="$(git rev-parse HEAD)"
DEPLOY_RAW="$(vercel deploy --prod --yes)"
DEPLOY_URL="$(printf "%s\n" "$DEPLOY_RAW" | grep -Eo 'https://[^ ]+\.vercel\.app' | tail -n 1)"
echo "Deploy URL: $DEPLOY_URL"
test -n "$DEPLOY_URL"
vercel inspect "$DEPLOY_URL" --json > /tmp/vercel-inspect.json
COMMIT_SHA="$COMMIT_SHA" node -e 'const fs=require("fs");const local=process.env.COMMIT_SHA||"";const d=JSON.parse(fs.readFileSync("/tmp/vercel-inspect.json","utf8"));const m=d.meta||{};const deployed=m.githubCommitSha||m.gitCommitSha||m.GITHUB_SHA||m.COMMIT_SHA||"";console.log("Deployed commit:",deployed||"NOT_FOUND");console.log("Local commit   :",local);if(deployed&&deployed!==local){console.error("COMMIT_MISMATCH");process.exit(1)}console.log("OK");'
echo "Live URL: https://project-3tj6u.vercel.app"
