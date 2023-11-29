import fetch from "node-fetch"
import uploadImage from "../../lib/uploadImage.js"
import Bardie from "../../lib/ai/bardie.js"
const bard = new Bardie();
let handler = async (m, {
	conn,
	args,
	usedPrefix,
	command
}) => {
	let text
	if (args.length >= 1) {
		text = args.slice(0).join(" ")
	} else if (m.quoted && m.quoted.text) {
		text = m.quoted.text
	} else return m.reply("Input Teks")
	let q = m.quoted ? m.quoted : m
	let mime = (q.msg || q).mimetype || ""
	await m.reply(wait)
	if (!mime) {
		try {
			let res = await GoogleBard(text)
			await m.reply(res.content);
		} catch (e) {
			try {
				let res = await GoogleBardApi(text)
				await m.reply(res);
			} catch (e) {
				try {
					let res = await GoogleBardApiV2(text)
					await m.reply(res);
				} catch (e) {
					await m.reply(eror);
				}
			}
		}
	} else {
		let media = await q.download()
		let isTele = /image\/(png|jpe?g)/.test(mime)
		let link = await uploadImage(media)
		let res = await GoogleBardImg(text, link)
		await m.reply(res.content);
	}
}
handler.help = ["bard"]
handler.tags = ["ai"]
handler.command = /^(bard)$/i

export default handler

/* New Line */
async function GoogleBard(query) {
	return await bard.question({
		ask: query
	});
};

async function GoogleBardImg(query, url) {
	return await bard.questionWithImage({
		ask: query,
		image: url
	});
};

async function GoogleBardApi(query) {
	const headers = {
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
		"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
	};

	const bardRes = await fetch(`https://api.yanzbotz.my.id/api/ai/bard?query=${query}`, {
		method: "get",
		headers
	});
	const bardText = await bardRes.json();
	return bardText.result;
};

async function GoogleBardApiV2(query) {
	const headers = {
		"Host": "api.azz.biz.id",
		"X-Same-Domain": "1",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
		"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
		"Origin": "https://api.azz.biz.id",
		"Referer": "https://api.azz.biz.id"
	};

	const bardRes = await fetch(`https://api.azz.biz.id/api/bard?q=${query}&key=global`, {
		method: "get",
		headers
	});
	const bardText = await bardRes.json();
	return bardText.respon;
};