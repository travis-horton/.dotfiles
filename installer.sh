echo '\n\n------------------------------'
echo '------- SETUP SCRIPT ---------'
echo '------------------------------\n'

echo '------------------------------'
echo '------- INSTALL XCODE --------'
echo '------------------------------\n'
xcode-select --install

echo '---------------------------------'
echo '------- INSTALL HOMEBREW --------'
echo '---------------------------------\n'
/bin/bash -c "$(curl -fsSL \
  https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo '-----------------------------------------'
echo '------- SYMLINK ZSH CONFIG STUFF --------'
echo '-----------------------------------------\n'
ln -vsf ${HOME}/.dotfiles/.zprofile ${HOME}/.zprofile
ln -vsf ${HOME}/.dotfiles/.zshenv ${HOME}/.zshenv
ln -vsf ${HOME}/.dotfiles/.zshrc ${HOME}/.zshrc

echo '------------------------------------------------'
echo '------- INSTALL BREW PACKAGES FROM LIST --------'
echo '------------------------------------------------\n'
xargs brew install < ${HOME}/.dotfiles/brew_packages_to_install.txt

echo '--------------------------------------'
echo '------- UPDATE ALL THE THINGS --------'
echo '--------------------------------------\n'
brew upgrade

echo '-----------------------------'
echo '------- INSTALL YARN --------'
echo '-----------------------------\n'
npm install --global yarn

# check git command
if type git; then
  : # You have git command. No Problem.
else
  echo 'Please install git or update your path to include the git executable!'
  exit 1
fi

echo '------------------------------'
echo '------- RUN VIM SETUP --------'
echo '------------------------------\n'
/bin/bash ${HOME}/.dotfiles/nvim_setup.sh
