import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG, createHeaders } from "../constants/api_config";
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
	completed?: number;
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
	find: boolean;
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

export interface User {
	id: number;
	name: string;
}

export interface Season {
	name: string;
	url: string;
	lang: string;
}

export class AnimeApiService {
	private static token: string = '';
	private static baseUrl: string = '';
	private static user: User | null = null;

	constructor() {
	}

	static setToken(token: string) {
		AnimeApiService.token = token;
	}

	static setBaseUrl(baseUrl: string) {
		AnimeApiService.baseUrl = baseUrl;
	}

	static setUser(user: User | null) {
		AnimeApiService.user = user;
	}

	static getActualUser(): User | null {
		return AnimeApiService.user;
	}

	async login(addr: string, password: string): Promise<void> {
		try {
			const response = await fetch(`${addr}${API_CONFIG.ENDPOINTS.LOGIN}`, {
				method: 'POST',
				headers: createHeaders(),
				body: JSON.stringify({
					addr: addr,
					password: password,
				}),
			});
			if (!response.ok) {
				throw new Error(`Erreur ${response.status}, veuillez vérifier vos informations de connexion`);
			}
			const data = await response.json();
			if (data?.token && typeof data.token === 'string') {
				AnimeApiService.setToken(data.token);
				AnimeApiService.setBaseUrl(addr);
				await AsyncStorage.setItem('token', data.token);
				await AsyncStorage.setItem('addr', addr);
			} else if (data?.error) {
				throw new Error('Mot de passe incorrect');
			} else {
				throw new Error('Mot de passe ou adresse incorrecte');
			}
		} catch (error) {
			console.error('Error during login:', error);
			throw error;
		}
	}

	async checkTokenValidity(token: string, addr: string): Promise<boolean> {
		try {
			const response = await fetch(`${addr}${API_CONFIG.ENDPOINTS.CHECK_TOKEN}`, {
				method: 'POST',
				headers: createHeaders(),
				body: JSON.stringify({ token }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			if (data?.status === 'success') {
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error checking token validity:', error);
			return false;
		}
	}

	async fetchAllUsers(): Promise<User[]> {
		try {
			const response = await fetch(`${AnimeApiService.baseUrl}${API_CONFIG.ENDPOINTS.GET_USERS}`, {
				method: 'GET',
				headers: createHeaders(AnimeApiService.token),
			});

			if (!response.ok) {
				throw new Error(`API error ${response.status}`);
			}
			const json = await response.json();
			return json || [];
		} catch (error) {
			console.error('Error fetching users:', error);
			throw error;
		}
	}

	async addNewUser(name: string): Promise<boolean> {
		try {
			const response = await fetch(`${AnimeApiService.baseUrl}/api/add_user`, {
				method: 'POST',
				headers: createHeaders(AnimeApiService.token),
				body: JSON.stringify({ name }),
			});

			if (!response.ok) {
				throw new Error(`API error ${response.status}`);
			}

			const json = await response.json();
			return json.status === 'success';
		} catch (error) {
			console.error('Error adding new user:', error);
			throw error;
		}
	}

	async fetchAllAnime({ signal }: { signal?: AbortSignal } = {}): Promise<AnimeItem[]> {
		try {
			const response = await fetch(AnimeApiService.baseUrl + API_CONFIG.ENDPOINTS.GET_ALL_ANIME, {
				method: 'GET',
				headers: createHeaders(AnimeApiService.token),
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
		} catch (error) {
			console.error('Error fetching all anime:', error);
			throw error;
		}
	}

	async fetchAverageColor({ imgUrl }: { imgUrl: string }): Promise<number[]> {
		try {
			const response = await fetch(`${AnimeApiService.baseUrl}${API_CONFIG.ENDPOINTS.GET_AVERAGE_COLOR}`, {
				method: 'POST',
				headers: createHeaders(AnimeApiService.token),
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


	async fetchAnimeSeasons(animeUrl: string): Promise<Season[]> {
		try {
			const response = await fetch(`${AnimeApiService.baseUrl}${API_CONFIG.ENDPOINTS.GET_ANIME_SEASON}`, {
				method: 'POST',
				headers: createHeaders(AnimeApiService.token),
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
			const response = await fetch(`${AnimeApiService.baseUrl}${API_CONFIG.ENDPOINTS.GET_PROGRESS}`, {
				method: 'POST',
				headers: createHeaders(AnimeApiService.token),
				body: JSON.stringify({
					id: animeId,
					idUser: AnimeApiService.user?.id ?? -1,
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
			const response = await fetch(`${AnimeApiService.baseUrl}${API_CONFIG.ENDPOINTS.GET_ANIME_EPISODES}`, {
				method: 'POST',
				headers: createHeaders(AnimeApiService.token),
				body: JSON.stringify({
					url: animeUrl,
					season: season,
					serverUrl: AnimeApiService.baseUrl
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
		const response = await fetch(`${AnimeApiService.baseUrl}${API_CONFIG.ENDPOINTS.TMDB_PROXY}`, {
			method: 'POST',
			headers: createHeaders(AnimeApiService.token),
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
			
			let allAnimeData: TMDBSearchResult[] = searchData?.results?.filter((result: TMDBSearchResult) =>
				result.genre_ids?.includes(16)
			) || [];

			if (allAnimeData.length === 0) {
				allAnimeData = searchData?.results || [];
			}

			if (allAnimeData.length === 0) {
				const englishSearchUrl = isMovie
					? `https://api.themoviedb.org/3/search/movie?{api_key_tmdb}&query=${encodeURIComponent(animeName)}&language=en-US`
					: `https://api.themoviedb.org/3/search/tv?{api_key_tmdb}&query=${encodeURIComponent(animeName)}&language=en-US`;
				
				const englishSearchData = await this.callTMDBProxy(englishSearchUrl);
				allAnimeData = englishSearchData?.results || [];
			}

			if (allAnimeData.length === 0) {
				
				const searchVariations = [];
				
				const withoutPunctuation = animeName.replace(/[^\w\s]/g, '').trim();
				if (withoutPunctuation !== animeName) {
					searchVariations.push(withoutPunctuation);
				}
				
				const words = animeName.split(/\s+/);
				for (let i = 1; i <= Math.min(3, words.length); i++) {
					const shortVersion = words.slice(0, i).join(' ');
					if (shortVersion !== animeName && !searchVariations.includes(shortVersion)) {
						searchVariations.push(shortVersion);
					}
				}
				
				const wordsToTry = animeName.split(/\s+/).filter(word => 
					!['ga', 'wo', 'ni', 'no', 'wa', 'de', 'to', '!', '?'].includes(word.toLowerCase())
				);
				if (wordsToTry.length > 0 && wordsToTry.join(' ') !== animeName) {
					searchVariations.push(wordsToTry.join(' '));
				}

				for (const variation of searchVariations) {
					const variationUrl = isMovie
						? `https://api.themoviedb.org/3/search/movie?{api_key_tmdb}&query=${encodeURIComponent(variation)}&language=en-US`
						: `https://api.themoviedb.org/3/search/tv?{api_key_tmdb}&query=${encodeURIComponent(variation)}&language=en-US`;
					
					try {
						const variationData = await this.callTMDBProxy(variationUrl);
						const variationResults = variationData?.results || [];
						
						if (variationResults.length > 0) {
							allAnimeData = variationResults;
							break;
						}
					} catch (error) {
						console.warn(`Error with variation "${variation}":`, error);
					}
				}
			}

			if (allAnimeData.length === 0) {
				const firstWord = animeName.split(/\s+/)[0];
				if (firstWord.length > 2) {
					console.log(`Last attempt with first word: "${firstWord}"`);
					const lastAttemptUrl = `https://api.themoviedb.org/3/search/tv?{api_key_tmdb}&query=${encodeURIComponent(firstWord)}&language=en-US`;
					
					try {
						const lastAttemptData = await this.callTMDBProxy(lastAttemptUrl);
						const lastAttemptResults = lastAttemptData?.results || [];
						
						const possibleAnimes = lastAttemptResults.filter((result: TMDBSearchResult) => {
							const name = (result.name || '').toLowerCase();
							const originalName = (result.original_name || '').toLowerCase();
							
							return result.genre_ids?.includes(16) ||
								   name.includes('anime') ||
								   originalName.includes('anime') ||
								   result.genre_ids?.includes(10759) ||
								   result.genre_ids?.includes(10765);
						});
						
						if (possibleAnimes.length > 0) {
							allAnimeData = possibleAnimes;
						}
					} catch (error) {
						console.warn(`Error with last attempt search:`, error);
					}
				}
			}

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

				const normalize = (str: string) => str.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
				const n1 = normalize(s1);
				const n2 = normalize(s2);
				
				if (n1 === n2) return 95;
				if (n1.includes(n2) || n2.includes(n1)) return 75;

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
				headers: createHeaders(AnimeApiService.token),
				body: JSON.stringify({ serverUrl: AnimeApiService.baseUrl }),
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
		allSeasons: Season[],
		progress: number,
		poster: String
	): Promise<void> {
		try {
			const response = await fetch(`${AnimeApiService.baseUrl}${API_CONFIG.ENDPOINTS.UPDATE_PROGRESS}`, {
				method: 'POST',
				headers: createHeaders(AnimeApiService.token),
				body: JSON.stringify({
					id: animeId,
					episode: episode,
					totalEpisode: totalEpisodes,
					seasonId: seasonId,
					allSeasons: allSeasons,
					progress: progress,
					poster: poster,
					idUser: AnimeApiService.user?.id ?? -1,
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
			const response = await fetch(`${AnimeApiService.baseUrl}${API_CONFIG.ENDPOINTS.GET_ALL_PROGRESS}`, {
				method: 'POST',
				headers: createHeaders(AnimeApiService.token),
				body: JSON.stringify({ idUser: AnimeApiService.user?.id ?? -1 }),
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
				find: true,
			} as ProgressData));
		} catch (error) {
			console.error('Error fetching all progress:', error);
			throw error;
		}
	}
}
