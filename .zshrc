# Sets "l" and "ll" for long list
alias l="exa --long --git --tree --level=1 --classify --all \
  --group-directories-first --header --group"
alias ll="exa --long --git --tree --level=2 --classify --all \
  --group-directories-first --header --group \
  --ignore-glob='node_modules*|dist*|.parcel-cache*'"
alias lll="exa --long --git --tree --level=3 --classify --all \
  --group-directories-first --header --group \
  --ignore-glob='node_modules*|dist*|.parcel-cache*'"
alias llll="exa --long --git --tree --level=4 --classify --all \
  --group-directories-first --header --group \
  --ignore-glob='node_modules*|dist*|.parcel-cache*'"

export EDITOR="nvim"                  # Sets neovim as editor
alias vi="nvim"                       # Opens neovim instead of vim
alias vim="nvim"                      # Opens neovim instead of vim

setopt CORRECT                        # Allows command line correction
setopt CORRECT_ALL                    # Allows command line correction
setopt EXTENDED_HISTORY               # Saves timestamp
setopt HIST_EXPIRE_DUPS_FIRST         # Expires duplicates first
setopt HIST_FIND_NO_DUPS              # Ignore duplicates when searching
setopt HIST_IGNORE_DUPS               # Do not store duplicates
setopt HIST_REDUCE_BLANKS             # Remove blank lines from history
setopt INC_APPEND_HISTORY             # Appends commands as they are typed
setopt NO_CASE_GLOB                   # Sets case-insensitive globbing
setopt PROMPT_SUBST                   # Allows prompt substitution
setopt SHARE_HISTORY                  # Shares history between zsh sessions

SAVEHIST=2000                         # Sets history size

autoload -Uz compinit && compinit     # Turn on more powerful auto-completion

# case insensitive path-completion
zstyle ':completion:*' matcher-list \
  'm:{[:lower:][:upper:]}={[:upper:][:lower:]}' \
  'm:{[:lower:][:upper:]}={[:upper:][:lower:]} l:|=* r:|=*' \
  'm:{[:lower:][:upper:]}={[:upper:][:lower:]} l:|=* r:|=*' \
  'm:{[:lower:][:upper:]}={[:upper:][:lower:]} l:|=* r:|=*'

# partial completion suggestions
zstyle ':completion:*' list-suffixes
zstyle ':completion:*' expand prefix suffix

PS1="%~; "

#Aliases
alias zshrc="vim ~/.zshrc"                         # Easy vim zshrc
alias vimrc="vim ~/.config/nvim/init.vim"          # Easy vim vimrc
alias zs="source ~/.zshrc"                         # Easy zshrc source

alias ga="git add -Ap"                             # Git add
alias gc="git commit"                              # Git commit
alias gp="git push"                                # Git push
alias gb="git branch -a"                           # Show git branches
alias gg="git graph"                               # Git push
alias gco="git checkout"                           # Git checkout

alias wake_up="set -x; cleanupds; brew update; set +x; blog;"

# for rustup doc on apple sillicon before it becomes tier1 platform
alias rustdoc="rustup doc --toolchain=stable-x86_64-apple-darwin"

# Allows cleanupds to get rid of all the .DS_Store
alias cleanupds="find . -type f -name '*.DS_Store' -ls -delete;"

alias rg="nocorrect rg"
