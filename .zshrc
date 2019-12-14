#Some aliases I need first thing.
alias l='ls -alFG' #allows l for long list
alias ll='ls -alFG' #allows ll for long list

#Sets editor to vim
export EDITOR='vim'

setopt NO_CASE_GLOB   #Sets case-insensitive globbing
setopt AUTO_CD    #Assumes cd if left off
setopt prompt_subst   #Allows substitute in prompt
setopt CORRECT    #Allows command line correction
setopt CORRECT_ALL    #Allows command line correction

#Declares history file, saves timestamp, and sets history size
HISTFILE=${ZDOTDIR:-$HOME}/.zsh_history
setopt EXTENDED_HISTORY
SAVEHIST=2000
# share history across multiple zsh sessions
setopt SHARE_HISTORY
# append to history
setopt APPEND_HISTORY
# adds commands as they are typed, not at shell exit
setopt INC_APPEND_HISTORY
# expire duplicates first
setopt HIST_EXPIRE_DUPS_FIRST
# do not store duplications
setopt HIST_IGNORE_DUPS
#ignore duplicates when searching
setopt HIST_FIND_NO_DUPS
# removes blank lines from history
setopt HIST_REDUCE_BLANKS
# turn on more powerful auto-completion
autoload -Uz compinit && compinit
# case insensitive path-completion
zstyle ':completion:*' matcher-list 'm:{[:lower:][:upper:]}={[:upper:][:lower:]}' 'm:{[:lower:][:upper:]}={[:upper:][:lower:]} l:|=* r:|=*' 'm:{[:lower:][:upper:]}={[:upper:][:lower:]} l:|=* r:|=*' 'm:{[:lower:][:upper:]}={[:upper:][:lower:]} l:|=* r:|=*'
# partial completion suggestions
zstyle ':completion:*' list-suffixes
zstyle ':completion:*' expand prefix suffix

#Prompt messing
PR_BOLD_DARK='%F{16}%B'
PR_BOLD_RED='%F{red}%B'
PS1='%(!.#.)'
#The mess at the beginning displays path with / colored red.
RPS1='${${(%):-%~}//\//${PR_BOLD_RED}/${PR_BOLD_DARK}}$PR_BOLD_DARK'

#Right aligned prompt messing
##Git status
#Load zsh version control info
autoload -Uz vcs_info
precmd_vcs_info() { vcs_info }
precmd_functions+=( precmd_vcs_info )   # I don't know what this does, but it seems to help...

zstyle ':vcs_info:*' enable git   #Enable git vcs
zstyle ':vcs_info:git:*' check-for-changes true   #sets check-for-changes
zstyle ':vcs_info:git:*' unstagedstr "UNSTAGED CHANGES!!"   #sets unstaged string to this
zstyle ':vcs_info:git:*' stagedstr "UNCOMMITTED CHANGES!!"    #sets staged string to this
zstyle ':vcs_info:git:*' formats ' | %s: %r - %b%K{green}%u%k%K{red}%c%k'   #Git info in prompt with colors
RPS1+=\$vcs_info_msg_0_   #Append git info to right aligned prompt
RPS1+=' | %D{%y%m%d.%H%M%S}%f%b'

#Aliases
alias cleanupds="find . -type f -name '*.DS_Store' -ls -delete"  #allows cleanupds to get rid of all the .DS_Store
alias t='tree -lCF -I "node_modules|dist|target|.cache"'  #makes tree colorized, follow symbolic links, show trailing char for types, and ignore a bunch of things
alias zshrc="vim ~/.zshrc"  #easy vim zshrc
alias zs="source ~/.zshrc"  #easy zshrc source
alias ga="git add -Ap"    #git add
alias gc="git commit -m"    #git commit
alias gp="git push"   #git push

#Function for make and move to dir
function mkcd() {
  mkdir "$1"
  cd "$1"
}

#Function for all the updates
function update() {
  echo "Updating Homebrew..."
  brew update
  echo "Updating npm..."
  npm update
}
