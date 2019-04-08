export LC_CTYPE=en_US.UTF-8   #sets caps type to US English
export EDITOR='vim'   #sets editor to vim

set -o vi #sets bash commands to vim commands

alias ll='ls -alhFG' #allows ll for long list

[[ -r "/usr/local/etc/profile.d/bash_completion.sh" ]] && . "/usr/local/etc/profile.d/bash_completion.sh" #source for bash completion

GIT_PS1_SHOWDIRTYSTATE=true #defines git status
GIT_PS1_SHOWSTASHSTATE=true #defines git status
GIT_PS1_SHOWUNTRACKEDFILES=true #defines git status
PS1='\w$(__git_ps1 " [%s]")\$ ' #prints git status in prompt

