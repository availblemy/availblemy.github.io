---
title: windows日志+Sysmon
date: 2026-07-19 13:14:13
categories: 日志分析
tags:
---

# windows日志

日志查看方法：win+r输入**eventvwr.msc**弹出事件查看器，日志的储存格式为evtx

![image-20260719134528230](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260719134528230.png)

## 1.安全日志

```powershell
储存位置：C:\Windows\System32\Winevt\Logs\Security.evtx
```

主要存放安全事件及id

| 安全事件                                                     | id                       |
| ------------------------------------------------------------ | ------------------------ |
| 成功登录，登录失败，账户加入管理员组，修改账户密码           | 4624，4625，4732，4723   |
| 管理员特权登录，调用系统高级权限，特权操作（修改权限、接管文件、篡改服务） | 4672，4673，4674         |
| 进程创建与程序执行（无文件执行、恶意脚本、远控程序启动）     | 4688                     |
| 文件访问，注册表修改，对象权限变更                           | 4663，4657，4670         |
| 新建系统服务，服务注册表权限变更                             | 4697，4656 / 4657 / 4670 |
| 建立 SMB 共享连接，访问共享内文件、读取共享资源              | 5140，5145               |
| 清除日志行为                                                 | 4698                     |
| 设备插拔                                                     | 6416，6417               |

## 2.系统日志

系统日志记录操作系统组件产生的事件，主要包括**驱动程序、系统组件和应用软件的崩溃以及数据丢失错误**等

```powershell
储存位置：C:\Windows\System32\Winevt\Logs\System.evtx
```

## 3.应用日志

**应用程序出现崩溃**情况，那么我们可以从程序事件日志中找到相应的记录

```powershell
储存位置：C:\Windows\System32\Winevt\Logs\Application.evtx
```

# Sysmon

终端增强审计工具，驱动层捕获进程、网络、DNS、DLL 注入、文件创建、注册表修改、远程线程注入等**底层恶意行为**，弥补系统日志缺失

## 1.启动用powershell启动，有不同的规则可以配置

```
sysmon64.exe -i sysmonconfig-export.xml
```

## 2.在事件管理器中查看

查看路径：应用程序和服务日志 → Microsoft → Windows → Sysmon → Operational

------

![image-20260719135754081](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260719135754081.png)

## 3.常见查看的事件

| ID   | 事件名称                 | 核心监控行为                                    |
| ---- | ------------------------ | ----------------------------------------------- |
| 1    | ProcessCreate            | 创建进程                                        |
| 5    | ProcessTerminate         | 进程退出、程序关闭                              |
| 8    | CreateRemoteThread       | 远程线程注入                                    |
| 10   | ProcessAccess            | 打开其他进程句柄、读取内存                      |
| 7    | ImageLoad                | 加载 DLL、驱动 sys，捕获劫持 / 恶意模块         |
| 3    | NetworkConnect           | TCP/UDP 外联，记录进程、目标 IP 端口（C2 远控） |
| 22   | DNSEvent                 | 所有域名解析行为，捕获恶意域名                  |
| 11   | FileCreate               | 文件新建、覆盖写入                              |
| 23   | FileDelete               | 文件直接删除                                    |
| 26   | FileDeleteOnClose        | 关闭后自删（内存马、无文件攻击常用）            |
| 15   | FileCreateStreamHash     | NTFS 备用数据流 ADS（隐藏恶意文件）             |
| 12   | RegistryKeyEvent         | 注册表项 创建 / 删除                            |
| 13   | RegistryValueSet         | 注册表键值修改（Run 启动项劫持）                |
| 14   | RegistryKeyDelete        | 删除注册表项，清理后门痕迹                      |
| 17   | PipeCreated              | 创建命名管道                                    |
| 18   | PipeConnected            | 管道建立连接（PsExec、横向渗透）                |
| 19   | WmiEventFilter           | 创建 WMI 事件过滤器                             |
| 20   | WmiEventConsumer         | 注册 WMI 事件消费者                             |
| 21   | WmiEventConsumerToFilter | 绑定过滤器与消费者                              |
| 9    | RawAccessRead            | 底层读取磁盘卷（窃取影子副本、凭证文件）        |
| 6    | DriverLoad               | 驱动加载事件                                    |
| 24   | ProcessProtectChange     | 进程内存保护修改（篡改内存权限执行 shellcode）  |



## 4.卸载服务

```powershell
sysmon64.exe -u
```

