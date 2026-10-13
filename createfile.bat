@echo off
setlocal

set /p title="Input post title: "
if "%title%"=="" (
    echo Title cannot be empty!
    pause
    exit /b 1
)

cd /d %~dp0
call npx hexo new "%title%"
if %errorlevel% neq 0 (
    echo Failed to create post!
    pause
    exit /b 1
)

for /f "delims=" %%f in ('dir /b /o-d source\_posts\*.md 2^>nul') do (
    start "" "source\_posts\%%f"
    goto :done
)

:done
echo Post created! [OK]
pause
