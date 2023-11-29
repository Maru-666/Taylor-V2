import CharacterAI from 'node_characterai';
const characterAI = new CharacterAI();
await characterAI.authenticateWithToken("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkVqYmxXUlVCWERJX0dDOTJCa2N1YyJ9.eyJpc3MiOiJodHRwczovL2NoYXJhY3Rlci1haS51cy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjU1ZjZjZjU1MGVkYzMyNjkzZTRjN2FjIiwiYXVkIjpbImh0dHBzOi8vYXV0aDAuY2hhcmFjdGVyLmFpLyIsImh0dHBzOi8vY2hhcmFjdGVyLWFpLnVzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3MDA3NTQ3OTAsImV4cCI6MTcwMzM0Njc5MCwiYXpwIjoiZHlEM2dFMjgxTXFnSVNHN0Z1SVhZaEwyV0VrbnFaenYiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIn0.UynMGJxNTmWqzz_LyIqIY_VGlO2rZWc3ftAi5RbUe-B72HFmq3o0Rc4MZz2rTjVUGmCwp0BHu8HYk9-RGVO306N60bXT5ozT9YrqCb0Hg_k88GqA1dZHzjNrbdKvlJfbX9i_ierxWWRH2aD83zxIo4OlQXavztM4Puj_f5tdUeDiMrqwcQyv96LPzH8yHvKR6UCUI7NlJua6hjN-pgM5X2bckgjwRrMTF5uwLslFkNkw0wUlvxCMQz8lAN70WaOUZmGYufT1Bx5hXlSsM2cr59we9JkfK0BDWU0LEhy-Basrb442QQ1iAHswVgjnUseW7akhmEyZCGzJrZqAkHxaIw")

export async function before(m) {
  this.cai = this.cai || {};
  
  if (m.isBaileys || !global.db.data.chats[m.chat].cai || !m.text) return false;

  const text = m.text.replace(/[^\x00-\x7F]/g, '').trim();
  if (!text) return false;

  const words = text.split(' ');

  if (words.length === 3 && words[0].toLowerCase() === 'cai' && words[1] && !isNaN(words[2])) {
    try {
      const chat = await characterAI.searchCharacters(words[1]);
      const characterIds = chat.characters;
      const characterNumber = parseInt(words[2]) - 1;

      if (characterNumber >= 0 && characterNumber < characterIds.length) {
        this.cai[m.chat] = { id: characterIds[characterNumber].external_id };
        await this.reply(m.chat, `*Nama karakter diatur menjadi:*\n *- Title:* ${characterIds[characterNumber].title || ''}\n*- Name:* ${characterIds[characterNumber].participant__name || ''}`, m);
      } else {
        const characterList = characterIds.map((char, index) => `*${index + 1}.* ${char.title}\n  - ${char.participant__name}`).join('\n');
        await this.reply(m.chat, `*Nomor karakter tidak valid*\n*List nama karakter:*\n${characterList}`, m);
        return true;
      }
    } catch (error) {
      console.error('Error searching characters:', error);
    }
  } else if (text.trim().toLowerCase() === 'cai stop') {
    delete this.cai[m.chat];
    await this.reply(m.chat, `*Sesi cai telah dihentikan*`, m);
    return true;
  }

  if (this.cai[m.chat].id) {
    try {
      const characterId = this.cai[m.chat].id;
      const chat = await characterAI.createOrContinueChat(characterId);
      const response = await chat.sendAndAwaitResponse(encodeURIComponent(text), true);

      if (response) {
        await this.reply(m.chat, response.text || '', m);
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  } else {
    await this.reply(m.chat, `*External ID belum diatur. Mohon setel terlebih dahulu.*`, m);
  }

  return true;
}