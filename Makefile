all: allinstall

zsh:
	xargs brew install < ${HOME}/.dotfiles/brew_stuff/brew_packages_to_install.txt

nvim:
	mkdir -p ${HOME}/.config/nvim;
	ln -vsf ${HOME}/.dotfiles/.config/nvim/init.vim \
		${HOME}/.config/nvim/init.vim
	ln -vsf ${HOME}/.dotfiles/.config/nvim/coc-settings.json \
		${HOME}/.config/nvim/coc-settings.json
	bash ${HOME}/.dotfiles/.config/nvim/installer.sh ${HOME}/.config/nvim;

allinstall: nvim
