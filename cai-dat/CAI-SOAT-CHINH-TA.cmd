@echo off
rem Chi dung ky tu ASCII: tieng Viet co dau lam cmd doc lech dong.
rem Dat ca thu muc nay tren thu muc mang dung chung, roi chay tu do.
rem Neu chay qua o mang da gan chu (Z:), dien duong dan day du vao DUONG_MANG.
title Cai dat Soat Chinh Ta
setlocal
set "DUONG_MANG="
set "MA={7C1F4E2A-3B6D-4F58-9A17-5D2E8C0B6F31}"
set "KHOA=HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\%MA%"
set "CU=HKCU\Software\Microsoft\Office\16.0\Wef\Developer"
set "GUID=0d864eeb-0939-4159-8800-21a3426119d2"

if not defined DUONG_MANG set "DUONG_MANG=%~dp0"
if "%DUONG_MANG:~-1%"=="\" set "DUONG_MANG=%DUONG_MANG:~0,-1%"
set "CATALOG=%DUONG_MANG%\manifest"

echo.
echo   CAI ADD-IN SOAT CHINH TA CHO WORD
echo   (C) August87 - 0982722036
echo.

if not "%CATALOG:~0,2%"=="\\" (
  echo   [LOI] Tep nay phai chay tu thu muc mang dung chung, dang \\may-chu\thu-muc
  echo   Hay nho nguoi quan ly dat bo cai len thu muc mang.
  goto :ketthuc
)

if not exist "%CATALOG%\manifest.xml" (
  echo   [LOI] Khong thay manifest\manifest.xml trong thu muc mang.
  goto :ketthuc
)

tasklist /fi "imagename eq WINWORD.EXE" 2>nul | "%SystemRoot%\System32\find.exe" /i "WINWORD.EXE" >nul
if not errorlevel 1 (
  echo   [DUNG] Word dang mo. Hay luu tai lieu, dong het Word roi chay lai tep nay.
  goto :ketthuc
)

reg add "%KHOA%" /v Id /t REG_SZ /d "%MA%" /f >nul
if errorlevel 1 goto :loiga
reg add "%KHOA%" /v Url /t REG_SZ /d "%CATALOG%" /f >nul
if errorlevel 1 goto :loiga
reg add "%KHOA%" /v Flags /t REG_DWORD /d 1 /f >nul
if errorlevel 1 goto :loiga

rem Don duong cai cu da loi tu ban cap nhat Word 24-25/09/2026
reg delete "%CU%" /v "%GUID%" /f >nul 2>&1

echo   DA DANG KY XONG. Con mot buoc trong Word (lam 1 lan):
echo     1. Mo Word, tab Home, bam nut Add-ins
echo     2. Chon dong cuoi bang (More Add-ins hoac Get Add-ins)
echo     3. Chon muc SHARED FOLDER, bam Soat Chinh Ta, bam Add
goto :ketthuc

:loiga
echo   [LOI] Khong dang ky duoc voi Word. May co the bi chinh sach co quan chan.

:ketthuc
echo.
pause
