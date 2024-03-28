------------------------
-- BEHAVIORAL SETTINGS -
------------------------

vim.opt.encoding = 'utf-8'

vim.opt.guicursor = ''

vim.opt.nu = true
vim.opt.relativenumber = true

vim.opt.tabstop = 2
vim.opt.softtabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true

vim.opt.smartindent = true

vim.opt.wrap = true
vim.opt.textwidth = 80

vim.opt.swapfile = false
vim.opt.backup = false
vim.opt.undodir = os.getenv('HOME') .. '/.config/nvim/undodir'
vim.opt.undofile = true

vim.opt.incsearch = true

vim.opt.scrolloff = 8
vim.opt.signcolumn = 'yes'
vim.opt.isfname:append('@-@')

vim.opt.updatetime = 50

vim.opt.colorcolumn = '80'

vim.opt.syntax = 'on'

-- Leave most folds open by default.
vim.opt.foldlevel = 99
vim.opt.foldmethod = 'indent'

vim.opt.list = true
vim.opt.listchars:append({
  eol = '¬',
  trail = '·',
  tab = '| ',
})

-- Show matching brackets.
vim.o.showmatch = true
-- Do smart case matching
vim.o.smartcase = true
-- Allow resizing of the window on session restore
vim.opt.sessionoptions:append({ 'resize' })
-- Hide buffers when they are not displayed; this prevents warning messages
-- about modified buffers when switching between them.
vim.o.hidden = true
-- Set the spelling language to US English.
vim.o.spelllang = 'en_us'
-- Highlight the line on which the cursor lies
vim.o.cursorline = true
-- Don't show insert mode; taken care of by lualine
vim.o.showmode = false

-- Enable concealing, for example, rendering bold text in Markdown but hiding
-- the asterisks
vim.o.conceallevel = 2

-- Set completion options
vim.opt.completeopt = { 'menuone', 'noselect' }
