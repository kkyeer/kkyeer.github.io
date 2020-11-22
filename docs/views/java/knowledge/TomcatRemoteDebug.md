---
date: 2019-12-14
categories:
  - 技巧
tags:
  - Debug
publish: true
---

# tomcat8 远程调试配置

1：修改  startup.sh

    exec "$PRGDIR"/"$EXECUTABLE"  start "$@"  改为exec "$PRGDIR"/"$EXECUTABLE" jpda start "$@"

2:修改catalina.sh

 JPDA_ADDRESS="127.0.0.1:8000"改为 JPDA_ADDRESS="本地ip地址:8000"
3. idea配置
edit configuration ->add
tomcat ->remote
第一个Tab页Server中
Port填tomcat对外提供服务的端口而不是调试端口
在第四个Tab页Startup/Connection选择Debug，复制对话框的内容
-agentlib:jdwp=transport=dt_socket,address=8333,suspend=n,server=y
在远程的tomcat的bin目录下，新建或修改setenv.sh文件，添加如下内容：
export JPDA_OPTS="-agentlib:jdwp=transport=dt_socket,address=8333,suspend=n,server=y"
4. 开始调试
