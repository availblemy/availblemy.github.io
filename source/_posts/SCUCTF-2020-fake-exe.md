---
title: SCUCTF 2020 fake.exe
date: 2026-04-09 08:25:17
categories: 逆向基础
tags:
  - CTF
  - STL
featured: true
---

![image-20260409082707423](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409082707423.png)

打开程序可以看到逻辑非常简单但是sub_7FF7C68B1320很明显是scanf函数答案又不可能是scuctf{fakeflag}

所以猜测有stl反调

打开TlsDirectory查看回调函数

![image-20260409083059688](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409083059688.png)

![image-20260409083320531](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409083320531.png)

这里就是两个个反调试

![image-20260409083629994](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409083629994.png)

这个是挂钩函数的主函数这里nop掉前面所有反函数后就可以看到

v5的值

![image-20260409083907720](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409083907720.png)

unk_14001D178的值

![image-20260409083937535](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409083937535.png)



可以看到它将_imp_strcmp指向的ucrtbased_strcmp放在了unk_14001D178上

![image-20260409083346785](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409083413524.png)

这个是sub_14001132A（func1）函数的主要逻辑

其中sub_7FF628F611FE()的逻辑就是下面的那张图将unk_14001D178保存的值还给_imp_strcmp指向地方

而下面的就是rc4加密然后再调用__imp_memcmp

![image-20260409083434242](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409083434242.png)

![image-20260409083456953](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409083456953.png)

这张图是sub_7FF628F61046()的主要逻辑就是将__imp_memcmp指向的值换为sub_14001132A（func1）函数

总结一下这个题的逻辑就是在tls中将j_strcmp钩取然后在主程序使用时调用先还原j_strcmp然后rc4加密再用还原的j_strcmp将密文和下面j_strcmp真正的密钥对比，而scuctf{fakeflag}时密钥。

![image-20260409092756473](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409092756473.png)

密文就是unk_7FF628F6D120（ 0x98, 0x11, 0xA1, 0x15, 0x1B, 0xFA, 0x99, 0xAB, 0xAF, 0xEA, 0x63, 0xCB, 0xB3, 0x98, 0x52, 0x1C, 
0x0D, 0xD5, 0xCE, 0xDA, 0xC4, 0xAF, 0x07, 0xA3, 0x4F, 0xB2, 0x65, 0x99, 0x15, 0x8A, 0xE1, 0x02,  0x4C, 0x3A, 0x1A, 0x69, 0x86, 0xCD, 0x56, 0x9C, 0xCA, 0x2C, 0x40, 0x4A）

由于这个rc4加密将交换改为了异或交换使得它不能用在线工具接的这是解密脚本

```c
#include<stdio.h>
#include<string.h>

void decrypt(char* a1, char* a2, int data_len)
{
    unsigned char v1[256]; 
    unsigned char v2[256];
    unsigned char temp;

    for (int j = 0; j < 256; ++j)
    {
        v1[j] = j;
        int v16 = strlen(a2);
        v2[j] = a2[j % v16];
    }
    unsigned int x1 = 0;
    unsigned int x2 = 0;
    while (x1 < 256)
    {
        x2 = (v2[x1] + v1[x1] + x2) % 256;
        int v14 = v1[x2] ^ v1[x1];
        v1[x1] = v14;
        int v15 = v14 ^ v1[x2];
        v1[x2] = v15;
        v1[x1] ^= v15;
        ++x1;
    }
    unsigned int y1 = 0;
    unsigned int y2 = 0;
    unsigned int y3 = 0;
    while (y1 < data_len) 
    {
        y2 = (y2 + 1) % 256;
        y3 = (v1[y2] + y3) % 256;
        int v14 = v1[y3] ^ v1[y2];
        v1[y2] = v14;
        int v15 = v14 ^ v1[y3];
        v1[y3] = v15;
        v1[y2] ^= v15;
        int v13 = (v1[y3] + v1[y2]) % 256;
        a1[y1++] ^= v1[v13];
    }
}

int main()
{
    unsigned char a2[] = "scuctf{fakeflag}";
    unsigned char a1[45] = {
        0x98, 0x11, 0xA1, 0x15, 0x1B, 0xFA, 0x99, 0xAB,
        0xAF, 0xEA, 0x63, 0xCB, 0xB3, 0x98, 0x52, 0x1C,
        0x0D, 0xD5, 0xCE, 0xDA, 0xC4, 0xAF, 0x07, 0xA3,
        0x4F, 0xB2, 0x65, 0x99, 0x15, 0x8A, 0xE1, 0x02,
        0x4C, 0x3A, 0x1A, 0x69, 0x86, 0xCD, 0x56, 0x9C,
        0xCA, 0x2C, 0x40, 0x4A
    };
    decrypt(a1, a2, 44);
    printf("解密结果：");
    for (int i = 0; i < 44; i++) printf("%c", a1[i]);
    printf("\n");
    return 0;
}
```

![image-20260409152252109](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260409152252109.png)
