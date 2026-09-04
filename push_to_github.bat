@echo off
title Push to GitHub
echo =======================================================
echo Pushing A11y Remediation Engine to GitHub...
echo Target: https://github.com/sritheanmathy-spec/proj.git
echo =======================================================
cd /d "%~dp0"
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Code successfully pushed to GitHub!
    echo Check your repository at:
    echo https://github.com/sritheanmathy-spec/proj
) else (
    echo [ERROR] If you see an authentication error, please sign in or use a GitHub Personal Access Token.
)
echo.
pause
