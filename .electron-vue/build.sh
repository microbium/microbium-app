run_build () {
  node ./.electron-vue/build-runner.js
  electron-builder
  terminal-notifier -title 'Bacterium' -message 'Build Complete'
}

if [[ -n $(git status --porcelain) ]]
then
  echo "$(tput setaf 1)Working tree is dirty, please resolve changes before building.$(tput sgr0)"
else
  run_build
fi
