import { API_CONFIG } from "../constants/api_config";
import { TMDBData } from "../types/tmdb";

export function getBetterLogo(tmdbData: TMDBData | null): string | null {
	let logos = [];

	if (!tmdbData?.logos || tmdbData.logos.length === 0) {
		return null;
	}
	for (const logo of tmdbData.logos) {
		if (logo.iso_639_1 !== 'fr' && logo.iso_639_1 !== 'jp' && logo.iso_639_1 !== 'en') {
			continue;
		}
		logos.push(logo);
	}
	logos.sort((a, b) => {
		if (a.iso_639_1 === 'en') return -1;
		if (b.iso_639_1 === 'en') return 1;
		if (a.iso_639_1 === 'jp') return -1;
		if (b.iso_639_1 === 'jp') return 1;
		return 0;
	});
	if (logos.length === 0) {
		return null;
	}
	return API_CONFIG.TMDB.BASE_URL_IMG + logos[0].file_path;
}