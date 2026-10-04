---
title: SCTF 2019 Crackme -wp
date: 2026-04-07 00:57:00
categories:
  - 逆向基础
tags:
  - CTF
  - SMC
  - SEH
featured: true
---

![image-20260407010147583](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407010147583.png)

这是主函数

先用findcrypt扫描算法发现有aes和base64编码并回溯找到aes函数位置为sub_4020D0(Block, (int)v22)

![image-20260407010221904](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407010221904.png)

接着运行调试时进入sub_402320(ModuleHandleW)发现有int3断点

![image-20260407010437363](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407010437363.png)

打开汇编流程图分析

![image-20260407010520959](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407010520959.png)

左边的为seh函数右边为主程序

并且在右边发现了注册she函数的汇编

![](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407010658595.png)

![image-20260407010823312](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407010823312.png)

其中seh结构体中loc_4023EF就是主程序中左边的seh函数

![image-20260407011015416](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407011015416.png)

这个程序在注册seh后在下面的DebugBreak()会强制出发int3断点然后交给调试器进而反调试我们调试的时候可以选择交给程序自己解决来跳过

在seh中有个函数sub_402450

![image-20260407011353264](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407011353264.png)

![image-20260407011411898](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407011411898.png)

这其中就是smc代码对每个字节和aSycloversyclov中的字符循环加密然后取反

至于smc的区域肯定在后面可以找到

![image-20260407011641548](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407011641548.png)

这个函数中return ((int (*)(void))dword_404000[0])();就是很明显的smc代码

![image-20260407011718433](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407011718433.png)

我们用ida脚本来还原

![image-20260407011830172](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407011830172.png)

重新编码后可以看到

![image-20260407011904719](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407011904719.png)

这是一个对aPvfqyc4ttc2uxr每个字符减一再逆序的函数

![image-20260407012102103](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407012102103.png)

解密后可以得到nKnbHsgqD3aNEB91jB3gEzAr+IklQwT1bSs3+bXpeuo=

这很明显是一个base64加密后的结果

结合前面的加密函数中两串连续的字符

![image-20260407012354573](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407012354573.png)

![image-20260407012404250](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407012404250.png)

推测是aes的cbc模式

![image-20260407012435345](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260407012435345.png)

解密拿到答案sctf{Ae3_C8c_I28_pKcs79ad4}
