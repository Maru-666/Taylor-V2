import fs from 'fs/promises';
import AdmZip from 'adm-zip';
const {
    js_beautify,
    css_beautify,
    html_beautify
} = await (await import('js-beautify')).default;
const handler = async (m, {
    args,
    command
}) => {
    try {
        const q = m.quoted || m;
        const mime = (q.msg || q).mimetype || '';

        if (mime !== "application/zip") {
            return m.reply('Invalid media type. Only "application/zip" is allowed.');
        }

        // Download the media file
        const buffer = await q.download();

        // Check the file size here
        const fileSizeInBytes = buffer.length;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        if (fileSizeInMB > 3) {
            return m.reply('Input file size is too large. It must be below 3 MB.');
        }

        const zip = new AdmZip(buffer);
        const obfuscatePromises = [];
        const start = new Date();

        const obfuscatedFiles = [];
        const errorFiles = [];

        for (const zipEntry of zip.getEntries()) {
            if (zipEntry.entryName.endsWith('.js')) {
                obfuscatePromises.push(
                    (async (zipEntry) => {
                        const jsCode = zipEntry.getData().toString('utf8');
                        try {
                            let result;
                            if (command === 'beautyjszip') {
                                result = await js_beautify(jsCode);
                            }
                            if (command === 'beautycsszip') {
                                result = await css_beautify(jsCode);
                            }
                            if (command === 'beautyhtmlzip') {
                                result = await html_beautify(jsCode);
                            }

                            if (result.error) {
                                console.error(`Gagal mengobfuskasi ${zipEntry.entryName}: ${result.error}`);
                                errorFiles.push(zipEntry.entryName);
                            } else {
                                zip.updateFile(zipEntry.entryName, Buffer.from(result, 'utf8'));
                                obfuscatedFiles.push(zipEntry.entryName);
                            }
                        } catch (error) {
                            console.error(`Gagal mengobfuskasi ${zipEntry.entryName}: ${error.message}`);
                            errorFiles.push(zipEntry.entryName);
                        }
                    })(zipEntry)
                );
            }
        }

        await Promise.all(obfuscatePromises);
        const outputZipPath = Buffer.from(zip.toBuffer()).toString('base64');
        const end = new Date();
        const processingTime = (end - start) / 1000;

        let message = `*Proses selesai dalam ${processingTime} detik.*\n`;

        if (obfuscatedFiles.length > 0) {
            message += `*File yang diobfus: ${obfuscatedFiles.length}*\n`;
        }

        if (errorFiles.length > 0) {
            message += `*File yang mengalami kesalahan: ${errorFiles.length}*\n`;
        }

        const fileName = await q.fileName || "ObfuscateZip.zip";

        // Send the obfuscated file
        await conn.sendFile(m.chat, Buffer.from(outputZipPath, 'base64'), fileName, fileName, m);

        await m.reply(message);
    } catch (err) {
        console.error(`Terjadi kesalahan: ${err.message}`);
        return m.reply(`Terjadi kesalahan saat mengobfuskasi file: ${err.message}`);
    }
};

handler.command = /^(beautyjszip|beautycsszip|beautyhtmlzip)$/i;

export default handler;