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

        -- <i>/<em> and markdown emphasis: base16 schemes don't reliably style
        -- the treesitter groups (renamed to @markup.* in nvim 0.10), so bold
        -- survives but italics silently vanish. Re-assert on every
        -- colorscheme load, merging into whatever colors the theme set.
        local function emphasis()
            for group, style in pairs({
                ['@markup.italic'] = 'italic',
                ['htmlItalic'] = 'italic',
                ['@markup.strong'] = 'bold',
                ['htmlBold'] = 'bold',
            }) do
                local hl = vim.api.nvim_get_hl(0, { name = group, link = false })
                hl[style] = true
                vim.api.nvim_set_hl(0, group, hl)
            end
        end
        emphasis()
        vim.api.nvim_create_autocmd('ColorScheme', { callback = emphasis })
    end,
}
