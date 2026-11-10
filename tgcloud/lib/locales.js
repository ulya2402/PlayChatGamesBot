export const strings = {
  en: {
    welcomeTitle: 'Play Chat Games',
    welcomeBody: 'Select an instant game below. All games run inside your chat bubble.',
    guestHint: 'Summon me in any chat by sending:',
    btnFlappy: '🐦 FLAPPY BIRD',
    btnRunner: '🥷 CYBER RUNNER',
    btnStack: '🧱 STACK TOWER',
    btnBrick: '🏓 NEON BRICK',
    btnOrbit: '🪐 ORBIT DASH',
    btnSolitaire: '🃏 KLONDIKE SOLITAIRE',
    btnPyramid: '🔺 PYRAMID SOLITAIRE',
    guestTitle: '🕹️ Play Chat Games',
    guestDesc: 'Tap any game below to launch it instantly In PM:',
    launchFlappy: '🐦 Flappy Bird',
    launchRunner: '🥷 Cyber Runner',
    launchStack: '🧱 Stack Tower',
    launchBrick: '🏓 Neon Brick',
    launchOrbit: '🪐 Orbit DASH',
    launchSolitaire: '🃏 Klondike Solitaire',
    launchPyramid: '🔺 Pyramid Solitaire',
    tapToStart: 'TAP TO START',
    dragToPlay: 'DRAG OR TAP TO PLAY',
    score: 'SCORE',
    best: 'BEST',
    playAgain: 'PLAY AGAIN',
    perfect: 'PERFECT!',
    submitScore: 'Save Your Score',
    submitting: 'SAVING...',
    submitted: '✓ SAVED',
    topGlobal: '🏆 #1:',
    noRecord: 'No Score record yet',
    newDeal: 'NEW DEAL',
    finishGame: 'FINISH & RANK',
    solGuide: 'Tap any card to auto-move!',
    pyrGuide: 'Tap K (13) or 2 cards totaling 13',
    pyrNeed: 'Tap highlighted ',
    noMove: 'No auto-move for this card'
  },
  id: {
    welcomeTitle: 'Main Game di Chat',
    welcomeBody: 'Pilih game instan di bawah. Semua game bisa langsung dimainkan di dalam chat.',
    guestHint: 'Panggil bot di chat mana aja pakai perintah:',
    btnFlappy: '🐦 FLAPPY BIRD',
    btnRunner: '🥷 CYBER RUNNER',
    btnStack: '🧱 STACK TOWER',
    btnBrick: '🏓 NEON BRICK',
    btnOrbit: '🪐 ORBIT DASH',
    btnSolitaire: '🃏 KLONDIKE SOLITAIRE',
    btnPyramid: '🔺 PYRAMID SOLITAIRE',
    guestTitle: '🕹️ Main Game di Chat',
    guestDesc: 'Pencet game di bawah buat langsung main lewat DM:',
    launchFlappy: '🐦 Flappy Bird',
    launchRunner: '🥷 Cyber Runner',
    launchStack: '🧱 Stack Tower',
    launchBrick: '🏓 Neon Brick',
    launchOrbit: '🪐 Orbit DASH',
    launchSolitaire: '🃏 Klondike Solitaire',
    launchPyramid: '🔺 Pyramid Solitaire',
    tapToStart: 'KETUK BUAT MULAI',
    dragToPlay: 'GESER ATAU KETUK BUAT MAIN',
    score: 'SKOR',
    best: 'TERBAIK',
    playAgain: 'MAIN LAGI',
    perfect: 'KEREN BANGET!',
    submitScore: 'Simpan Skor Kamu',
    submitting: 'MENYIMPAN...',
    submitted: '✓ TERSIMPAN',
    topGlobal: '🏆 #1:',
    noRecord: 'Belum ada rekor skor',
    newDeal: 'BAGI KARTU BARU',
    finishGame: 'SELESAI & LIHAT RANK',
    solGuide: 'Ketuk kartu buat gerak otomatis!',
    pyrGuide: 'Ketuk K (13) atau 2 kartu berjumlah 13',
    pyrNeed: 'Ketuk kartu yang menyala ',
    noMove: 'Kartu ini nggak bisa digerakkan'
  },
};

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