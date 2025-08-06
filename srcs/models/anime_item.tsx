interface AnimeItemProps {
	id: number;
	title: String;
	alternativeTitle?: String;
	img: String;
	url: String;
	genres: String[];
}

class AnimeItem {
	id: number;
	title: String;
	alternativeTitle?: String;
	img: String;
	url: String;
	genres: String[];

	constructor({ id, title, alternativeTitle, img, url, genres }: AnimeItemProps) {
		this.id = id;
		this.title = title;
		this.alternativeTitle = alternativeTitle;
		this.img = img;
		this.url = url;
		this.genres = genres;
	}
}

export default AnimeItem;