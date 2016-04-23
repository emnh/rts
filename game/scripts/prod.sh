#!/bin/bash
lein cljsbuild once prod
#lein cljsbuild once prod-client
./scripts/docker-build.sh
./scripts/docker-run.sh
