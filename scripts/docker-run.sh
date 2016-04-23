NAME=rts
sudo docker rm $NAME
sudo docker run \
  --name $NAME \
  -v /home/emh/.rts:/home/nodeuser/.rts:ro \
  --net=rts \
  -it \
  emnh/nodejs-rts
