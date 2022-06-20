## nvim setup
mkdir -p ${HOME}/.config/nvim;
ln -vsf ${HOME}/.dotfiles/.config/nvim/init.vim ${HOME}/.config/nvim/init.vim
ln -vsf ${HOME}/.dotfiles/.config/nvim/coc-settings.json \
  ${HOME}/.config/nvim/coc-settings.json

PLUGIN_DIR=${HOME}/.config/nvim

mkdir -p ${PLUGIN_DIR}/autoload ${PLUGIN_DIR}/bundle && \
curl -LSso ${PLUGIN_DIR}/autoload/pathogen.vim https://tpo.pe/pathogen.vim

## Install plugins
## coc is for auto-complete
git clone https://github.com/neoclide/coc.nvim \
  ${PLUGIN_DIR}/bundle/coc.nvim

cd ${PLUGIN_DIR}/bundle/coc.nvim;
git pull
yarn install;
cd ~;

## This doesn't seem to work?
nvim -c "CocInstall coc-html \
  | CocInstall coc-tsserver \
  | CocInstall coc-rust-analyzer \
  | CocInstall coc-pyright \
  | CocInstall coc-json \
  | CocInstall coc-html \
  | q
"

## telescope is a fuzzy finder
git clone https://github.com/nvim-telescope/telescope.nvim \
  ${PLUGIN_DIR}/bundle/telescope.nvim
## update
cd ${PLUGIN_DIR}/bundle/telescope.nvim
git pull
cd ~

## The following are requirements for telescope:
git clone https://github.com/nvim-lua/plenary.nvim \
  ${PLUGIN_DIR}/bundle/plenary
git clone https://github.com/nvim-treesitter/nvim-treesitter
  ${PLUGIN_DIR}/bundle/nvim-treesitter

## fugitive is for git commands in vim
git clone https://github.com/tpope/vim-fugitive \
  ${PLUGIN_DIR}/bundle/vim-fugitive
## update
cd ${PLUGIN_DIR}/bundle/vim-fugitive
git pull
cd ~

## undo tree is the bomb
git clone https://github.com/mbbill/undotree
  ${PLUGIN_DIR}/bundle/undotree
## update
cd ${PLUGIN_DIR}/bundle/undotree
git pull
cd ~

## The following are for coc autocomplete
git clone https://github.com/rust-lang/rust.vim.git \
  ${PLUGIN_DIR}/bundle/rust.vim
## update
cd ${PLUGIN_DIR}/bundle/rust.vim
git pull
cd ~

git clone https://github.com/leafgarland/typescript-vim \
  ${PLUGIN_DIR}/bundle/typescript-vim
## update
cd ${PLUGIN_DIR}/bundle/typescript-vim
git pull
cd ~

git clone https://github.com/pangloss/vim-javascript.git \
  ${PLUGIN_DIR}/bundle/vim-javascript
## update
cd ${PLUGIN_DIR}/bundle/vim-javascript
git pull
cd ~
yarn global add neovim

git clone https://github.com/MaxMEllon/vim-jsx-pretty \
  ${PLUGIN_DIR}/bundle/vim-jsx-pretty
## update
cd ${PLUGIN_DIR}/bundle/vim-jsx-pretty
git pull
cd ~

git clone https://github.com/peitalin/vim-jsx-typescript \
  ${PLUGIN_DIR}/bundle/vim-jsx-typescript
## update
cd ${PLUGIN_DIR}/bundle/vim-jsx-typescript
git pull
cd ~

nvim -c "helptags ALL | q"
