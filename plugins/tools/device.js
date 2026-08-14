import * as zapo from '../../lib/simple.js';

const handler = {
  help: ['device'],
  tags: ['tools'],
  command: 'device',
  run: async (m) => {
    const { getDevice } = zapo;

    m.reply(await getDevice(m.quoted ? m.quoted.id : m.key.id));
  }
};

export default handler;
