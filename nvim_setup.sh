echo '\n\n----------------------------'
echo '------- NVIM SETUP ---------'
echo '----------------------------'

echo '-------------------------------------------------------'
echo '------- MAKE NVIM DIR IN ${HOME}/.CONFIG/NVIM ---------'
echo '-------------------------------------------------------\n'
mkdir -p ${HOME}/.config/nvim;
echo '--------------------------------------------------------------'
echo '------- SYMLINK CONFIG INIT.VIM TO DOTFILES INIT.VIM ---------'
echo '--------------------------------------------------------------\n'
ln -vsf ${HOME}/.dotfiles/.config/nvim/init.vim ${HOME}/.config/nvim/init.vim;
echo '----------------------------------------------------------------------'
echo '------- SYMLINK CONFIG COC-SETTINGS TO DOTFILES COC-SETTINGS ---------'
echo '----------------------------------------------------------------------\n'
ln -vsf ${HOME}/.dotfiles/.config/nvim/coc-settings.json \
  ${HOME}/.config/nvim/coc-settings.json;

PLUGIN_DIR=${HOME}/.config/nvim;

echo '-----------------------------------------------------------'
echo '------- CREATE AUTOLOAD AND BUNDLE IN CONFIG NVIM ---------'
echo '--------------- AND THEN INSTALL PATHOGEN -----------------'
echo '-----------------------------------------------------------'
mkdir -p ${PLUGIN_DIR}/autoload ${PLUGIN_DIR}/bundle && \
curl -LSso ${PLUGIN_DIR}/autoload/pathogen.vim https://tpo.pe/pathogen.vim;

echo '---------------------------------'
echo '------- INSTALL PLUGINS ---------'
echo '---------------------------------\n'
echo '-----------------------------------------------'
echo '------- INSTALL COC FOR AUTO-COMPLETE ---------'
echo '-----------------------------------------------\n'
git clone https://github.com/neoclide/coc.nvim \
  ${PLUGIN_DIR}/bundle/coc.nvim;

echo '-------------------------------'
echo '------- SETUP FOR COC ---------'
echo '-------------------------------\n'
cd ${PLUGIN_DIR}/bundle/coc.nvim;
git pull;
yarn install;
cd ~;

## telescope is a fuzzy finder
echo '-----------------------------------'
echo '------- INSTALL TELESCOPE ---------'
echo '-----------------------------------\n'
git clone https://github.com/nvim-telescope/telescope.nvim \
  ${PLUGIN_DIR}/bundle/telescope.nvim;
echo '----------------------------------'
echo '------- UPDATE TELESCOPE ---------'
echo '----------------------------------\n'
cd ${PLUGIN_DIR}/bundle/telescope.nvim;
git pull;
cd ~;

## The following are requirements for telescope:
echo '------------------------------------------------'
echo '------- INSTALL TELESCOPE REQUIREMENTS ---------'
echo '------------------------------------------------\n'
git clone https://github.com/nvim-lua/plenary.nvim \
  ${PLUGIN_DIR}/bundle/plenary;
git clone https://github.com/nvim-treesitter/nvim-treesitter
  ${PLUGIN_DIR}/bundle/nvim-treesitter;

## fugitive is for git commands in vim
echo '----------------------------------'
echo '------- INSTALL FUGITIVE ---------'
echo '----------------------------------\n'
git clone https://github.com/tpope/vim-fugitive \
  ${PLUGIN_DIR}/bundle/vim-fugitive;
## update
echo '---------------------------------'
echo '------- UPDATE FUGITIVE ---------'
echo '---------------------------------\n'
cd ${PLUGIN_DIR}/bundle/vim-fugitive;
git pull;
cd ~;

## undo tree is the bomb
echo '-----------------------------------'
echo '------- INSTALL UNDO TREE ---------'
echo '-----------------------------------\n'
git clone https://github.com/mbbill/undotree ${PLUGIN_DIR}/bundle/undotree;
## update
echo '----------------------------------'
echo '------- UPDATE UNDO TREE ---------'
echo '----------------------------------'
cd ${PLUGIN_DIR}/bundle/undotree;
git pull;
cd ~;

## The following are for coc autocomplete
echo '---------------------------------------------------'
echo '------- INSTALL DEPS FOR COC AUTOCOMPLETE ---------'
echo '---------------------------------------------------\n'
echo '------- RUST -------'
git clone https://github.com/rust-lang/rust.vim.git \
  ${PLUGIN_DIR}/bundle/rust.vim;
## update
echo '------- UPDATE ---------'
cd ${PLUGIN_DIR}/bundle/rust.vim;
git pull;
cd ~;

echo '------- TYPESCRIPT ---------'
git clone https://github.com/leafgarland/typescript-vim \
  ${PLUGIN_DIR}/bundle/typescript-vim;
## update
echo '------- UPDATE ---------'
cd ${PLUGIN_DIR}/bundle/typescript-vim;
git pull;
cd ~;

echo '------- JAVASCRIPT ---------'
git clone https://github.com/pangloss/vim-javascript.git \
  ${PLUGIN_DIR}/bundle/vim-javascript;
## update
echo '------- UPDATE ---------'
cd ${PLUGIN_DIR}/bundle/vim-javascript;
git pull;
cd ~;

yarn global add neovim;

echo '------- JSX ---------'
git clone https://github.com/MaxMEllon/vim-jsx-pretty \
  ${PLUGIN_DIR}/bundle/vim-jsx-pretty;
## update
echo '------- UPDATE ---------'
cd ${PLUGIN_DIR}/bundle/vim-jsx-pretty;
git pull;
cd ~;

echo '------- JSX TYPESCRIPT ---------'
git clone https://github.com/peitalin/vim-jsx-typescript \
  ${PLUGIN_DIR}/bundle/vim-jsx-typescript;
## update
echo '------- UPDATE ---------'
cd ${PLUGIN_DIR}/bundle/vim-jsx-typescript;
git pull;
cd ~;

echo '--------------------------------------------------------------------'
echo '--------------- INSTALL OTHER COC DEPS WITHIN NVIM -----------------'
echo '---------- AND INSTALL HELP TAGS FOR ALL VIM EXTENSIONS ------------'
echo 'this might take a minute and there is no status update... be patient'
echo '--------------------------------------------------------------------'
sleep 3

nvim -c "CocInstall -sync coc-html \
  | CocInstall -sync coc-tsserver \
  | CocInstall -sync coc-rust-analyzer \
  | CocInstall -sync coc-pyright \
  | CocInstall -sync coc-json \
  | CocInstall -sync coc-html \
  | CocUpdateSync \
  | helptags ALL \
  | q
";
