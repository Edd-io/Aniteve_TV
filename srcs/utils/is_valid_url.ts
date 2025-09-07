export function isValidUrl(url: string): boolean {
    const pattern = new RegExp('^(https://|http://)([a-z0-9.-]+)\\.([a-z]{2,6})(/[a-z0-9.-]*)*$', 'i');
	return pattern.test(url);
}
