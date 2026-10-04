---
title: 手脱upx
date: 2026-04-13 13:07:45
categories: 逆向基础
tags:
  - 脱壳
  - UPX
---

练一下手脱upx+用esp定律加scylla的方法



![image-20260413131950179](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260413131950179.png)

直接在内存中打开栈顶并下硬件断点4字节的访问断点然后运行（原理就是upx解压相当于一个函数开头会压入栈结尾会输出栈）

![image-20260413131925360](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260413131925360.png)

再用scylla来dump和修复

依次是dump将内存中的代码复制下来

再是iat autosearch 再到iat表中每个地址对应得是那个dll中得函数

然后get imports来建立函数和dll中导出表得关系

最后fixdunmp重新来填入INT让程序可以运行

![image-20260413132600572](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260413132600572.png)

顺便解密下这个题

![image-20260413132648693](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260413132648693.png)

这个头就是解密完了但是upx的效验头其中byte_401171就是主函数

![image-20260413132820219](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260413132820219.png)

这里是一个常见的花指令由于一定会跳到loc_409030+1去执行后面的

![image-20260413132944576](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260413132944576.png)

loc_409030位置的E8是call命令就形成干扰直接nop加u c p一下重新编译

![image-20260413134258057](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260413134258057.png)

![image-20260413134327464](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260413134327464.png)

找到主函数和地图起点终点得答案

![image-20260413134444809](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260413134444809.png)

![image-20260413134710200](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260413134710200.png)
