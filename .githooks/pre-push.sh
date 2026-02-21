#!/usr/bin/env bash

set -Eeuo pipefail

[ "${SKIP_HOOKS:-0}" = "1" ] && exit 0

readonly REPO_ROOT=$(git rev-parse --show-toplevel)

cd "$REPO_ROOT"

main() {
  _run_check "format" npm run format:check
  _run_check "lint" npm run lint
  _run_check "typecheck" npm run typecheck
  _run_check "test" npm run test

  echo "All pre-push checks passed."
}

_run_check() {
  local checkName="$1"
  shift
  echo "==> $checkName"
  "$@"
  echo ""
}

main "$@"
