export const strings = {
  en: {
    welcomeTitle: '🕹️ Widget Arcade',
    welcomeBody: 'Select an instant game below. All games run natively at 60fps right inside your chat bubble with live cloud leaderboards.',
    guestHint: 'Summon me in any chat by sending:',
    btnFlappy: '🐦 FLAPPY BIRD',
    btnRunner: '🥷 CYBER RUNNER',
    btnStack: '🧱 STACK TOWER',
    btnBrick: '🏓 NEON BRICK',
    btnOrbit: '🪐 ORBIT DASH',
    btnSolitaire: '🃏 KLONDIKE SOLITAIRE',
    btnPyramid: '🔺 PYRAMID SOLITAIRE',
    guestTitle: '🕹️ Widget Arcade — Guest Summon',
    guestDesc: 'Interactive 60fps widgets are restricted by Telegram Production servers to private bot chats. Tap any game below to launch it instantly:',
    launchFlappy: '🐦 Launch Flappy Bird',
    launchRunner: '🥷 Launch Cyber Runner',
    launchStack: '🧱 Launch Stack Tower',
    launchBrick: '🏓 Launch Neon Brick',
    launchOrbit: '🪐 Launch Orbit Dash',
    launchSolitaire: '🃏 Launch Klondike Solitaire',
    launchPyramid: '🔺 Launch Pyramid Solitaire',
    tapToStart: 'TAP TO START',
    dragToPlay: 'DRAG OR TAP TO PLAY',
    score: 'SCORE',
    best: 'BEST',
    playAgain: 'PLAY AGAIN',
    perfect: 'PERFECT!',
    submitScore: '☁️ SAVE TO LEADERBOARD',
    submitting: 'SAVING...',
    submitted: '✓ SAVED TO CLOUD',
    topGlobal: '🏆 #1:',
    noRecord: 'No cloud record yet',
    newDeal: 'NEW DEAL',
    finishGame: 'FINISH & RANK',
    solGuide: 'Tap any card to auto-move!',
    pyrGuide: 'Tap K (13) or 2 cards totaling 13',
    pyrNeed: 'Tap highlighted ',
    noMove: 'No auto-move for this card'
  },
  id: {
    welcomeTitle: '🕹️ Widget Arcade',
    welcomeBody: 'Pilih game instan di bawah. Semua game berjalan mulus 60fps langsung di gelembung chat lengkap dengan papan skor cloud live.',
    guestHint: 'Panggil bot ini di chat mana saja dengan mengirim pesan:',
    btnFlappy: '🐦 FLAPPY BIRD',
    btnRunner: '🥷 CYBER RUNNER',
    btnStack: '🧱 STACK TOWER',
    btnBrick: '🏓 NEON BRICK',
    btnOrbit: '🪐 ORBIT DASH',
    btnSolitaire: '🃏 KLONDIKE SOLITAIRE',
    btnPyramid: '🔺 PYRAMID SOLITAIRE',
    guestTitle: '🕹️ Widget Arcade — Mode Tamu',
    guestDesc: 'Widget interaktif 60fps dibatasi oleh server Production Telegram hanya di chat pribadi bot. Ketuk game di bawah untuk langsung bermain:',
    launchFlappy: '🐦 Mainkan Flappy Bird',
    launchRunner: '🥷 Mainkan Cyber Runner',
    launchStack: '🧱 Mainkan Stack Tower',
    launchBrick: '🏓 Mainkan Neon Brick',
    launchOrbit: '🪐 Mainkan Orbit Dash',
    launchSolitaire: '🃏 Mainkan Klondike Solitaire',
    launchPyramid: '🔺 Mainkan Pyramid Solitaire',
    tapToStart: 'KETUK UNTUK MULAI',
    dragToPlay: 'GESER ATAU KETUK',
    score: 'SKOR',
    best: 'TERBAIK',
    playAgain: 'MAIN LAGI',
    perfect: 'SEMPURNA!',
    submitScore: '☁️ SIMPAN SKOR CLOUD',
    submitting: 'MENYIMPAN...',
    submitted: '✓ TERSIMPAN DI CLOUD',
    topGlobal: '🏆 #1:',
    noRecord: 'Belum ada rekor cloud',
    newDeal: 'ACAK BARU',
    finishGame: 'SELESAI & PERINGKAT',
    solGuide: 'Ketuk kartu untuk pindah otomatis!',
    pyrGuide: 'Ketuk K (13) atau 2 kartu berjumlah 13',
    pyrNeed: 'Ketuk kartu hijau angka ',
    noMove: 'Belum ada langkah untuk kartu ini'
  }
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