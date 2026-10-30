#!/bin/bash
# Copy the app's Convex functions next to the stand-in _generated files so convex-test can load them
set -e
cd "$(dirname "$0")"
mkdir -p convex/lib
cp ../app/convex/accounts.ts ../app/convex/classes.ts ../app/convex/learning.ts ../app/convex/admin.ts ../app/convex/ratings.ts ../app/convex/parents.ts ../app/convex/schema.ts convex/
cp ../app/convex/lib/security.ts convex/lib/
