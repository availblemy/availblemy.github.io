---
title: elf文件蠕虫木马病毒
date: 2026-06-10 16:22:28
categories:
  - 样本分析
tags:
  - 木马
  - ELF
  - Linux
---

![image-20260610163246401](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610163246401.png)

socket（1，1，0）使用tcp协议，其中ensure_persistence有着大量的持久化技术，先看下面的流量加密逻辑

![image-20260610163536566](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610163536566.png)

可以清楚的看见它使用了0x7f进行异或加密

![image-20260610170119088](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610170119088.png)

这里可以看到用三个命令用来交互

第一个是用来dos攻击的

![image-20260610170053251](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610170053251.png)

![image-20260610170201491](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610170201491.png)

可以看见它有8中的常见dos攻击，并且会将信息返回c2服务器

第二和是用来横向感染的

![image-20260610170440722](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610170440722.png)

先是提取本地ip用于后面的感染

![](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610170604319.png)

然后循环判断子网段下有没有ip

![image-20260610171029155](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610171029155.png)

这个是感染核心逻辑使用开放的5555端口来投放木马文件

第三个是用来执行shell命令来远程操控

![image-20260610172009038](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610172009038.png)

popen是执行函数其他的是一些数据处理

接下来我来分析下持久化的函数ensure_persistence

![image-20260610173502416](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610173502416.png)

它先是加入了一些开机自启的目录这些都是不同系统下的开机目录

![image-20260610173824620](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610173824620.png)

install_chipset_persistence()这个是芯片级的持久化install_root_persistence()这个是有root权限的持久化install_nonroot_persistence()这个是非root权限的持久化



![image-20260610174148418](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610174148418.png)

这个是对物联网系统的install_iot_persistence()持久化

![image-20260610180130870](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610180130870.png)

这里是创建了一个shell脚本来看主程序有没有存在没有就启动后面是主程序检查脚本存在吗，是两个进程互相检查

这里我们可以看到如果程序运行起来后几乎是很难删除的。

最后我来做一下流量分析

![image-20260610182710249](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260610182710249.png)

可以看见这个程序发送了请求但是我这个虚拟机断网了没有完成三次握手就没有发送流量了

下面的ioc和hash值

| ip             | 176.65.139.41                                                |                              |
| -------------- | ------------------------------------------------------------ | ---------------------------- |
| 主程序隐藏副本 | /data/local/tmp/.fern_bot                                    |                              |
| 主程序隐藏副本 | /dev/.fern_bot                                               |                              |
| 主程序隐藏副本 | /tmp/.fern_bot                                               |                              |
| 主程序隐藏副本 | /sdcard/.fern_bot                                            |                              |
| 主程序隐藏副本 | /jffs/.sysupd                                                |                              |
| 持久化文件路径 | /etc/init.d/S99sysupd                                        | SysVinit 启动脚本            |
| 持久化文件路径 | /etc/hotplug.d/iface/99-sysupd                               | Hotplug 事件触发             |
| 持久化文件路径 | /etc/crontabs/root                                           | Crontab 定时任务             |
| 持久化文件路径 | /data/local/tmp/.dex                                         |                              |
| 持久化文件路径 | /data/local/tmp/.sys                                         |                              |
| 进程与系统 IOC | fern_bot                                                     |                              |
| 进程与系统 IOC | kworker                                                      |                              |
| 命令行 IOC     | `while true; do grep -q 'fernet_hb' /proc/net/unix           |                              |
| 命令行 IOC     | adb connect %s:5555 && adb push .fern_bot /data/local/tmp/ && adb shell chmod 777 .fern_bot && adb shell nohup ./fern_bot & | 横向感染安卓设备的完整命令链 |

| sha256 | 3d91b861984bda9fb52b9c082a2839d0a11a9d83979c79676a8667472da8cc09 |
| ------ | ------------------------------------------------------------ |
| md5    | d2ec16db8621508cada2d9fd60127409                             |
| sha1   | 9f36ac3143357a25935d812f3cc738129188ec84                     |

