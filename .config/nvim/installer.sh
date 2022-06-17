if [ $# -ne 1 ]; then
  echo "You must specify the installation directory!"
  exit 1
fi

case $1 in
  /*) PLUGIN_DIR=$1;;
  *) PLUGIN_DIR=$PWD/$1;;
esac

# check git command
if type git; then
  : # You have git command. No Problem.
else
  echo 'Please install git or update your path to include the git executable!'
  exit 1
fi

mkdir -p ${PLUGIN_DIR}/autoload ${PLUGIN_DIR}/bundle && \
curl -LSso ${PLUGIN_DIR}/autoload/pathogen.vim https://tpo.pe/pathogen.vim

## Install plugins
## coc is for auto-complete
git clone https://github.com/neoclide/coc.nvim \
  ${PLUGIN_DIR}/bundle/coc.nvim

## ctrlp is a fuzzy finder. Maybe move to telescope?
git clone https://github.com/ctrlpvim/ctrlp.vim.git \
  ${PLUGIN_DIR}/bundle/ctrlp.vim

## The following are for lsp
git clone https://github.com/rust-lang/rust.vim.git \
  ${PLUGIN_DIR}/bundle/rust.vim

git clone https://github.com/leafgarland/typescript-vim \
  ${PLUGIN_DIR}/bundle/typescript-vim

git clone https://github.com/pangloss/vim-javascript.git \
  ${PLUGIN_DIR}/bundle/vim-javascript

git clone https://github.com/MaxMEllon/vim-jsx-pretty \
  ${PLUGIN_DIR}/bundle/vim-jsx-pretty

git clone https://github.com/peitalin/vim-jsx-typescript \
  ${PLUGIN_DIR}/bundle/vim-jsx-typescript

git clone https://github.com/fannheyward/coc-styled-components \
  ${PLUGIN_DIR}/bundle/coc-styled-components
