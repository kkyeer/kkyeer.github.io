---
date: 2019-05-19
categories:
  - 懂
tags:
  - 日志
publish: true
---

# logback日志配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration debug="false" scan="false">
    <property name="log.path" value="/var/logs" />
    <property name="app.name" value="poly"/>
    <property name="pattern"
              value="[%d{yyyy-MM-dd HH:mm:ss.SSS}] [%thread] %highlight(%-5level) %cyan(%logger{36})[%L] - %msg%n"/>

    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>INFO</level>
        </filter>
        <encoder>
            <pattern>${pattern}
            </pattern>
        </encoder>
    </appender>
    <appender name="infoFile"
              class="ch.qos.logback.core.rolling.RollingFileAppender">
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>INFO</level>
        </filter>
        <file>${log.path}/${app.name}-info.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/${app.name}-info/${app.name}-%d{yyyy-MM-dd}-%i.log.zip</fileNamePattern>
            <maxFileSize>10MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>1GB</totalSizeCap>
        </rollingPolicy>

        <encoder>
            <pattern>${pattern}
            </pattern>
        </encoder>
    </appender>

    <appender name="debugFile"
              class="ch.qos.logback.core.rolling.RollingFileAppender">
        <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
            <level>DEBUG</level>
        </filter>
        <file>${log.path}/${app.name}-debug.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${log.path}/${app.name}-debug/${app.name}-%d{yyyy-MM-dd}-%i.log.zip</fileNamePattern>
            <maxFileSize>10MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>1GB</totalSizeCap>
        </rollingPolicy>

        <encoder>
            <pattern>${pattern}
            </pattern>
        </encoder>
    </appender>

    <springProfile name="dev">
        <root level="debug">
            <appender-ref ref="console"/>
        </root>
    </springProfile>

    <springProfile name="prod">
        <root level="debug">
            <appender-ref ref="infoFile" />
            <appender-ref ref="debugFile"/>
        </root>
    </springProfile>

</configuration>

```