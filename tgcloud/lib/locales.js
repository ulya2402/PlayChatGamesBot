// === AWAL PERUBAHAN: tgcloud/lib/locales.js ===
// === AWAL PERUBAHAN: tgcloud/lib/locales.js ===
export const strings = {
  en: {
    welcomeTitle: 'Play Chat Games',
    welcomeBody: 'Select an instant game or tool below. Everything runs inside your chat bubble.',
    guestHint: 'Summon me in any chat by sending:',
    btnFlappy: '🐦 FLAPPY BIRD',
    btnRunner: '🏃 CYBER RUNNER',
    btnStack: '🧱 STACK TOWER',
    btnBrick: '🏓 NEON BRICK',
    btnOrbit: '🪐 ORBIT DASH',
    btnSolitaire: '🃏 KLONDIKE SOLITAIRE',
    btnPyramid: '🔺 PYRAMID SOLITAIRE',
    btnCalc: '🧮 SCIENTIFIC CALCULATOR',
    guestTitle: '🎮 Play Chat Games',
    guestDesc: 'Tap any game or tool below to launch it instantly In PM:',
    launchFlappy: '🐦 Flappy Bird',
    launchRunner: '🏃 Cyber Runner',
    launchStack: '🧱 Stack Tower',
    launchBrick: '🏓 Neon Brick',
    launchOrbit: '🪐 Orbit DASH',
    launchSolitaire: '🃏 Klondike Solitaire',
    launchPyramid: '🔺 Pyramid Solitaire',
    launchCalc: '🧮 Scientific Calculator',
    tapToStart: 'TAP TO START',
    dragToPlay: 'DRAG OR TAP TO PLAY',
    score: 'SCORE',
    best: 'BEST',
    playAgain: 'PLAY AGAIN',
    perfect: 'PERFECT!',
    submitScore: 'Save Your Score',
    submitting: 'SAVING...',
    submitted: '✅ SAVED',
    topGlobal: '🏆 #1:',
    noRecord: 'No Score record yet',
    newDeal: 'NEW DEAL',
    finishGame: 'FINISH & RANK',
    solGuide: 'Tap card to move or select',
    pyrGuide: 'Pair cards totaling 13 (K = 13)',
    pyrNeed: 'Pair with ',
    noMove: 'No valid move for this card',
    calcHist: 'History',
    calcEmpty: 'No calculations yet',
    calcCopy: 'COPY',
    calcCopied: 'COPIED',
    calcClearHist: 'CLR'
  },
  id: {
    welcomeTitle: 'Main Game di Chat',
    welcomeBody: 'Pilih game atau tool instan di bawah. Semua langsung jalan di dalam chat.',
    guestHint: 'Panggil bot di chat mana aja pakai perintah:',
    btnFlappy: '🐦 FLAPPY BIRD',
    btnRunner: '🏃 CYBER RUNNER',
    btnStack: '🧱 STACK TOWER',
    btnBrick: '🏓 NEON BRICK',
    btnOrbit: '🪐 ORBIT DASH',
    btnSolitaire: '🃏 KLONDIKE SOLITAIRE',
    btnPyramid: '🔺 PYRAMID SOLITAIRE',
    btnCalc: '🧮 KALKULATOR ILMIAH',
    guestTitle: '🎮 Main Game di Chat',
    guestDesc: 'Pencet game atau tool di bawah buat langsung buka lewat DM:',
    launchFlappy: '🐦 Flappy Bird',
    launchRunner: '🏃 Cyber Runner',
    launchStack: '🧱 Stack Tower',
    launchBrick: '🏓 Neon Brick',
    launchOrbit: '🪐 Orbit DASH',
    launchSolitaire: '🃏 Klondike Solitaire',
    launchPyramid: '🔺 Pyramid Solitaire',
    launchCalc: '🧮 Kalkulator Ilmiah',
    tapToStart: 'KETUK BUAT MULAI',
    dragToPlay: 'GESER ATAU KETUK BUAT MAIN',
    score: 'SKOR',
    best: 'TERBAIK',
    playAgain: 'MAIN LAGI',
    perfect: 'KEREN BANGET!',
    submitScore: 'Simpan Skor Kamu',
    submitting: 'MENYIMPAN...',
    submitted: '✅ TERSIMPAN',
    topGlobal: '🏆 #1:',
    noRecord: 'Belum ada rekor skor',
    newDeal: 'BAGI BARU',
    finishGame: 'SELESAI & RANK',
    solGuide: 'Ketuk kartu buat pindah otomatis',
    pyrGuide: 'Pasangkan kartu berjumlah 13 (K = 13)',
    pyrNeed: 'Pasangkan dengan ',
    noMove: 'Kartu ini belum bisa pindah',
    calcHist: 'RIWAYAT',
    calcEmpty: 'Belum ada riwayat hitung',
    calcCopy: 'SALIN',
    calcCopied: 'TERSALIN',
    calcClearHist: 'HAPUS'
  }
};
// === BATAS PERUBAHAN: tgcloud/lib/locales.js ===

export function t(key, lang = 'en') {
  const code = String(lang || 'en').slice(0, 2).toLowerCase();
  const l = strings[code] ? code : 'en';
  return strings[l][key] || strings['en'][key] || key;
}

export function fullBtn(label, targetLen = 30) {
  const cleanLen = Array.from(label).length;
  const totalPad = Math.max(4, targetLen - cleanLen);
  const side = '\u2800'.repeat(Math.ceil(totalPad / 2));
  return `${side}${label}${side}`;
}