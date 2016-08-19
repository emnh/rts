#for fname in resources/public/models/3d/*.json; do
#  out=$(echo $fname | sed -n s@/3d/@/voxels/@p | sed -n s@\.json@.msgpack@p)
#  echo "processing $fname to $out"
#  node --stack_size=10000 js/voxelize.js $fname $out
#done
#node --stack_size=10000 --max-old-space-size=8192 js/voxelize.js
node --stack_size=10000 js/voxelize.js $1
