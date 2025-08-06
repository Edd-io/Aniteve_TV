import AnimeItem from "../models/anime_item";

const featuredAnime: AnimeItem = new AnimeItem(
  1,
  'A Certain Scientific Railgun',
  require('../../assets/images/bg_test.jpg'),
  'Action, Aventure, Comédie, Drame, Science fiction',
  '2009',
  '24 episodes'
);

const animeCategories = [
  {
	title: 'Populaires cette semaine',
	data: [
	  new AnimeItem(1, 'A Certain Scientific Railgun', { uri: 'https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Railgun' }, 'Action'),
	  new AnimeItem(2, 'Attack on Titan', { uri: 'https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=AOT' }, 'Action'),
	  new AnimeItem(3, 'My Hero Academia', { uri: 'https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=MHA' }, 'Aventure'),
	  new AnimeItem(4, 'Demon Slayer', { uri: 'https://via.placeholder.com/300x400/F39C12/FFFFFF?text=Demon+Slayer' }, 'Action'),
	  new AnimeItem(5, 'One Piece', { uri: 'https://via.placeholder.com/300x400/9B59B6/FFFFFF?text=One+Piece' }, 'Aventure'),
	]
  },
  {
	title: 'Nouveautés',
	data: [
	  new AnimeItem(6, 'Jujutsu Kaisen', { uri: 'https://via.placeholder.com/300x400/E74C3C/FFFFFF?text=JJK' }, 'Action'),
	  new AnimeItem(7, 'Chainsaw Man', { uri: 'https://via.placeholder.com/300x400/2C3E50/FFFFFF?text=CSM' }, 'Horror'),
	  new AnimeItem(8, 'Spy x Family', { uri: 'https://via.placeholder.com/300x400/27AE60/FFFFFF?text=SpyFamily' }, 'Comédie'),
	  new AnimeItem(9, 'Mob Psycho 100', { uri: 'https://via.placeholder.com/300x400/8E44AD/FFFFFF?text=Mob' }, 'Surnaturel'),
	  new AnimeItem(10, 'Dr. Stone', { uri: 'https://via.placeholder.com/300x400/D35400/FFFFFF?text=Dr+Stone' }, 'Science'),
	]
  }
];


export { featuredAnime, animeCategories };