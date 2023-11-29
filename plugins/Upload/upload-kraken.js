import axios from 'axios';
import {
    FormData,
    Blob
} from 'formdata-node';
import {
    fileTypeFromBuffer
} from 'file-type';
const referer = 'https://krakenfiles.com';
const uloadUrlRegexStr = /url: "([^"]+)"/;

let handler = async (m, {
    args,
    usedPrefix,
    command
}) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        if (!mime) throw 'No media found';
        let media = await q.download();
        await m.reply(wait);
        const response = await uploadToKraken(q.caption.split('\n')[0] || m.name, media);
        if (response.error === '') {
            const fileSize = response.size;
            const pesan = `*Pesan Anda berhasil terkirim! 🚀*\n\n*File Detail:*\n*Name:* ${response.name}\n\n*Hash:* ${response.hash}\n*URL:* ${referer + response.url}\n*Ukuran:* ${fileSize}`;
            await m.reply(pesan);
        } else {
            await m.reply('Pesan Anda gagal terkirim. 🙁');
        }
    } catch (error) {
        console.error(error);
        await m.reply('Terjadi kesalahan dalam pemrosesan permintaan Anda. 🙁');
    }
};
handler.help = ["up2kraken"];
handler.tags = ["tools"];
handler.command = /^(up2kraken)$/i;
export default handler;

async function uploadToKraken(fileNames, content) {
    try {
        const {
            data
        } = await axios.get(referer);
        const uploadUrl = data.match(uloadUrlRegexStr)?.[1];

        if (!uploadUrl) {
            throw new Error('No regex match.');
        }
        const {
            ext,
            mime
        } = await fileTypeFromBuffer(content) || {};
        const blob = new Blob([content.toArrayBuffer()], {
            type: mime
        });
        const formData = new FormData();
        formData.append('files[]', blob, fileNames + '.' + ext);

        const response = await axios.post(uploadUrl, formData, {
            headers: {
                Referer: referer,
                'Content-Type': 'multipart/form-data'
            }
        });

        const {
            files
        } = response.data;
        const file = files[0];
        return file;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
};