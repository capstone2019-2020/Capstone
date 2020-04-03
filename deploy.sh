#!/bin/bash

ssh -i ~/OneDrive/Desktop/Development/ssh-keys/ece496-45.pem ubuntu@ec2-3-86-32-191.compute-1.amazonaws.com

cd Capstone
sudo apt-get update
sudo apt-get install npm

npm install
sudo npm install -g nodemon

sudo npm start &
