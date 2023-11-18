---
date: 2023-11-18 16:28:15
categories:
  - Linux
tags:
  - Linux
publish: true
---

# 在Ubuntu系统安装Monaspace字体

![示意图](https://github-production-user-asset-6210df.s3.amazonaws.com/22723/281846605-301020e0-f138-44af-abb1-48efa610be08.png)

在Ubuntu系统安装Google新开源的Monaspace字体

```bash
#!/bin/bash

# if the folder does not exist, create the folder
mkdir -p $HOME/.local/share/fonts/monaspace

# remove all fonts from ~/.local/share/fonts that start with "Monaspace"
mv $HOME/.local/share/fonts/monaspace/Monaspace* /tmp/

# copy all fonts from ./otf to ~/.local/share/fonts
cp $HOME/monaspace/fonts/otf/* $HOME/.local/share/fonts/monaspace

# copy variable fonts from ./variable to ~/.local/share/fonts
cp $HOME/monaspace/fonts/variable/* $HOME/.local/share/fonts/monaspace

# Build font information caches
fc-cache -f
```
