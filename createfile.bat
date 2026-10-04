@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion
cd /d E:\blog

echo.
echo ======================================
echo        Hexo 自动新建文章
echo ======================================
echo.

:: 1. 输入文章标题，非空校验
set "title="
set /p "title=请输入文章标题: "
if "%title%"=="" (
    echo [错误] 标题不能为空！
    pause
    exit /b 1
)
echo [成功] 已输入标题: %title%
echo.

:: 2. 分类选择
echo ======================================
echo        参考
echo ======================================
echo categories: 逆向基础
echo categories: 自动化逆向
echo categories: 进阶攻防
echo categories: question
echo categories: 样本分析
echo categories: 内核驱动
echo ======================================
:: ==============================================
:: 【第一步】先执行 hexo new 纯创建文件
:: ==============================================
echo [步骤1/2] 正在调用Hexo创建文章...
call hexo new "%title%"
if !errorlevel! neq 0 (
    echo [错误] Hexo创建文件失败！
    pause
    exit /b 1
)
echo [成功] Hexo文件创建完成
echo.

:: ==============================================
:: 【第二步】定位刚生成的文件
:: ==============================================
echo [步骤2/2] 正在定位并修改文章...
set "md_file="
set "posts_dir=source\_posts"
:: 取最新创建的md文件，100%匹配刚生成的文章
for /f "delims=" %%a in ('dir /b /o-d /a-d "!posts_dir!\*.md" 2^>nul') do (
    set "md_file=!posts_dir!\%%a"
    goto :find_done
)
:find_done

if not exist "!md_file!" (
    echo [错误] 未找到文章文件！
    pause
    exit /b 1
)
echo ======================================
echo        [成功] 全部操作完成！
echo ======================================
start "" "!md_file!"
pause
endlocal
    )
) > "!temp_file!"

:: ==============================================