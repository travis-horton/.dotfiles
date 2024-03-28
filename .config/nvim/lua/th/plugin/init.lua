return {
    {
        'NLKNguyen/papercolor-theme',
        lazy = false,
        priority = 1000,
        config = function()
            vim.cmd([[colorscheme PaperColor]])
        end,
    },
    'nvim-treesitter/playground',
    'theprimeagen/harpoon',
    'mbbill/undotree',
    'tpope/vim-fugitive',
    'vim-test/vim-test',
    'stevearc/oil.nvim',
}
