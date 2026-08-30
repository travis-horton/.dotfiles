return {
    'windwp/nvim-ts-autotag',
    ft = { 'html', 'xml', 'javascriptreact', 'typescriptreact', 'markdown' },
    config = function()
        require('nvim-ts-autotag').setup()
    end,
}
