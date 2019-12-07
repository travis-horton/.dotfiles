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

# Allows substitute in prompt
setopt prompt_subst

# Allows command line correction
setopt CORRECT
setopt CORRECT_ALL

# Prompt messing
PR_BOLD_DARK='%F{16}%B'
PR_BOLD_RED='%F{red}%B'
PR_DATE=$(date +%y%m%d.%H%M%S)
PR_PLAIN_DIR=$(pwd)
# eventually want to color background green if git status isn't clean
PR_COLOR_DIR=$(printf "\e[42m $PR_PLAIN_DIR")
PS1='$PR_BOLD_DARK%D{%y%m%d.%H%M%S} %n on %M in ${${(%):-%/}//\//${PR_BOLD_RED}/${PR_BOLD_DARK}} %(!.#.) %f%b
'

# Right aligned prompt messing
## Git status
# Load zsh version control info
autoload -Uz vcs_info
precmd_vcs_info() { vcs_info }
# Enable git vcs
zstyle ':vcs_info:*' enable git
zstyle ':vcs_info:git:*' check-for-changes true
zstyle ':vcs_info:git:*' unstagedstr "UNSTAGED CHANGES!!"
zstyle ':vcs_info:git:*' stagedstr "UNCOMMITTED CHANGES!!"
# Git info in prompt with colors
zstyle ':vcs_info:git:*' formats '%B%F{16}%r/%S - %b %K{green}%u%k%K{red}%c%k%f'
# Append git info to right aligned prompt
RPS1=\$vcs_info_msg_0_

# Aliases
alias cleanupds="find . -type f -name '*.DS_Store' -ls -delete"  #allows cleanupds to get rid of all the .DS_Store
alias zshrc="vim ~/.zshrc"  #easy vim zshrc
alias zs="source ~/.zshrc"  #easy zshrc source

# Function for make and move to dir
function mkcd() {
  mkdir "$1"
  cd "$1"
}
