#!/bin/sh
RUSER=sipp11
RHOST=mango-its
PORT=22
RPATH=/opt/www/nstda
LPATH=./
rsync -avu -e "ssh -p $PORT" $LPATH $RUSER@$RHOST:$RPATH \
--exclude=node_modules --exclude=.git \
--exclude=*.sh --exclude=.DS_Store
