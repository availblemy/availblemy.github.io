@echo off
setlocal EnableDelayedExpansion

cd /d %~dp0

REM ============================================================
REM   === SET YOUR GITHUB TOKEN HERE ===
REM   Get token from: https://github.com/settings/tokens (need 'repo' scope)
REM ============================================================
set "GITHUB_TOKEN=***"

echo ============================================
echo   Hexo Blog - One-Click Deploy
echo ============================================
echo.

REM --- Step 1: Sync GitHub projects ---
echo [1/4] Syncing GitHub projects...
if defined GITHUB_TOKEN (
    if not "%GITHUB_TOKEN%"=="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" (
        node scripts/sync-projects.js
        if !errorlevel! neq 0 (
            echo [WARN] Project sync failed, skipping...
        )
    ) else (
        echo [INFO] Please edit refresh.bat and set your GITHUB_TOKEN.
    )
) else (
    echo [INFO] GITHUB_TOKEN not set, skip project sync.
)
echo.

REM --- Step 2: Push source to remote FIRST ---
echo [2/4] Pushing source to remote hexo branch...
git add -A
git diff --cached --quiet >nul 2>&1
if !errorlevel! equ 0 (
    echo       No source changes, skip commit.
) else (
    git commit -m "chore: update blog content"
    if !errorlevel! neq 0 (
        echo [ERROR] Git commit failed!
        pause
        exit /b 1
    )
    git push origin hexo
    if !errorlevel! neq 0 (
        echo [ERROR] Git push failed!
        pause
        exit /b 1
    )
    echo       Source pushed OK.
)
echo.

REM --- Step 3: Generate static site ---
echo [3/4] Generating static site...
call npx hexo clean
if !errorlevel! neq 0 (
    echo [ERROR] Clean failed!
    pause
    exit /b 1
)
call npx hexo generate
if !errorlevel! neq 0 (
    echo [ERROR] Generate failed!
    pause
    exit /b 1
)
echo       Static site generated.
echo.

REM --- Step 4: Deploy to GitHub Pages ---
echo [4/4] Deploying to GitHub Pages...
call npx hexo deploy
if !errorlevel! neq 0 (
    echo [ERROR] Deploy failed!
    pause
    exit /b 1
)
echo       Deployed OK.
echo.
echo ============================================
echo   All Done!
echo   URL: https://woshinext.top
echo ============================================
pause
