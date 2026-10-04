---
title: openclaw+deepseek v4+doubao 1.8部署
date: 2026-05-13 16:12:26
categories: 其他
tags:
  - AI
  - OpenClaw
  - 部署
---

最近研究了下ai agent本地部署的事，想要用国外的大模型还是比较麻烦

第一是用中转站open ai不稳定而且容易倒闭，

第二用集成的ai平台虽然比较稳定但是每个月要冲不少钱还不能本地化部署也很麻烦而且没有信誉较好的凭证容易删号跑路，

第三就是注册港澳电话卡获得国外的账户然后直接使用但每次的电话费用和要翻外网使用成本比较高和程序繁琐（有一个谷歌账号就好了）

第四使用本地开源模型一方面是我的笔记本负担不了那么多内存和开源模型大多没有那么先进

所以我想要可以agent代理模型调用方便，负担小就使用了openclaw和deepseek v4，再加上要一些图片读取使用豆包的1.8模型

接下来是安装步骤

1.用命令行安装openclaw（问ai）

2.去deepseek和火山引擎获得open api接口（记得看官方文档里面的curl和模型名）

3.用openclaw的命令安装deepseek和doubao（openclaw configure）local-model-custom provide-api配置

4.打开（openclaw gateway）用deepseek模型写python脚本调用豆包读取图片

下面是我布置成功的界面

![image-20260513170903013](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260513170903013.png)

