syntax enable             "enable means it won't override other highlighting (supposedly)
filetype plugin indent on "uses file extension to determine indentation
filetype plugin on
colorscheme zellner

set ai                    "autoindent: required for smartindent
set directory=~/.vim/swp  "puts all swp files in this ~/.vim/swp instead of local
set et                    "expandtab: makes the tab key insert spaces instead of tabs
set foldlevel=2           "auto-folds everything more than two indents
set foldmethod=indent     "fold uses indents
set incsearch             "searches as you type
set hidden                "keeps vim from warnings on new buffer
set hlsearch              "highlights all finds
set laststatus=2          "always show statusbar
set nocompatible          "takes out archaic vim
set rnu                   "show hybrid line numbers (200219 took out 'hybrid' part (relativenumber)
set path+=**              "allows recursive subdirectory searches
set ruler                 "show cursor position [row, col] in bottom right
set sw=2                  "shiftwidth: how many spaces tabs equal
set si                    "smartindent: indents based on syntax, requires autoindent
set smarttab              "makes tab use shiftwidth instead of tabstop or softtabstop
set sts=2                 "set softtabstop to 2
set tags=tags             "sets tags file
set ts=2                  "set tabstop to 2
set tw=100                "set text width to wrap at 100 chars
set wildmenu              "shows menu on tab completion

let mapleader=" "         "assign leader key

"sets <leader> h to noh
map <leader>h :noh<CR>
"sets <leader> i to make js for loop
map <leader>i :norm ifor (let i = 0; i < .length; i++) { }<CR>
"set <leader RETURN to wq!>
map <leader><CR> :wq!<CR>
"sets jk to esc 
imap jk <Esc>
"sets control N to bnext
nnoremap <C-n> :bnext<CR>
"sets control R to bprev
nnoremap <C-p> :bprev<CR>
"sets control N to toggle rnu
nnoremap <C-u> :set rnu!<CR>

"resets status line
set statusline=
"show path
set statusline+=Cur\ Dir:\ %{getcwd()}\ 
set statusline+=\|\ Path:\ %r%f\  
set statusline+=\|\ Buf:\ %.3n\                 "buffer number
set statusline+=\|\ Flags:\ %h%m%r%w            "status flags
set statusline+=%=                              "right align remainder
set statusline+=\|\ Char:\ 0x%B\                "character value
set statusline+=\|\ Pos:\ %(%l,%c%V%)\          "line, character
set statusline+=\|\ File\ Pos:\ %<%P\           "file position
set statusline+=\|\ %{strftime('%y%m%d.%Hh%M')} "show time
