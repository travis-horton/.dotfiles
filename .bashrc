export LC_CTYPE=en_US.UTF-8
export EDITOR='vim --wait'

alias ll='ls -alhFG'
alias git='hub'

GIT_PS1_SHOWDIRTYSTATE=true
GIT_PS1_SHOWSTASHSTATE=true
GIT_PS1_SHOWUNTRACKEDFILES=true
PS1='\w$(__git_ps1 " [%s]")\$ '

[ -f /usr/local/etc/bash_completion ] && . /usr/local/etc/bash_completion
