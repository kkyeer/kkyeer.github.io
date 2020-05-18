分布式邮件推送系统：
1. 前提：服务器NTP时间同步，误差不超过1秒
2. 使用DB持久化存储JOB配置
3. 

1. 任务重复执行：
    1. 服务器时间NTP同步
    2. redis锁，key为JobGroup_JobName_TriggerGroup_TriggerName_yyyyMMddHHmmss,value为1
2. 长耗时任务均匀分布
3. 配置更新后刷新
    1. redis锁,key为Version_ID，value为1
4. 