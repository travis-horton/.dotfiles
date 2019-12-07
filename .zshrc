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

#Prompt messing
PR_BOLD_DARK='%F{16}%B'
PR_BOLD_RED='%F{red}%B'
PS1='%(!.#.)'
#The mess at the beginning displays path with / colored red.
RPS1='${${(%):-%/}//\//${PR_BOLD_RED}/${PR_BOLD_DARK}} | $PR_BOLD_DARK%D{%y%m%d.%H%M%S}%f%b'

#Right aligned prompt messing
##Git status
#Load zsh version control info
autoload -Uz vcs_info
precmd_vcs_info() { vcs_info }

zstyle ':vcs_info:*' enable git   #Enable git vcs
zstyle ':vcs_info:git:*' check-for-changes true   #sets check-for-changes
zstyle ':vcs_info:git:*' unstagedstr "UNSTAGED CHANGES!!"   #sets unstaged string to this
zstyle ':vcs_info:git:*' stagedstr "UNCOMMITTED CHANGES!!"    #sets staged string to this
zstyle ':vcs_info:git:*' formats '%B%F{16} | %s: %r - %b %K{green}%u%k%K{red}%c%k%f'   #Git info in prompt with colors
RPS1+=\$vcs_info_msg_0_   #Append git info to right aligned prompt

#Aliases
alias cleanupds="find . -type f -name '*.DS_Store' -ls -delete"  #allows cleanupds to get rid of all the .DS_Store
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
