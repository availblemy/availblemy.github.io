---
title: 用调试器结构和替换iat表来对writefile函数来hook
date: 2026-04-13 14:51:54
categories: 逆向基础
tags:
  - Hook
  - IAT
featured: true
---

```c++
#include "pch.h"
typedef BOOL(WINAPI* WriteFileFuncPtr)(
    HANDLE       hFile,
    LPCVOID      lpBuffer,
    DWORD        nNumberOfBytesToWrite,
    LPDWORD      lpNumberOfBytesWritten,
    LPOVERLAPPED lpOverlapped
    );

// 全局变量：保存原始WriteFile函数地址（使用正确的函数指针类型）
PROC proc = nullptr;
BOOL WINAPI procnew(
    HANDLE       hFile,   
    LPCVOID      lpBuffer,    
    DWORD        nNumberOfBytesToWrite, 
    LPDWORD      lpNumberOfBytesWritten, 
    LPOVERLAPPED lpOverlapped  
);
BOOL Hook_iat(LPCSTR DllName, WriteFileFuncPtr proc, WriteFileFuncPtr procnew);
BOOL APIENTRY DllMain( HMODULE hModule,DWORD  ul_reason_for_call,LPVOID lpReserved)
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        MessageBoxA(NULL, "WriteFile Hook 成功！", "DLL 注入提示", MB_OK | MB_ICONINFORMATION);
        proc = GetProcAddress(GetModuleHandleA("kernel32.dll"), "WriteFile");
        Hook_iat("kernel32.dll", (WriteFileFuncPtr)proc, procnew);//提取原本的writefile函数
        break;
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
        break;
    case DLL_PROCESS_DETACH:
        Hook_iat("kernel32.dll", procnew, (WriteFileFuncPtr)proc);
        break;
    }
    return TRUE;
}
BOOL WINAPI procnew(HANDLE hFile, LPCVOID lpBuffer, DWORD nNumberOfBytesToWrite, LPDWORD lpNumberOfBytesWritten, LPOVERLAPPED lpOverlapped)//编写钩子函数
{
    char* newBuffer = new char[nNumberOfBytesToWrite];
    memcpy(newBuffer, lpBuffer, nNumberOfBytesToWrite);

    for (int k = 0; k < nNumberOfBytesToWrite; k++)
    {
        if (97 <= newBuffer[k] && newBuffer[k] <= 122)
            newBuffer[k] -= 0x20; // 小写转大写
        else if (65 <= newBuffer[k] && newBuffer[k] <= 90)
            newBuffer[k] += 0x20; // 大写转小写
    }
    ((WriteFileFuncPtr)proc)(hFile, newBuffer, nNumberOfBytesToWrite, lpNumberOfBytesWritten, lpOverlapped);
    delete[] newBuffer;
    return TRUE;
    
};
BOOL Hook_iat(LPCSTR DllName, WriteFileFuncPtr proc, WriteFileFuncPtr procnew)
{
    HMODULE hMod;
    hMod = GetModuleHandleW(NULL);
    PBYTE pAddr = (PBYTE)hMod;
    IMAGE_NT_HEADERS64 NT = *(PIMAGE_NT_HEADERS64)(pAddr + *(DWORD*)&pAddr[0x3c]);
    PIMAGE_IMPORT_DESCRIPTOR Import = (PIMAGE_IMPORT_DESCRIPTOR)(NT.OptionalHeader.DataDirectory[IMAGE_DIRECTORY_ENTRY_IMPORT].VirtualAddress + pAddr);
    for (; Import->Name; Import++)
    {
        if (!_stricmp((const char*)(pAddr + (DWORD64)Import->Name), DllName))
        {
            PIMAGE_THUNK_DATA64 IAT = (PIMAGE_THUNK_DATA64)(Import->FirstThunk+ pAddr);
            for (; IAT->u1.Function;IAT++)
            {
                if (IAT->u1.Function == (DWORD64)proc)//找到iat表中write
                {
                    DWORD OldProtect;
                    VirtualProtect((LPVOID)&IAT->u1.Function, 4, PAGE_EXECUTE_READWRITE, &OldProtect);
                    IAT->u1.Function = (DWORD64)procnew;
                    VirtualProtect((LPVOID)&IAT->u1.Function, 4, OldProtect, &OldProtect);
                    return TRUE;
                }
            }
        }
    }
    return FALSE;
}

```



```c
#include<stdio.h>
#include<windows.h>
LPVOID proc;
DWORD int0=0,int3=0xcc;
main() {
	EnablePrivilege(SE_DEBUG_NAME, TRUE);
	DWORD PID;
    scanf_s("%d",&PID);
	DebugActiveProcess(PID);
	DEBUG_EVENT pe;
	while (WaitForDebugEvent(&pe, INFINITE))//等待调试
	{
		if (pe.dwDebugEventCode == CREATE_PROCESS_DEBUG_EVENT)
			hook1(&pe);//初次调试设置断点
		else if (pe.dwDebugEventCode == EXCEPTION_DEBUG_EVENT)
			hook2(&pe);//遇到断点修改内容
		else if(pe.dwDebugEventCode==EXIT_PROCESS_DEBUG_EVENT)
			break;
		ContinueDebugEvent(pe.dwProcessId, pe.dwThreadId, DBG_CONTINUE);
	}
}
BOOL hook1(LPDEBUG_EVENT pe)
{
	proc = GetProcAddress(GetModuleHandleA("Kernel32.dll"), "WriteFile");
	ReadProcessMemory(pe->u.CreateProcessInfo.hProcess, proc, &int0, sizeof(DWORD), NULL);//保存促使值
	WriteProcessMemory(pe->u.CreateProcessInfo.hProcess, proc, &int3, sizeof(DWORD), NULL);//设置断点
	return TRUE;
}
BOOL hook2(LPDEBUG_EVENT pe)
{
	if (pe->u.Exception.ExceptionRecord.ExceptionCode == EXCEPTION_BREAKPOINT)
	{
		if (pe->u.Exception.ExceptionRecord.ExceptionAddress == proc)
		{
			HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, pe->dwProcessId);
			HANDLE hThread = OpenThread(
				THREAD_SUSPEND_RESUME | THREAD_GET_CONTEXT | THREAD_SET_CONTEXT,
				FALSE, pe->dwThreadId
			);
			WriteProcessMemory(hProcess, proc, &int0, sizeof(DWORD), NULL);//恢复断点
			CONTEXT ctx;
			ctx.ContextFlags = CONTEXT_CONTROL | CONTEXT_INTEGER;
			if(!GetThreadContext(hThread, &ctx))
				printf("true%d",GetLastError());//获得寄存器值
			printf("\nRCX (hFile): 0x%016llX\n", ctx.Rcx);
			printf("RDX (lpBuffer): 0x%016llX\n", ctx.Rdx);
			printf("R8 (nNumberOfBytesToWrite): 0x%016llX\n", ctx.R8);//当时那上下文的时候老是拿不到
			PBYTE Buffer;
			PBYTE pRemoteData = ctx.Rdx;
			DWORD pRemoteDataLen = ctx.R8;
			Buffer = malloc(pRemoteDataLen + 1);
			memset(Buffer, 0, pRemoteDataLen + 1);
			if (!ReadProcessMemory(hProcess, (LPVOID)pRemoteData, Buffer, pRemoteDataLen, NULL))
			{
				printf("read memory wrong!%x",GetLastError());
			}
			for (int k = 0; k < pRemoteDataLen; k++)
			{
				if(97<=Buffer[k]&&Buffer[k]<=122)
				Buffer[k] -= 0x20;//大写转小写
				else if(65<= Buffer[k] && Buffer[k] <= 90)
				Buffer[k] += 0x20;
			}
			WriteProcessMemory(hProcess, (LPVOID)pRemoteData, Buffer, pRemoteDataLen, NULL);
			free(Buffer);
			ctx.Rip = (DWORD64)proc;
			SetThreadContext(hThread, &ctx);//纠正运行地址
			ContinueDebugEvent(pe->dwProcessId, pe->dwThreadId, DBG_CONTINUE);
			WriteProcessMemory(pe->u.CreateProcessInfo.hProcess, proc, &int3, sizeof(DWORD), NULL);
			return TRUE;
		}
    }
	return FALSE;
}
BOOL EnablePrivilege(LPCTSTR Privilege, BOOL enable)
{
	LUID Luid;
	TOKEN_PRIVILEGES TokenPrivileges;
	HANDLE Token;
	OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, &Token);
	LookupPrivilegeValueA(NULL, Privilege, &Luid);
	TokenPrivileges.PrivilegeCount = 1;
	TokenPrivileges.Privileges[0].Luid = Luid;
	TokenPrivileges.Privileges[0].Attributes = enable;
	if(!AdjustTokenPrivileges(Token, FALSE, &TokenPrivileges, sizeof(TOKEN_PRIVILEGES), NULL, NULL))
		printf("false%d", GetLastError());
}
```

这两个实现的效果都是在文件保存后中的英文字母大小写互换
