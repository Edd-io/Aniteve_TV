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
