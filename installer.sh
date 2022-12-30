# Print a full horizontal line of dashes
printf '\n\n%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' -;
echo "------------------------------";
echo "------- SETUP SCRIPT ---------";
echo "------------------------------";

echo "------------------------------";
echo "------- INSTALL XCODE --------";
echo "------------------------------";
set -x;
xcode-select --install;
set +x;

echo "\n---------------------------------";
echo "------- INSTALL HOMEBREW --------";
echo "---------------------------------";
# I don't need to set -x here because homebrew install has good status updates
/bin/bash -c "$(curl -fsSL \
  https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)";

echo "\n-----------------------------------------";
echo "------- SYMLINK ZSH CONFIG STUFF --------";
echo "-----------------------------------------";
set -x;
ln -vsf ${HOME}/.dotfiles/.zprofile ${HOME}/.zprofile;
ln -vsf ${HOME}/.dotfiles/.zshenv ${HOME}/.zshenv;
ln -vsf ${HOME}/.dotfiles/.zshrc ${HOME}/.zshrc;
set +x;

echo "\n------------------------------------------------";
echo "------- INSTALL BREW PACKAGES FROM LIST:";
cat ${HOME}/.dotfiles/brew_packages_to_install.txt;
echo "------------------------------------------------";
set -x;
xargs brew install < ${HOME}/.dotfiles/brew_packages_to_install.txt;
set +x;

echo "\n---------------------------------------------------------";
echo "------- UPDATE ALL THE THINGS (run brew upgrade) --------";
echo "---------------------------------------------------------";
set -x;
brew upgrade;
set +x;

echo "\n-----------------------------";
echo "------- INSTALL YARN --------";
echo "-----------------------------";
set -x;
npm install --global yarn;
set +x;

# check git command
if type git; then
  : # You have git command. No Problem.
else
  echo "Please install git or update your path to include the git executable!";
  exit 1;
fi

echo "\n------------------------------";
echo "------- RUN VIM SETUP --------";
echo "------------------------------\n";
/bin/zsh ${HOME}/.dotfiles/nvim_setup.sh;
