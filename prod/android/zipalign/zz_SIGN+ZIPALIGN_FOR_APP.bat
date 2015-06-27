@ECHO off
ECHO Current Path = "%~dp0"
set SUBDIR=%~dp0
cd %SUBDIR%
echo.
echo Script to Sign and Zipalign .apk for Market Release.
echo By Mattmanwrx - www.mattman.org
echo.
echo ***!THIS SCRIPT WON'T RUN WITHOUT ADMINISTRATIVE RIGHTS!***
echo.
echo Copying .Keystore to Java Path...
COPY my-release-key.keystore "C:\Program Files\Java\jdk1.8.0_20\bin"
echo Copying .apk to Java Path...
COPY Photofi-release-unsigned.apk "C:\Program Files\Java\jdk1.8.0_20\bin"
echo.
cd C:\Program Files\Java\jdk1.8.0_20\bin
echo Starting Signing Procedure...
echo.
jarsigner -verbose -keystore my-release-key.keystore Photofi-release-unsigned.apk alias_name
jarsigner -verify Photofi-release-unsigned.apk
echo.
echo Signed - If No Errors Above
echo.
echo Do You Want To Delete .Keystore Key From Java Path [y/n]
set /p INPUT=
IF %INPUT%==y DEL my-release-key.keystore 
IF %INPUT%==n goto:rename
:rename
Pause
echo.
echo Renaming to Signed App Name...
ren Photofi-release-unsigned.apk Photofi.apk
echo.
echo Moving Signed App Back to Script Directory...
MOVE Photofi.apk "%SUBDIR%/Photofi.apk"
echo.
cd %SUBDIR%
IF EXIST "%SUBDIR%/zipaligned-Photofi.apk" goto:label1
IF NOT EXIST "%SUBDIR%/zipaligned-Photofi.apk" goto:label2
:label1
echo zipaligned-Photofi.apk Already exists, Do You Want To Delete and Continue [y/n]
set /p INPUT1=
if %INPUT1%==y DEL "%SUBDIR%/zipaligned-Photofi.apk" goto label2
if %INPUT1%==n goto:end
:label2
echo Ready to Zipalign...
pause
zipalign -v 4 Photofi.apk zipaligned-Photofi.apk
echo.
echo If No Errors Above then has been created in the Sign+Ziplalign-Folder
echo With the name zipaligned-Photofi.apk 
echo.
echo Moving Photofi-release-unsigned.apk to OLD Directory.
MOVE Photofi-release-unsigned.apk "%SUBDIR%/OLD/Photofi-release-unsigned.apk"
echo.
echo Moving Photofi.apk to OLD Directory.
MOVE Photofi.apk "%SUBDIR%/OLD/Photofi.apk"
echo.
goto EOF
:end
echo File Not Zipaligned
pause
:EOF
pause

