import Head from "next/head";
import Header from "@components/Header";
import Footer from "@components/Footer";
import {getSortedPostsData} from "../lib/posts";

function getPostData(post) {
	let r = <div>ID={post.id}</div>;
	console.log(r);
	return r;
}

function getPosts(postArray) {
	console.log(postArray);
	return postArray.map((e) => {
		return getPostData(e);
	});
}

export default function Home(props) {
	console.log(props);
	let p = getPosts(props.allPostsData.postArray);
	console.log(p);
	return (
		<div className="container">
			<Head>
				<title>Next.js Starter!</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				<Header title="Welcome to my app!" />
				<p className="description">
					Get started by editing <code>pages/index.js</code>
				</p>
				<p>And here we go:</p>

				{p}
			</main>

			<Footer />
		</div>
	);
}

export async function getStaticProps() {
	const allPostsData = await getSortedPostsData();
	return {
		props: {
			allPostsData,
		},
		revalidate: 10,
	};
}
