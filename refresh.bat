@echo off
:: 强制cmd用UTF-8编码，彻底解决中文乱码
chcp 65001 > nul
setlocal enabledelayedexpansion
echo ======================================
echo          博客自动部署中...
echo ======================================

:: 强制锁定博客根目录，避免路径错误
cd /d E:\blog

:: 【核心修复】所有hexo命令必须加call，否则脚本会提前退出
echo [1/3] 正在清理缓存...
call hexo clean
if %errorlevel% neq 0 (
    echo [错误] 清理缓存失败！请检查Hexo配置是否有语法错误
    pause
    exit /b 1
)
echo [成功] 缓存清理完成

echo.
echo [2/3] 正在生成静态文件...
call hexo g
if %errorlevel% neq 0 (
    echo [错误] 生成文件失败！请检查文章/主题配置是否有错误
    pause
    exit /b 1
)
echo [成功] 静态文件生成完成

echo.
echo [3/3] 正在部署到服务器...
call hexo d
if %errorlevel% neq 0 (
    echo [错误] 部署失败！请检查Git/部署配置是否正确
    pause
    exit /b 1
)

echo.
echo ======================================
echo          [成功] 部署完成！博客已自动更新
echo ======================================
timeout /t 3 /nobreak > nul
endlocal
exit /b 0