# .dotfiles — what changed, in plain words

This is the whole history of Travis's settings files, newest first, written for someone who has never read them. These files decide how the terminal (the zsh shell, and bash before it), the text editor (Vim, then Neovim), git and a few other tools behave, and they carry an installer for setting up a new Mac. Every entry is one step that reached the main version: a merge, one commit, or one day's commits on one topic.

**How to read an entry**
- The heading names the change, links to the full technical detail on GitHub, and says when it landed (YY.MMDD.HHMM, Boise time).
- A bigger entry lists its parts underneath; each part's name links to the exact change that made it.
- **New:** something you can see or use · **Fixed:** a problem that no longer happens · **Behind the scenes:** a real change you can't see · **Removed:** something that is gone · **Breaking:** something that still exists but works differently, so the old way of using it stopped working · **Try it:** where to see it, only when that still works today.
- A word in `this style` is what you type in the terminal. In the editor, "Space-h" means press Space, then h.
- "(Later replaced …)" or "(Later removed …)" means that version is gone and says when.

*Written from the git history on 26.0919 and checked against the actual changes of each day. From then on, each pull request carries its own entry, and it is added here automatically when the pull request merges.*

## September 2026

**Undo history kept out of the public settings, and passwords in the keychain** · [commit](https://github.com/travis-horton/.dotfiles/commit/6b57dec) · merged 26.0917.1440 · v8.7.2
- Fixed: the editor's undo history (what lets you undo changes even after closing and reopening a file) was saved inside the editor's settings folder, which is linked into this public project; a rule kept it from being uploaded, but it now lives in the editor's own private folder on the computer instead. The editor also keeps no undo history at all for password, key and token files.
  Fixed: git now signs in to sites other than GitHub through the Mac's keychain.

**The editor's language help rebuilt** · [merge](https://github.com/travis-horton/.dotfiles/commit/f04469f) · merged 26.0904.2000 · v8.7.1
- Behind the scenes: the editor's language helpers (the part that suggests completions, explains code when you hover, and marks mistakes) now run on Neovim's own built-in system instead of an add-on (lsp-zero). Two setups had been competing, and an update had quietly stopped several settings from ever being applied, such as the list of names the Lua helper should treat as known.
  Fixed: the editor no longer prints the word "help" every time a code file opens, and `]d` and `[d` now jump to the next and the previous problem (they were the wrong way round).
  Fixed: the JavaScript style checker (eslint) now actually starts, so it can tidy a file when asked.

## August 2026

**Italics show in HTML files, and tags close themselves** · [merge](https://github.com/travis-horton/.dotfiles/commit/cf9911e) · merged 26.0829.2104 · v8.7.0
- **[Italic and bold in HTML](https://github.com/travis-horton/.dotfiles/commit/2d295f3)** · merged 26.0829.2104
  Fixed: text inside italic and bold tags in HTML files showed up plain in the editor. It now shows in italics or bold, whatever the colour theme.
- **[Tags close themselves](https://github.com/travis-horton/.dotfiles/commit/981ed18)** · merged 26.0829.2104
  New: in HTML, XML, React and Markdown files, typing an opening tag adds its closing tag, and renaming one renames its partner. The editor's add-ons were also brought up to their newest versions.
- **[A renamed helper](https://github.com/travis-horton/.dotfiles/commit/9b2a72a)** · merged 26.0829.2104
  Behind the scenes: the older of the two lists of language helpers was updated to the TypeScript helper's new name, to match the other list. (That older list was removed on 26.0904.)

**Zig files work in the editor** · [merge](https://github.com/travis-horton/.dotfiles/commit/80e3f8a) · merged 26.0829.2101 · v8.6.1
- Fixed: opening a Zig file showed an error every time, and there were no completions, explanations or error marks. The editor now installs the Zig language helper and keeps Zig's colouring up to date, so Zig files work like the other languages.
  Behind the scenes: the TypeScript helper was switched to its new name.

**The morning update covers the editor; colours follow the time of day** · [commit](https://github.com/travis-horton/.dotfiles/commit/381e2ba) · merged 26.0817.2048 · v8.6.0
- New: `wake_up` also updates the editor's add-ons, right after it updates the installed programs.
  New: the terminal and the editor share one colour theme (gruvbox), light from 07:00 to 19:00 and dark otherwise, unless another theme has been picked. The editor shows spaces as faint dots and gained a typing-practice game (Typr).
  New: in the editor, jumping half a page or to the next search match puts that line at the top of the screen instead of the middle. In the terminal, tab-completion keeps a path as you typed it, the listings hide only folders named exactly "dist", `pip` runs Python 3's pip, and two more folders of personal and Python tools are searched for commands.
  Behind the scenes: git signs in to GitHub through the GitHub command-line tool.
  Try it: open Terminal and type `ll` to see the folder you are in as a tree, two levels deep.

## August 2024

**The editor setup script catches up; more programs to install** · [merge](https://github.com/travis-horton/.dotfiles/commit/b5fd019) · merged 24.0802.0909 · v8.5.0
- Fixed: the editor setup script still tried to link and install the editor settings from before 24.0328, which no longer existed. It now links the whole editor settings folder in one step.
  New: the list of programs the installer adds swaps exa for its successor eza, and adds fzf (a fuzzy finder), jq (for reading JSON), mutt (terminal email) and Zig.
  Behind the scenes: the web-browser shortcut added on 24.0328 was removed.

**The file cleanup shows what it deletes** · [commit](https://github.com/travis-horton/.dotfiles/commit/b186e2e) · merged 24.0802.0818 · v8.4.0
- New: `cleanupds` lists each hidden Mac folder-view file (.DS_Store) as it deletes it.

**eza listings, a quicker cleanup, and a Dvorak keyboard layout** · [commit](https://github.com/travis-horton/.dotfiles/commit/47016f3) · merged 24.0801.1406 · v8.3.0
- New: the `l` to `lllll` listings use eza, the maintained successor of exa, and look the same.
  New: `cleanupds` uses a faster file finder and leaves the Library folder alone.
  New: a custom Dvorak keyboard layout for macOS is kept in the project.

## July 2024

**Editor notes and a closer scroll margin** · [commit](https://github.com/travis-horton/.dotfiles/commit/27b7cfb) · merged 24.0710.1835 · v8.2.0
- New: the editor keeps 4 lines visible above and below the cursor instead of 8.
  Behind the scenes: a short guide to how the editor settings are organised was added, and the half-written helper for running a work project's tests, added on 24.0328, was removed; it could never have run.

**wake_up upgrades everything** · [commit](https://github.com/travis-horton/.dotfiles/commit/04d8f6c) · merged 24.0710.1748 · v8.1.0
- New: `wake_up` upgrades the installed programs and clears out their old versions, instead of only refreshing the list of what is available.
  Behind the scenes: git was set to sign in through Git Credential Manager, with one extra setting for Azure DevOps. (Later replaced on 26.0817.)

## March 2024

**A new editor setup, written in Lua** · [commit](https://github.com/travis-horton/.dotfiles/commit/bbe1dfd) · merged 24.0328.0054 · v8.0.0
- **[The editor rewritten](https://github.com/travis-horton/.dotfiles/commit/bbe1dfd)** · merged 24.0328.0054
  Breaking: the editor's settings were rewritten from scratch in Lua, with a new add-on manager (lazy.nvim), replacing the old settings file and all its add-ons. Some keys changed: Space then Return now only saves (it used to save and quit), Ctrl-P searches the project's files, and Space-e opens a file browser (oil). The editor setup script kept pointing at the old files until 24.0802.
  New: language helpers for Lua, Rust and TypeScript that install themselves (Mason), a short list of favourite files to jump between (harpoon), git inside the editor (Space-gs), a highlight on the cursor's line, and selected lines that move up and down with J and K. A half-written helper for a work project's tests was also added (removed on 24.0710).
- **[Terminal additions](https://github.com/travis-horton/.dotfiles/commit/bbe1dfd)** · merged 24.0328.0054
  New: a completion add-on shows suggestions as you type (it has to be installed separately), replacing the old case-insensitive completion settings. `cat` shows files with colours (bat), `cd` learns your frequent folders (zoxide), `lllll` lists five levels deep, Zig's folder is searched for commands, and there are shortcuts for the weather, for starting the game Dwarf Fortress, and for opening a web browser.
  New: settings for mutt, a terminal email program.
  Behind the scenes: the zipped copy of the editor settings from 23.0817 was removed, and the editor's undo-history folder is kept out of the project.

## August 2023

**The editor settings, zipped** · [commit](https://github.com/travis-horton/.dotfiles/commit/7a697b0) · merged 23.0817.1629 · v7.4.1
- Behind the scenes: a zipped copy of the editor settings was saved. (Later removed on 24.0328.)

## December 2022

**The installer finished: git and database settings** · [commits](https://github.com/travis-horton/.dotfiles/compare/2e11acb...4064d72) · merged 22.1231.0930 · v7.4.0
- New: git settings are back in the project: changes are shown side by side in colour (delta), merge conflicts show the original text too, and new projects start on a branch called main.
  New: settings for the Postgres database tool: a coloured prompt, a welcome line, empty values shown as [null], results laid out one field per line, timings after every query, and fuller error messages.
  Behind the scenes: the installer (now called `installer`, still run by `make`) also sets up the Rust tools' path file and reloads the terminal settings before setting up the editor. The guide says what the installer does.

**The installer: clearer progress and a few more pieces** · [commits](https://github.com/travis-horton/.dotfiles/compare/61c20d5...2e11acb) · merged 22.1230.1032 · v7.3.0
- New: the installer and the editor setup print a full-width line and a heading before each step, and show each command as it runs.
  New: the installer also links the git and Postgres settings (those files arrived the next day), installs the test tool Jest and the editor's JavaScript bridge, and downloads the PaperColor colour theme.

**The installer: progress headings, `make`, and colour** · [commits](https://github.com/travis-horton/.dotfiles/compare/0a2613e...61c20d5) · merged 22.1229.1738 · v7.2.0
- New: typing `make` in the project runs the whole installer. The old `make nvim` step, which had pointed at a script deleted on 22.0619, is gone.
  New: the installer and the editor setup print a heading before every step, the installer adds git-delta (a clearer way to show changes), and the editor's completion helpers for HTML, TypeScript, Rust, Python and JSON now install themselves.
  New: the editor uses the PaperColor theme, highlights search matches, gives Rust files a 100-character line, and Space-h clears highlighting. Its undo history moved into its settings folder.

## June 2022

**Editor setup tweaks** · [commits](https://github.com/travis-horton/.dotfiles/compare/e2d4303...0a2613e) · merged 22.0620.1506 · v7.1.1
- Behind the scenes: the editor setup also asks for the HTML completion helper and no longer installs the styled-components add-on. A note records that its helper-install step didn't seem to work (it was fixed on 22.1229).

**A one-command installer for a new Mac** · [commits](https://github.com/travis-horton/.dotfiles/compare/c2a7a3f...e2d4303) · merged 22.0619.1738 · v7.1.0
- New: an installer sets up a new Mac from scratch: Apple's developer tools, Homebrew, links to the zsh settings, a short list of programs (bat, exa, fd, Lua, Neovim, Node, Postgres, Python, ripgrep, tree-sitter), Yarn, and then the editor with its add-ons: a fuzzy finder (Telescope), git inside the editor (fugitive), an undo-history browser (undotree, Space-u) and language colouring.
  Behind the scenes: the list of programs to install was cut from 128 to the 10 actually wanted, the `ll`-style listings also hide the .git folder, and the old add-on script was replaced by the new setup. One slip: `make nvim` still pointed at the deleted script until 22.1229.

**A fresh start: zsh and Neovim** · [commits](https://github.com/travis-horton/.dotfiles/compare/65dfe86...c2a7a3f) · merged 22.0617.1523 · v7.0.0
- Removed: the old bash settings, the Vim settings, the git and npm settings, the setup script, and every personal command: `fullgit`, `pushblog`, `blog`, `brewdaily`, `deploy`, `replace_spaces`, `uppercase_to_lowercase`, the work folder shortcut, the class-sync script and the `jk:wq` joke. `wake_up` was left calling the removed `blog`.
  New: Neovim is the editor (`vi` and `vim` open it), with a completion helper (coc), a fuzzy finder on Ctrl-P, Ctrl-H/J/K/L to move between split windows, a guide line at 80 characters, and a status bar with the folder, file, position and time. `l`, `ll`, `lll` and `llll` show the files as a tree one to four levels deep with their git status (exa), hiding build folders.
  New: the prompt is simply the current folder followed by "; ", Homebrew for Apple-chip Macs loads at start, and there are new shortcuts: `gb` (branches), `gg` (history graph), `gco` (switch branch), `vimrc` (edit the editor settings) and `rustdoc` (Rust's documentation), and spelling correction no longer interrupts `rg` searches. A list of 128 Homebrew programs was saved, and the guide got install steps.

## November 2020

**wake_up, the morning routine** · [commit](https://github.com/travis-horton/.dotfiles/commit/65dfe86) · merged 20.1111.1250 · v6.7.0
- New: `wake_up` runs the morning routine in one go: it deletes the hidden .DS_Store files, refreshes Homebrew's list, and opens today's blog page.
  Behind the scenes: the work folder shortcut names its new folders with the dotted date (YY.MMDD).

## July 2020

**A dotted date on the blog** · [commit](https://github.com/travis-horton/.dotfiles/commit/3e142ec) · merged 20.0730.0736 · v6.6.0
- New: the automatic message from `pushblog` uses the dotted date (YY.MMDD).

**`blog` works again** · [commit](https://github.com/travis-horton/.dotfiles/commit/6adaf4b) · merged 20.0725.0832 · v6.5.1
- Fixed: the change the day before had broken `blog` with a missing semicolon, and it looked for today's page without its ".html" ending, so it could never find it. Both are fixed: `blog` opens today's page once, and says so if it already exists.

**A blue prompt, and `blog` checks first** · [commit](https://github.com/travis-horton/.dotfiles/commit/e62f88c) · merged 20.0724.1907 · v6.5.0
- New: the folder path in the prompt turned blue. `blog` copies the template only if today's page doesn't exist yet, and otherwise says you have already started today. (It had two mistakes, fixed the next day.)

## April 2020

**Back to the desert colours** · [commits](https://github.com/travis-horton/.dotfiles/compare/4b64cb8...eb5d968) · merged 20.0406.1820 · v6.4.0
- New: Vim went back to the desert colour scheme. The guide's opening line moved to the top, a change made on GitHub on 20.0310.

## February 2020

**A shorter path in Vim's status bar** · [commit](https://github.com/travis-horton/.dotfiles/commit/4b64cb8) · merged 20.0225.1048 · v6.3.0
- New: Vim's status bar shows the file's path from the current folder instead of the full path.

**Vim wraps at 100** · [commits](https://github.com/travis-horton/.dotfiles/compare/f3371c7...f1f1dbb) · merged 20.0219.0949 · v6.2.0
- New: Vim wraps text at 100 characters, shows only relative line numbers, and Ctrl-U turns them on and off.
  Behind the scenes: the Vim settings were lined up into neat columns.

**A yellow prompt and zellner colours** · [commits](https://github.com/travis-horton/.dotfiles/compare/d23b776...f3371c7) · merged 20.0214.1055 · v6.1.0
- New: Vim switched to the zellner colour scheme, and the path in the prompt turned bright yellow with red slashes.

**The commit shortcut changes; a class-sync script** · [commits](https://github.com/travis-horton/.dotfiles/compare/b98e774...d23b776) · merged 20.0209.2056 · v6.0.0
- Breaking: `gc` no longer includes the message option, so it opens the editor to write the commit message; `gc "message"` stopped working.
  New: `nodegitignore` adds GitHub's standard list of files to ignore in a Node project, and a script copies a class's files to and from an online workspace (removed on 22.0617).
  Behind the scenes: the npm settings were adjusted twice.

## December 2019

**The blog message shows the right time** · [commit](https://github.com/travis-horton/.dotfiles/commit/b98e774) · merged 19.1224.0748 · v5.5.1
- Fixed: the automatic message from `pushblog` put the month where the minutes belong. It now shows the real time.

**deploy** · [commit](https://github.com/travis-horton/.dotfiles/commit/c97c3f4) · merged 19.1219.1453 · v5.5.0
- New: `deploy` copies a folder up to the website's server. (Later removed on 22.0617.)

**The tree view skips clutter** · [commits](https://github.com/travis-horton/.dotfiles/compare/1c68297...f24310c) · merged 19.1214.1051 · v5.4.0
- New: `t` hides the node_modules, dist, target, .cache and .git folders, and shows hidden files.

**Smarter completion, a tree view, and save-and-quit** · [commits](https://github.com/travis-horton/.dotfiles/compare/fed9e8f...1c68297) · merged 19.1213.2022 · v5.3.0
- New: tab-completion ignores capital letters, can complete from the middle of a name, and uses zsh's full completion system. `t` shows a coloured tree of the current folder (for a few minutes it was called `tree`).
  New: in Vim, Space then Return saves and quits, and the line numbers show both the current line's number and the distance to the others.

**Vim's leader key and add-ons** · [commits](https://github.com/travis-horton/.dotfiles/compare/14ae029...fed9e8f) · merged 19.1206.2202 · v5.2.0
- New: Space is Vim's leader key: Space-h clears search highlighting, and Space-i types out a JavaScript for-loop. Vim also loads add-ons for each kind of file.
  Behind the scenes: the tag-building command added that morning was taken out again, and the setup script stopped deleting the .vim folder.

**A prompt that shows git status** · [commits](https://github.com/travis-horton/.dotfiles/compare/8bb830b...14ae029) · merged 19.1206.1923 · v5.1.0
- New: the prompt moved to the right-hand side: the current folder with red slashes, then the git project and branch, a green "UNSTAGED CHANGES!!" or red "UNCOMMITTED CHANGES!!" warning, and the date and time.
  New: shortcuts `ga` (add changes piece by piece), `gc` (commit with a message), `gp` (push), `zshrc` (edit the shell settings) and `zs` (reload them), and `update` refreshes Homebrew and npm.
  New: command history is shared between open terminal windows, saved as you type, and skips repeats and blank lines.

**Switching to zsh** · [commits](https://github.com/travis-horton/.dotfiles/compare/56233cb...8bb830b) · merged 19.1206.1129 · v5.0.0
- Breaking: the setup script installs zsh settings instead of the bash ones and removes the old bash files; the bash settings moved into their own folder. On Travis's own computer it also links the personal commands folder.
  New: the zsh settings: `l` and `ll`, Vim as the editor, a folder name alone moves into it, case-insensitive matching, spelling correction, 2,000 lines of history with times, `cleanupds` and `mkcd`. The bash prompt gained the date and time, and a `jk:wq` command answers "You're not in vim anymore, Toto."
  New: Vim folds open two levels deep, finds files in subfolders, and shows a menu for tab-completion. The guide gained the command for Apple's developer tools, a change made on GitHub on 19.1028.
  Behind the scenes: the personal commands now run with the basic sh shell instead of bash, and a tag-building command was added to Vim (taken out that evening).

## September 2019

**The work folder shortcut becomes a command** · [commits](https://github.com/travis-horton/.dotfiles/compare/fdc861b...56233cb) · merged 19.0910.2104 · v4.0.0
- Breaking: the work folder shortcut and its fiscal-year helper moved out of the shell settings into a stand-alone command with a new name; the old name stopped working.
  Behind the scenes: the setup script runs with bash, a few empty files left over from testing were deleted, and the guide notes that only macOS is supported (a change made on GitHub on 19.0908).

**The setup links fullgit correctly** · [commit](https://github.com/travis-horton/.dotfiles/commit/fdc861b) · merged 19.0908.1032 · v3.4.1
- Fixed: the setup script had been linking the personal commands from where they used to be. It now makes the commands folder and links `fullgit` from its real place; the two blog commands are left out until the setup can tell it is on the home computer.
  Behind the scenes: the fiscal-year helper got a clearer name.

## August 2019

**More personal commands** · [commit](https://github.com/travis-horton/.dotfiles/commit/12a390b) · merged 19.0802.0943 · v3.4.0
- New: `blog` opens today's blog page, making it from a template in a folder for the month if needed. `replace_spaces` swaps spaces for underscores in every file name below the current folder, `uppercase_to_lowercase` lowercases them, and `brewdaily` says what it is doing at each step.
  Behind the scenes: the setup script and the guide were updated for the commands folder.

## July 2019

**Commands move into the project** · [commit](https://github.com/travis-horton/.dotfiles/commit/ef60599) · merged 19.0728.0937 · v3.3.0
- New: `brewdaily` prints the date first.
  Behind the scenes: `fullgit` and `pushblog` moved into the commands folder as real files instead of links. The setup script still pointed at their old place until 19.0908.

**A personal commands folder** · [commit](https://github.com/travis-horton/.dotfiles/commit/f3e1992) · merged 19.0727.1838 · v3.2.0
- New: a personal commands folder is searched for commands, starting with `brewdaily`, which upgrades, refreshes and cleans up Homebrew in one go.

**A work folder shortcut** · [commit](https://github.com/travis-horton/.dotfiles/commit/b1543fa) · merged 19.0724.1550 · v3.1.0
- New: a work shortcut that makes the next period's set of folders and copies in a starting document. `l` also gives the long listing.
  Behind the scenes: the path to Rust's tools moved from one bash settings file to the other.

**npm installs to the normal place** · [commits](https://github.com/travis-horton/.dotfiles/compare/c345185...263eba3) · merged 19.0709.1601 · v3.0.1
- Behind the scenes: the npm setting that put shared packages in a custom folder was removed. The same change, made on another computer, was merged in and added nothing new.

**fullgit and pushblog become commands** · [commit](https://github.com/travis-horton/.dotfiles/commit/c345185) · merged 19.0708.2023 · v3.0.0
- Breaking: `fullgit` and the blog push became stand-alone commands that the setup script installs, and the blog push is now called `pushblog` instead of `blogpush`.
  New: `l` is a short name for the long listing.

**fullgit** · [commits](https://github.com/travis-horton/.dotfiles/compare/aa84ca5...06465e3) · merged 19.0707.0934 · v2.0.0
- New: `blogpush` adds, commits and pushes the blog in one step, with a label and the date as the message. `fullgit` does the same for any project, with your message, or the date when you give none.
  Breaking: `wwwpush` was renamed `fullgit`.
  Removed: `lldeep`, the listing of every folder below.

**The setup asks first** · [commits](https://github.com/travis-horton/.dotfiles/compare/a21dd02...aa84ca5) · merged 19.0706.1430 · v1.8.0
- New: the setup script explains which files it will replace and asks "Are you sure?", then removes the old files before linking the new ones and makes Vim's swap folder.
  Behind the scenes: `mkcd` is written as a function.

**wwwpush and mydate** · [commits](https://github.com/travis-horton/.dotfiles/compare/6afc7b9...a21dd02) · merged 19.0704.1705 · v1.7.0
- New: `wwwpush` adds, commits and pushes a project in one command, showing each step, with the date as the message. `mydate` prints the date and time in a compact style, and `lldeep` lists every folder below.
  New: new npm projects start at version 0.0.1, the email address on commits changed, and Vim's clock shows the minutes after an "h".
  Fixed: the setup script links from the renamed .dotfiles folder, can be run directly, and puts Vim's swap folder in the home folder. `mydate` is set up before `wwwpush`, which needs it.

## June 2019

**The current folder in Vim's status bar** · [commit](https://github.com/travis-horton/.dotfiles/commit/6afc7b9) · merged 19.0622.0744 · v1.6.0
- New: Vim's status bar also shows the current folder.

**The setup links from the project** · [merge](https://github.com/travis-horton/.dotfiles/commit/fa02ff1) · merged 19.0620.0734 · v1.5.1
- Fixed: the setup script linked each settings file to itself, so it did nothing. It now links them from the project folder and creates Vim's swap folder. (Changes made on GitHub on 19.0502.)

**Vim's status bar redesigned** · [commit](https://github.com/travis-horton/.dotfiles/commit/e2111a7) · merged 19.0619.0755 · v1.5.0
- New: Vim's status bar has labelled sections: path, buffer number, flags, character code, position, place in the file, and the time.

**Exact sizes in ll** · [commit](https://github.com/travis-horton/.dotfiles/commit/9d9e608) · merged 19.0601.0717 · v1.4.0
- New: `ll` shows file sizes in bytes instead of rounded to KB or MB.

## May 2019

**Desert colours, and a setup script** · [commits](https://github.com/travis-horton/.dotfiles/compare/400e1b4...fd091d9) · merged 19.0502.1418 · v1.3.0
- New: Vim uses the desert colour scheme, with plain line numbers again.
  New: a setup script puts the settings files in place, and the guide says how to use it (changes made on GitHub that day). The script linked each file to itself until 19.0620.

## April 2019

**mkcd, and relative line numbers** · [commit](https://github.com/travis-horton/.dotfiles/commit/400e1b4) · merged 19.0412.2209 · v1.2.0
- New: `mkcd` makes a folder and moves into it, and Vim numbers the lines by their distance from the cursor.

**Vim keys in the shell; switching files in Vim** · [commits](https://github.com/travis-horton/.dotfiles/compare/fc6e04a...9c5fd62) · merged 19.0408.1722 · v1.1.0
- New: the bash command line uses Vim-style editing keys, `cleanupds` deletes the Mac's hidden .DS_Store files below the current folder, git gets a `graph` history view, and Rust's tools are added to the command path.
  New: Vim highlights search matches as you type, Ctrl-N and Ctrl-P switch between open files, and a status bar is always shown. The guide gained an emergency note.
  Behind the scenes: git commands no longer run through hub, GitHub's add-on for git.

## March 2019

**The first settings** · [commits](https://github.com/travis-horton/.dotfiles/commits/main?since=2019-03-22&until=2019-03-22) · merged 19.0322.0739 · v1.0.0
- **[Shell, Vim, git and npm settings](https://github.com/travis-horton/.dotfiles/commit/06a0b36)** · merged 19.0322.0714
  New: the first settings: `ll` for a long listing, git commands through hub, a prompt that shows the git branch and whether anything has changed, and Vim with two-space indents, line numbers, folding, and jk to leave typing mode. Git and npm got the author details to put on new work.
- **[A guide](https://github.com/travis-horton/.dotfiles/commit/fc6e04a)** · merged 19.0322.0739
  New: a short README: "it's dangerous to go alone! take this."
