---
title: pe加载器
date: 2026-04-03 12:50:44
categories: 逆向基础
tags:
  - 逆向基础
featured: true
---

# peloader加载器

## 1.创建数组来保存pe文件中的内容

```c
HANDLE X1(char* x, unsigned char** pbuf)
{
	HANDLE X;
	DWORD FileSize;
	LPDWORD IFFileSize=0;
	LPDWORD IFReadFile=0;
	X = CreateFileA(x,
		GENERIC_READ,
		FILE_SHARE_READ | FILE_SHARE_WRITE,
		NULL,
		OPEN_EXISTING,
		FILE_ATTRIBUTE_NORMAL,
		NULL
	);
	DWORD err= GetLastError();
	if (X == INVALID_HANDLE_VALUE)
	{
		printf("未能打开文件%d", err);
		exit(0);
	}
	FileSize = GetFileSize(X, IFFileSize);
	if (IFFileSize == -1)
	{
		printf("未能得到文件尺寸");
		exit(0);
	}
    *pbuf =(unsigned char *)malloc(sizeof(unsigned char)* FileSize);
	ZeroMemory(*pbuf, FileSize);//清零
	ReadFile(X, *pbuf, FileSize, IFReadFile, NULL);
	if (IFReadFile == -1)
	{
		printf("未能复制文件");
		exit(0);
	}
}
```

## 2.申请内存将DOS头NT头写入

```c
PIMAGE_DOS_HEADER DOS = (PIMAGE_DOS_HEADER)pbuf;
PIMAGE_NT_HEADERS64 NT = (PIMAGE_NT_HEADERS64)(pbuf + DOS->e_lfanew);
DWORD SizeOfImage = NT->OptionalHeader.SizeOfImage;
LPVOID Alloc;
if (NT->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_BASERELOC].VirtualAddress != 0)
Alloc = VirtualAlloc(NULL, SizeOfImage, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
else
Alloc = VirtualAlloc(NT->OptionalHeader.ImageBase, SizeOfImage, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
ZeroMemory(Alloc, SizeOfImage);
CopyMemory(Alloc, pbuf, NT->OptionalHeader.SizeOfHeaders);//申请dos，nt空间
```

## 3.将节区循环写入申请内存

```c
DWORD SectionNumber = NT->FileHeader.NumberOfSections;
for (DWORD n=0; n < SectionNumber; n++)//复制节区
{
	PIMAGE_SECTION_HEADER SectionHead = (PIMAGE_SECTION_HEADER)((char*)NT+sizeof(IMAGE_NT_HEADERS64)+ sizeof(IMAGE_SECTION_HEADER)*n);
	if (SectionHead->PointerToRawData!=0)//.bss节区（需要初始化）
	CopyMemory(SectionHead->VirtualAddress + (PCHAR)Alloc, pbuf + SectionHead->PointerToRawData, SectionHead->SizeOfRawData);
	else
	{
		ZeroMemory(SectionHead->VirtualAddress + (PCHAR)Alloc, SectionHead->Misc.VirtualSize);//清零
	}
}
```

[^节区]: 包括了IAT,INT,代码块，数据块等

## 4.加载重定位表

```c
	if (NT->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_BASERELOC].VirtualAddress != 0)
	{
		PIMAGE_BASE_RELOCATION ReLoc = (PIMAGE_BASE_RELOCATION)(NT->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_BASERELOC].VirtualAddress + (PCHAR)Alloc);
		while (ReLoc->SizeOfBlock != 0)
		{
			PCHAR ReV = ReLoc->VirtualAddress + (PCHAR)Alloc;//每页的虚拟地址
			int NumberOfBlock = (ReLoc->SizeOfBlock - 8) / 2;//每页有多少需要修改的值
			for (int n = 0; n < NumberOfBlock; n++)
			{
				PWORD ChangByte = (PWORD)(ReLoc + 1);
				char Type = ChangByte[n] >> 12;//获得标志位
				if (Type == 10)
				{
					PDWORD64 Offest = (PDWORD64*)((ChangByte[n] & 0xfff) + ReV);//这页当中需要修改的具体位置
					*Offest = *Offest + (ULONGLONG)Alloc - NT->OptionalHeader.ImageBase;//加上基址
				}
			}
			ReLoc = (PIMAGE_SECTION_HEADER)((PCHAR)ReLoc + ReLoc->SizeOfBlock);//下一页
		}
	}
```

[^加载重定位表实际过程]: 当imagebase的值与实际地址的值不同时：1.遍历重定位表：将遍历后的虚拟地址加上基址加上TypeOffset数组中的偏移量可以得到它在内存中的地址2.然后将内存中的地址引用的值地址加上虚拟地址相减就将需要修改的引用地址纠正了（就是纠正相关引用变量的值）

相关加载重定位表的理解可以看这篇文章：https://blog.csdn.net/Apollon_krj/article/details/77370452

## 5.填充IAT表

```c
PIMAGE_IMPORT_DESCRIPTOR IntImport = (PIMAGE_IMPORT_DESCRIPTOR)(NT->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_IMPORT].VirtualAddress + (PCHAR)Alloc);
while (IntImport->Name!=0)//循环dll库
{
	HMODULE DllHandle;
	char DllName[50];
	strncpy(DllName,IntImport->Name+(PCHAR)Alloc,49);
	DllHandle = LoadLibraryA(DllName);
	PIMAGE_THUNK_DATA64	INT = IntImport->OriginalFirstThunk + (PCHAR)Alloc;
	PIMAGE_THUNK_DATA64	IAT = IntImport->FirstThunk + (PCHAR)Alloc;
	while (INT->u1.AddressOfData != 0)//循环dll中每个函数
	{
		if (INT->u1.Ordinal & IMAGE_ORDINAL_FLAG64)//通过序号查找函数
		{
			IAT->u1.AddressOfData = GetProcAddress(DllHandle, INT->u1.Ordinal);
		}	
		else//通过名字查找函数
		{
			PIMAGE_IMPORT_BY_NAME Fcn = (PIMAGE_IMPORT_BY_NAME)(INT->u1.AddressOfData + (PCHAR)Alloc);
			IAT->u1.AddressOfData = GetProcAddress(DllHandle, Fcn->Name);//填充IAT表
			int l = 1;
		}
		INT++;
		IAT++;
	}
	IntImport++;
}
```

[^填充IAT表实际过程]: 通过INT表找到函数并填充到IAT表中(先根据结构体变量Name加载对应的dll,读取dll的导出表，对应原程序的INT表，匹配dll导出函数的地址，返回其地址，贴在对应的IAT表上)

相关填充IAT表的理解可以看这篇文章：https://blog.csdn.net/qq_35289660/article/details/107329444

# 6.修改程序入口

```c
FARPROC EOP = (FARPROC)((LPBYTE)Alloc + NT->OptionalHeader.AddressOfEntryPoint);//修改程序入口点
EOP(); 

free(pbuf);
free(Alloc);
return 0;
```

# 汇总

peloader的加载原理就是将pe文件的内容读取后根据当中的VirtualAddress将内容分配到申请空间里，然后执行。（下面是所有代码）

```c
#define _CRT_SECURE_NO_WARNINGS
#include<stdio.h>
#include<windows.h>
#include <stdbool.h>
#include<winnt.h>

HANDLE X1(char* x, unsigned char** pbuf)
{
	HANDLE X;
	DWORD FileSize;
	LPDWORD IFFileSize=0;
	LPDWORD IFReadFile=0;
	X = CreateFileA(x,
		GENERIC_READ,
		FILE_SHARE_READ | FILE_SHARE_WRITE,
		NULL,
		OPEN_EXISTING,
		FILE_ATTRIBUTE_NORMAL,
		NULL
	);
	DWORD err= GetLastError();
	if (X == INVALID_HANDLE_VALUE)
	{
		printf("未能打开文件%d", err);
		exit(0);
	}
	FileSize = GetFileSize(X, IFFileSize);
	if (IFFileSize == -1)
	{
		printf("未能得到文件尺寸");
		exit(0);
	}
    *pbuf =(unsigned char *)malloc(sizeof(unsigned char)* FileSize);
	ZeroMemory(*pbuf, FileSize);
	ReadFile(X, *pbuf, FileSize, IFReadFile, NULL);
	if (IFReadFile == -1)
	{
		printf("未能复制文件");
		exit(0);
	}
}
VOID MAIN1(unsigned char* pbuf) {
	printf("这是个64进制文件\n");
	Sleep(500);
	PIMAGE_DOS_HEADER DOS = (PIMAGE_DOS_HEADER)pbuf;
	PIMAGE_NT_HEADERS64 NT = (PIMAGE_NT_HEADERS64)(pbuf + DOS->e_lfanew);
	DWORD SizeOfImage = NT->OptionalHeader.SizeOfImage;
	LPVOID Alloc;
	if (NT->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_BASERELOC].VirtualAddress != 0)
	Alloc = VirtualAlloc(NULL, SizeOfImage, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
	else
	Alloc = VirtualAlloc(NT->OptionalHeader.ImageBase, SizeOfImage, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
	ZeroMemory(Alloc, SizeOfImage);
	CopyMemory(Alloc, pbuf, NT->OptionalHeader.SizeOfHeaders);//申请dos，nt空间
	DWORD SectionNumber = NT->FileHeader.NumberOfSections;
	for (DWORD n=0; n < SectionNumber; n++)//复制节区
	{
		PIMAGE_SECTION_HEADER SectionHead = (PIMAGE_SECTION_HEADER)((char*)NT+sizeof(IMAGE_NT_HEADERS64)+ sizeof(IMAGE_SECTION_HEADER)*n);
		if (SectionHead->PointerToRawData!=0)//.bss特殊
		CopyMemory(SectionHead->VirtualAddress + (PCHAR)Alloc, pbuf + SectionHead->PointerToRawData, SectionHead->SizeOfRawData);
		else//.bss特殊
		{
			ZeroMemory(SectionHead->VirtualAddress + (PCHAR)Alloc, SectionHead->Misc.VirtualSize);
		}
	}
	if (NT->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_BASERELOC].VirtualAddress != 0)
	{
		PIMAGE_BASE_RELOCATION ReLoc = (PIMAGE_BASE_RELOCATION)(NT->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_BASERELOC].VirtualAddress + (PCHAR)Alloc);
		while (ReLoc->SizeOfBlock != 0)
		{
			PCHAR ReV = ReLoc->VirtualAddress + (PCHAR)Alloc;
			int NumberOfBlock = (ReLoc->SizeOfBlock - 8) / 2;
			for (int n = 0; n < NumberOfBlock; n++)
			{
				PWORD ChangByte = (PWORD)(ReLoc + 1);
				char Type = ChangByte[n] >> 12;
				//PDWORD64 Offest = 0;
				if (Type == 10)
				{
					// 找到目标地址
					// 修改目标地址的值：方法是原来的值+偏移
					PDWORD64 Offest = (PDWORD64*)((ChangByte[n] & 0xfff) + ReV);
					*Offest = *Offest + (ULONGLONG)Alloc - NT->OptionalHeader.ImageBase;
				}
			}
			ReLoc = (PIMAGE_SECTION_HEADER)((PCHAR)ReLoc + ReLoc->SizeOfBlock);
		}
	}
	PIMAGE_IMPORT_DESCRIPTOR IntImport = (PIMAGE_IMPORT_DESCRIPTOR)(NT->OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_IMPORT].VirtualAddress + (PCHAR)Alloc);
	while (IntImport->Name!=0)//引入表
	{
		HMODULE DllHandle;
		char DllName[50];
		strncpy(DllName,IntImport->Name+(PCHAR)Alloc,49);
		DllHandle = LoadLibraryA(DllName);
		PIMAGE_THUNK_DATA64	INT = IntImport->OriginalFirstThunk + (PCHAR)Alloc;
		PIMAGE_THUNK_DATA64	IAT = IntImport->FirstThunk + (PCHAR)Alloc;
		while (INT->u1.AddressOfData != 0)
		{
			if (INT->u1.Ordinal & IMAGE_ORDINAL_FLAG64)
			{
				IAT->u1.AddressOfData = GetProcAddress(DllHandle, INT->u1.Ordinal);
			}	
			else
			{
				PIMAGE_IMPORT_BY_NAME Fcn = (PIMAGE_IMPORT_BY_NAME)(INT->u1.AddressOfData + (PCHAR)Alloc);
				IAT->u1.AddressOfData = GetProcAddress(DllHandle, Fcn->Name);
				int l = 1;
			}
			INT++;
			IAT++;
		}
		IntImport++;
	}
	FARPROC EOP = (FARPROC)((LPBYTE)Alloc + NT->OptionalHeader.AddressOfEntryPoint);
	EOP(); 

	free(pbuf);
	free(Alloc);
	return 0;
}//64文件处理
int main(int argc,char* argv[])
{
	unsigned char* pbuf=NULL;
	X1(argv[1],&pbuf);
	PIMAGE_DOS_HEADER DOS = (PIMAGE_DOS_HEADER)pbuf;
	if (*(PWORD)pbuf == 0x5A4D)
		printf("这是个PE文件\n");
	WORD Magic = *(WORD*)(pbuf + (DOS->e_lfanew + 6 * 4));
	if (Magic == 0x20b)
		MAIN1(pbuf);
}
```

