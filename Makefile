all: allinstall

nvim:
	mkdir -p ${HOME}/.config/nvim;
	ln -vsf ${HOME}/.dotfiles/.config/nvim/init.vim ${HOME}/.config/nvim/init.vim
	ln -vsf ${HOME}/.dotfiles/.config/nvim/installer.sh ${HOME}/.config/nvim/installer.sh
	ln -vsf ${HOME}/.dotfiles/.config/nvim/coc-settings.json ${HOME}/.config/nvim/coc-settings.json
	bash ${HOME}/.config/nvim/installer.sh ${HOME}/.config/nvim;

allinstall: nvim
