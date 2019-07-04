#!/bin/sh

#create .vim/swp/ (-p makes parent dirs if necessary)
mkdir -p $HOME/vim/swp

ln -sf "$HOME/.dotfiles/.bashrc" ~/.bashrc 
ln -sf "$HOME/.dotfiles/.bash_profile" ~/.bash_profile
ln -sf "$HOME/.dotfiles/.vimrc" ~/.vimrc
ln -sf "$HOME/.dotfiles/.gitconfig" ~/.gitconfig
ln -sf "$HOME/.dotfiles/.npmrc" ~/.npmrc
