xcode-select --install

/bin/bash -c "$(curl -fsSL \
  https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

ln -vsf ${HOME}/.dotfiles/.zprofile ${HOME}/.zprofile
ln -vsf ${HOME}/.dotfiles/.zshenv ${HOME}/.zshenv
ln -vsf ${HOME}/.dotfiles/.zshrc ${HOME}/.zshrc

xargs brew install < ${HOME}/.dotfiles/brew_packages_to_install.txt

brew upgrade

npm install --global yarn

# check git command
if type git; then
  : # You have git command. No Problem.
else
  echo 'Please install git or update your path to include the git executable!'
  exit 1
fi

/bin/bash ${HOME}/.dotfiles/nvim_setup.sh
