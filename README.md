<h1 align="center">VIOZAP</h1>

<p align="center">Bot WhatsApp multi-fitur di atas <a href="https://zapo.to"><code>zapo-js</code></a> — 700+ plugin, ESM murni, hot-reload tanpa restart.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node">
  <img src="https://img.shields.io/badge/zapo--js-Latest-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="zapo-js">
  <img src="https://img.shields.io/badge/Lisensi-MIT-yellow?style=for-the-badge" alt="License">
</p>

---

**Pemakaian** · [Mulai Cepat](#mulai-cepat) · [Persyaratan](#persyaratan) · [Instalasi](#instalasi) · [Konfigurasi](#konfigurasi) · [Menjalankan](#menjalankan) · [Argumen CLI](#argumen-cli) · [Deployment](#deployment)

**Pengembangan** · [Struktur](#struktur-proyek) · [Cara Kerja](#cara-kerja) · [Membuat Plugin](#membuat-plugin) · [Test & Lint](#test--lint) · [MCP](#mcp)

---

## Mulai Cepat

```bash
git clone https://github.com/BOTCAHX/RTXZY-MD
cd RTXZY-MD
npm install
cp .env.example .env      # isi BOTCAHX_APIKEY
npm start                 # scan QR yang muncul di terminal
```

Login sekali saja — kredensial tersimpan di `sessions/state.sqlite`. Sisanya diatur di [`config.js`](config.js): nomor owner, prefix, dan database.

---

## Persyaratan

| Komponen        |                   | Untuk apa                                               |
| --------------- | ----------------- | ------------------------------------------------------- |
| **Node.js**     | wajib, **22+**    | Di bawah 22 ditolak saat `npm install` dan saat boot    |
| **ffmpeg**      | wajib untuk media | Video, audio, stiker animasi (perlu dukungan `libwebp`) |
| **imagemagick** | wajib untuk media | Manipulasi gambar, fallback pembuatan stiker            |
| **python3**     | opsional          | Hanya untuk `.speedtest`                                |

Saat boot, bot memprobe tool-tool ini dan melaporkan `x/7 tool tersedia`. Yang hilang tidak membuat bot mati — hanya fitur yang memakainya yang gagal.

> Tidak mendukung **Termux**.

---

## Instalasi

### Linux / VPS

```bash
apt update && apt install -y nodejs imagemagick ffmpeg
node -v                                              # harus 22+
curl -s https://deb.nodesource.com/setup_22.x | sudo bash && apt install -y nodejs   # kalau masih di bawah 22
```

### Windows / RDP

Instal [Git](https://git-scm.com/downloads), [Node.js 22+](https://nodejs.org/en/download), [FFmpeg](https://ffmpeg.org/download.html) (tambahkan ke PATH), dan [ImageMagick](https://imagemagick.org/script/download.php). Lanjut ke [Mulai Cepat](#mulai-cepat).

### Docker

```bash
docker build -t viozap .
docker run -it -p 5000:5000 \
  -v "$PWD/sessions:/app/sessions" \
  -v "$PWD/database:/app/database" \
  viozap
```

`-it` wajib supaya QR code dan prompt nomor bisa muncul. Dua volume itu juga wajib kalau tidak mau login ulang dan kehilangan data tiap container dibuat ulang.

### Pterodactyl

| Letak file                    | Startup command             | Catatan                                                                                                                   |
| ----------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Langsung di `/home/container` | `npm start`                 | Paling sederhana, semua folder rapi di satu tempat                                                                        |
| Di dalam subfolder            | `node NAMA_FOLDER/index.js` | `npm install` dulu dari terminal panel. `sessions/`, `database/`, `tmp/` lahir di cwd panel — bukan di dalam subfoldernya |

Pakai egg Node.js 22+. Kalau panel tidak punya akses bash, taruh file langsung di `/home/container`. Untuk mengedit, lebih praktis edit di lokal lalu upload ulang sebagai ZIP/tar.gz daripada mengedit lewat file manager panel.

---

## Konfigurasi

Semua di satu file: [`config.js`](config.js). File ini di-`watchFile`, jadi begitu disimpan config langsung dimuat ulang — bot tidak perlu restart.

| Field                                        | Wajib | Keterangan                                                                    |
| -------------------------------------------- | :---: | ----------------------------------------------------------------------------- |
| `owner.number` · `owner.name`                |  ✅   | Nomor owner format internasional tanpa `+` (`628xxx`), dan namanya            |
| `owner.mail`                                 |       | Email owner                                                                   |
| `prefix`                                     |  ✅   | Array karakter, satu karakter per entry: `['.', '#', '!', '/']`               |
| `access.owner`                               |  ✅   | Akses penuh — plugin bertanda `rowner` / `owner`                              |
| `access.mods` · `access.prems`               |  ✅   | Moderator dan user premium                                                    |
| `usePair`                                    |       | `false` = QR code (default), `true` = pairing code                            |
| `botNumber` · `pairingCode`                  |       | Hanya dipakai saat `usePair: true`. `botNumber` kosong = diminta lewat prompt |
| `database`                                   |       | Lihat [Database](#database)                                                   |
| `api.*`                                      |  ✅   | Lihat [API key](#api-key)                                                     |
| `branding.watermark`                         |       | Nama bot di footer pesan                                                      |
| `branding.stickerPackname` · `stickerAuthor` |       | Metadata EXIF stiker                                                          |
| `branding.thumb`                             |       | URL thumbnail default                                                         |
| `messages.wait` · `error` · `stickerWait`    |       | Template balasan untuk plugin `wait: true`, error, dan pembuatan stiker       |
| `links.group` · `links.instagram`            |       | Link yang muncul di beberapa menu                                             |
| `maxWarn`                                    |       | Jumlah peringatan sebelum user ditindak                                       |

### API key

Hampir semua fitur memanggil REST API BOTCAHX, jadi apikey **wajib**. Daftar di [api.botcahx.eu.org](https://api.botcahx.eu.org) — free 15 request/hari, atau [beli paket](https://api.botcahx.eu.org/price).

Isi lewat `.env` (disarankan — sudah masuk `.gitignore`, jadi tidak ikut ter-commit):

```dotenv
BOTCAHX_APIKEY=apikey_kamu
BOTCAHX_AKSESKEY=akseskey_kamu   # opsional: suno ai & fitur premium
WHOISJSON_KEY=key_kamu           # opsional: .whois2
DATABASE_URL=                    # opsional: lihat Database
```

Nilai di `config.js` hanya dipakai kalau variabel `.env`-nya kosong. Plugin memakai key ini lewat helper `Api` di [`lib/system/api.js`](lib/system/api.js) — apikey disuntik otomatis ke setiap URL, tidak perlu ditulis per plugin.

### Database

Database menyimpan `users`, `chats`, `stats`, `msgs`, dan `sticker`. Ditulis otomatis setiap 30 detik **dan sekali lagi saat bot berhenti** (`Ctrl+C`, `SIGTERM`, restart), supaya perubahan di antara dua penulisan tidak hilang.

Cukup isi satu field `url` — tipenya dideteksi dari skema URL-nya:

```js
  database: {
    type: 'sqlite', // dipakai kalau `url` kosong
    url: ''         // atau lewat DATABASE_URL di .env
  },
```

| Isi `url`                         | Dipakai    | Keterangan                                                 |
| --------------------------------- | ---------- | ---------------------------------------------------------- |
| kosong (**default**)              | `sqlite`   | `database/database.sqlite`, mode WAL, satu baris per entry |
| `postgres://…` / `postgresql://…` | `postgres` | Tabel `bot_data` dibuat otomatis, satu baris `jsonb`       |
| `mongodb://…` / `mongodb+srv://…` | `mongodb`  | Satu dokumen berisi seluruh database                       |
| `https://…`                       | `cloud`    | Adapter HTTP: `GET` untuk baca, `POST` untuk simpan        |

- `url` menang atas `type`, jadi mengisi `url` tidak perlu diikuti mengubah `type`.
- Kalau `type` minta postgres/mongodb tapi `url` kosong, bot berhenti dengan pesan jelas — bukan diam-diam jatuh ke SQLite.
- **Postgres:** server dengan sertifikat self-signed (Render, Heroku, dan sejenisnya) butuh `?sslmode=no-verify` di akhir URL.
- Upgrade dari versi lama yang menyimpan `database.json` di root: datanya diimpor sekali otomatis ke SQLite pada boot pertama. File lama tidak dihapus, jadi aman sebagai backup.
- Semua adapter selain sqlite menulis ulang seluruh dokumen setiap flush.

Logikanya ada di [`lib/database/adapter.js`](lib/database/adapter.js) dan bisa diuji tanpa menyalakan bot:

```bash
node lib/database/adapter.js   # -> adapter.js self-check OK
```

---

## Menjalankan

```bash
npm start        # index.js: health server + auto-restart kalau bot crash
node main.js     # tanpa supervisor — crash tetap mati, berguna saat debug
```

Default login lewat **QR code** di terminal (kalau QR-nya rusak atau kepotong, bot juga mencetak link untuk scan lewat browser). Mau **pairing code**? Set di `config.js`:

```js
  usePair: true,
  botNumber: '628xxxxxxxxxx',   // kosongkan kalau mau diminta lewat prompt
  pairingCode: 'ABCD1234',      // wajib 8 karakter
```

Masukkan kodenya di HP lewat **Perangkat tertaut › Tautkan dengan nomor telepon**.

Log terminal menyatukan pesan chat dan kejadian sistem dalam satu aliran:

```
  ● Tersambung  VIOZAP  ·  +62 811-1000-222
10:34:36  info    Menunggu pesan masuk
[ MSG ] 02/09/26 10:34:36  conversation  0B from [6285891001164]  Sariawan  in [6285891001164@s.whatsapp.net]  DM
halo bot, bisa bikin stiker?
[ CMD ] 02/09/26 10:34:36  conversation  0B from [6289882934933]  Ditzzy  in [123@g.us]  Grup Kocak  exp+17
.sticker
10:34:40  reload  plugins/main/menu.js
```

Tag di depan menandai jenisnya: `MSG` pesan biasa, `CMD` perintah, `BOT` pesan dari bot sendiri, `ERR` perintah yang error, `STUB` kejadian grup — jadi bisa langsung `grep '\[ CMD \]'`.

---

## Argumen CLI

```bash
node index.js [nama] [--options]
```

**Login**

| Argumen           | Fungsi                                              |
| ----------------- | --------------------------------------------------- |
| `--qr`            | Paksa QR code, mengabaikan `usePair` di `config.js` |
| `--reset-session` | Hapus `sessions/state.sqlite` — login dari nol      |

**Batasan respon**

| Argumen      | Fungsi                                                |
| ------------ | ----------------------------------------------------- |
| `--self`     | Hanya merespon owner & bot sendiri                    |
| `--pconly`   | Hanya chat pribadi                                    |
| `--gconly`   | Hanya grup                                            |
| `--swonly`   | Hanya status                                          |
| `--nyimak`   | Mode silent — mencatat log tanpa membalas             |
| `--restrict` | Aktifkan plugin bertag `admin` (berisiko kena banned) |

**Database & lain-lain**

| Argumen                     | Fungsi                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| `--db sqlite`               | Paksa SQLite                                                                                      |
| `--db postgres` / `mongodb` | Paksa tipe itu, URL diambil dari `config.js`                                                      |
| `--db <url>`                | URL langsung — `postgres://…`, `mongodb://…`, atau `https://…`                                    |
| `--prefix <karakter>`       | Override prefix (setiap karakter jadi prefix terpisah)                                            |
| `--autoread`                | Tandai semua pesan masuk sebagai sudah dibaca                                                     |
| `--queque`                  | Antrikan pesan masuk, delay 1 detik per pesan di antrian                                          |
| `--img`                     | Tampilkan gambar & stiker langsung di terminal                                                    |
| `--tmp`                     | Matikan pembersihan `tmp` otomatis (default: file yang tak diakses 3 menit dihapus tiap 30 detik) |
| `--test`                    | Mode pengembangan — matikan penulisan database & pembersihan tmp berkala                          |
| `--debug-lid`               | Log tambahan untuk debugging resolusi JID `@lid`                                                  |
| `nama` (posisional)         | Prefix nama sesi, file database, dan tabel postgres — untuk beberapa bot dalam satu folder        |

Contoh dua bot dalam satu checkout: `node index.js bot2` memakai `sessions/bot2/`, `database/bot2_database.sqlite`, dan tabel `bot2_bot_data`.

---

## Deployment

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://dashboard.render.com/blueprint/new?repo=https%3A%2F%2Fgithub.com%2FBOTCAHX%2FRTXZY-MD)

Bot membuka HTTP server di `process.env.PORT` (atau port acak kalau tidak diset) yang menjawab `GET /` dengan status JSON — itu yang dipakai platform hosting sebagai health check.

---

## Struktur Proyek

```
index.js            Supervisor: health server, spawn main.js, auto-restart
main.js             Perakitan: config, database, plugin loader, watcher
config.js           Semua pengaturan
handler.js          Router pesan: cocokkan prefix, cek izin, jalankan plugin

lib/
  simple.js         Layer kompatibilitas: ~90 helper di objek conn
  system/
    connection.js   Koneksi zapo-js, login QR/pairing, translasi event
    userDefaults.js Nilai default entry user & chat di database
    api.js          Client API botcahx (apikey otomatis)
    print.js        Log pesan masuk/keluar ke terminal
    log.js          Log sistem (boot, koneksi, reload, error)
    levelling.js    Rumus level & XP
  database/
    adapter.js         Pemilihan adapter (sqlite/postgres/mongodb/cloud)
    sqliteDB.js        Adapter lowdb berbasis SQLite
    postgresDB.js      Adapter lowdb berbasis PostgreSQL
    mongoDB.js         Adapter lowdb berbasis MongoDB
    cloudDBAdapter.js  Adapter lowdb berbasis HTTP
  media/            Konversi stiker, webp, gambar, video
  games/            State game (werewolf, tictactoe, ular tangga, dll)

plugins/            703 file — satu file, satu fitur
  _events/          Fitur pasif tanpa perintah (autodownload, anti-link, dll)
  ai/ cmd/ core/ downloader/ fun/ game/ group/ info/ internet/ islam/
  main/ maker/ misc/ news/ owner/ primbon/ quotes/ rpg/ stalker/
  sticker/ tools/ xp/

script/             test.js (cek sintaks) & speed.py (.speedtest)
sessions/           Kredensial WhatsApp — jangan di-commit
database/           Data bot — jangan di-commit
tmp/                Media sementara, dibersihkan otomatis
```

---

## Cara Kerja

### Alur boot

```
index.js  ──spawn──▶  main.js  ──▶  config.js
   │                     │
   │                     ├─▶ database (lowdb + adapter)
   │                     ├─▶ createClient()   ──▶  lib/system/connection.js  ──▶  zapo-js WaClient
   │                     ├─▶ authenticate()   ──▶  QR / pairing code
   │                     ├─▶ muat semua plugins/**/*.js
   │                     └─▶ reloadHandler()  ──▶  handler.js
   │
   └─▶ restart otomatis kalau main.js exit / crash
```

[`index.js`](index.js) adalah proses induk: menyalakan health server, menjalankan `main.js` sebagai child dengan channel IPC, lalu menghidupkannya lagi kalau mati. Crash berulang kena backoff eksponensial supaya tidak menghabiskan CPU. Saat `Ctrl+C`, induk menunggu maksimal 5 detik supaya child sempat menyimpan database dulu.

### Layer koneksi

`zapo-js` punya API sendiri yang berbeda dari Baileys, sedangkan ratusan plugin di repo ini ditulis gaya Baileys. Jembatannya dua lapis:

1. [`lib/system/connection.js`](lib/system/connection.js) membungkus `WaClient` jadi objek berbentuk socket Baileys (`conn.ev`, `conn.user`, `conn.authState`, `conn.ws`) dan menerjemahkan setiap event zapo ke nama event Baileys (`messages.upsert`, `group-participants.update`, `message.delete`, …).
2. [`lib/simple.js`](lib/simple.js) menempelkan ~90 helper ke objek itu lewat `attach()` — `sendMessage`, `sendFile`, `reply`, `downloadM`, `groupMetadata`, `copyNForward`, dan lainnya.

Efeknya plugin tidak perlu tahu library WhatsApp mana yang dipakai di bawahnya. Kemampuan WhatsApp yang baru ditambahkan dengan menerjemahkannya di `connection.js` dan/atau menambah helper di `simple.js` — bukan dengan memanggil `conn._client` dari plugin.

### Alur satu pesan

1. `zapo-js` menerima pesan, `connection.js` menerjemahkannya, lalu emit `messages.upsert`.
2. `handler.js` menerimanya dan memanggil `smsg()` untuk membuat objek `m` yang enak dipakai.
3. Default user & chat diisi lewat `ensureUserAndChatDefaults()`.
4. Semua plugin dengan hook `all` jalan, lalu semua hook `before` — di sini fitur otomatis seperti autodownload bekerja.
5. Prefix dicocokkan, `command` dicari, izin dicek, `run` dijalankan. Pencarian **berhenti pada plugin pertama yang cocok**.
6. XP, limit, dan statistik dicatat; pesannya dicetak ke log.

### Hot reload

| Yang diubah       | Yang terjadi                                                                     |
| ----------------- | -------------------------------------------------------------------------------- |
| `plugins/**/*.js` | Plugin itu di-import ulang. Syntax error dicetak dan versi lama tetap dipakai    |
| `handler.js`      | Handler di-import ulang, listener dipasang ulang                                 |
| `config.js`       | Config dimuat ulang                                                              |
| `main.js`         | Bot restart penuh oleh `index.js`                                                |
| **`lib/**/*.js`** | **Tidak diawasi** — perubahan di `lib/` baru berlaku setelah bot direstart penuh |

Karena re-import menjalankan ulang kode top-level modulnya, apa pun yang didaftarkan di sana akan terdaftar **dua kali**. Timer dan watcher harus dikawal seperti pola yang sudah ada — `clearInterval(global.__namaTimer)` sebelum `setInterval`, `fs.unwatchFile(file)` sebelum `fs.watchFile` (lihat [`plugins/group/remindersholat.js`](plugins/group/remindersholat.js)).

---

## Membuat Plugin

Satu file di `plugins/<kategori>/` = satu fitur. Simpan, bot langsung memuatnya.

```js
// plugins/tools/ping.js
const handler = {
  help: ['ping'],
  tags: ['tools'],
  command: ['ping', 'p'],
  run: async (m, { conn }) => {
    await m.reply('Pong!');
  }
};

export default handler;
```

Dengan argumen, limit, dan validasi:

```js
// plugins/internet/translate.js
const handler = {
  help: ['tr'],
  usage: 'kode teks',
  tags: ['tools'],
  command: ['translate', 'tl', 'tr'],
  limit: 1,
  run: async (m, { args, usedPrefix, command }) => {
    if (!args[0]) throw `*• Contoh:* ${usedPrefix}${command} id how are you`;
    await m.reply('hasil terjemahan');
  }
};

export default handler;
```

### Properti

**Identitas & menu**

| Properti   | Tipe                            | Fungsi                                                   |
| ---------- | ------------------------------- | -------------------------------------------------------- |
| `command`  | `string` \| `RegExp` \| `array` | Perintah yang memicu plugin                              |
| `hidden`   | `array`                         | Alias yang dikenali tapi tidak muncul di `.menu`         |
| `help`     | `array`                         | Nama perintah yang ditampilkan di `.menu`                |
| `usage`    | `string`                        | Petunjuk argumen di `.menu`, contoh `'nama_guild'`       |
| `tags`     | `array`                         | Kategori menu (`tools`, `rpg`, `downloader`, `owner`, …) |
| `disabled` | `boolean`                       | Matikan plugin tanpa menghapus filenya                   |

**Prefix**

| Properti       | Tipe                            | Fungsi                         |
| -------------- | ------------------------------- | ------------------------------ |
| `noPrefix`     | `boolean`                       | Perintah jalan tanpa prefix    |
| `customPrefix` | `string` \| `RegExp` \| `array` | Prefix khusus untuk plugin ini |

**Izin & syarat** — kalau tidak lolos, bot membalas pesan penolakan standar dan plugin dilewati

| Properti   | Syarat                                   |
| ---------- | ---------------------------------------- |
| `rowner`   | Hanya nomor di `access.owner`            |
| `owner`    | Owner, atau pesan dari bot sendiri       |
| `mods`     | Owner atau nomor di `access.mods`        |
| `premium`  | User premium                             |
| `group`    | Hanya di grup                            |
| `private`  | Hanya di chat pribadi                    |
| `admin`    | Pengirim harus admin grup                |
| `botAdmin` | Bot harus admin grup                     |
| `register` | User harus sudah `.daftar`               |
| `rpg`      | Fitur RPG aktif di chat itu              |
| `nsfw`     | Fitur NSFW aktif di chat itu             |
| `limit`    | `number` — limit yang dipotong per pakai |
| `level`    | `number` — level minimum user            |

**Lain-lain**

| Properti | Tipe       | Fungsi                                                  |
| -------- | ---------- | ------------------------------------------------------- |
| `exp`    | `number`   | XP yang didapat user (default `17`)                     |
| `wait`   | `boolean`  | Balas `messages.wait` dulu sebelum `run`                |
| `fail`   | `function` | Handler custom saat izin gagal (default `global.dfail`) |

### Hook

| Hook                      | Kapan jalan                            | Catatan                                     |
| ------------------------- | -------------------------------------- | ------------------------------------------- |
| `run(m, extra)`           | Saat perintah cocok                    | Isi utama plugin                            |
| `before(m, extra)`        | Setiap pesan, sebelum parsing perintah | Return truthy untuk menghentikan plugin ini |
| `after(m, extra)`         | Setelah `run`, di blok `finally`       | Jalan walaupun `run` error                  |
| `all(m, chatUpdate, Api)` | Setiap pesan, paling awal              | Untuk fitur pasif                           |

Plugin di `plugins/_events/` umumnya hanya memakai `before` atau `all` — itulah cara fitur otomatis seperti autodownload bekerja. Dua plugin yang mengaku perintah yang sama adalah bug, bukan pilihan: handler berhenti di yang pertama cocok, dan urutannya alfabetis per path.

### Objek `m`

| Properti           | Isi                                                                  |
| ------------------ | -------------------------------------------------------------------- |
| `m.chat`           | JID chat (grup atau pribadi)                                         |
| `m.sender`         | JID pengirim                                                         |
| `m.participant`    | Pengarang pesan, selalu terisi — `key.participant` hanya ada di grup |
| `m.isGroup`        | `true` kalau dari grup                                               |
| `m.fromMe`         | `true` kalau pesan dari bot sendiri                                  |
| `m.text`           | Isi teks pesan                                                       |
| `m.name`           | Nama tampilan pengirim                                               |
| `m.senderUsername` | Username WhatsApp pengirim, `null` kalau tidak ada                   |
| `m.mtype`          | Tipe pesan (`conversation`, `imageMessage`, …)                       |
| `m.mentionedJid`   | Array JID yang di-mention                                            |
| `m.quoted`         | Pesan yang di-reply, `null` kalau tidak ada                          |
| `m.id` / `m.key`   | ID & key pesan                                                       |

| Method                   | Fungsi                                              |
| ------------------------ | --------------------------------------------------- |
| `m.reply(text)`          | Balas pesan                                         |
| `m.download(saveToFile)` | Unduh media pesan jadi Buffer (atau file)           |
| `m.delete()`             | Hapus pesan                                         |
| `m.copyNForward(jid)`    | Teruskan pesan ke chat lain                         |
| `m.quoted.download()`    | Unduh media dari pesan yang di-reply                |
| `m.quoted.reply(text)`   | Balas ke pesan yang di-reply                        |
| `m.getQuotedObj()`       | Ambil pesan yang di-reply sebagai objek `m` lengkap |

### Parameter `extra`

| Nama                             | Isi                                                      |
| -------------------------------- | -------------------------------------------------------- |
| `conn`                           | Objek koneksi — semua helper `lib/simple.js` ada di sini |
| `Api`                            | Client API botcahx, apikey otomatis                      |
| `command` · `usedPrefix`         | Perintah dan prefix yang dipakai user                    |
| `args` · `text`                  | Argumen sebagai array, dan sebagai satu string           |
| `groupMetadata` · `participants` | Metadata grup dan daftar anggotanya                      |
| `user` · `bot`                   | Entry peserta grup untuk pengirim dan untuk bot          |
| `isOwner` · `isROwner`           | Status owner                                             |
| `isAdmin` · `isBotAdmin`         | Status admin grup                                        |
| `isPrems`                        | Status premium                                           |
| `chatUpdate`                     | Event mentah dari WhatsApp                               |

### Helper `conn` yang sering dipakai

```js
await conn.sendFile(m.chat, url, 'nama.jpg', 'caption', m); // kirim media apa pun
await conn.sendMessage(m.chat, { text: 'hai', mentions: [jid] }); // kirim dengan mention
await conn.sendImageAsSticker(m.chat, buffer, m); // gambar jadi stiker
await conn.reply(m.chat, 'teks', m); // balasan
const buffer = await conn.getFile(url); // unduh file
const name = await conn.getName(jid); // nama kontak/grup
const handle = await conn.getUsername(jid); // username, null kalau tidak ada
```

`conn.getUsername()` di-cache termasuk hasil negatifnya, jadi aman dipanggil per pesan; `conn.getUsername(jid, true)` melewati jaringan sepenuhnya. `conn.getName()` memakai username sebagai fallback sebelum menampilkan digit LID mentah.

**JID `@lid`.** JID bisa datang sebagai `@lid` sesering `@s.whatsapp.net`. Bandingkan dan mention lewat `conn.getJid()` / `resolveLidJid()` / perbandingan digit — jangan pernah dengan `===` string mentah. Mention ke `@lid` yang belum diresolusi akan tampil salah di HP.

**Pengaturan per-chat** lewat `conn.chatModify(mods, jid)`, bentuknya sama seperti Baileys, satu operasi per panggilan:

```js
await conn.chatModify({ archive: true }, m.chat);
await conn.chatModify({ pin: true }, m.chat);
await conn.chatModify({ mute: 8 * 3600 * 1000 }, m.chat); // milidetik; null = unmute
await conn.chatModify({ markRead: true }, m.chat);
await conn.chatModify({ clear: 'all' }, m.chat);
await conn.chatModify({ delete: true }, m.chat);
```

`mods` yang tidak dikenal **melempar error**, bukan diabaikan — salah tulis langsung ketahuan. Semua ini app-state mutation: ikut tersinkron ke perangkat tertaut lain, dan hanya mengubah tampilan akun bot, bukan tampilan peer.

**Link preview.** Pesan teks bisa membawa thumbnail tanpa mengirim gambar yang harus diunduh:

```js
await conn.reply(m.chat, text, m, {
  linkPreview: { title: 'Judul', description: 'Deskripsi', matchedText: 'https://contoh.dev', thumbnail: { bytes: jpegBuffer, width: 640, height: 400 } }
});
```

`linkPreview: true` membuat zapo mengambil sendiri title/deskripsi/thumbnail dari URL di dalam teks. Objek override melewati fetch itu. Yang perlu diketahui: thumbnail wajib **JPEG** dan hanya disisipkan inline kalau **≤ 64 KB**; tanpa `matchedText` (atau URL di dalam teks) preview dibuang tanpa suara; dan proto zapo tidak punya field `canonicalUrl`, jadi apakah klien WhatsApp benar-benar menggambar kartunya masih belum terverifikasi.

**Notifikasi MEX** — perubahan username kontak, rotasi LID, dan kuota pesan keluar datang lewat satu event:

```js
conn.ev.on('mex.notification', (ev) => {
  if (ev.kind === 'username_set') console.log(ev.lidJid, '->', ev.username);
  if (ev.kind === 'message_capping') console.log(ev.cappingStatus, ev.usedQuota, '/', ev.totalQuota);
});
```

`kind` yang ada: `username_set`, `username_delete`, `username_update_hint`, `own_username_sync`, `text_status_update`, `text_status_update_hint`, `lid_change`, `message_capping`, `unknown`. Bot otomatis mencetak peringatan kalau `message_capping` bukan `NONE` — itu tanda akun mendekati batas kirim.

### Menyimpan data

Pakai `global.db.data`, jangan menulis file database sendiri. Perubahan pada objek ini tersimpan otomatis, apa pun tipe database yang dipakai:

```js
global.db.data.users[m.sender].money += 1000;
if (global.db.data.chats[m.chat].antilink) {
  /* ... */
}
```

Field baru untuk user/chat didaftarkan di [`lib/system/userDefaults.js`](lib/system/userDefaults.js), bukan ditulis ad hoc dari plugin.

### Error & validasi

`throw` dengan **string** adalah pesan validasi — teksnya dibalas apa adanya ke user:

```js
if (!text) throw `*• Contoh:* ${usedPrefix}${command} halo`;
```

`Error` asli (bug, request gagal) **tidak pernah** dibalas mentah: user hanya menerima `messages.error`, sementara detailnya masuk ke log server dengan API key disensor jadi `#HIDDEN#`. Ini disengaja — stack trace bisa membocorkan path server.

---

## Test & Lint

```bash
npm test           # cek sintaks (node -c) semua file di root, lib/, dan plugins/
npm run lint       # eslint; lint:fix untuk autofix
npm run format     # prettier --write
```

`npm test` **bukan** lint — ia hanya memastikan setiap file bisa di-parse. Jalankan keduanya sebelum commit.

Unit test tinggal di dasar modul yang diujinya, dijaga `if (process.argv[1] === import.meta.filename)` dan memakai `node:assert`. Tidak ada framework test dan tidak ada folder `test/`. Jalankan satu modul untuk mengetesnya:

```bash
node lib/simple.js                # -> simple.js self-check OK
node lib/database/adapter.js
node lib/database/postgresDB.js
node lib/system/connection.js
node lib/system/print.js
node lib/system/api.js
node lib/system/userDefaults.js
```

Global baru harus ikut didaftarkan di blok `globals` [`eslint.config.js`](eslint.config.js), kalau tidak `no-undef` gagal — ESM selalu strict mode, jadi global yang tidak terdefinisi itu `ReferenceError`, bukan `undefined`.

Prettier di repo ini memakai `printWidth: 100000`. Baris sangat panjang itu output formatter, bukan kesalahan — jalankan `npm run format` daripada memotong baris manual.

---

## MCP

Dua MCP server terdaftar project-scope di [`.mcp.json`](.mcp.json), jadi agen AI (Claude Code, Cursor, …) langsung dapat keduanya saat membuka repo ini:

| Nama        | Jenis | Fungsi                                                                      |
| ----------- | ----- | --------------------------------------------------------------------------- |
| `zapo-docs` | http  | Cari & baca dokumentasi zapo on demand ([zapo.to/mcp](https://zapo.to/mcp)) |
| `zapo`      | stdio | Sesi WaClient nyata: pairing, kirim pesan, inspeksi event & log             |

`zapo` dijalankan lokal dari `@zapo-js/mcp-server` (`npm run mcp` untuk menjalankannya manual). Tool yang disediakan: `call`, `inspect`, `events`, `logs`, `lifecycle`, `restart`.

Sesi WhatsApp-nya **terpisah** dari sesi bot — `MCP_AUTH_PATH=sessions/mcp.sqlite`, bukan `sessions/state.sqlite`. Itu disengaja: berbagi satu store SQLite memicu `SQLITE_BUSY`. Konsekuensinya MCP butuh pairing sendiri, dan `connect()` memblokir sampai pairing selesai — jadi selalu panggil dengan `noAwait`:

```text
call({ path: 'connect', noAwait: true })
events({ types: ['auth_qr', 'auth_pairing_code', 'auth_paired', 'connection'] })
call({ path: 'message.send', args: ['628xxx@s.whatsapp.net', { conversation: 'halo' }] })
```

| Variabel         | Fungsi                                                      |
| ---------------- | ----------------------------------------------------------- |
| `MCP_AUTH_PATH`  | Path store SQLite kredensial (default `.auth/state.sqlite`) |
| `MCP_SESSION_ID` | ID sesi, mendukung beberapa sesi dalam satu store           |
| `MCP_TRANSPORT`  | `stdio` (default) atau `http`                               |
| `MCP_LOG_LEVEL`  | Level log                                                   |

Ini alat **development**, bukan untuk production. Dokumentasi lengkap di [zapo.to/mcp](https://zapo.to/mcp).

---

## Kontributor

<p align="center">
  <a href="https://github.com/BOTCAHX"><img src="https://github.com/BOTCAHX.png?size=100" width="100" height="100" alt="Tio"></a>
  <a href="https://github.com/ERLANRAHMAT"><img src="https://github.com/ERLANRAHMAT.png?size=100" width="100" height="100" alt="Erlan"></a>
  <a href="https://github.com/BochilGaming"><img src="https://github.com/BochilGaming.png?size=100" width="100" height="100" alt="Bochilgaming"></a>
  <a href="https://github.com/Nurutomo"><img src="https://github.com/Nurutomo.png?size=100" width="100" height="100" alt="Nurutomo"></a>
</p>

| [Tio](https://github.com/BOTCAHX) | [Erlan](https://github.com/ERLANRAHMAT) | [Bochilgaming](https://github.com/BochilGaming) | [Nurutomo](https://github.com/Nurutomo) |
| --------------------------------- | --------------------------------------- | ----------------------------------------------- | --------------------------------------- |
| Recode                            | Contributor                             | Sepuh                                           | Sepuh                                   |

**Base original:** [`ZukaBet`](https://github.com/HelgaIlham/ZukaBet) · **Upstream:** [`RTXZY-MD`](https://github.com/BOTCAHX/RTXZY-MD)

---

## Support

<a href="https://wa.me/6282221792667"><img src="https://img.shields.io/badge/Contact_Admin-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp"></a>
<a href="https://whatsapp.com/channel/0029VbAI9JCBKfi5qXq9yJ01"><img src="https://img.shields.io/badge/Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Channel"></a>
<a href="https://qris.zone.id/qviqy41iq"><img src="https://img.shields.io/badge/Donate-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Donate"></a>
