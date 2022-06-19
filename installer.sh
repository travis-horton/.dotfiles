xcode-select --install

/bin/bash -c "$(curl -fsSL \
  https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

xargs brew install < ${HOME}/.dotfiles/brew_packages_to_install.txt

brew upgrade

# check git command
if type git; then
  : # You have git command. No Problem.
else
  echo 'Please install git or update your path to include the git executable!'
  exit 1
fi

/bin/bash ${HOME}/.dotfiles/nvim_setup.sh
