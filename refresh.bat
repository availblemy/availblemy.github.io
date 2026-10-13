@echo off
setlocal

cd /d %~dp0

echo ============================================
echo   Hexo Auto Deploy
echo ============================================
echo.

echo [1/3] Cleaning...
call npx hexo clean
if %errorlevel% neq 0 (
    echo Clean failed!
    pause
    exit /b 1
)
echo [OK] Cleaned
echo.

echo [2/3] Generating...
call npx hexo generate
if %errorlevel% neq 0 (
    echo Generate failed!
    pause
    exit /b 1
)
echo [OK] Generated
echo.

echo [3/4] Deploying to GitHub Pages...
call npx hexo deploy
if %errorlevel% neq 0 (
    echo Deploy failed!
    pause
    exit /b 1
)
echo [OK] Deployed
echo.
echo [4/4] Pushing source code to remote...
git add -A
git diff --cached --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo No changes to commit, skip.
) else (
    git commit -m "chore: update blog content"
    if %errorlevel% neq 0 (
        echo Commit failed!
        pause
        exit /b 1
    )
    git push
    if %errorlevel% neq 0 (
        echo Push failed!
        pause
        exit /b 1
    )
    echo [OK] Pushed to remote
)
echo.
echo ============================================
echo   Done! https://woshinext.top
echo ============================================
pause
