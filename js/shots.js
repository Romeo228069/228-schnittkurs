/* Echte Screenshots aus DaVinci Resolve Studio 21.1 (Demo-Projekt mit neutralem Material).
   Punkte: [x, y, Breite, Höhe] in Prozent des Bildes, Texte je Sprache.
   steps/tips/why ersetzen in diesen Lektionen die längeren Texte aus data.js, damit das Bild führt. */
export const IMG = {
  project_manager: [1600, 1125], settings_master: [1040, 1080], settings_proxy: [1040, 1080], new_timeline: [1000, 576],
  media_page: [1600, 952], edit_full: [1600, 952], inspector: [1600, 952], effects_titles: [1600, 952], effects_transitions: [1600, 952],
  title_timeline: [1600, 952], retime: [1600, 952], fusion_page: [1600, 952], fairlight_page: [1600, 952], deliver_page: [1600, 952],
  proxy_generator: [1400, 1009], color_page: [1600, 1003], cut_page: [1600, 1003], subtitles: [1600, 1003], vertical: [1600, 1003], multicam: [1600, 1003],
  prefs_ui: [946, 800], prefs_save: [946, 800]
};

const TB = 48.8, TH = 3.4; // Werkzeugleiste der Edit Page

export const SHOTS = {
  l4: {
    why: { de: "Bevor der erste Clip reinkommt, stehen Projekt, Auflösung und Bildrate.", en: "Before the first clip comes in, project, resolution and frame rate are set." },
    shots: [
      { img: "project_manager", title: { de: "Project Manager", en: "Project Manager" }, spots: [
        [[69, 92, 17, 6], "New Project: neues Projekt, gleicher Name wie der Ordner.", "New Project: new project, same name as the folder."],
        [[40, 16, 28, 4], "Dein Projekt steht in der Liste. Doppelklick öffnet es.", "Your project shows up in the list. Double click opens it."],
        [[2, 18, 34, 7], "Local Database: hier liegen die Projekte auf deinem Rechner.", "Local Database: this is where projects live on your computer."]
      ] },
      { img: "settings_master", title: { de: "Project Settings, Master Settings", en: "Project Settings, Master Settings" }, spots: [
        [[30, 7, 34, 4], "Timeline Resolution: 1920 × 1080 für Full HD, 3840 × 2160 für 4K.", "Timeline Resolution: 1920 × 1080 for Full HD, 3840 × 2160 for 4K."],
        [[42, 12, 19, 3], "Use vertical resolution: Hochformat für Reels und TikTok.", "Use vertical resolution: vertical video for Reels and TikTok."],
        [[29, 26.5, 34, 3.5], "Timeline Frame Rate: genau wie dein Material. Handy meist 30, Kamera in Deutschland oft 25. Später nicht mehr änderbar.", "Timeline Frame Rate: exactly like your footage. Phones usually 30, cameras in Germany often 25. Can't be changed later."],
        [[29, 35.5, 34, 4], "Playback Frame Rate: derselbe Wert.", "Playback Frame Rate: the same value."],
        [[86, 94.5, 13, 4.5], "Save. Danach das Projekt mit [[cmd+S]] sichern.", "Save. Then save the project with [[cmd+S]]."]
      ] }
    ],
    steps: { de: ["Project Manager öffnen: [[shift+1]] oder das Haus unten rechts.", "Project Settings öffnen: [[shift+9]] oder das Zahnrad unten rechts."], en: ["Open the Project Manager: [[shift+1]] or the house icon bottom right.", "Open Project Settings: [[shift+9]] or the gear bottom right."] },
    tips: { de: ["Die Bildrate deiner Clips steht in der Listenansicht des Media Pools in der Spalte FPS. Diesen Wert nimmst du für die Timeline.", "Mit 60 gedreht? Trotzdem eine 30er Timeline. Dann kannst du später sauber auf halbe Geschwindigkeit gehen.", "Fragt Resolve beim ersten Import, ob es die Bildrate an die Clips anpassen soll: Change, wenn das wirklich die Bildrate deines Materials ist."], en: ["Your clips' frame rate is in the FPS column of the Media Pool list view. Use that value for the timeline.", "Shot at 60? Still use a 30 timeline. Then you can cleanly go to half speed later.", "If Resolve asks on the first import whether to match the frame rate to the clips: Change, if that really is your footage's frame rate."] }
  },
  l5: {
    why: { de: "In der Media Page holst du die Clips ins Projekt und sortierst sie in Bins.", en: "On the Media page you bring clips into the project and sort them into bins." },
    shots: [
      { img: "media_page", title: { de: "Media Page", en: "Media page" }, spots: [
        [[0, 4, 14.5, 36], "Media Storage: deine Festplatten. Hier zum Projektordner navigieren.", "Media Storage: your drives. Navigate to the project folder here."],
        [[15, 5, 23, 18], "Rechtsklick auf 01_Footage > Add Folder and SubFolders into Media Pool (Create Bins).", "Right click 01_Footage > Add Folder and SubFolders into Media Pool (Create Bins)."],
        [[0, 52, 14.5, 17], "Bins: Footage, Ton, Musik, Timelines. Neuer Bin mit [[shift+cmd+N]].", "Bins: Footage, Audio, Music, Timelines. New bin with [[shift+cmd+N]]."],
        [[14.5, 55, 31, 8], "Deine Clips. Mit der Maus drüberfahren spielt sie ab.", "Your clips. Hover with the mouse to skim through them."],
        [[38, 5, 38, 43], "Viewer: Clip ansehen, gute Stelle mit [[I]] und [[O]] markieren.", "Viewer: watch the clip, mark the good part with [[I]] and [[O]]."],
        [[26.5, 96.5, 5.5, 3.5], "Media Page: [[shift+2]].", "Media page: [[shift+2]]."]
      ] }
    ],
    steps: { de: ["Rechtsklick auf 01_Footage > Add Folder and SubFolders into Media Pool (Bild, Punkt 2). Einzelne Dateien ziehst du aus dem Explorer in den Media Pool oder holst sie mit [[cmd+I]].", "Ton extra aufgenommen: Bild und Ton markieren, Rechtsklick, Auto Sync Audio, Based on Waveform."], en: ["Right click 01_Footage > Add Folder and SubFolders into Media Pool (picture, point 2). Single files you drag from Explorer into the Media Pool or bring in with [[cmd+I]].", "Sound recorded separately: select picture and sound, right click, Auto Sync Audio, Based on Waveform."] },
    tips: { de: ["Starke Clips farbig markieren: Rechtsklick > Clip Color.", "iPhone Clips wirken flau oder grell? Das iPhone filmt standardmäßig in HDR. Für neue Aufnahmen am iPhone Einstellungen > Kamera > Video aufnehmen > HDR Video aus. Für schon gedrehte Clips: Project Settings > Color Management, Color Science DaVinci YRGB Color Managed, Automatic Color Management an, Color Processing Mode SDR.", "Läuft bei Handy oder Bildschirmaufnahmen der Ton nach einer Weile versetzt oder ruckelt das Bild, hat der Clip eine schwankende Bildrate. Dann den Clip vorher mit dem kostenlosen HandBrake umwandeln, Einstellung Constant Framerate."], en: ["Mark strong clips with a color: right click > Clip Color.", "iPhone clips look flat or harsh? The iPhone films in HDR by default. For new recordings on the iPhone: Settings > Camera > Record Video > HDR Video off. For clips already shot: Project Settings > Color Management, Color Science DaVinci YRGB Color Managed, Automatic Color Management on, Color Processing Mode SDR.", "If the sound drifts out of sync after a while or the picture stutters in phone or screen recordings, the clip has a variable frame rate. Convert it first with the free HandBrake, setting Constant Framerate."] }
  },
  l6: {
    why: { de: "Proxys sind leichte Arbeitskopien. Du schneidest flüssig, exportiert wird automatisch das Original.", en: "Proxies are light working copies. You edit smoothly, the export automatically uses the original." },
    shots: [
      { img: "settings_proxy", title: { de: "Project Settings, Suche nach proxy", en: "Project Settings, searching for proxy" }, spots: [
        [[1, 3, 17.5, 3.5], "Im Suchfeld proxy tippen, die Treffer führen direkt hin.", "Type proxy into the search box, the results take you straight there."],
        [[28, 88, 42, 3], "Proxy Media Resolution: Choose Automatically oder Half.", "Proxy Media Resolution: Choose Automatically or Half."],
        [[28, 90.5, 42, 3], "Proxy Media Format: unter Windows DNxHR LB, am Mac ProRes 422 Proxy.", "Proxy Media Format: DNxHR LB on Windows, ProRes 422 Proxy on a Mac."],
        [[1, 15.8, 17.5, 3], "Proxy generation location: Speicherort, am besten die schnelle SSD.", "Proxy generation location: where they are saved, ideally the fast SSD."]
      ] },
      { img: "proxy_generator", title: { de: "Oder: Blackmagic Proxy Generator, kommt kostenlos mit Resolve", en: "Or: Blackmagic Proxy Generator, free with Resolve" }, spots: [
        [[2.1, 93.2, 11.8, 4.2], "Add: den Ordner mit deinen Originalclips wählen, zum Beispiel 01_Footage.", "Add: pick the folder with your original clips, for example 01_Footage."],
        [[33.6, 32.4, 23, 13.2], "Format wählen. H.264 1080p läuft auf jedem Rechner flüssig. Unter Windows kann die Liste etwas anders aussehen.", "Pick a format. H.264 1080p plays smoothly on any computer. On Windows the list may look a little different."],
        [[82.4, 15.5, 13.2, 4.4], "Start. Ab jetzt baut er Proxys für alles im Ordner, auch für Clips, die später dazukommen. Die Leertaste startet und stoppt.", "Start. From now on it builds proxies for everything in the folder, including clips added later. Space starts and stops."],
        [[2.2, 57.6, 95.7, 4.2], "Status: Waiting wartet auf Start, dann Processing, am Ende Completed.", "Status: Waiting means it waits for Start, then Processing, finally Completed."],
        [[27.6, 93.2, 11.8, 4.2], "Show öffnet den Ordner. Neben den Originalen liegt jetzt der Unterordner Proxy.", "Show opens the folder. Next to the originals there is now a subfolder called Proxy."]
      ] }
    ],
    steps: { de: ["Weg 1 in Resolve: im Media Pool alle Clips markieren ([[cmd+A]]), Rechtsklick, Generate Proxy Media.", "Weg 2 mit dem Proxy Generator (Bild 2): Ordner hinzufügen, Format wählen, Start. Danach die Originale in Resolve importieren, die Proxys hängen sich selbst an.", "Menü Playback > Proxy Handling > Prefer Proxies.", "Beim Export nimmt Resolve automatisch die Originale."], en: ["Way 1 in Resolve: in the Media Pool select all clips ([[cmd+A]]), right click, Generate Proxy Media.", "Way 2 with the Proxy Generator (picture 2): add the folder, pick a format, Start. Then import the originals into Resolve, the proxies attach themselves.", "Menu Playback > Proxy Handling > Prefer Proxies.", "On export Resolve automatically uses the originals."] },
    tips: { de: ["Proxy Generator unter Windows: Start > Blackmagic Design > Blackmagic Proxy Generator Lite. Er ist kostenlos dabei und läuft nebenbei, Resolve bleibt frei.", "Am besten direkt nach dem Kopieren der Karte starten, dann sind die Proxys fertig, bevor du schneidest.", "Hängen die Proxys nicht dran: Clips markieren, Rechtsklick > Link Proxy Media, den Ordner Proxy wählen.", "Schnelle Hilfe ganz ohne Proxys: Playback > Timeline Proxy Resolution > Half oder Quarter."], en: ["Proxy Generator on Windows: Start > Blackmagic Design > Blackmagic Proxy Generator Lite. It comes free with Resolve and runs on the side, Resolve stays free to use.", "Best started right after copying the card, so the proxies are ready before you edit.", "If the proxies don't attach: select the clips, right click > Link Proxy Media, choose the Proxy folder.", "Quick help without any proxies: Playback > Timeline Proxy Resolution > Half or Quarter."] }
  },
  l7: {
    why: { de: "Hier entsteht dein Film. Tipp die Punkte an.", en: "This is where your film is made. Tap the points." },
    widget: null,
    shots: [
      { img: "edit_full", title: { de: "Edit Page", en: "Edit page" }, spots: [
        [[0, 4, 26, 44], "Media Pool: alle Clips, Musik und Timelines, sortiert in Bins.", "Media Pool: all clips, music and timelines, sorted into bins."],
        [[26, 4, 37, 44], "Source Viewer: der Rohclip. Hier setzt du In und Out.", "Source viewer: the raw clip. This is where you set In and Out."],
        [[63, 4, 37, 44], "Timeline Viewer: dein Schnitt am Playhead.", "Timeline viewer: your edit at the playhead."],
        [[24, TB, 38, TH], "Werkzeugleiste: Auswahl, Trim, Blade, Einsetzen, Einrasten.", "Toolbar: selection, trim, blade, edit buttons, snapping."],
        [[0, 52.5, 100, 43.5], "Timeline: oben Videospuren, unten Tonspuren.", "Timeline: video tracks on top, audio tracks below."],
        [[88, 0, 12, 4], "Inspector einblenden: Größe, Position, Tempo des markierten Clips.", "Show the Inspector: size, position, speed of the selected clip."],
        [[26, 96.5, 48, 3.5], "Seitenleiste. Edit Page: [[shift+4]].", "Page bar. Edit page: [[shift+4]]."]
      ] }
    ],
    steps: { de: [], en: [] },
    tips: { de: ["Alles verschoben? Workspace > Reset UI Layout.", "[[Q]] wechselt zwischen Source und Timeline Viewer, [[cmd+F]] zeigt Vollbild."], en: ["Everything moved? Workspace > Reset UI Layout.", "[[Q]] switches between Source and Timeline viewer, [[cmd+F]] shows full screen."] }
  },
  l8: {
    why: { de: "Die Timeline ist deine Arbeitsfläche. Die linke Hand liegt auf J, K und L.", en: "The timeline is your workspace. Your left hand rests on J, K and L." },
    shots: [
      { img: "new_timeline", title: { de: "Neue Timeline: [[cmd+N]]", en: "New timeline: [[cmd+N]]" }, spots: [
        [[23, 11, 22, 6.5], "Start Timecode: 01:00:00:00 ist der Standard.", "Start timecode: 01:00:00:00 is the default."],
        [[23, 20, 41, 6.5], "Name, zum Beispiel Schnitt_v01.", "Name, for example Edit_v01."],
        [[1, 84, 27, 6.5], "Haken raus: eigenes Format, etwa Hochformat 1080 × 1920.", "Untick: own format, for example vertical 1080 × 1920."],
        [[73, 82.5, 25.5, 8.5], "Create.", "Create."]
      ] },
      { img: "edit_full", title: { de: "Timeline lesen", en: "Reading the timeline" }, spots: [
        [[2.5, 53, 10, 4], "Timecode: Stunden, Minuten, Sekunden, Frames.", "Timecode: hours, minutes, seconds, frames."],
        [[53.5, 52.5, 3, 44], "Playhead: hier stehst du gerade.", "Playhead: where you are right now."],
        [[15, 53, 85, 3], "Zeitlineal: klicken springt dorthin.", "Ruler: click to jump there."],
        [[0, 56, 15, 40], "Spuren: V für Bild, A für Ton.", "Tracks: V for picture, A for sound."]
      ] }
    ],
    steps: { de: ["[[space]] spielt und stoppt. [[L]] vor, [[J]] zurück, [[K]] Stopp. Zweimal [[L]] ist schneller.", "[[K]] halten und [[L]] antippen: ein Frame vor. Oder [[left]] und [[right]].", "[[up]] und [[down]]: zum vorherigen oder nächsten Schnitt.", "[[shift+Z]]: ganze Timeline. [[cmd+eq]] und [[cmd+minus]]: Zoom."], en: ["[[space]] plays and stops. [[L]] forward, [[J]] back, [[K]] stop. [[L]] twice is faster.", "Hold [[K]] and tap [[L]]: one frame forward. Or [[left]] and [[right]].", "[[up]] and [[down]]: previous or next edit.", "[[shift+Z]]: whole timeline. [[cmd+eq]] and [[cmd+minus]]: zoom."] },
    tips: { de: ["Rechte Hand an der Maus, linke auf J, K, L."], en: ["Right hand on the mouse, left hand on J, K, L."] }
  },
  l9: {
    why: { de: "Besten Teil markieren, gezielt einsetzen.", en: "Mark the best part, place it precisely." },
    shots: [
      { img: "edit_full", title: { de: "In und Out im Source Viewer", en: "In and Out in the source viewer" }, spots: [
        [[26, 41.5, 37, 3.5], "Der helle Balken zwischen In und Out ist die gewählte Stelle.", "The bright bar between In and Out is the selected part."],
        [[26, 4, 10, 3.5], "Dauer zwischen In und Out.", "Duration between In and Out."],
        [[34.6, TB, 7.2, TH], "Insert, Overwrite, Replace als Knöpfe.", "Insert, Overwrite, Replace as buttons."],
        [[0, 64.5, 7, 4], "Zielspur: das rote Feld links bestimmt, wohin der Clip kommt.", "Target track: the red box on the left decides where the clip goes."]
      ] }
    ],
    steps: { de: ["Doppelklick auf einen Clip im Media Pool: er öffnet sich im Source Viewer.", "Am Anfang der guten Stelle [[I]], am Ende [[O]].", "Playhead in der Timeline an die Zielstelle.", "[[F9]] Insert schiebt nach hinten, [[F10]] Overwrite überschreibt, [[shift+F12]] hängt ans Ende."], en: ["Double click a clip in the Media Pool: it opens in the source viewer.", "At the start of the good part press [[I]], at the end [[O]].", "Put the timeline playhead where it should go.", "[[F9]] Insert pushes back, [[F10]] Overwrite replaces, [[shift+F12]] appends to the end."] },
    tips: { de: ["Am Laptop brauchen die F Tasten oft zusätzlich die Taste Fn.", "Mit [[opt+1]] bis [[opt+8]] wählst du die Videospur als Ziel."], en: ["On a laptop the F keys often need the Fn key as well.", "[[opt+1]] to [[opt+8]] choose the target video track."] }
  },
  l10: {
    why: { de: "Mit wenigen Tasten auf den Frame genau kürzen, ohne Lücken.", en: "Trim to the exact frame with a few keys, without gaps." },
    shots: [
      { img: "edit_full", title: { de: "Werkzeugleiste", en: "Toolbar" }, spots: [
        [[25.0, TB, 2.2, TH], "Auswahl [[A]].", "Selection [[A]]."],
        [[27.4, TB, 2.2, TH], "Trim Modus [[T]]: Ripple, Roll, Slip, Slide.", "Trim mode [[T]]: ripple, roll, slip, slide."],
        [[29.6, TB, 2.2, TH], "Blade [[B]]: Klick in den Clip teilt ihn.", "Blade [[B]]: click into a clip to split it."],
        [[42.5, TB, 2.2, TH], "Einrasten an und aus [[N]].", "Snapping on and off [[N]]."],
        [[44.9, TB, 2.2, TH], "Linked Selection: Bild und Ton zusammen oder getrennt.", "Linked selection: picture and sound together or separate."]
      ] }
    ],
    steps: { de: ["Playhead an die Stelle, [[cmd+B]] teilt dort.", "[[del]] löscht mit Lücke, [[fdel]] löscht ohne Lücke (Ripple Delete).", "Profiweg: [[shift+cmd+lbr]] schneidet alles vor dem Playhead weg, [[shift+cmd+rbr]] alles danach.", "[[cmd+Z]] macht jeden Fehler rückgängig."], en: ["Put the playhead on the spot, [[cmd+B]] splits there.", "[[del]] deletes leaving a gap, [[fdel]] deletes without a gap (ripple delete).", "Pro way: [[shift+cmd+lbr]] removes everything before the playhead, [[shift+cmd+rbr]] everything after.", "[[cmd+Z]] undoes any mistake."] },
    tips: { de: ["[[comma]] und [[period]] verschieben einen markierten Schnitt um ein Frame."], en: ["[[comma]] and [[period]] move a selected edit by one frame."] }
  },
  l11: {
    why: { de: "Unten die Geschichte, darüber Bilder und Titel, darunter Ton und Musik.", en: "The story at the bottom, pictures and titles above, sound and music below." },
    shots: [
      { img: "title_timeline", title: { de: "Spuren in der Timeline", en: "Tracks in the timeline" }, spots: [
        [[0, 56, 100, 11], "V2: Titel und B Roll liegen über der Geschichte.", "V2: titles and B roll sit above the story."],
        [[0, 67.5, 100, 9.5], "V1: die Hauptgeschichte.", "V1: the main story."],
        [[0, 77, 100, 7.5], "A1: Ton der Clips.", "A1: sound of the clips."],
        [[0, 84.5, 100, 6.5], "A2: Interview oder Sprache.", "A2: interview or voice."],
        [[0, 91, 100, 5.5], "A3: Musik.", "A3: music."],
        [[51.5, 53.5, 2.5, 3], "Marker [[M]]: Notiz, Musikschlag, offene Stelle.", "Marker [[M]]: note, music beat, open spot."]
      ] }
    ],
    steps: { de: ["J Cut: Ton der nächsten Szene beginnt vor ihrem Bild. L Cut: Ton läuft weiter, während das nächste Bild schon steht.", "Dafür [[opt]] halten und nur die Tonkante ziehen, oder Linked Selection aus."], en: ["J cut: sound of the next scene starts before its picture. L cut: sound keeps going while the next picture is already there.", "Hold [[opt]] and drag only the audio edge, or turn linked selection off."] },
    tips: { de: ["Bauchbinden nur über das Bild der Person, die spricht.", "[[D]] schaltet einen Clip unsichtbar, ohne ihn zu löschen."], en: ["Name captions only over the picture of the person speaking.", "[[D]] makes a clip invisible without deleting it."] }
  },
  l13: {
    why: { de: "Sparsam einsetzen. Ein harter Schnitt ist fast immer die beste Wahl.", en: "Use sparingly. A hard cut is almost always the best choice." },
    shots: [
      { img: "effects_titles", title: { de: "Text+ finden", en: "Finding Text+" }, spots: [
        [[9.5, 0, 9.5, 3.5], "Effects oben links einblenden.", "Show Effects at the top left."],
        [[0, 13.5, 9, 3.5], "Toolbox > Titles.", "Toolbox > Titles."],
        [[9.2, 31, 16, 3.5], "Text+ auf Spur V2 über deinen Clip ziehen.", "Drag Text+ onto track V2 above your clip."]
      ] },
      { img: "title_timeline", title: { de: "Titel bearbeiten", en: "Editing the title" }, spots: [
        [[17, 56.5, 21, 10], "Der Titel liegt auf V2.", "The title sits on V2."],
        [[76, 20, 24, 22], "Text im Inspector schreiben, darunter Schrift, Farbe, Größe.", "Type the text in the Inspector, font, color and size below."],
        [[30, 4, 45, 38], "Ergebnis im Viewer.", "Result in the viewer."]
      ] },
      { img: "inspector", title: { de: "Inspector: Größe und Bewegung", en: "Inspector: size and movement" }, spots: [
        [[76, 11, 24, 20], "Transform: Zoom, Position, Rotation.", "Transform: zoom, position, rotation."],
        [[96, 13, 3, 16], "Raute: Keyframe setzen. Zwei Keyframes ergeben Bewegung.", "Diamond: set a keyframe. Two keyframes make movement."],
        [[49, 65, 19, 11], "Markierter Clip, seine Werte stehen im Inspector.", "Selected clip, its values show in the Inspector."]
      ] },
      { img: "retime", title: { de: "Tempo: [[cmd+R]]", en: "Speed: [[cmd+R]]" }, spots: [
        [[49, 63.5, 19, 3], "Retime Controls über dem Clip.", "Retime controls above the clip."],
        [[53, 73.5, 7, 3], "Auf 100 % klicken und Tempo wählen, etwa 50 %.", "Click 100% and choose a speed, for example 50%."]
      ] }
    ],
    steps: { de: ["Übergang: Schnittpunkt mit [[V]] wählen, [[cmd+T]] setzt eine Blende. [[opt+T]] nur Bild, [[shift+T]] nur Ton.", "Weiche Zeitlupe: im Inspector unter Retime and Scaling auf Optical Flow."], en: ["Transition: select the edit with [[V]], [[cmd+T]] adds a dissolve. [[opt+T]] picture only, [[shift+T]] sound only.", "Smooth slow motion: in the Inspector under Retime and Scaling choose Optical Flow."] },
    tips: { de: ["Kurze Tonblende ([[shift+T]]) an harten Tonschnitten verhindert Knackser."], en: ["A short audio fade ([[shift+T]]) on hard sound cuts prevents clicks."] }
  },
  l15: {
    why: { de: "Grafik und Effekte aus Nodes, kleinen Bausteinen hintereinander.", en: "Graphics and effects made of nodes, small building blocks in a row." },
    shots: [
      { img: "fusion_page", title: { de: "Fusion Page", en: "Fusion page" }, spots: [
        [[38, 10, 38, 37], "Viewer: Text 228 über dem Clip.", "Viewer: the text 228 on top of the clip."],
        [[6.5, 78.5, 9, 4.5], "MediaIn: dein Clip aus der Timeline.", "MediaIn: your clip from the timeline."],
        [[1.5, 70.5, 8.5, 4.5], "Merge: legt den Text über den Clip.", "Merge: puts the text on top of the clip."],
        [[54, 78.5, 9, 4.5], "MediaOut: das geht zurück in die Timeline.", "MediaOut: this goes back to the timeline."],
        [[76, 3, 24, 60], "Inspector: Einstellungen des gewählten Nodes.", "Inspector: settings of the selected node."],
        [[3.5, 61, 67, 4], "Werkzeuge. Suche mit [[shift+space]].", "Tools. Search with [[shift+space]]."]
      ] }
    ],
    steps: { de: ["Playhead auf einen Clip, [[shift+5]].", "MediaIn markieren, [[shift+space]], Text+ eintippen. Fusion verbindet über einen Merge.", "Node markieren und [[1]] oder [[2]] zeigt ihn im linken oder rechten Viewer."], en: ["Playhead on a clip, [[shift+5]].", "Select MediaIn, [[shift+space]], type Text+. Fusion connects it through a Merge.", "Select a node and press [[1]] or [[2]] to view it left or right."] },
    tips: { de: ["Einfache Titel gehen ohne Fusion mit Text+ in der Edit Page."], en: ["Simple titles work without Fusion, with Text+ on the Edit page."] }
  },
  l16: {
    why: { de: "Erst korrigieren, dann Look. Die Scopes messen, was das Auge falsch sieht.", en: "Correct first, then the look. Scopes measure what your eye gets wrong." },
    shots: [
      { img: "color_page", title: { de: "Color Page mit Parade Scope, vorher", en: "Color page with parade scope, before" }, spots: [
        [[0, 9, 41.8, 37.7], "Viewer: ein flacher Clip wie Log Material.", "Viewer: a flat clip like log footage."],
        [[50.4, 17.9, 3.5, 5.2], "Node 01. Ein Node pro Aufgabe, neuer Node mit [[opt+S]].", "Node 01. One node per task, new node with [[opt+S]]."],
        [[0, 53.2, 55.3, 11.3], "Clips der Timeline. Nächsten Clip wählen und [[eq]] übernimmt die Korrektur davor.", "Timeline clips. Select the next clip and [[eq]] copies the correction before it."],
        [[7.8, 65.9, 1.8, 2.5], "Das dritte Symbol öffnet die Farbräder.", "The third icon opens the color wheels."],
        [[0, 74.9, 49.9, 16.1], "Lift für Schatten, Gamma für Mitten, Gain für Lichter, Offset für alles.", "Lift for shadows, Gamma for mids, Gain for highlights, Offset for everything."],
        [[7.9, 71.7, 14.5, 2.1], "Temp und Tint: Farbstich raus.", "Temp and Tint: remove color casts."],
        [[50.2, 71.2, 49.8, 25.6], "Parade: Rot, Grün und Blau getrennt, Skala 0 bis 1023. Hier liegt alles zusammengedrückt in der Mitte, also Lift runter und Gain hoch.", "Parade: red, green and blue separately, scale 0 to 1023. Here everything is squeezed into the middle, so lower Lift and raise Gain."],
        [[89.2, 69.1, 4, 1.8], "Hier wechselst du zwischen Parade, Waveform und Vectorscope.", "Switch between parade, waveform and vectorscope here."],
        [[93.9, 65.9, 1.9, 2.5], "Scopes ein und aus.", "Scopes on and off."]
      ] }
    ],
    steps: { de: ["[[shift+6]], dann Scopes einblenden (Symbol rechts in der Palettenleiste) und oben rechts Parade oder Waveform wählen.", "Der Waveform zählt in Resolve von 0 (Schwarz) bis 1023 (Weiß). Das Dunkelste knapp über 0, das Hellste knapp unter 1023, nichts platt abschneiden.", "Etwas Graues steht im Parade Scope in Rot, Grün und Blau gleich hoch."], en: ["[[shift+6]], then show the scopes (icon on the right of the palette bar) and choose Parade or Waveform at the top right.", "In Resolve the waveform runs from 0 (black) to 1023 (white). The darkest part just above 0, the brightest just below 1023, nothing clipped flat.", "Something grey sits at equal height in red, green and blue on the parade scope."] },
    tips: { de: ["[[shift+D]]: alle Korrekturen aus und an, ehrlicher Vergleich.", "Graues, flaues Material ist meist Log. Dann Project Settings > Color Management > DaVinci YRGB Color Managed."], en: ["[[shift+D]]: all corrections off and on, an honest comparison.", "Grey, flat footage is usually log. Then Project Settings > Color Management > DaVinci YRGB Color Managed."] }
  },
  l17: {
    why: { de: "Sprache klar, Musik darunter, Lautheit messen.", en: "Clear speech, music underneath, measure loudness." },
    shots: [
      { img: "fairlight_page", title: { de: "Fairlight Page", en: "Fairlight page" }, spots: [
        [[24, 38, 12, 24], "Spuren: A1 Clips, A2 Interview, A3 Musik.", "Tracks: A1 clips, A2 interview, A3 music."],
        [[69, 3, 11, 20], "Loudness Meter: Ziel etwa −14 LUFS für Social, Spitzen nie über −1.", "Loudness meter: aim for about −14 LUFS for social, peaks never above −1."],
        [[84, 31, 16, 66], "Mixer: ein Regler pro Spur, dazu EQ und Dynamics.", "Mixer: one fader per track, plus EQ and dynamics."],
        [[9, 53, 15, 44], "Fairlight FX, zum Beispiel Dialogue Processor und De-Esser.", "Fairlight FX, for example Dialogue Processor and De-Esser."]
      ] }
    ],
    steps: { de: ["In der Edit Page: weiße Linie im Tonclip hoch oder runter. Griffe oben an den Ecken: Blenden.", "Mehrere Clips gleich laut: markieren, Rechtsklick, Normalize Audio Levels.", "Musik unter Sprache absenken (Ducking), mit Keyframes auf der Musikspur."], en: ["On the Edit page: drag the white line in the audio clip up or down. Handles at the top corners: fades.", "Several clips equally loud: select, right click, Normalize Audio Levels.", "Lower the music under speech (ducking), with keyframes on the music track."] },
    tips: { de: ["Am Ende einmal über den Handylautsprecher hören."], en: ["Listen once through a phone speaker at the end."] }
  },
  l18: {
    why: { de: "Aus der Timeline wird eine Datei. Die Einstellung hängt vom Ziel ab.", en: "The timeline becomes a file. The settings depend on where it goes." },
    shots: [
      { img: "deliver_page", title: { de: "Deliver Page", en: "Deliver page" }, spots: [
        [[0, 3, 26, 6], "Vorlage wählen, etwa H.264 Master oder YouTube.", "Pick a preset, for example H.264 Master or YouTube."],
        [[0, 13, 26, 6], "Dateiname und Speicherort, am besten 06_Export.", "File name and location, ideally 06_Export."],
        [[0, 33, 20, 6.5], "Format und Codec. H.264 läuft überall.", "Format and codec. H.264 plays everywhere."],
        [[0, 45.5, 20, 9.5], "Auflösung und Bildrate wie die Timeline.", "Resolution and frame rate same as the timeline."],
        [[50.5, 75.5, 12.5, 3.5], "Entire Timeline oder In/Out Range.", "Entire Timeline or In/Out Range."],
        [[14, 92.5, 13, 4], "Add to Render Queue.", "Add to Render Queue."],
        [[76, 3, 24, 58], "Render Queue, dann Render All.", "Render Queue, then Render All."]
      ] }
    ],
    steps: { de: ["Vor jedem Export: komplett ansehen, Texte prüfen, Lautheit messen, schwarze Frames suchen."], en: ["Before every export: watch it all, check the text, measure loudness, look for black frames."] },
    tips: { de: ["Schnell ohne Einstellungen: File > Quick Export.", "Für Abnahmen: Workspace > Data Burn In schreibt den Timecode ins Bild."], en: ["Quick without settings: File > Quick Export.", "For reviews: Workspace > Data Burn In writes the timecode into the picture."] }
  },
  l2: {
    shots: [
      { img: "media_page", title: { de: "So sieht der Projektordner in Resolve aus", en: "This is the project folder in Resolve" }, spots: [
        [[15, 5, 23, 18], "Sechs feste Unterordner, immer gleich.", "Six fixed subfolders, always the same."]
      ] }
    ]
  },
  l3: {
    shots: [
      { img: "prefs_ui", title: { de: "Preferences > User > UI Settings", en: "Preferences > User > UI Settings" }, spots: [
        [[50.1, 4.9, 11.1, 2.8], "Reiter User: deine persönlichen Einstellungen.", "User tab: your personal settings."],
        [[38.9, 4.9, 11.1, 2.8], "Reiter System: dort unter Media Storage die schnellste Festplatte nach oben.", "System tab: under Media Storage move your fastest drive to the top."],
        [[49.4, 14.4, 12.5, 2.6], "Language: am besten Englisch lassen. Alle Tutorials nutzen die englischen Namen.", "Language: best left on English. Every tutorial uses the English names."],
        [[1.8, 21.9, 21.9, 2.8], "Project Save and Load: dort schaltest du Live Save ein, nächstes Bild.", "Project Save and Load: that's where you turn on Live Save, next picture."]
      ] },
      { img: "prefs_save", title: { de: "Preferences > User > Project Save and Load", en: "Preferences > User > Project Save and Load" }, spots: [
        [[48.8, 24.5, 8.8, 2.3], "Live save: speichert jede Änderung sofort mit.", "Live save: stores every change immediately."],
        [[48.8, 27.6, 12.5, 2.3], "Project backups: zusätzlich regelmäßige Sicherungskopien. Haken setzen.", "Project backups: regular backup copies on top. Tick it."],
        [[48.8, 34, 29.4, 9.5], "Wie oft und wie lange gesichert wird. Die Standardwerte passen.", "How often and how long backups are kept. The defaults are fine."],
        [[86.2, 94.4, 11.6, 3.1], "Save, danach Resolve einmal neu starten.", "Save, then restart Resolve once."]
      ] }
    ]
  },
  l14: {
    shots: [
      { img: "cut_page", title: { de: "Cut Page", en: "Cut page" }, spots: [
        [[0, 6, 47.1, 62], "Media Pool mit deinen Clips.", "Media Pool with your clips."],
        [[47.7, 3.7, 4.7, 1.8], "Source Clip, Source Tape, Timeline. Source Tape zeigt alle Clips des Bins als ein Band.", "Source Clip, Source Tape, Timeline. Source Tape shows all clips of the bin as one reel."],
        [[16.3, 68.9, 14.1, 2.5], "Smart Insert, Append, Ripple Overwrite, Close Up, Place on Top, Source Overwrite.", "Smart Insert, Append, Ripple Overwrite, Close Up, Place on Top, Source Overwrite."],
        [[13.7, 72.4, 86.3, 9.7], "Oben: die ganze Timeline im Überblick.", "Top: the whole timeline at a glance."],
        [[13.4, 82.4, 86.6, 15], "Unten: vergrößert rund um den Playhead. Hier schneidest du genau.", "Bottom: zoomed in around the playhead. This is where you cut precisely."],
        [[38.3, 97.1, 5.8, 2.9], "Cut Page: [[shift+3]].", "Cut page: [[shift+3]]."]
      ] }
    ]
  },
  l20: {
    shots: [
      { img: "multicam", title: { de: "Ein Multicam Clip von innen", en: "A multicam clip from the inside" }, spots: [
        [[18.2, 9.4, 4.3, 5.7], "Der Multicam Clip im Media Pool. Rechtsklick > Open in Timeline zeigt ihn so von innen.", "The multicam clip in the Media Pool. Right click > Open in Timeline shows it from the inside like this."],
        [[45.4, 3.5, 10.4, 1.8], "Name des Multicam Clips, hier aufgeklappt wie eine Timeline.", "Name of the multicam clip, opened up here like a timeline."],
        [[0, 56.3, 15, 28.7], "Jede Kamera ist ein Winkel, Angle 1 bis 4, eine Spur pro Kamera.", "Each camera is an angle, Angle 1 to 4, one track per camera."],
        [[15.1, 56.3, 14.3, 28.7], "Alle Winkel liegen synchron übereinander. Dafür sorgt Angle Sync.", "All angles sit in sync on top of each other. Angle Sync takes care of that."],
        [[0, 85.3, 29.4, 11], "Auch der Ton jeder Kamera ist dabei.", "Each camera's sound is included too."],
        [[30.2, 5.5, 41, 36.7], "Aufgeklappt zeigt der Viewer die oberste Spur. Zum Schneiden stellst du den Source Viewer auf Multicam und siehst alle Winkel nebeneinander.", "Opened up, the viewer shows the top track. For cutting you switch the source viewer to Multicam and see all angles side by side."]
      ] }
    ]
  },
  l21: {
    shots: [
      { img: "subtitles", title: { de: "Untertitel in der Edit Page", en: "Subtitles on the Edit page" }, spots: [
        [[0, 63.8, 84.2, 2.6], "Untertitelspur ST1. Jeder Untertitel ist ein eigener Clip.", "Subtitle track ST1. Each subtitle is a clip of its own."],
        [[62.2, 63.8, 7.2, 2.6], "Ein Untertitel. Kanten ziehen ändert, wann er kommt und geht.", "One subtitle. Dragging the edges changes when it appears and leaves."],
        [[34.5, 30.6, 16.6, 3.4], "Automatische Untertitel setzen Satzzeichen und machen Fehler, hier Teameline statt Timeline. Immer lesen.", "Automatic subtitles add punctuation and make mistakes, here Teameline instead of Timeline. Always read them."],
        [[76.5, 20.7, 22, 9.4], "Inspector unter Caption: hier den Text korrigieren und die Satzzeichen löschen.", "Inspector under Caption: correct the text here and delete the punctuation."],
        [[87.8, 11.1, 11.6, 2.4], "Reiter Track: Schrift, Größe und Position für alle Untertitel der Spur.", "Track tab: font, size and position for all subtitles on the track."],
        [[75.7, 37.7, 24.3, 10.2], "Liste aller Untertitel. Prev und Next springen durch.", "List of all subtitles. Prev and Next step through them."],
        [[16.8, 83.5, 67.4, 6.1], "Aus dieser Sprachspur hat Resolve die Untertitel erzeugt.", "Resolve created the subtitles from this speech track."]
      ] }
    ]
  },
  l22: {
    shots: [
      { img: "vertical", title: { de: "Hochformat Timeline Reel_v01", en: "Vertical timeline Reel_v01" }, spots: [
        [[49.1, 8.3, 14.4, 34.1], "Viewer im Hochformat 9:16. Querformat Clips füllen das Bild, weil Scale full frame with crop eingestellt ist.", "Viewer in vertical 9:16. Horizontal clips fill the frame because Scale full frame with crop is set."],
        [[60, 6, 4.7, 1.6], "Eigene Timeline Reel_v01 mit 1080 × 1920.", "A separate timeline Reel_v01 at 1080 × 1920."],
        [[76.8, 13.6, 18.6, 4.6], "Zoom und Position X: Bildausschnitt setzen.", "Zoom and Position X: set the framing."],
        [[76.6, 30.6, 23, 2.1], "AI Smart Reframe, nur Studio: Ausschnitt automatisch.", "AI Smart Reframe, Studio only: automatic framing."],
        [[15.1, 66.5, 80, 9.9], "Dieselben Clips wie im Querformat, jeder wird neu gesetzt.", "The same clips as in the horizontal version, each one reframed."]
      ] }
    ]
  }
};
