import { API_CONFIG } from "../constants/api_config";
import { TMDBData } from "../types/tmdb";

export function getBetterPoster(tmdbData?: TMDBData | null): string | null {
	let posters = [];

	if (!tmdbData?.posters || !tmdbData.posters.length) {
		return null;
	}

	for (const poster of tmdbData.posters) {
		if (poster.iso_639_1 !== 'fr' && poster.iso_639_1 !== 'jp' && poster.iso_639_1 !== 'en') {
			continue;
		}
		posters.push(poster);
	}
	posters.sort((a, b) => {
		if (a.iso_639_1 === 'en') return -1;
		if (b.iso_639_1 === 'en') return 1;
		if (a.iso_639_1 === 'jp') return -1;
		if (b.iso_639_1 === 'jp') return 1;
		return 0;
	});
	if (posters.length === 0) {
		return null;
	}
	return API_CONFIG.TMDB.BASE_URL_IMG + posters[0].file_path;
}
