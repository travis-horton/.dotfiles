#!/bin/sh

read -p "This setup installs the following config files:
bashrc, bash_profile, vimrc, gitconfig, npmrc, and a vim/swp directory within $HOME
all removed first if present and replaced with symlinks to the files/directory in .dotfiles.

Then, if this is th user, blog, and pushblog scripts are installed in $HOME/.bin/

Are you sure? " -n 1 -r

echo    # (optional) move to a new line

if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "\nRemoved:"

  # create .vim/swp/ (-p makes parent dirs if necessary)
  rm -rv $HOME/vim/
  rm -rv $HOME/.vim/
  mkdir -p $HOME/.vim/swp

  # removes all previously existing config/profile files that will be created
  rm -v $HOME/.bashrc $HOME/.bash_profile
  rm -v $HOME/.vimrc $HOME/.gitconfig $HOME/.npmrc $HOME/.bin
  rm -v $HOME/.zshenv $HOME/.zshrc
  rm -rv $HOME/.bin

  # creates symlinks to .dotfile files
  ln -sf "$HOME/.dotfiles/.zshenv" $HOME/.zshenv
  ln -sf "$HOME/.dotfiles/.zshrc" $HOME/.zshrc 
  ln -sf "$HOME/.dotfiles/.vimrc" $HOME/.vimrc
  ln -sf "$HOME/.dotfiles/.gitconfig" $HOME/.gitconfig
  ln -sf "$HOME/.dotfiles/.npmrc" $HOME/.npmrc

  # if using my user, creates two blog commands
  if [[ $USER == "th" ]]
  then 
    ln -sf "$HOME/.dotfiles/.bin" $HOME/
  fi
fi
