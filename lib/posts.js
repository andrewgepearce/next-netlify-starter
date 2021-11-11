import fs from "fs";
import path from "path";
import matter from "gray-matter";
import imgsz from "./imageSize";
import {parseISO, format} from "date-fns";

////////////////////////////////////////////////////////////////////////////////
// https://www.theviewport.io/post/using-nextjs-and-nextimage-with-mdx-markdown-processing
// (?<altstart>!\[){1}(?<alt>.*?){1}(?<altend>\]){1}(?<urlstart>\(){1}(?<url>.*?){1}(?<urlend>\)){1}
// /(?<altstart>!\[){1}(?<alt>.*?){1}(?<altend>\]){1}(?<urlstart>\(){1}(?<url>[a-zA-Z/_\-\.~]*)(([ ])*(\")(?<title>.*)(\"))?(?<urlend>\)){1}/g
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll
////////////////////////////////////////////////////////////////////////////////

// const postsDirectory = path.join(process.cwd(), "./posts/");
// const publicDirectory = path.join(process.cwd(), "./public/");
const postsDirectory = path.join(".", "posts");
const publicDirectory = path.join(".", "public");

const regexp = new RegExp(
	/(?<altstart>!\[){1}(?<alt>.*?){1}(?<altend>\]){1}(?<urlstart>\(){1}(?<url>[a-zA-Z0-9\/_\-\.~]*)(([ ])*(\")(?<title>.*)(\"))?(?<urlend>\)){1}/g
);

export async function getSortedPostsData() {
	let postArray = [];
	let imgs = {};
	const fileNames = fs.readdirSync(postsDirectory);
	for (let i = 0; i < fileNames.length; i++) {
		////////////////////////////////////////////////////////////////////////////
		// Get the ID from the filename
		const id = fileNames[i].replace(/\.md$/, "");
		////////////////////////////////////////////////////////////////////////////
		// Read markdown file as string
		const fullPath = path.join(postsDirectory, fileNames[i]);
		const fileContents = fs.readFileSync(fullPath, "utf8");
		////////////////////////////////////////////////////////////////////////////
		// Use gray-matter to parse the post metadata section
		const matterResult = matter(fileContents);
		////////////////////////////////////////////////////////////////////////////
		// Get image sizes for any referenced images within the content
		let imgurlarray = [...matterResult.content.matchAll(regexp)];
		for (let j = 0; j < imgurlarray.length; j++) {
			try {
				const imgPath = path.join(publicDirectory, imgurlarray[j].groups.url);
				let dimension = imgsz(imgPath);
				imgs[imgurlarray[j].groups.url] = dimension;
				imgurlarray[j];
			} catch (err) {
				console.error(err);
			}
		}
		if (typeof matterResult.data === "object" && typeof matterResult.data.date == "string") {
			let yr = format(parseISO(matterResult.data.date), "yyyy");
			if (Array.isArray(matterResult.data.tags) && matterResult.data.tags.indexOf(`${yr}`) == -1) {
				matterResult.data.tags.push(`${yr}`);
			}
		}

		////////////////////////////////////////////////////////////////////////////
		// Add file results to array
		postArray.push({id, ...matterResult.data, md: matterResult.content});
	}
	postArray = postArray.sort((e1, e2) => {
		if (e1.date < e2.date) {
			return 1;
		} else if (e1.date > e2.date) {
			return -1;
		} else if (e1.date == e2.date && e1.idx > e2.idx) return 1;
		else if (e1.date == e2.date && e1.idx < e2.idx) return -1;
		else {
			return 0;
		}
	});

	// console.log(imgs);
	let tagMapping = {};
	postArray.map((post) => {
		let tags = post.tags;
		let id = post.id;
		if (Array.isArray(tags)) {
			for (let i = 0; i < tags.length; i++) {
				let tagname = tags[i].toLowerCase();
				if (!(tagname in tagMapping)) {
					tagMapping[tagname] = {};
					tagMapping[tagname].articles = [];
					tagMapping[tagname].selected = false;
				}
				if (tagMapping[tagname].articles.indexOf(id) == -1) tagMapping[tagname].articles.push(id);
			}
		}
	});
	let ret = {postArray, tagMapping, imgs};
	console.log(ret);

	return ret;
}
