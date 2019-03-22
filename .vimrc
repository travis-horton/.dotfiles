syntax enable    "enable means it won't override other highlighting (supposedly)
filetype plugin indent on   "uses file extension to determine indentation
colorscheme evening

set ai   "autoindent: required for smartindent
set directory=~/.vim/swp   "puts all swp files in this ~/.vim/swp instead of local
set et   "expandtab: makes the tab key insert spaces instead of tabs
set foldlevel=1   "auto-folds everything more than one indent
set foldmethod=indent   "fold uses indents
set number   "show line numbers
set ruler   "show cursoer position [row, col] in bottom right
set sw=2   "shiftwidth: how many spaces tabs equal
set si   "smartindent: indents based on syntax, requires autoindent
set smarttab   "makes tab use shiftwidth instead of tabstop or softtabstop
set sts=2   "set softtabstop to 2
set ts=2   "set tabstop to 2

"sets jk to esc 
imap jk <Esc>
