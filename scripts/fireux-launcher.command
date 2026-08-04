#!/bin/zsh

launcher_path=${0:A}
repo_root=${launcher_path:h:h}

printf '\033[8;30;110t'
exec pnpm --dir "$repo_root" launcher
