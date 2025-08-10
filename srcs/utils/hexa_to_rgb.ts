export function hexToRgb(hex: string): number[] {
	if (!/^#[0-9A-F]{6}$/i.test(hex)) {
		throw new Error('Invalid hex color');
	}
	const bigint = parseInt(hex.slice(1), 16);
	return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}
