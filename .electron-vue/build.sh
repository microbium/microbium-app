run_build () {
  export BUILD_NUMBER="$(git rev-parse --short HEAD)"
  node ./.electron-vue/build-runner.js
  electron-builder --publish=never
  terminal-notifier -title 'Microbium' -message 'Build Complete'
}

if [[ -n $(git status --porcelain) ]]
then
  echo "$(tput setaf 1)Working tree is dirty, please resolve changes before building.$(tput sgr0)"
else
  run_build
fi
