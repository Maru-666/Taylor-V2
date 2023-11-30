const BingImageCreator = await(await import('../../lib/ai/bing-image.js')).default;
import {
    randomUUID
} from "crypto";

const handler = async (m, {
	conn,
	args,
	usedPrefix,
	command
}) => {
	let text;
	if (args.length >= 1) {
		text = args.slice(0).join(" ");
	} else if (m.quoted && m.quoted.text) {
		text = m.quoted.text;
	} else {
		throw 'Input teks atau reply teks!';
	}

	await conn.reply(m.chat, wait, m);
	try {
		const response = new BingImageCreator({
			userToken: "1CBrGSpML0Fz8WQSDRzqWaeyL9zle6nYrZn6uCwVyEEO8Nqdcs4B2UGs-zBkYVeTjYmvveLcSvkWvDtPHVV8CtUt0l15dzoSU_ARtKpYzDes8WjEKQPjWX64ckraHm676gEcRMa2dVE_nGuCLpFvnkDBdzkO_Kfesi4LgVMDrucBRmOPrSOVYzqPJVFXtNIOLDlW5xOUUi3rS8ltxZfSoCQ"
		});
		const data = await response.genImageList(text, randomUUID(), true, true);

		if (data.length > 0) {
			for (let i = 0; i < data.length; i++) {
				try {
					if (!data[i].endsWith('.svg')) {
						await conn.sendFile(
							m.chat,
							data[i],
							'',
							`Image *(${i + 1}/${data.length - 1})*`,
							m,
							false, {
								mentions: [m.sender],
							}
						);
					}
				} catch (error) {
					console.error(`Error sending file: ${error.message}`);
					await m.reply(`Failed to send image *(${i + 1}/${data.length})*`);
				}
			}
		} else {
			await m.reply('No images found.');
		}
	} catch (error) {
		console.error(`Error in handler: ${error.message}`);
		await m.reply('An error occurred while processing the request.');
	}
};

handler.help = ["bingimg *[query]*"];
handler.tags = ["ai"];
handler.command = /^(bingimg)$/i;
export default handler;