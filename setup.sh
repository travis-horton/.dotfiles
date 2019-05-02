#!/bin/sh

pushd `dirname $0` > /dev/null
DIR=`pwd`
popd > /dev/null

ln -s "$DIR/.bashrc" ~/.bashrc 
ln -s "$DIR/.bash_profile" ~/.bash_profile
ln -s "$DIR/.vimrc" ~/.vimrc
ln -s "$DIR/.gitconfig" ~/.gitconfig
ln -s "$DIR/.npmrc" ~/.npmrc
