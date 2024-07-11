# nvim config
## General info

Mostly, we get to files by putting them in ../nvim/init.lua.

However, this isn't really the place you want to put all your config, as this is
the main entry point for a lot of stuff, so we set up lazy in there and then
call into "th", which is in ../nvim/lua/.


