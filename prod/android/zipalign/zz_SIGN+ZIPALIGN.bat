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
echo - Please type the Path to Jarsigner
echo E.G. C:\Program Files\Java\JDK1.6.0_23\bin
set JavaPath="C:\Program Files\Java\jdk1.8.0_20\bin"
echo.
echo Please type the name of the UNSIGNED app with ".apk"
set UnsignedApp=CordovaApp-release-unsigned.apk
echo.
echo Please type the desired name of the Signed App with ".apk"
echo (Different to Unsinged App Name) - 
set SignedApp=PhotofiPhotographer.apk
echo.
echo Please type the name of the .keystore Key
set keystore=my-release-key.keystore
echo.
echo The "Alias_Name" of your Jarsigner Certificate
set alias_name=alias_name
echo.
echo %JavaPath%
echo Copying .Keystore to Java Path...
COPY %Keystore% %JavaPath%
echo Copying .apk to Java Path...
COPY %UnsignedApp% %JavaPath%
echo.
cd %JavaPath%
echo Starting Signing Procedure...
echo.
jarsigner.exe -verbose -keystore %keystore% %UnsignedApp% %alias_name%
jarsigner.exe -verify %UnsignedApp%
echo.
echo Signed - If No Errors Above
echo.
echo Do You Want To Delete .Keystore Key From Java Path [y/n]
set /p INPUT=
IF %INPUT%==y DEL %keystore% 
IF %INPUT%==n goto:rename
:rename
Pause
echo.
echo Renaming to Signed App Name...
ren %UnsignedApp% %SignedApp%
echo.
echo Moving Signed App Back to Script Directory...
MOVE %SignedApp% "%SUBDIR%/%SignedApp%"
echo.
cd %SUBDIR%
IF EXIST "%SUBDIR%/zipaligned-%SignedApp%" goto:label1
IF NOT EXIST "%SUBDIR%/zipaligned-%SignedApp%" goto:label2
:label1
echo zipaligned-%SignedApp% Already exists, Do You Want To Delete and Continue [y/n]
set /p INPUT1=
if %INPUT1%==y DEL "%SUBDIR%/zipaligned-%SignedApp%" goto label2
if %INPUT1%==n goto:end
:label2
echo Ready to Zipalign...
pause
zipalign -v 4 %SignedApp% zipaligned-%SignedApp%
echo.
echo If No Errors Above then has been created in the Sign+Ziplalign-Folder
echo With the name zipaligned-%SignedApp% 
echo.
echo Moving %UnsignedApp% to OLD Directory.
MOVE %UnsignedApp% "%SUBDIR%/OLD/%UnsignedApp%"
echo.
echo Moving %SignedApp% to OLD Directory.
MOVE %SignedApp% "%SUBDIR%/OLD/%SignedApp%"
echo.
goto EOF
:end
echo File Not Zipaligned
pause
:EOF
pause

