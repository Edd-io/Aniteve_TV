import Secrets from "../constants/secrets";
import AnimeItem from "../models/anime_item";

export async function fetchAllAnime({ signal }: { signal?: AbortSignal } = {}): Promise<AnimeItem[]> {
	const response = await fetch(Secrets.API_URL + '/api/get_all_anime', {
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
		genres: e?.genres ?? [],
	}));

	return mapped;
}
