# Some aliases I need first thing.
alias l='ls -alFG' #allows l for long list
alias ll='ls -alFG' #allows ll for long list

# Sets editor to vim
export EDITOR='vim'

# Sets case-insensitive globbing
setopt NO_CASE_GLOB

# Assumes cd if left off
setopt AUTO_CD

# Declares history file, saves timestamp, and sets history size
HISTFILE=${ZDOTDIR:-$HOME}/.zsh_history
setopt EXTENDED_HISTORY
SAVEHIST=2000

# Allows command line correction
setopt CORRECT
setopt CORRECT_ALL

# Prompt messing
PS1='%F{16}%B%~%f%b %(!.#.>) '

# Right justified prompt messing
## Git status
autoload -Uz vcs_info
precmd_vcs_info() { vcs_info }
precmd_functions+=( precmd_vcs_info )
setopt prompt_subst
RPS1=\$vcs_info_msg_0_
zstyle ':vcs_info:git:*' formats '%B%F{16}%r - %b%f | '
zstyle ':vcs_info:*' enable git
## Add time
RPS1+='%F{16}%B%D{%y%m%d.%H%M}%f%b'

# Aliases
alias cleanupds="find . -type f -name '*.DS_Store' -ls -delete"  #allows cleanupds to get rid of all the .DS_Store

# Function for make and move to dir
function mkcd() {
  mkdir "$1"
  cd "$1"
}
