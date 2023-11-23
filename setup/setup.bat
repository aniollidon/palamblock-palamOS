@echo off

:: ID de l'extensió
set "extension_id=1"

:: Valor de la clau
set "extension_value=djdihbjaljagohkmfbjhacghcdplkhlh;https://clients2.google.com/service/update2/crx"
set "extension_value_edge=djdihbjaljagohkmfbjhacghcdplkhlh;https://edge.microsoft.com/extensionwebstorebase/v1/crx"

:: Comprovar si la clau ja existeix per al Chrome
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist\%extension_id%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per al Chrome
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v "%extension_id%" /t REG_SZ /d "%extension_value%" /f
)

:: Comprovar si la clau ja existeix per al Brave
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\BraveSoftware\Brave\ExtensionInstallForcelist\%extension_id%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per al Brave
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\BraveSoftware\Brave\ExtensionInstallForcelist" /v "%extension_id%" /t REG_SZ /d "%extension_value%" /f
)

:: Comprovar si la clau ja existeix per a l'Edge
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallForcelist\%extension_id%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per a l'Edge
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallForcelist" /v "%extension_id%" /t REG_SZ /d "%extension_value_edge%" /f
)

:: Comprovar si la clau ja existeix per a Vivaldi
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Vivaldi\ExtensionInstallForcelist\%extension_id%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per a Vivaldi
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Vivaldi\ExtensionInstallForcelist" /v "%extension_id%" /t REG_SZ /d "%extension_value%" /f
)

:: Comprovar si la clau ja existeix per a Chromium
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Chromium\ExtensionInstallForcelist\%extension_id%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per a Chromium
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Chromium\ExtensionInstallForcelist" /v "%extension_id%" /t REG_SZ /d "%extension_value%" /f
)

:: Comprovar si la clau ja existeix per a Avast Secure Browser
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\AVAST Software\Browser\ExtensionInstallForcelist\%extension_id%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per a Chromium
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\AVAST Software\Browser\ExtensionInstallForcelist" /v "%extension_id%" /t REG_SZ /d "%extension_value%" /f
)

:: Desactivar la navegació privada en Chrome
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome" /v "IncognitoModeAvailability" /t REG_DWORD /d "1" /f

:: Desactivar la navegació privada en Brave
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\BraveSoftware\Brave" /v "IncognitoModeAvailability" /t REG_DWORD /d "1" /f

:: Desactivar la navegació privada en Edge
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge" /v "InPrivateModeAvailability" /t REG_DWORD /d "1" /f

:: Desactivar la navegació privada a Vivaldi
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Vivaldi" /v "IncognitoModeAvailability" /t REG_DWORD /d "1" /f

:: Desactivar la navegació privada a Chromium
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Chromium" /v "IncognitoModeAvailability" /t REG_DWORD /d "1" /f

:: Desactivar la navegació privada a Avast Secure Browser
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\AVAST Software\Browser" /v "IncognitoModeAvailability" /t REG_DWORD /d "1" /f

:: pausa l'script fins a l'interecció de l'usuari
pause


:: Sortir de l'script
exit /b 0
