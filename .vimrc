syntax enable    "enable means it won't override other highlighting (supposedly)
filetype plugin indent on   "uses file extension to determine indentation
colorscheme desert

set ai   "autoindent: required for smartindent
set directory=~/.vim/swp   "puts all swp files in this ~/.vim/swp instead of local
set et   "expandtab: makes the tab key insert spaces instead of tabs
set foldlevel=1   "auto-folds everything more than one indent
set foldmethod=indent   "fold uses indents
set incsearch   "searchs as you type
set hidden   "keeps vim from warnings on new buffer
set hlsearch   "highlights all finds
set nocompatible   "takes out archaic vim
set number   "show line numbers
set ruler   "show cursoer position [row, col] in bottom right
set sw=2   "shiftwidth: how many spaces tabs equal
set si   "smartindent: indents based on syntax, requires autoindent
set smarttab   "makes tab use shiftwidth instead of tabstop or softtabstop
set sts=2   "set softtabstop to 2
set ts=2   "set tabstop to 2

"sets jk to esc 
imap jk <Esc>
"sets control N to bnext
nnoremap <C-n> :bnext<CR>
"sets control R to bprev
nnoremap <C-p> :bprev<CR>

set laststatus=2   "always show statusbar
"resets status line
set statusline=
set statusline+=%f\   "filename
set statusline+=%-10.3n\   "buffer number
set statusline+=%h%m%r%w   "status flags
set statusline+=\[%{strlen(&ft)?&ft:'none'}]   "file type
set statusline+=%=   "right align remainder
set statusline+=0x%-8B   "character value
set statusline+=%-14(%l,%c%V%)   "line, character
set statusline+=%<%P   "file position
