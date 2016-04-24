NAME=rts
sudo docker stop $NAME
sudo docker rm $NAME
sudo docker run \
  --name $NAME \
  -v /home/emh/github/rts:/home/nodeuser/app \
  -v /home/emh/.rts:/home/nodeuser/.rts:ro \
  --net=rts \
  -d \
  emnh/nodejs-rts
