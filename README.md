'It's dangerous to go alone! Take this.'

# .dotfiles

Starting out on my dotfiles journey

## In case of emergency:
In the `$HOME` dir:
```
git clone https://github.com/kiddspazz/dotfiles
```

then simply:
```
make
```

This runs the installer script, which installs xcode dev tools, then installs
brew, symlinks the config files, and then installs a bunch of brew packages
(found in `brew_packages_to_install.txt`), and finally runs my vim setup script.
