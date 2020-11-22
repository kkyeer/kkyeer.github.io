---
date: 2020-04-17
categories:
  - 技巧
tags:
  - IDEA
publish: true
---

# IDEA文件头模板自动提示输入摘要

1. 菜单中File->settings->Editor->File and Code Templates
2. Files选中Include -> File Header
3. 在右侧的编辑框中输入下列值

    ```java
        /**
        * @Author: kkyeer
        * @Description: ${desc}
        * @Date:Created in ${TIME} ${DATE}
        * @Modified By:
        */
    ```

4. 下次新建类文件时，会弹出一个提示框要求输入描述信息
