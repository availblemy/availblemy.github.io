---
title: DVWA靶场练习-soc视角
date: 2026-08-04 14:58:00
categories: Web 安全
tags:
   —漏洞
---

# DVWA

本文章环境介绍：kali linux作为攻击机，windows10作为DVWA靶机，SIEM采集用的是wazuh

![image-20260804150046347](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260804150046347.png)

![image-20260804150118346](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260804150118346.png)

![image-20260804150514604](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260804150514604.png)

# Brute Force

## low

### 攻击

将密码设定为变量，使用爆破集来爆破

根据相应长度判断password为正确密码

![image-20260804160015642](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260804160015642.png)

### 防御

在wazuh中可以看见来自kali的DHCP记录Suricata保存相应的pcap可用于分析

C:\\Program Files\\Suricata\\log/log.pcap.1785822920

![image-20260804162351620](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260804162351620.png)

直接搜索包含admin的流量可以看见大量的爆破记录

查看apache日志也可看见大量的爆破记录

![image-20260804162912270](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260804162912270.png)

## medium

### 攻击

这一关当登陆失败后会堵塞2秒来防止爆破

把密码当做变量然后，用密码集爆破，但是用单请求和每个请求间隔2100ms来规避

依旧是根据回应长度来判断那个是正确密码

### 防御

查看日志和SIEM可以发现特征基本一致

可能是因为我的爆破速度太慢了没能识别为危险行为

# Vulnerability: Command Injection

## low

### 攻击

这个攻击是开发者想要用用户输入的命令直接在shell后执行，但攻击者可以用分隔符来添加自己想要执行的恶意命令

![image-20260804173454060](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260804173454060.png)

在后面加di显示主机的敏感信息

### 防御

![image-20260804174510536](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260804174510536.png)

SIEM采集到执行命令的信息，详细的查看systom

![image-20260804175508452](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260804175508452.png)

查看流量包也有相关的回应

![image-20260804180552890](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260804180552890.png)

## medium

同样是对一些特殊字符做处理但是，任然可以绕过

# CSRF

## lowreferen

攻击

主要是利用残留的chiock来确认用户消息可靠，用于修改密码等

防御

可以查看sucarita流下的流量包来溯源

![image-20260808180022106](C:\Users\Lenovo\AppData\Roaming\Typora\typora-user-images\image-20260808180022106.png)

## medium

中等难度的就是加了个referer头效验，但是burpsuit抓包依旧可以改变

# File Upload

## low

攻击

本来是要传送图片，我们可以改变文件后缀，抓包改变文件形式的方法来攻击

防御



可以看见siem系统采集到关于文件落地信息，

查询symon日志，一开始并没有发现日志在，于是我添加规则上传指定路径和jpg格式的文件后才有记录

![image-20260808200647537](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260808200647537.png)



# SQL Injection

## low

攻击

主要是采用sql语法的漏洞让非法的sql语句执行

防御

![image-20260817151400023](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260817151400023.png)

可以看见wazuh生成kali机器的登陆提醒可以查看留下的流量包来看是不是有攻击存在

![image-20260817152047159](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260817152047159.png)

这里+代表空格%27是单引号%3D是等号

## medium

进攻

采用`mysqli_real_escape_string()`转义特殊字符，限制了前端的输入，但仍可以通过抓包来注入

![image-20260817153420991](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260817153420991.png)

防御

![image-20260817153701678](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260817153701678.png)

仍然是查看流量包来检查是不是被攻击

