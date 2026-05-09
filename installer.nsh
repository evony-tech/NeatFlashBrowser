!macro customInstall
  ; Create the folder FIRST
  CreateDirectory "$SMPROGRAMS\NeatFlashBrowser"
  
  ; Generate the shortcuts inside the new folder
  WriteIniStr "$SMPROGRAMS\NeatFlashBrowser\Neato3 Homepage.url" "InternetShortcut" "URL" "http://neato3.com/neatflashbrowser"
  CreateShortCut "$SMPROGRAMS\NeatFlashBrowser\Uninstall NeatFlashBrowser.lnk" "$INSTDIR\Uninstall NeatFlashBrowser.exe"
!macroend

!macro customUnInstall
  ; Clean up during uninstall
  Delete "$SMPROGRAMS\NeatFlashBrowser\Neato3 Homepage.url"
  Delete "$SMPROGRAMS\NeatFlashBrowser\Uninstall NeatFlashBrowser.lnk"
  RMDir "$SMPROGRAMS\NeatFlashBrowser"
!macroend