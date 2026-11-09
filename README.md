# 228 Schnittkurs

DaVinci Resolve 21 Masterclass für Einsteiger, gebaut für Kamila und Romeo. Auf Deutsch und Englisch.

Live: https://romeo228069.github.io/228-schnittkurs/

## So funktioniert die Seite

Beim Öffnen sagt man, wer man ist. Kamila ist die Schülerin: sie arbeitet die 19 Lektionen durch, hakt Übungen ab, beantwortet die Checks, übt Shortcuts und kann Romeo zu jeder Lektion eine Frage schreiben. Die Seite merkt sich, wo sie stehen geblieben ist.

Romeo ist der Lehrer: er sieht Kamilas Stand live (abgeschlossene Lektionen, Übungen, Checks, Training, Verlauf, Fragen), antwortet in den Lektionen, kann Texte jeder Lektion ändern, Lektionen ausblenden oder eigene hinzufügen und den Kurs als Kamila ansehen.

Beim allerersten Besuch legt jede Person ihr eigenes Passwort fest (mindestens 6 Zeichen), danach bleibt man auf dem Gerät angemeldet.

## Screenshots

Die Bilder in `img/` sind echte Screenshots aus DaVinci Resolve Studio 21.1, aufgenommen im Demo-Projekt „228 Schnittkurs Demo“ mit neutralem, selbst erzeugtem Material (Ordner `20261109_Kamila_Demo` neben der Webseite). Kundenprojekte im Project Manager sind unkenntlich gemacht. Die klickbaren Punkte und Texte dazu stehen in `js/shots.js` (Koordinaten in Prozent). Resolve sieht unter Windows bis auf die Menüleiste gleich aus, die Tasten stehen standardmäßig auf Windows.

## Technik

Statische Seite auf GitHub Pages, ohne Build. Daten liegen in Firebase (Projekt `schnittkurs`, Firestore in Frankfurt, Anmeldung per Passwort). Die Webkonfiguration in `js/config.js` ist öffentlich gedacht, geschützt wird über `firestore.rules`: nur die zwei Konten haben Zugriff, nur Romeo darf den Kurs ändern.

`js/data.js` und `js/data_en.js` enthalten die Inhalte, `js/widgets.js` die Schaubilder, `js/store.js` die Datenbank, `js/app.js` die Oberfläche. Mit `?vorschau` an der Adresse läuft die Seite ohne Datenbank zum Ausprobieren.

Passwort vergessen: in der Firebase Konsole unter Authentication das Konto löschen, danach in der Seite neu festlegen. Der Fortschritt bleibt erhalten.

---

# 228 Editing Course

A DaVinci Resolve 21 masterclass for beginners, built for Kamila and Romeo, in German and English. Kamila signs in as the student, Romeo as the teacher who follows her progress live and adapts the course. Data is stored in Firebase, protected by `firestore.rules`.
