# PMP学习机 - 外网访问

## 当前隧道地址

https://e16acabd6bdee1.lhr.life

## 如何重建隧道（如果地址失效）

```bash
# 1. 确保本地服务运行
cd "c:\Users\xiang\Desktop\PMP\pmp-learning"
python -m http.server 9000 --bind 0.0.0.0

# 2. 建立SSH隧道（开另一个终端）
ssh -R 80:localhost:9000 nokey@localhost.run
```

隧道建立后会在输出中显示类似 `https://xxxx.lhr.life` 的地址。

## 如何恢复到之前的工作状态

没做什么分析工作，只是重建了一个稳定的HTTPS隧道让手机和外部PC可以访问。
项目功能齐全：2800题题库、知识学习、仪表盘、练习、考试、报告。
