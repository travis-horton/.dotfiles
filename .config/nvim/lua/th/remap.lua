-- file sitter
vim.keymap.set('n', '<leader>e', ':Oil<CR>')
-- save
vim.keymap.set('n', '<leader><CR>', ':w<CR>')
-- close buffer
vim.keymap.set('n', '<leader><leader><CR>', ':bd<CR>')
-- get out of input mode
vim.keymap.set('i', 'jk', '<Esc>')

-- move highlighted lines up or down
vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv")
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv")

-- centers the cursor vertically on move
vim.keymap.set('n', 'J', 'mzJ`z')
vim.keymap.set('n', '<C-d>', '<C-d>zt')
vim.keymap.set('n', '<C-u>', '<C-u>zt')
vim.keymap.set('n', 'n', 'nztzv')
vim.keymap.set('n', 'N', 'Nztzv')

-- these allow copy/paste from the clipboard
  -- greatest remap ever
vim.keymap.set('x', '<leader>p', [["_dP]])

  -- next greatest remap ever : asbjornHaland
vim.keymap.set({'n', 'v'}, '<leader>y', [["+y]])
vim.keymap.set('n', '<leader>Y', [["+Y]])

-- i think this keeps the deleted thing from being copied
vim.keymap.set({'n', 'v'}, '<leader>d', [["_d]])

-- this keeps vim from going into Ex mode via "Q"
vim.keymap.set('n', 'Q', '<nop>')

-- super substitute (substitute all instances of word under cursor)
vim.keymap.set('n', '<leader>s', [[:%s/\<<C-r><C-w>\>/<C-r><C-w>/gI<Left><Left><Left>]])

-- this moves between panes
vim.keymap.set('n', '<C-h>', '<C-w>h')

-- this unhighlights everything
vim.keymap.set('n', '<leader>h', ':noh<CR>')

-- next buffer
vim.keymap.set('n', '<C-n>', ':bnext<CR>')

-- split navigation
vim.keymap.set('n', '<C-l>', '<C-w>l')
vim.keymap.set('n', '<C-d>', '<C-w>h')
