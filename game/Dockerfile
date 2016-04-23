FROM node:latest
MAINTAINER Eivind Magnus Hvidevold "hvidevold@gmail.com"

# Don't install app dependencies: Do it on host instead.
# COPY package.json /usr/src/app/
# RUN npm install

# Add user
RUN groupadd nodeuser
RUN useradd -m -d /home/nodeuser -g nodeuser -s /bin/bash nodeuser

# Bundle app source
COPY . /home/nodeuser/app
RUN chown nodeuser:nodeuser /home/nodeuser/app

EXPOSE 3551
USER nodeuser
WORKDIR /home/nodeuser/app
CMD [ "npm", "start" ]
