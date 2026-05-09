!macro customInstall
  ; 1. Folder & Shortcut Setup
  CreateDirectory "$SMPROGRAMS\NeatFlashBrowser"
  WriteIniStr "$SMPROGRAMS\NeatFlashBrowser\Neato3 Homepage.url" "InternetShortcut" "URL" "http://neato3.com/neatflashbrowser"
  CreateShortCut "$SMPROGRAMS\NeatFlashBrowser\Uninstall NeatFlashBrowser.lnk" "$INSTDIR\Uninstall NeatFlashBrowser.exe"

  ; 2. StartMenuInternet Registration (The "I am a Browser" Key)
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser" "" "NeatFlashBrowser"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\DefaultIcon" "" "$INSTDIR\NeatFlashBrowser.exe,0"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\InstallInfo" "ReinstallCommand" '"$INSTDIR\NeatFlashBrowser.exe" --make-default-browser'
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\InstallInfo" "HideIconsCommand" '"$INSTDIR\NeatFlashBrowser.exe" --hide-icons'
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\InstallInfo" "ShowIconsCommand" '"$INSTDIR\NeatFlashBrowser.exe" --show-icons'
  WriteRegDWORD HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\InstallInfo" "IconsVisible" 1

  ; 3. Capabilities (Claiming both to show up in the 'Web Browser' list)
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\Capabilities" "ApplicationName" "NeatFlashBrowser"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\Capabilities" "ApplicationDescription" "Secure Flash Browser for Botfather"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\Capabilities" "ApplicationIcon" "$INSTDIR\NeatFlashBrowser.exe,0"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\Capabilities\URLAssociations" "http" "NeatFlashBrowserHTM"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\Capabilities\URLAssociations" "https" "NeatFlashBrowserHTM"
  
  ; 4. Define the Action
  WriteRegStr HKCU "Software\Classes\NeatFlashBrowserHTM" "" "Neat Flash Browser HTML Document"
  WriteRegStr HKCU "Software\Classes\NeatFlashBrowserHTM" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\NeatFlashBrowserHTM\DefaultIcon" "" "$INSTDIR\NeatFlashBrowser.exe,0"
  WriteRegStr HKCU "Software\Classes\NeatFlashBrowserHTM\shell\open\command" "" '"$INSTDIR\NeatFlashBrowser.exe" "%1"'
  
  ; 5. Final Master Registration
  WriteRegStr HKCU "Software\RegisteredApplications" "NeatFlashBrowser" "Software\Clients\StartMenuInternet\NeatFlashBrowser\Capabilities"
  WriteRegStr HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser\shell\open\command" "" '"$INSTDIR\NeatFlashBrowser.exe"'
!macroend

!macro customUnInstall
  Delete "$SMPROGRAMS\NeatFlashBrowser\Neato3 Homepage.url"
  Delete "$SMPROGRAMS\NeatFlashBrowser\Uninstall NeatFlashBrowser.lnk"
  RMDir "$SMPROGRAMS\NeatFlashBrowser"

  DeleteRegKey HKCU "Software\Clients\StartMenuInternet\NeatFlashBrowser"
  DeleteRegKey HKCU "Software\Classes\NeatFlashBrowserHTM"
  DeleteRegValue HKCU "Software\RegisteredApplications" "NeatFlashBrowser"
!macroend