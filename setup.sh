#!/bin/sh

read -p "This setup installs the following config files:
bashrc, bash_profile, vimrc, gitconfig, npmrc, and a vim/swp directory within $HOME
all removed first if present and replaced with symlinks to the files/directory in .dotfiles.

Then bash scripts fullgit, and pushblog are installed in /usr/local/bin/

Are you sure? " -n 1 -r

echo    # (optional) move to a new line

if [[ $REPLY =~ ^[Yy]$ ]]
then
#create .vim/swp/ (-p makes parent dirs if necessary)
  rm -r $HOME/vim/
  rm -r $HOME/.vim/
  mkdir -p $HOME/.vim/swp

  rm $HOME/.bashrc $HOME/.bash_profile $HOME/.vimrc $HOME/.gitconfig $HOME/.npmrc
  ln -sf "$HOME/.dotfiles/.bashrc" ~/.bashrc 
  ln -sf "$HOME/.dotfiles/.bash_profile" ~/.bash_profile
  ln -sf "$HOME/.dotfiles/.vimrc" ~/.vimrc
  ln -sf "$HOME/.dotfiles/.gitconfig" ~/.gitconfig
  ln -sf "$HOME/.dotfiles/.npmrc" ~/.npmrc
  sudo ln -sf "$HOME/.dotfiles/fullgit" /usr/local/bin/
  sudo ln -sf "$HOME/.dotfiles/pushblog" /usr/local/bin/
fi
