-- LSP: native vim.lsp.config / vim.lsp.enable (nvim 0.11+), mason for binaries.
--
-- nvim-lspconfig is on the runtimepath only for its lsp/<server>.lua defaults;
-- nothing calls require("lspconfig") any more. mason-lspconfig v2 owns exactly
-- two jobs: install `ensure_installed` and vim.lsp.enable() every installed
-- server (automatic_enable, default true). Per-server settings live in
-- vim.lsp.config() below and MUST be declared before mason-lspconfig.setup(),
-- which is what triggers the enable.
return {
  "neovim/nvim-lspconfig",
  dependencies = {
    "williamboman/mason.nvim",
    "williamboman/mason-lspconfig.nvim",
    "hrsh7th/cmp-nvim-lsp",
    "j-hui/fidget.nvim",
  },

  config = function()
    local capabilities = vim.tbl_deep_extend(
      "force",
      {},
      vim.lsp.protocol.make_client_capabilities(),
      require("cmp_nvim_lsp").default_capabilities()
    )

    -- 1. default: nvim-cmp capabilities on every server
    vim.lsp.config("*", {
      capabilities = capabilities,
    })

    -- 2. lua_ls: nvim globals + the nvim runtime as workspace library
    --    (what lsp-zero's nvim_workspace() used to do)
    vim.lsp.config("lua_ls", {
      settings = {
        Lua = {
          runtime = { version = "LuaJIT" },
          diagnostics = {
            globals = { "vim", "it", "describe", "before_each", "after_each" },
          },
          workspace = {
            checkThirdParty = false,
            library = { vim.env.VIMRUNTIME },
          },
        },
      },
    })

    -- 3. eslint: format on request
    vim.lsp.config("eslint", {
      settings = {
        eslint = {
          format = { enable = true },
        },
      },
    })

    require("fidget").setup({})
    require("mason").setup()
    require("mason-lspconfig").setup({
      ensure_installed = {
        "lua_ls",
        "rust_analyzer",
        "zls",
        "ts_ls",
        "eslint",
      },
      -- automatic_enable = true (default): vim.lsp.enable() for each installed server
    })

    -- buffer-local keymaps on attach (was lsp-zero's on_attach)
    vim.api.nvim_create_autocmd("LspAttach", {
      group = vim.api.nvim_create_augroup("th_lsp_attach", { clear = true }),
      callback = function(ev)
        local opts = { buffer = ev.buf, remap = false }
        local map = vim.keymap.set

        map("n", "gd", vim.lsp.buf.definition, opts)
        map("n", "K", vim.lsp.buf.hover, opts)
        map("n", "<leader>vws", vim.lsp.buf.workspace_symbol, opts)
        map("n", "<leader>vd", vim.diagnostic.open_float, opts)
        map("n", "[d", function() vim.diagnostic.jump({ count = -1, float = true }) end, opts)
        map("n", "]d", function() vim.diagnostic.jump({ count = 1, float = true }) end, opts)
        map("n", "<leader>vca", vim.lsp.buf.code_action, opts)
        map("n", "<leader>vrr", vim.lsp.buf.references, opts)
        map("n", "<leader>vrn", vim.lsp.buf.rename, opts)
        map("n", "<C-h>", vim.lsp.buf.signature_help, opts)
        map("n", "<leader>f", function() vim.lsp.buf.format() end, opts)
      end,
    })

    vim.diagnostic.config({
      -- update_in_insert = true,
      float = {
        focusable = false,
        style = "minimal",
        border = "rounded",
        source = true,
        header = "",
        prefix = "",
      },
    })
  end,
}
