FROM node:22-bookworm

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

# index.js pakai port acak kalau PORT tidak diset, jadi EXPOSE di bawah
# hanya berguna kalau portnya dipatok.
ENV PORT=5000
EXPOSE 5000

CMD ["node", "index.js"]
