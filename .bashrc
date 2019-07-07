export LC_CTYPE=en_US.UTF-8   #sets caps type to US English
export EDITOR='vim'   #sets editor to vim

set -o vi #sets bash commands to vim commands

alias ll='ls -alFG' #allows ll for long list
alias lldeep='ls -alFGR'  #allows ll but recursively
alias cleanupds="find . -type f -name '*.DS_Store' -ls -delete"  #allows cleanupds to get rid of all the .DS_Store
alias mydate="date '+%y%m%d.%Hh%m %z %a'"   #print date in format i like
alias blogpush="set -x; cd ~/blog/; git add -A; git commit -m \"daily journal `mydate`\"; git push; set +x"  #add, commit, and push blog

#add, commit, and push in one command
function fullgit() {
  set -x;
  git add -A;
  if [ -z "$1" ]
  then
    echo "No commit message given, setting message to: \"`mydate`\"";
    git commit -m "\"`mydate`\"";
  else
    git commit -m "$1";
  fi
  git push;
  set +x;
}

#make and move to dir
function mkcd() {
  mkdir "$1"
  cd "$1"
}

[[ -r "/usr/local/etc/profile.d/bash_completion.sh" ]] && . "/usr/local/etc/profile.d/bash_completion.sh" #source for bash completion

GIT_PS1_SHOWDIRTYSTATE=true #defines git status
GIT_PS1_SHOWSTASHSTATE=true #defines git status
GIT_PS1_SHOWUNTRACKEDFILES=true #defines git status
PS1='\w$(__git_ps1 " [%s]")\$ ' #prints git status in prompt

