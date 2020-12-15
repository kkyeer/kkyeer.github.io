---
date: 2020-11-22
categories:
  - 知识技能
tags:
  - markdown
publish: true
---

# VsCode自动修复markdown lint报错

1. 打开用户自定义配置文件:菜单栏File->Preference->Settins->User->Edit settings.json
2. 添加或修改如下配置项

    ```json
    "editor.codeActionsOnSave": {
        "source.fixAll.markdownlint": true
    }
    ```

3. Ctrl+S保存文件，自动修复lint报错，可以用Ctrl+Z快捷键来回退
