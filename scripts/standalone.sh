#!/bin/bash
PUBDIR=~/public_html/publish/voxel-explosions-rts-snapshot
mkdir -p $PUBDIR
cp -a resources/public/* $PUBDIR/
#lein cljsbuild once prod-client
cp -a out.prod.client/* $PUBDIR/
