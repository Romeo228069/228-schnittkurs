/* Firebase Webkonfiguration. Diese Werte sind öffentlich und dürfen im Code stehen,
   den Schutz übernehmen die Sicherheitsregeln in firestore.rules.
   Ist apiKey leer, läuft die Seite als Vorschau ohne Datenbank (Speicher nur im Browser). */
export const FIREBASE = {
  apiKey: "AIzaSyCJv3mKnGcpfiDmWoU1-CFAAu7B95J4bBY",
  authDomain: "schnittkurs.firebaseapp.com",
  projectId: "schnittkurs",
  storageBucket: "schnittkurs.firebasestorage.app",
  messagingSenderId: "28092415011",
  appId: "1:28092415011:web:106aa54c14e7c3af488596"
};

/* Die zwei Konten. Es sind reine Kennungen für die Anmeldung, an diese Adressen wird nichts geschickt.
   Müssen genau mit firestore.rules übereinstimmen. */
export const ACCOUNTS = {
  romeo: { email: "romeo.kurs@228motions.de", name: "Romeo", role: "Lehrer" },
  kamila: { email: "kamila.kurs@228motions.de", name: "Kamila", role: "Schülerin" }
};
