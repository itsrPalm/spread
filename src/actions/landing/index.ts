"use server";
import axios from "axios";

const auth = {
	username: `${process.env.WP_USER}`,
	// password: encodeURIComponent(`${process.env.WP_PASS}`),
	password: `${process.env.WP_PASS}`,
};

export const onGetBlogPosts = async () => {
	try {
		const postArray: {
			id: string;
			title: string;
			image: string;
			content: string;
			createdAt: Date;
		}[] = [];
		const postsUrl = process.env.CLOUDWAYS_POSTS_URL;
		console.log("POSTS URL[LANDING INDEX]: ", postsUrl);
		if (!postsUrl) return;

		const posts = await axios.get(postsUrl, { auth });
		// console.log("POSTS RETURN[LANDING INDEX]: ", { ...posts });
		const featuredImages = process.env.CLOUDWAYS_FEATURED_IMAGES_URL;
		if (!featuredImages) return;

		let i = 0;
		while (i < posts.data.length) {
			const image = await axios.get(
				`${featuredImages}/${posts.data[i].featured_media}`,
				{ auth }
			);
			if (image) {
				//we push a post object into the array
				console.log(image.data.media_details);
				const post: {
					id: string;
					title: string;
					image: string;
					content: string;
					createdAt: Date;
				} = {
					id: posts.data[i].id,
					title: posts.data[i].title.rendered,
					image: image.data.media_details.file,
					content: posts.data[i].content.rendered,
					createdAt: new Date(posts.data[i].date),
				};
				postArray.push(post);
			}
			i++;
		}

		if (posts.data) {
			return postArray;
		}
	} catch (error) {
		console.log(error);
	}
};

export const onGetBlogPost = async (id: string) => {
	try {
		const postUrl = process.env.CLOUDWAYS_POSTS_URL;
		if (!postUrl) return;

		// Fetch the post
		const response = await axios.get(`${postUrl}/${id}`, { auth });
		// console.log("BLOG POSTS RETURN[LANDING INDEX]: ", { ...response });

		// try {
		//     const response = await axios.get(`${postUrl}/${id}`, { auth });
		//     console.log("Response Data:", response.data);
		// } catch (error) {
		//     console.error("Error fetching post:", error);
		// }

		const post = response.data; // Access the data property

		if (post) {
			const authorUrl = process.env.CLOUDWAYS_USERS_URL;
			if (!authorUrl) return;

			// Correct the author URL to use the right endpoint
			const authorResponse = await axios.get(
				`${authorUrl}${post.author}`,
				{ auth }
			);
			console.log("BLOG POSTS AUTHORS RETURN[LANDING INDEX]: ", {
				...authorResponse,
			});

			if (authorResponse.data) {
				return {
					id: post.id,
					title: post.title.rendered,
					content: post.content.rendered,
					createdAt: new Date(post.date),
					author: authorResponse.data.name,
				};
			}
		}
	} catch (error) {
		console.log("Error fetching post:", error);
	}
};
