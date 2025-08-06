import AnimeItem from "../models/anime_item";

const featuredAnime: AnimeItem = new AnimeItem({
	id: 1,
	title: "'Tis Time For \"Torture,\" Princess",
	alternativeTitle: "Hime-Sama, \"Goumon\" No Jikan Desu",
	genres: [
		"Com\u00e9die",
		"Fantasy",
		"D\u00e9mons",
		"Gastronomie",
		"Torture",
		"Anime",
		"Vostfr"
	],
	url: "https://anime-sama.fr/catalogue/tis-time-for-torture-princess",
	img: "https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/tis-time-for-torture-princess.jpg"
});

const allAnime: AnimeItem[] = Array.from({ length: 150 }, (_, i) => new AnimeItem({
    id: i + 1,
    title: `Anime Title ${i + 1}`,
    img: `https://cdn.statically.io/gh/Anime-Sama/IMG/img/contenu/tis-time-for-torture-princess.jpg`,
    genres: ['Genre 1', 'Genre 2'],
    url: `https://example.com/${i + 1}`,
}));


export { featuredAnime, allAnime };