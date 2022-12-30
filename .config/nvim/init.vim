syntax on
filetype plugin indent on   "uses file extension to determine indentation

set encoding=utf-8

set foldlevel=99
set foldmethod=indent

set colorcolumn=80
set backspace=indent,eol,start
set incsearch
set hlsearch
set scrolloff=8

set list
set listchars=tab:\|\ ,trail:▫

set relativenumber
set number
set ruler

set viminfo=""
set noswapfile
set undodir=$HOME/.config/nvim/undo
set undofile

set path+=**

set splitright
set hidden      " this needs to be set for coc

set expandtab
set shiftwidth=2
set tabstop=2
set textwidth=80

set laststatus=2
set wildmenu

colorscheme PaperColor

" Set textwidth to 99 and colorcolumn to 100 for rust files
autocmd FileType rust setlocal colorcolumn=100
autocmd FileType rust setlocal textwidth=99

" Large js files syntax highlighting can get out of sync. This forces rescan of
" the entire buffer when highlighting. (In vanilla vim that would be a
" problem, but because of nvim's async, it's fine.)
autocmd BufEnter *.{js,jsx,ts,tsx} :syntax sync fromstart
autocmd BufLeave *.{js,jsx,ts,tsx} :syntax sync clear

let g:markdown_folding=1    " this is for folding in markdown
autocmd BufRead,BufNewFile *.py let python_highlight_all=1

" Keep nvim `:checkhealth` from complaining about ruby or perl
let g:loaded_ruby_provider = 0
let g:loaded_perl_provider = 0

" --------------------------------------------------------
"  STATUS LINE CONFIGURATION START
set statusline=                                         "resets status line
set statusline+=%{substitute(getcwd(),$HOME,'~','')}    "show curr dir
set statusline+=\/%r%f\                                 "show current file
set statusline+=\|\ Flags:\ %h%m%r%w                    "status flags
set statusline+=%=                                      "right align remainder
set statusline+=%(%l,%c%V%)\                            "line, char
set statusline+=\|\ %{strftime('%y%m%d.%Hh%M')}         "show time
"  STATUS LINE CONFIGURATION END
" --------------------------------------------------------

" --------------------------------------------------------
"  MAPPINGS START

"assign leader key
let mapleader=" "

map <leader><CR> :wq!<CR>
imap jk <Esc>
map <leader>h :nohl<CR>

" moving between buffers:
nnoremap <C-n> :bnext<CR>
nnoremap <C-p> :bprev<CR>

" moving around splits:
map <C-j> <C-W>j
map <C-k> <C-W>k
map <C-h> <C-W>h
map <C-l> <C-W>l

" use ctrlp for Telescope
map <C-p> :Telescope<CR>

" leader u for undo tree
map <leader>u :UndotreeToggle<CR>

"  MAPPINGS END
" --------------------------------------------------------

" --------------------------------------------------------
" coc-vim SETTINGS START

" Some servers have issues with backup files, see #649.
set nobackup
set nowritebackup

" Give more space for displaying messages.
set cmdheight=2

" Having longer updatetime (default is 4000 ms = 4 s) leads to noticeable
" delays and poor user experience.
set updatetime=300

" COC-VIM TAB AUTOCOMPLETE CONTROLS (FOR REFERENCE):
" <c-n> to go down in list
" <c-p> to go up in list
" <c-y> to select

" GoTo code navigation. (COC-VIM settings)
nmap <silent> gd :vsplit<CR><Plug>(coc-definition)
nmap <silent> gy :vsplit<CR><Plug>(coc-type-definition)
nmap <silent> gi :vsplit<CR><Plug>(coc-implementation)
nmap <silent> gr :vsplit<CR><Plug>(coc-references)

" Install the following coc extensions
let g:coc_global_extensions = [
  \ 'coc-html',
  \ 'coc-tsserver',
  \ 'coc-rust-analyzer',
  \ 'coc-pyright',
  \ 'coc-json',
  \ 'coc-html',
\]

" coc-vim SETTINGS END
" --------------------------------------------------------

"pathogen + nvim knows to look in ~/.config/nvim/bundle.
execute pathogen#infect()
