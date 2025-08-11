export class Colors {
	static primary = '#626262';

	static setPrimaryColor(color: string) {
		if (/^#[0-9A-F]{6}$/i.test(color)) {
			Colors.primary = color;
		} else {
			console.warn('Invalid hex color provided:', color);
			Colors.primary = '#626262';
		}
	}

	static getPrimaryColor(): string {
		return Colors.primary;
	}

	static availableColors = [
		{ name: 'Gris', value: '#626262' },
		{ name: 'Bleu', value: '#3498db' },
		{ name: 'Rouge', value: '#e74c3c' },
		{ name: 'Vert', value: '#2ecc71' },
		{ name: 'Orange', value: '#f39c12' },
		{ name: 'Violet', value: '#9b59b6' },
		{ name: 'Rose', value: '#e91e63' },
		{ name: 'Cyan', value: '#1abc9c' },
	]
}