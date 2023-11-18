@echo off

:: ID de l'extensió
set "extension_pos=1"

:: Valor de la clau
set "extension_value=fiphpbkbalgfpgdnblppmpbfdbbcancf;https://clients2.google.com/service/update2/crx"

:: Comprovar si la clau ja existeix per al Chrome
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist\%extension_pos%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per al Chrome
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v "%extension_pos%" /t REG_SZ /d "%extension_value%" /f
)

:: Comprovar si la clau ja existeix per al Brave
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\BraveSoftware\Brave\ExtensionInstallForcelist\%extension_pos%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per al Brave
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\BraveSoftware\Brave\ExtensionInstallForcelist" /v "%extension_pos%" /t REG_SZ /d "%extension_value%" /f
)

:: Comprovar si la clau ja existeix per a l'Edge
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallForcelist\%extension_pos%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per a l'Edge
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallForcelist" /v "%extension_pos%" /t REG_SZ /d "%extension_value%" /f
)

:: Comprovar si la clau ja existeix per a Vivaldi
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Vivaldi\ExtensionInstallForcelist\%extension_pos%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per a Vivaldi
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Vivaldi\ExtensionInstallForcelist" /v "%extension_pos%" /t REG_SZ /d "%extension_value%" /f
)

:: Comprovar si la clau ja existeix per a Chromium
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Chromium\ExtensionInstallForcelist\%extension_pos%" >nul 2>&1
if %errorlevel% neq 0 (
    :: Afegir la clau ExtensionInstallForcelist per a Chromium
    reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Chromium\ExtensionInstallForcelist" /v "%extension_pos%" /t REG_SZ /d "%extension_value%" /f
)

:: Desactivar la navegació privada en Chrome
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome" /v "IncognitoModeAvailability" /t REG_DWORD /d "1" /f

:: Desactivar el guest mode en Chrome
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome" /v "BrowserGuestModeEnabled" /t REG_DWORD /d "0" /f

:: Desactivar la navegació privada en Brave
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\BraveSoftware\Brave" /v "IncognitoModeAvailability" /t REG_DWORD /d "1" /f

:: Desactivar la navegació privada en Edge
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge" /v "InPrivateModeAvailability" /t REG_DWORD /d "1" /f

:: Desactivar la navegació privada en Vivaldi
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Vivaldi" /v "IncognitoModeAvailability" /t REG_DWORD /d "1" /f

:: Desactivar la navegació privada en Chromium
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Chromium" /v "IncognitoModeAvailability" /t REG_DWORD /d "1" /f

:: Sortir de l'script
exit /b 0
