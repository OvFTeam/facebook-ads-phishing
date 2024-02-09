#!/bin/bash

install_nvm() {
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
}

install_with_apt() {
    sudo apt-get update&&sudo apt-get upgrade
    sudo apt-get install "${packages[@]}"
}

install_with_pacman() {
    sudo pacman -Syyu "${packages[@]}"
}

install_with_yum() {
    sudo yum update
    sudo yum install "${packages[@]}"
}

source_shell_config() {
    if [ -n "$ZSH_VERSION" ]; then
        source "~/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        source "~/.bashrc"
    else
        echo "Unsupported shell"
        exit 1
    fi
}

install_pm2() {
    nvm install --lts
    npm install -g pm2
}

packages=(
    ca-certificates
    fonts-liberation
    libasound2
    libatk-bridge2.0-0
    libatk1.0-0
    libc6
    libcairo2
    libcups2
    libdbus-1-3
    libexpat1
    libfontconfig1
    libgbm1
    libgcc1
    libglib2.0-0
    libgtk-3-0
    libnspr4
    libnss3
    libpango-1.0-0
    libpangocairo-1.0-0
    libstdc++6
    libx11-6
    libx11-xcb1
    libxcb1
    libxcomposite1
    libxcursor1
    libxdamage1
    libxext6
    libxfixes3
    libxi6
    libxrandr2
    libxrender1
    libxss1
    libxtst6
    lsb-release
    wget
    xdg-utils
)

install_nvm
source_shell_config
if command -v apt-get &>/dev/null; then
    echo "Using apt package manager"
    install_with_apt
elif command -v pacman &>/dev/null; then
    echo "Using pacman package manager"
    install_with_pacman
elif command -v yum &>/dev/null; then
    echo "Using yum package manager"
    install_with_yum
else
    echo "Unsupported package manager"
    exit 1
fi
install_pm2
