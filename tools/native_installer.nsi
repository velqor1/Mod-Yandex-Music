Unicode True
!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "..\build\windows\version.nsh"
SetCompressor /SOLID lzma
Name "Яндекс Музыка Mod"
OutFile "..\dist\YandexMusic-Mod-${MOD_VERSION}-win-x64.exe"
InstallDir "$LOCALAPPDATA\Programs\YandexMusic"
RequestExecutionLevel user
Icon "..\assets\icon.ico"
VIProductVersion "${MOD_VERSION}.0"
VIAddVersionKey "ProductName" "Яндекс Музыка Mod"
VIAddVersionKey "CompanyName" "velqor1"
VIAddVersionKey "LegalCopyright" "velqor1"
VIAddVersionKey "FileDescription" "Яндекс Музыка Mod ${MOD_VERSION}"
VIAddVersionKey "FileVersion" "${MOD_VERSION}"
VIAddVersionKey "ProductVersion" "${MOD_VERSION}"
!define MUI_ICON "..\assets\icon.ico"
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Russian"
Var Params
Var Parent
Var Extra
Var Result
Section
  InitPluginsDir
  SetOutPath "$PLUGINSDIR\payload"
  File /r "..\dist\staging\*"
  SetOutPath "$PLUGINSDIR"
  File "..\build\windows\InstallModUpdate.exe"
  ${GetParameters} $Params
  StrCpy $Parent "0"
  ClearErrors
  ${GetOptions} $Params "/PARENT=" $Parent
  ${If} ${Errors}
    StrCpy $Parent "0"
  ${EndIf}
  StrCpy $Extra ""
  ClearErrors
  ${GetOptions} $Params "/NOLAUNCH" $0
  ${IfNot} ${Errors}
    StrCpy $Extra "--no-launch"
  ${EndIf}
  ClearErrors
  ${GetOptions} $Params "/TEST" $0
  ${IfNot} ${Errors}
    StrCpy $Extra "$Extra --no-shell"
  ${EndIf}
  DetailPrint "Создание резервной копии и установка обновления..."
  nsExec::ExecToStack '"$PLUGINSDIR\InstallModUpdate.exe" "--target=$INSTDIR" "--payload=$PLUGINSDIR\payload" --parent=$Parent $Extra'
  Pop $Result
  Pop $0
  ${If} $Result != 0
    DetailPrint "$0"
    SetErrorLevel 1
    MessageBox MB_OK|MB_ICONSTOP "Не удалось обновить Музыку. Подробности и путь к резервной копии: $0" /SD IDOK
    Abort
  ${EndIf}
  DetailPrint "Мод обновлён. Аккаунт и настройки сохранены."
  SetErrorLevel 0
SectionEnd
