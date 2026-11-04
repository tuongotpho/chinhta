@echo off
rem Chi dung ky tu ASCII, xem ghi chu trong CAI-SOAT-CHINH-TA.cmd
title Go Soat Chinh Ta
setlocal
set "MA={7C1F4E2A-3B6D-4F58-9A17-5D2E8C0B6F31}"
set "GUID=0d864eeb-0939-4159-8800-21a3426119d2"

echo.
echo   GO ADD-IN SOAT CHINH TA
echo   (C) August87 - 0982722036
echo.

reg delete "HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\%MA%" /f >nul 2>&1
reg delete "HKCU\Software\Microsoft\Office\16.0\Wef\Developer" /v "%GUID%" /f >nul 2>&1
if exist "%USERPROFILE%\SoatChinhTa" rmdir /s /q "%USERPROFILE%\SoatChinhTa"

echo   DA GO XONG. Dong het Word roi mo lai.
echo.
pause
