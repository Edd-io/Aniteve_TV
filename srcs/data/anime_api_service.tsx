import { API_CONFIG, createHeaders } from "../constants/api_config";
import Secrets from "../constants/secrets";
import AnimeItem from "../models/anime_item";

export interface AnimeEpisodesData {
	episodes: Record<string, string[]>;
	number: number;
}

export interface ProgressDataAnime {
	episode?: number;
	find: boolean;
	progress?: number;
	season?: string;
	status?: number;
}

export enum ProgressStatus {
	IN_PROGRESS = 0,
	UP_TO_DATE = 1,
	NEW_EPISODE = 2,
	NEW_SEASON = 3,
}

export interface ProgressData {
	anime: AnimeItem;
	completed: number;
	episode: number;
	poster: string;
	progress: ProgressStatus;
	season: string;
}

export interface TMDBSearchResult {
	id: number;
	title?: string;
	name?: string;
	original_name?: string;
	overview?: string;
	poster_path?: string;
	vote_average?: number;
	vote_count?: number;
	first_air_date?: string;
	release_date?: string;
	genre_ids?: number[];
	popularity?: number;
}

export interface TMDBData {
	title?: string;
	overview?: string;
	poster_path?: string;
	vote_average?: number;
	first_air_date?: string;
	logos?: any[];
	backdrops?: backdropImage[];
	popularity?: number;
	vote_count?: number;
	posters?: any[];
	original_name?: string | null;
}

export interface backdropImage {
	aspect_ratio: number;
	height: number;
	iso_639_1: string | null;
	file_path: string;
	vote_average: number;
	vote_count: number;
	width: number;
}

export class AnimeApiService {

	constructor() {
	}

	async fetchAllAnime({ signal }: { signal?: AbortSignal } = {}): Promise<AnimeItem[]> {
		const response = await fetch(Secrets.API_URL + API_CONFIG.ENDPOINTS.GET_ALL_ANIME, {
			method: 'GET',
			headers: {
				Authorization: `${Secrets.API_TOKEN}`,
				Accept: 'application/json',
			},
			signal,
		});

		if (!response.ok) {
			throw new Error(`API error ${response.status}`);
		}

		const json = await response.json();
		const rawList = Array.isArray(json) ? json : (json?.data ?? []);

		const mapped: AnimeItem[] = (rawList as any[]).map((e: any, idx: number) => new AnimeItem({
			id: Number(e?.id ?? idx + 1),
			title: String(e?.title ?? e?.name ?? 'Untitled'),
			alternativeTitle: e?.alternativeTitle ?? e?.altTitle ?? undefined,
			img: String(e?.img ?? e?.image ?? e?.poster ?? ''),
			url: String(e?.url ?? e?.link ?? ''),
			genres: e?.genre ?? [],
		}));

		return mapped;
	}

	async fetchAverageColor({ imgUrl }: { imgUrl: string }): Promise<number[]> {
		try {
			const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_AVERAGE_COLOR}`, {
				method: 'POST',
				headers: createHeaders(Secrets.API_TOKEN),
				body: JSON.stringify({
					url: imgUrl
				}),
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			const averageColor = data?.average_color;
			if (!averageColor || averageColor.length !== 3) {
				throw new Error('Invalid average color data received');
			}
			return averageColor;
		} catch (error) {
			console.error('Error fetching average color:', error);
			throw error;
		}
	}


	async fetchAnimeSeasons(animeUrl: string): Promise<String[]> {
		try {
			const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ANIME_SEASON}`, {
				method: 'POST',
				headers: createHeaders(Secrets.API_TOKEN),
				body: JSON.stringify({
					serverUrl: "",
					url: animeUrl
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return (await response.json()).season || [];
		} catch (error) {
			console.error('Error fetching anime season:', error);
			throw error;
		}
	}

	async fetchProgress(animeId: number): Promise<ProgressDataAnime> {
		try {
			const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_PROGRESS}`, {
				method: 'POST',
				headers: createHeaders(Secrets.API_TOKEN),
				body: JSON.stringify({
					id: animeId,
					idUser: Secrets.USER_ID,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const ProgressDataAnime = await response.json();
			return ProgressDataAnime as ProgressDataAnime;
		} catch (error) {
			console.error('Error fetching progress:', error);
			throw error;
		}
	}

	async fetchAnimeEpisodes(animeUrl: string, season: string): Promise<AnimeEpisodesData> {
		try {
			const response = await fetch(`${API_CONFIG.BASE_URL}/api/get_anime_episodes`, {
				method: 'POST',
				headers: createHeaders(Secrets.API_TOKEN),
				body: JSON.stringify({
					url: animeUrl,
					season: season,
					serverUrl: API_CONFIG.BASE_URL
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching anime episodes:', error);
			throw error;
		}
	}

	private async callTMDBProxy(url: string): Promise<any> {
		const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TMDB_PROXY}`, {
			method: 'POST',
			headers: createHeaders(Secrets.API_TOKEN),
			body: JSON.stringify({ url }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	}

	async fetchTMDBData(animeName: string, isMovie: boolean = false): Promise<TMDBData> {
		try {
			const searchUrl = isMovie
				? `https://api.themoviedb.org/3/search/movie?{api_key_tmdb}&query=${encodeURIComponent(animeName)}&language=fr-FR`
				: `https://api.themoviedb.org/3/search/tv?{api_key_tmdb}&query=${encodeURIComponent(animeName)}&language=fr-FR`;

			const searchData = await this.callTMDBProxy(searchUrl);
			const allAnimeData: TMDBSearchResult[] = searchData?.results?.filter((result: TMDBSearchResult) =>
				result.genre_ids?.includes(16)
			) || [];

			if (allAnimeData.length === 0) {
				return {
					title: '',
					overview: 'Aucune information disponible sur TMDB',
					poster_path: '',
					vote_average: 0,
					first_air_date: '',
					logos: [],
					backdrops: [],
					posters: [],
					original_name: null,
				};
			}

			const calculateSimilarity = (str1: string, str2: string): number => {
				const s1 = str1.toLowerCase().trim();
				const s2 = str2.toLowerCase().trim();
				
				if (s1 === s2) return 100;
				
				if (s1.includes(s2) || s2.includes(s1)) return 80;
				
				const levenshteinDistance = (a: string, b: string): number => {
					const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
					for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
					for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
					for (let j = 1; j <= b.length; j++) {
						for (let i = 1; i <= a.length; i++) {
							matrix[j][i] = b[j - 1] === a[i - 1] 
								? matrix[j - 1][i - 1]
								: Math.min(matrix[j - 1][i - 1] + 1, matrix[j][i - 1] + 1, matrix[j - 1][i] + 1);
						}
					}
					return matrix[b.length][a.length];
				};
				
				const distance = levenshteinDistance(s1, s2);
				const maxLength = Math.max(s1.length, s2.length);
				return maxLength === 0 ? 0 : ((maxLength - distance) / maxLength) * 100;
			};

			const animeScores = allAnimeData.map((anime, index) => {
				const tmdbName = anime[isMovie ? 'title' : 'name'] || '';
				const originalName = anime.original_name || '';
				const titleScore = calculateSimilarity(animeName, tmdbName);
				const originalScore = originalName ? calculateSimilarity(animeName, originalName) : 0;
				const popularityBonus = Math.min((anime.popularity || 0) / 100, 10);
				const voteBonus = Math.min((anime.vote_count || 0) / 100, 5);
				const finalScore = Math.max(titleScore, originalScore) + popularityBonus + voteBonus;
				
				return {
					index,
					score: finalScore,
					anime,
					titleScore,
					originalScore,
					tmdbName,
					originalName,
				};
			});

			animeScores.sort((a, b) => b.score - a.score);
			const bestMatch = animeScores[0]?.anime;
			const animeId = bestMatch?.id;

			if (!animeId) {
				throw new Error('No anime ID found in TMDB results');
			}

			let imageData = null;
			try {
				const imageUrl = `https://api.themoviedb.org/3/${isMovie ? 'movie' : 'tv'}/${animeId}/images?{api_key_tmdb}&include_image_language=ja,en,null`;
				imageData = await this.callTMDBProxy(imageUrl);

				if (!imageData?.logos?.length) {
					const fallbackUrl = `https://api.themoviedb.org/3/${isMovie ? 'movie' : 'tv'}/${animeId}/images?{api_key_tmdb}`;
					imageData = await this.callTMDBProxy(fallbackUrl);
				}
			} catch (imageError) {
				console.warn('Error fetching images from TMDB:', imageError);
				imageData = { logos: [], backdrops: [] };
			}

			return {
				title: bestMatch.title || bestMatch.name,
				overview: bestMatch.overview,
				poster_path: bestMatch.poster_path,
				vote_average: bestMatch.vote_average,
				first_air_date: bestMatch.first_air_date || bestMatch.release_date,
				popularity: bestMatch.popularity,
				vote_count: bestMatch.vote_count,
				logos: imageData?.logos || [],
				backdrops: imageData?.backdrops || [],
				posters: imageData?.posters || [],
				original_name: bestMatch.original_name || null,
			};

		} catch (error) {
			console.error('Error fetching TMDB data:', error);
			throw error;
		}
	}

	async fetchVideoSource(url: string): Promise<string> {
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: createHeaders(Secrets.API_TOKEN),
				body: JSON.stringify({ serverUrl: API_CONFIG.BASE_URL }),
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data.src;
		} catch (error) {
			console.error('Error fetching video source:', error);
			throw error;
		}
	}

	async updateProgress(
		animeId: number,
		episode: number,
		totalEpisodes: number,
		seasonId: number,
		allSeasons: String[],
		progress: number,
		poster: String
	): Promise<void> {
		try {
			const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PROGRESS}`, {
				method: 'POST',
				headers: createHeaders(Secrets.API_TOKEN),
				body: JSON.stringify({
					id: animeId,
					episode: episode,
					totalEpisode: totalEpisodes,
					seasonId: seasonId,
					allSeasons: allSeasons,
					progress: progress,
					poster: poster,
					idUser: Secrets.USER_ID,
				}),
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
		} catch (error) {
			console.error('Error fetching video source:', error);
			throw error;
		}
	}

	async fetchAllProgress(): Promise<ProgressData[]> {
		try {
			const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_PROGRESS}`, {
				method: 'POST',
				headers: createHeaders(Secrets.API_TOKEN),
				body: JSON.stringify({ idUser: Secrets.USER_ID }),
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			return data.map((item: any) => ({
				anime: new AnimeItem({
					id: item.anime.id,
					title: item.anime.title,
					alternativeTitle: item.anime.alternativeTitle,
					img: item.anime.img,
					url: item.anime.url,
					genres: item.anime.genres ?? item.anime.genre ?? [],
				}),
				completed: item.completed,
				episode: item.episode,
				poster: item.poster,
				progress: item.progress,
				season: item.season,
			}));
		} catch (error) {
			console.error('Error fetching all progress:', error);
			throw error;
		}
	}
}
