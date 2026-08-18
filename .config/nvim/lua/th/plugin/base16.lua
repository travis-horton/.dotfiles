return {
    'tinted-theming/tinted-vim',
    priority = 1000,
    config = function()
        vim.g.base16colorspace = 256

        local theme = 'gruvbox-light-medium'
        local link = vim.loop.fs_readlink(os.getenv('HOME') .. '/.base16_theme')
        if link then
            theme = link:match('/base16%-([%w%-]+)%.sh$') or theme
        end

        vim.cmd('colorscheme base16-' .. theme)
    end,
}
