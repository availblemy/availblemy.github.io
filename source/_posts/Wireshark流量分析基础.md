---
title: .Wireshark流量分析基础
date: 2026-07-25 17:30:49
categories: 流量分析
tags:
    -流量分析
---

# Wireshark使用范围

1.网络安全分析

2.应用程序分析

3.故障任务分析

4.分析一般任务

# Wireshark查询指令

```
ip.addr==10.2.9.4
!ip.addr===10.2.9.4
ip.src==10.2.9.4
ip.dst==10.2.9.4
ip.host==www.baidu.com
(ip.src>10.2.7.2&&ip.src<10.2.7.5)&&!ip.src==10.2.7.3
ip.src==10.2.7.0/24
tcp.port==80
tcp.stream eq 0 or tcp.stream eq 3(流的筛选)
http.host==baidu.com
http.response.code==302
http.response==1
http.request==1
http.request.method==POST
```

# Wireshark数据分析

## 1.查看协议的流可以看具体时如和传输数据和威胁安全

![image-20260725174724856](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260725174724856.png)

## 2.查看单个IP的会话或者两个IP之间的会话以便分析

![image-20260725175412729](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260725175412729.png)

![image-20260725175457061](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260725175457061.png)

## 3.协议分层统计

![image-20260725175633022](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260725175633022.png)

## 4.IO Graph直观分析

![image-20260725180153807](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260725180153807.png)

# 数据处理

## 1.追踪流时可以保存传输内容

![image-20260725180819839](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260725180819839.png)

## 2.可以一键导出同类型的文件

![image-20260725180950605](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260725180950605.png)

## 3.capinfos.exe处理大型文件

查看pcap文件

```
capinfos.exe xxxx.pcap
```

使用命令【editcap.exe -i <每个文件时长，单位：s> < 源文件名 > < 目的文件名 >】，如【editcap.exe -i 20 c:\sql.pcap c:\2\fsql.pcap】，为按照 20s 一个包进行分割。

```
editcap.exe -i 20 c:\sql.pcap c:\2\fsql.pcap
```

## 4.数据包分割

![image-20260725181901913](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260725181901913.png)

## 5.tshark.exe提取特定数据

例如

```
tshark.exe -r c:\http.pcapng -T fields -e frame.number -e ip.src -e ip.dst -e http.request.method
```

命令为从 http.pcapng 中提取 HTTP 协议中的源地址、目的地址、请求方法和对应的帧号，便于定位哪个帧
