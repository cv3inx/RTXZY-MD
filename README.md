<h1 align="center">RTXZY-MD</h1>

<p align="center">Bot WhatsApp multi-fitur berbasis <a href="https://zapo.to"><code>zapo-js</code></a> — 700+ plugin, ESM murni, hot-reload.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node">
  <img src="https://img.shields.io/badge/zapo--js-Latest-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="zapo-js">
  <img src="https://img.shields.io/badge/Lisensi-MIT-yellow?style=for-the-badge" alt="License">
</p>

---

## Daftar Isi

**Pemakaian**

- [Pembaruan Terbaru](#pembaruan-terbaru)
- [Persyaratan](#persyaratan)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Bot](#menjalankan-bot)
- [Daftar Argumen](#daftar-argumen)
- [Deployment](#deployment)

**Pengembangan**

- [Struktur Proyek](#struktur-proyek)
- [Cara Kerja](#cara-kerja)
- [Membuat Plugin](#membuat-plugin)
- [Lint, Format & Test](#lint-format--test)
- [MCP Development](#mcp-development)

**Lain-lain**

- [Kontributor](#kontributor)
- [Support](#support)

---

## Pembaruan Terbaru

| Perubahan                    | Keterangan                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Pindah ke zapo-js**        | Library WhatsApp diganti dari Baileys ke [`zapo-js`](https://zapo.to). Dokumentasi & MCP di [`zapo.to/mcp`](https://zapo.to/mcp) |
| **ESM (ECMAScript Modules)** | Semua file pakai `import`/`export` native, bukan `require`                                                                       |
| **Server HTTP native**       | Dependensi `express` dibuang, pakai modul `http` bawaan Node                                                                     |
| **Sesi lokal SQLite**        | Kredensial WhatsApp di `sessions/state.sqlite` (`@zapo-js/store-sqlite` + `better-sqlite3`)                                      |
| **Database bot 3 tipe**      | `sqlite` (default), `json`, atau `mongodb` — pilih di `config.js`. Semua file database ada di folder `database/`                 |
| **Login dual mode**          | QR Code (default) atau Pairing Code, diatur lewat `usePair` di `config.js`                                                       |
| **API key lewat `.env`**     | Key bisa diisi di `.env` supaya tidak ikut ter-commit                                                                            |
| **Update LID resolver**      | Penanganan JID `@lid` (format baru WhatsApp) diperbarui                                                                          |
| **Wajib Node.js 22+**        | Versi di bawah 22 ditolak saat boot                                                                                              |

---

## Persyaratan

| Komponen        | Keterangan                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| **Node.js**     | Versi **22 atau lebih baru** (dicek saat boot, di bawah itu langsung exit) |
| **ffmpeg**      | Pemrosesan video & audio                                                   |
| **imagemagick** | Manipulasi gambar                                                          |
| **webp**        | Konversi stiker                                                            |
| **python3**     | Opsional — hanya untuk `.speedtest` (menjalankan `speed.py`)               |

Saat pertama jalan, bot mengecek tool-tool ini dan menampilkan hasilnya (`x/7 tools found`). Fitur yang butuh tool yang hilang akan gagal, tapi bot tetap jalan.

> **Catatan:** Script ini **tidak mendukung** eksekusi di **Termux**.

---

## Instalasi

### Windows / VPS / RDP

Unduh dan instal:

- [Git](https://git-scm.com/downloads)
- [Node.js 22+](https://nodejs.org/en/download)
- [FFmpeg](https://ffmpeg.org/download.html) — tambahkan ke PATH
- [ImageMagick](https://imagemagick.org/script/download.php)

### VPS (Linux)

```bash
apt update && apt upgrade -y
apt install nodejs imagemagick ffmpeg -y
node -v
# Jika versi masih di bawah 22:
curl -s https://deb.nodesource.com/setup_22.x | sudo bash
apt-get install -y nodejs
```

### Clone & Install

```bash
git clone https://github.com/BOTCAHX/RTXZY-MD
cd RTXZY-MD
npm install
cp .env.example .env   # lalu isi API key-nya
```

### Docker

```bash
docker build -t rtxzy-md .
docker run -it -p 5000:5000 rtxzy-md
```

Pakai `-it` supaya QR Code atau prompt nomor bisa muncul dan terbaca. Agar sesi & data tidak hilang setiap container dibuat ulang, mount volume untuk `sessions/` dan `database/`:

```bash
docker run -it -p 5000:5000 \
  -v "$PWD/sessions:/app/sessions" \
  -v "$PWD/database:/app/database" \
  rtxzy-md
```

### Pterodactyl Panel

Caranya tergantung letak file:

**Opsi 1 — File langsung di `/home/container` (bukan dalam folder):**

- Set startup ke `node index.js` atau `npm start`

**Opsi 2 — File berada dalam folder (contoh `/home/container/RTXZY-MD`):**

1. Buka **Terminal** panel, lalu install dependensinya:
   ```bash
   cd RTXZY-MD   # atau nama folder kamu
   npm install
   ```
2. Set startup panel ke `node RTXZY-MD/index.js` (sesuaikan nama foldernya)

> **Catatan:** `sessions/`, `database/`, dan `tmp/` dibuat relatif terhadap direktori kerja panel, bukan folder bot. Jadi dengan startup di atas, folder-folder itu muncul di `/home/container`. Kalau ingin semuanya rapi di dalam satu folder, pakai Opsi 3.

**Opsi 3 — Pindahkan semua file ke `/home/container`:**

Pindahkan semua isi folder bot langsung ke `/home/container`, lalu set startup ke `node index.js` atau `npm start`.

**Cara upload file ke panel:**

Bot bisa di-clone via `git clone` langsung dari terminal panel, atau diupload sebagai arsip. Rekomendasi:

1. Download repo sebagai **ZIP** dari GitHub
2. Edit file (`config.js`, `.env`, dll) di lokal
3. Upload ke panel sebagai **ZIP** atau **tar.gz**, lalu extract di panel

> Panel biasanya punya batas view per file, jadi editing lokal lalu upload arsip lebih praktis.
>
> Konfigurasi tiap panel bisa berbeda. Pahami struktur folder server kamu dan sesuaikan startup command-nya.
>
> Pastikan Node.js egg yang dipakai versi 22+, kalau tidak bot akan error.
>
> Kalau panel tidak punya akses bash sama sekali, gunakan Opsi 1 atau Opsi 3.

---

## Konfigurasi

Semua pengaturan bot ada di satu file: [`config.js`](config.js). File ini di-`watchFile` — begitu disimpan, config langsung dimuat ulang tanpa restart bot.

### Field utama

| Field                                        | Wajib | Keterangan                                                                                       |
| -------------------------------------------- | :---: | ------------------------------------------------------------------------------------------------ |
| `owner.number`                               |  ✅   | Nomor owner, format internasional tanpa `+` (contoh `628xxx`)                                    |
| `owner.name`                                 |  ✅   | Nama owner, dipakai di beberapa pesan                                                            |
| `owner.mail`                                 |       | Email owner                                                                                      |
| `usePair`                                    |       | `false` = login QR Code (default), `true` = Pairing Code                                         |
| `botNumber`                                  |       | Nomor bot. Hanya dipakai saat `usePair: true`; kalau kosong, nomor diminta lewat prompt terminal |
| `pairingCode`                                |       | Kode pairing custom, wajib 8 karakter                                                            |
| `prefix`                                     |  ✅   | Array karakter prefix, satu karakter per entry: `['.', '#', '!', '/']`                           |
| `database`                                   |       | Tipe & lokasi database — lihat [Database](#database)                                             |
| `access.owner`                               |  ✅   | Array nomor dengan akses owner penuh (plugin bertanda `rowner`/`owner`)                          |
| `access.mods`                                |  ✅   | Array nomor moderator (plugin bertanda `mods`)                                                   |
| `access.prems`                               |  ✅   | Array nomor premium                                                                              |
| `links.group` / `links.instagram`            |       | Link yang ditampilkan di beberapa menu                                                           |
| `branding.watermark`                         |       | Nama bot, dipakai di footer pesan                                                                |
| `branding.stickerPackname` / `stickerAuthor` |       | Metadata EXIF stiker                                                                             |
| `branding.thumb`                             |       | URL thumbnail default                                                                            |
| `messages.wait` / `error` / `stickerWait`    |       | Template balasan untuk plugin `wait: true`, error, dan pembuatan stiker                          |
| `maxWarn`                                    |       | Jumlah peringatan sebelum user ditindak                                                          |
| `api.*`                                      |  ✅   | Endpoint & key API — lihat [API Key](#api-key)                                                   |

### API Key

Bot ini menggunakan **97% fitur dari Rest API**, jadi kamu **wajib mengisi apikey**.

1. Daftar di [`BOTCAHX API`](https://api.botcahx.eu.org)
2. Pilih paket yang sesuai: [`Lihat Paket`](https://api.botcahx.eu.org/price)
3. Copy apikey kamu

| Tipe        | Batas                                    |
| ----------- | ---------------------------------------- |
| **Free**    | 15 request/hari                          |
| **Premium** | Sesuai paket yang dibeli _(recommended)_ |

Ada dua cara mengisinya. **Lewat `.env` (disarankan)** — key tidak ikut ter-commit karena `.env` sudah masuk `.gitignore`:

```bash
cp .env.example .env
```

```dotenv
BOTCAHX_APIKEY=apikey_kamu
BOTCAHX_AKSESKEY=akseskey_kamu   # opsional, untuk suno ai & fitur premium
WHOISJSON_KEY=key_kamu           # opsional, untuk .whois2
```

Atau **langsung di `config.js`** pada `api.botcahx.key`. Nilai di `config.js` hanya dipakai kalau variabel `.env`-nya kosong.

Semua plugin memakai key ini lewat helper `Api` di [`lib/system/api.js`](lib/system/api.js) — apikey disuntik otomatis ke setiap URL, tidak perlu ditulis manual per plugin.

### Database

Database bot menyimpan `users`, `chats`, `stats`, `msgs`, dan `sticker`. Isinya ditulis otomatis setiap 30 detik.

```js
  database: {
    type: 'sqlite',  // 'sqlite' | 'json' | 'mongodb'
    mongoUrl: ''     // wajib diisi kalau type: 'mongodb'
  },
```

| Tipe                   | Lokasi data                | Catatan                                                                         |
| ---------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| `sqlite` **(default)** | `database/database.sqlite` | Mode WAL, satu baris per entry — tidak menulis ulang seluruh file setiap simpan |
| `json`                 | `database/database.json`   | Satu file JSON, ditulis ulang penuh setiap simpan                               |
| `mongodb`              | Server MongoDB             | Isi `mongoUrl`, contoh `mongodb://user:pass@host:27017/bot`                     |

Catatan penting:

- **Semua file database ada di folder `database/`.** Kalau kamu upgrade dari versi lama yang menyimpan `database.json` di root, datanya diimpor sekali otomatis pada boot pertama. File lama tidak dihapus, jadi aman sebagai backup.
- Argumen `--db` menimpa `database.type` tanpa mengubah `config.js`.
- Kalau `type: 'mongodb'` tapi `mongoUrl` kosong, bot berhenti dengan pesan error — bukan diam-diam jatuh ke SQLite.
- Menjalankan beberapa bot di satu folder: argumen posisional jadi prefix nama file, misal `node index.js bot2` memakai `database/bot2_database.sqlite`.

Logika pemilihan adapter ada di [`lib/database/adapter.js`](lib/database/adapter.js), dan bisa diuji sendiri:

```bash
node lib/database/adapter.js   # -> adapter.js self-check OK
```

---

## Menjalankan Bot

```bash
npm start
# atau
node index.js
```

Secara default **QR Code** muncul di terminal — scan dari WhatsApp di HP (**Perangkat tertaut → Tautkan perangkat**). Kalau QR di terminal terlalu besar atau rusak, bot juga mencetak link untuk scan lewat browser.

Mau pakai **Pairing Code**? Set di `config.js`:

```js
  usePair: true,
  botNumber: '628xxxxxxxxxx',   // kosongkan kalau mau diminta lewat prompt
  pairingCode: 'ABCD1234',      // wajib 8 karakter
```

Kode 8 karakter akan muncul di terminal — masukkan di HP lewat **Perangkat tertaut → Tautkan dengan nomor telepon**.

Sesi tersimpan di `sessions/state.sqlite`, jadi login cuma sekali. Kalau bot gagal link dengan pesan _"Couldn't link device"_, hapus folder `sessions/` lalu jalankan ulang.

---

## Daftar Argumen

```bash
node index.js [--options]
```

**Autentikasi**

| Argumen | Fungsi                                                   |
| ------- | -------------------------------------------------------- |
| `--qr`  | Paksa mode QR Code, mengabaikan `usePair` di `config.js` |

**Batasan respon**

| Argumen      | Fungsi                                                |
| ------------ | ----------------------------------------------------- |
| `--self`     | Hanya merespon owner & bot sendiri                    |
| `--pconly`   | Hanya merespon chat pribadi                           |
| `--gconly`   | Hanya merespon chat grup                              |
| `--swonly`   | Hanya merespon status                                 |
| `--nyimak`   | Mode silent — hanya log, tidak membalas               |
| `--restrict` | Aktifkan plugin bertag `admin` (berisiko kena banned) |

**Database**

| Argumen              | Fungsi                                                          |
| -------------------- | --------------------------------------------------------------- |
| `--db sqlite`        | Pakai SQLite (`database/database.sqlite`)                       |
| `--db json`          | Pakai file JSON (`database/database.json`)                      |
| `--db <mongodb url>` | Pakai MongoDB, contoh `--db mongodb://user:pass@host:27017/bot` |
| `--db <https://...>` | Pakai cloud adapter                                             |

Tanpa `--db`, bot memakai `database.type` dari `config.js`.

**Lain-lain**

| Argumen             | Fungsi                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `--prefix <prefix>` | Override prefix (setiap karakter jadi prefix terpisah)                                             |
| `--autoread`        | Tandai semua pesan masuk sebagai sudah dibaca                                                      |
| `--queque`          | Antrikan pesan masuk (delay 1 detik per pesan di antrian)                                          |
| `--img`             | Tampilkan gambar di terminal                                                                       |
| `--tmp`             | Matikan pembersihan otomatis folder `tmp` (default: file lebih dari 3 menit dihapus tiap 30 detik) |
| `--test`            | Mode pengembangan — matikan penulisan database & pembersihan tmp berkala                           |
| `--debug-lid`       | Log tambahan untuk debugging resolusi JID `@lid`                                                   |
| `<nama>`            | Argumen posisional jadi prefix nama sesi & file database (multi-bot)                               |

---

## Deployment

### Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://dashboard.render.com/blueprint/new?repo=https%3A%2F%2Fgithub.com%2FBOTCAHX%2FRTXZY-MD)

Bot membuka HTTP server di `process.env.PORT` (atau port acak kalau tidak diset) yang membalas `GET /` dengan status JSON — dipakai platform hosting untuk health check.

---

## Struktur Proyek

```
index.js            Supervisor: HTTP health server, spawn main.js, auto-restart
main.js             Wiring: config, database, plugin loader, hot-reload
config.js           Semua pengaturan bot
handler.js          Router pesan: parsing prefix, cek izin, jalankan plugin
test.js             Cek sintaks + lint semua file (npm test)

lib/
  simple.js         Layer kompatibilitas: ~90 helper di objek conn (sendFile, reply, dll)
  system/
    connection.js   Setup koneksi zapo-js, login QR/pairing, translasi event
    userDefaults.js Nilai default untuk entry user & chat di database
    api.js          Client API botcahx (apikey otomatis)
    print.js        Log pesan masuk ke terminal
    levelling.js    Rumus level & XP
    functions.js    Helper umum
  database/
    adapter.js      Pemilihan adapter database (sqlite/json/mongodb/cloud)
    sqliteDB.js     Adapter lowdb berbasis SQLite
    mongoDB.js      Adapter lowdb berbasis MongoDB
    cloudDBAdapter.js  Adapter lowdb berbasis HTTP
  media/            Konversi stiker, webp, gambar, video
  games/            State game (werewolf, tictactoe, ular tangga, dll)

plugins/            Semua fitur bot, satu file = satu fitur
  _events/          Hook otomatis tanpa perintah (autodownload, anti-link, dll)
  main/ core/ owner/ group/ tools/ info/
  downloader/ internet/ news/ ai/ maker/ sticker/ stalker/
  rpg/ game/ xp/ fun/ quotes/ islam/ primbon/ misc/ cmd/

sessions/           Kredensial WhatsApp (SQLite) — jangan di-commit
database/           Data bot — jangan di-commit
tmp/                File media sementara, dibersihkan otomatis
```

---

## Cara Kerja

### Alur boot

```
index.js  ──spawn──▶  main.js  ──▶  config.js
   │                     │
   │                     ├─▶ database (lowdb + adapter)
   │                     ├─▶ createClient()  ──▶  lib/system/connection.js  ──▶  zapo-js WaClient
   │                     ├─▶ authenticate()  ──▶  QR / Pairing Code
   │                     ├─▶ load semua plugins/**/*.js
   │                     └─▶ reloadHandler() ──▶  handler.js
   │
   └─▶ restart otomatis kalau main.js exit / error
```

[`index.js`](index.js) adalah proses induk: ia menyalakan HTTP health server, lalu menjalankan `main.js` sebagai child process dengan channel IPC. Kalau child mati atau melempar error, induk menghidupkannya kembali. Ini juga yang membuat perintah restart dari dalam bot bisa bekerja.

### Layer koneksi

`zapo-js` punya API sendiri yang berbeda dari Baileys, sedangkan ratusan plugin di repo ini ditulis untuk gaya Baileys. Jembatannya ada dua lapis:

1. [`lib/system/connection.js`](lib/system/connection.js) membungkus `WaClient` jadi objek yang bentuknya seperti socket Baileys (`conn.ev`, `conn.authState`, `conn.user`, `conn.ws`) dan menerjemahkan setiap event zapo-js ke nama event Baileys (`messages.upsert`, `group-participants.update`, `connection.update`, dan seterusnya).
2. [`lib/simple.js`](lib/simple.js) menempelkan ~90 method helper ke objek itu lewat `attach()` — `sendMessage`, `sendFile`, `reply`, `downloadM`, `groupMetadata`, `copyNForward`, dan lainnya.

Efeknya: plugin tidak perlu tahu library WhatsApp mana yang dipakai di bawahnya.

### Alur satu pesan masuk

1. `zapo-js` menerima pesan, `connection.js` menerjemahkannya, lalu emit `messages.upsert`.
2. `handler.js` menerima, memanggil `smsg()` untuk membuat objek `m` yang mudah dipakai.
3. Default user & chat diisi lewat `ensureUserAndChatDefaults()`.
4. Semua plugin dengan hook `all` dijalankan.
5. Semua plugin dengan hook `before` dijalankan — di sini fitur otomatis seperti autodownload bekerja.
6. Prefix dicocokkan, `command` dicari, izin dicek, lalu `run` plugin yang cocok dijalankan. Pencarian **berhenti pada plugin pertama yang cocok**.
7. XP, limit, dan statistik dicatat; pesan dicetak ke log terminal.

### Hot reload

Bot tidak perlu restart saat kamu mengedit kode:

| File yang diubah  | Yang terjadi                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| `plugins/**/*.js` | Plugin itu di-import ulang. Kalau ada syntax error, error dicetak dan versi lama tetap dipakai |
| `handler.js`      | Handler di-import ulang, listener dipasang ulang                                               |
| `config.js`       | Config dimuat ulang                                                                            |
| `main.js`         | Bot restart penuh oleh `index.js`                                                              |

---

## Membuat Plugin

Satu file di `plugins/` = satu fitur. Simpan file baru di kategori yang sesuai, bot langsung memuatnya tanpa restart.

### Contoh minimal

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

Contoh dengan argumen, limit, dan validasi:

```js
// plugins/internet/translate.js
const handler = {
  help: ['tr'],
  usage: 'leng text',
  tags: ['tools'],
  command: ['translate', 'tl', 'tr'],
  limit: 1,
  run: async (m, { args, usedPrefix, command }) => {
    if (!args[0]) throw `*• Contoh:* ${usedPrefix}${command} id how are you`;
    // ... proses ...
    await m.reply('hasil terjemahan');
  }
};

export default handler;
```

### Properti plugin

**Identitas & menu**

| Properti   | Tipe                            | Fungsi                                                                     |
| ---------- | ------------------------------- | -------------------------------------------------------------------------- |
| `command`  | `string` \| `RegExp` \| `array` | Perintah yang memicu plugin                                                |
| `hidden`   | `array`                         | Alias tambahan yang dikenali tapi tidak muncul di menu                     |
| `help`     | `array`                         | Nama perintah yang ditampilkan di `.menu`                                  |
| `usage`    | `string`                        | Petunjuk argumen di `.menu`, contoh `'nama_guild'`                         |
| `tags`     | `array`                         | Kategori menu (`tools`, `rpg`, `downloader`, `game`, `owner`, dan lainnya) |
| `disabled` | `boolean`                       | Matikan plugin tanpa menghapus file                                        |

**Prefix**

| Properti       | Tipe                            | Fungsi                         |
| -------------- | ------------------------------- | ------------------------------ |
| `noPrefix`     | `boolean`                       | Perintah jalan tanpa prefix    |
| `customPrefix` | `string` \| `RegExp` \| `array` | Prefix khusus untuk plugin ini |

**Izin & syarat** — kalau tidak lolos, bot membalas pesan penolakan standar dan plugin dilewati

| Properti   | Syarat                                       |
| ---------- | -------------------------------------------- |
| `rowner`   | Hanya nomor di `access.owner`                |
| `owner`    | Owner atau pesan dari bot sendiri            |
| `mods`     | Owner atau nomor di `access.mods`            |
| `premium`  | User premium                                 |
| `group`    | Hanya di grup                                |
| `private`  | Hanya di chat pribadi                        |
| `admin`    | Pengirim harus admin grup                    |
| `botAdmin` | Bot harus admin grup                         |
| `register` | User harus sudah `.daftar`                   |
| `rpg`      | Fitur RPG harus aktif di chat itu            |
| `nsfw`     | Fitur NSFW harus aktif di chat itu           |
| `limit`    | `number` — limit yang dipotong per pemakaian |
| `level`    | `number` — level minimum user                |

**Lain-lain**

| Properti | Tipe       | Fungsi                                                        |
| -------- | ---------- | ------------------------------------------------------------- |
| `exp`    | `number`   | XP yang didapat user (default `17`)                           |
| `wait`   | `boolean`  | Balas `messages.wait` dulu sebelum `run`                      |
| `fail`   | `function` | Handler custom saat izin tidak lolos (default `global.dfail`) |

### Hook

| Hook                      | Kapan jalan                            | Catatan                                                      |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| `run(m, extra)`           | Saat perintah cocok                    | Isi utama plugin                                             |
| `before(m, extra)`        | Setiap pesan, sebelum parsing perintah | Return nilai truthy untuk menghentikan pemrosesan plugin ini |
| `after(m, extra)`         | Setelah `run`, di blok `finally`       | Jalan walaupun `run` error                                   |
| `all(m, chatUpdate, Api)` | Setiap pesan, paling awal              | Untuk fitur pasif                                            |

Plugin di `plugins/_events/` umumnya hanya memakai `before` atau `all` — itulah cara fitur otomatis seperti autodownload link bekerja.

### Objek `m`

| Properti         | Isi                                                         |
| ---------------- | ----------------------------------------------------------- |
| `m.chat`         | JID chat (grup atau pribadi)                                |
| `m.sender`       | JID pengirim                                                |
| `m.isGroup`      | `true` kalau dari grup                                      |
| `m.fromMe`       | `true` kalau pesan dari bot sendiri                         |
| `m.text`         | Isi teks pesan                                              |
| `m.name`         | Nama tampilan pengirim                                      |
| `m.mtype`        | Tipe pesan (`conversation`, `imageMessage`, dan seterusnya) |
| `m.mentionedJid` | Array JID yang di-mention                                   |
| `m.quoted`       | Pesan yang di-reply, `null` kalau tidak ada                 |
| `m.id` / `m.key` | ID & key pesan                                              |

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

| Nama                     | Isi                                                     |
| ------------------------ | ------------------------------------------------------- |
| `conn`                   | Objek koneksi, semua helper `lib/simple.js` ada di sini |
| `Api`                    | Client API botcahx, apikey otomatis                     |
| `command`                | Nama perintah yang dipakai user                         |
| `usedPrefix`             | Prefix yang dipakai user                                |
| `args`                   | Argumen sebagai array                                   |
| `text`                   | Argumen sebagai satu string                             |
| `groupMetadata`          | Metadata grup                                           |
| `participants`           | Daftar anggota grup                                     |
| `user` / `bot`           | Entry peserta grup untuk pengirim dan bot               |
| `isOwner` / `isROwner`   | Status owner                                            |
| `isAdmin` / `isBotAdmin` | Status admin grup                                       |
| `isPrems`                | Status premium                                          |
| `chatUpdate`             | Event mentah dari WhatsApp                              |

### Helper `conn` yang sering dipakai

```js
await conn.sendFile(m.chat, url, 'nama.jpg', 'caption', m); // kirim media apa pun
await conn.sendMessage(m.chat, { text: 'hai', mentions: [jid] }); // kirim dengan mention
await conn.sendImageAsSticker(m.chat, buffer, m); // gambar jadi stiker
await conn.reply(m.chat, 'teks', m); // balasan
const buffer = await conn.getFile(url); // unduh file
const name = await conn.getName(jid); // nama kontak/grup
```

### Menyimpan data

Pakai `global.db.data` — jangan menulis file database secara manual. Perubahan pada objek ini otomatis disimpan setiap 30 detik, apa pun tipe database yang dipakai.

```js
const user = global.db.data.users[m.sender];
user.money += 1000;

const chat = global.db.data.chats[m.chat];
if (chat.antilink) {
  /* ... */
}
```

### Error & validasi

`throw` dengan **string** dipakai untuk pesan validasi — teksnya dibalas apa adanya ke user:

```js
if (!text) throw `*• Contoh:* ${usedPrefix}${command} halo`;
```

`Error` asli (bug, request gagal, dan sejenisnya) tidak pernah dibalas mentah ke chat: user hanya menerima `messages.error`, sementara detail lengkapnya masuk ke log server. Ini disengaja — stack trace bisa membocorkan path server, dan API key di dalamnya disensor jadi `#HIDDEN#`.

---

## Lint, Format & Test

```bash
npm test           # cek sintaks + lint seluruh file
npm run lint       # eslint
npm run lint:fix   # eslint + perbaiki otomatis
npm run format     # prettier --write
```

Jalankan `npm test` sebelum commit. Ia mengecek setiap file bisa di-parse dan lolos lint, jadi plugin yang rusak ketahuan sebelum bot dijalankan.

---

## MCP Development

Bot ini menyertakan [`@zapo-js/mcp-server`](https://zapo.to/mcp) — server Model Context Protocol yang mengekspos sesi `zapo-js` (koneksi, pairing, kirim pesan, query grup, inspeksi event) sebagai **tools** untuk LLM agent (Claude Code, Cursor, dan lainnya). Cocok untuk **development/testing**, bukan production.

### Menjalankan server

```bash
npm run mcp          # = zapo-mcp-server (stdio)
MCP_TRANSPORT=http MCP_AUTH_PATH=sessions/mcp.sqlite zapo-mcp-server
```

| Variabel           | Fungsi                                                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MCP_AUTH_PATH`    | Path store SQLite kredensial. **Gunakan path terpisah dari bot utama** (mis. `sessions/mcp.sqlite`) supaya tidak terjadi konflik `SQLITE_BUSY` saat bot & MCP jalan bersamaan |
| `MCP_SESSION_ID`   | Sesi default (mendukung multi-sesi di satu store)                                                                                                                             |
| `MCP_MAX_SESSIONS` | Batas jumlah sesi                                                                                                                                                             |
| `MCP_TRANSPORT`    | `stdio` (default) atau `http`                                                                                                                                                 |
| `MCP_LOG_LEVEL`    | Level log                                                                                                                                                                     |

### Registrasi ke Claude Code

```bash
claude mcp add zapo -- node node_modules/@zapo-js/mcp-server/dist/bin.js
```

### Alur pairing lewat MCP

`client.connect()` **memblokir sampai pairing selesai** — selalu panggil dengan `noAwait`:

```text
call({ path: 'connect', noAwait: true })
events({ types: ['auth_qr', 'auth_pairing_code', 'auth_paired', 'connection'] })
# tampilkan QR ke user, tunggu auth_paired, lalu lanjut
call({ path: 'message.send', args: ['628xxx@s.whatsapp.net', { conversation: 'halo' }] })
```

Dokumentasi lengkap & skill MCP ada di [`zapo.to/mcp`](https://zapo.to/mcp).

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

**Base original:** [`ZukaBet`](https://github.com/HelgaIlham/ZukaBet)

---

## Support

<a href="https://wa.me/6282221792667"><img src="https://img.shields.io/badge/Contact_Admin-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp"></a>
<a href="https://whatsapp.com/channel/0029VbAI9JCBKfi5qXq9yJ01"><img src="https://img.shields.io/badge/Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Channel"></a>
<a href="https://qris.zone.id/qviqy41iq"><img src="https://img.shields.io/badge/Donate-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Donate"></a>
