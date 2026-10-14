@echo off
setlocal
chcp 65001 >nul 2>&1

cd /d %~dp0

echo ============================================
echo   Hexo Blog - 一键更新部署
echo ============================================
echo.

REM ── Step 1: 同步 GitHub 项目到 source/projects/index.md ──
echo [1/4] 同步 GitHub 项目列表...
if defined GITHUB_TOKEN (
    node scripts/sync-projects.js
) if errorlevel 1 (
    echo [WARN] 项目同步失败（未设置 GITHUB_TOKEN 或 API 错误），跳过...
    echo        如需同步项目，请设置环境变量 GITHUB_TOKEN
)
echo.

REM ── Step 2: 推送源码到远程 hexo 分支（先推源码！） ──
echo [2/4] 推送源码到远程 hexo 分支...
git add -A
git diff --cached --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo       源码无变化，跳过提交。
) else (
    git commit -m "chore: update blog content"
    if %errorlevel% neq 0 (
        echo [ERROR] Git commit 失败！
        pause
        exit /b 1
    )
    git push origin hexo
    if %errorlevel% neq 0 (
        echo [ERROR] Git push 失败！请检查网络或权限。
        pause
        exit /b 1
    )
    echo       ✅ 源码已推送。
)
echo.

REM ── Step 3: 生成静态站点 ──
echo [3/4] 生成静态站点...
call npx hexo clean
if %errorlevel% neq 0 (
    echo [ERROR] Clean 失败！
    pause
    exit /b 1
)
call npx hexo generate
if %errorlevel% neq 0 (
    echo [ERROR] Generate 失败！
    pause
    exit /b 1
)
echo       ✅ 静态站已生成。
echo.

REM ── Step 4: 部署到 GitHub Pages（push 到 main 分支） ──
echo [4/4] 部署到 GitHub Pages...
call npx hexo deploy
if %errorlevel% neq 0 (
    echo [ERROR] Deploy 失败！
    pause
    exit /b 1
)
echo       ✅ 已部署。
echo.
echo ============================================
echo   全部完成！🎉
echo   网址：https://woshinext.top
echo ============================================
pause
