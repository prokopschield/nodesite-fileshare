'use strict';
var _a;
const filelist = document.querySelector('ul#files');
if (!filelist) {
	console.error('Malformed html, missing ul#files.');
}
const upload = document.querySelector('button#upload');
if (!upload) {
	console.error('Malformed html, missing button#upload.');
}
const files = [
	...((filelist === null || filelist === void 0
		? void 0
		: filelist.querySelectorAll('li')) || []),
].map((li) => {
	var _a;
	const a = li.querySelector('a');
	const href = a === null || a === void 0 ? void 0 : a.href;
	const match =
		href === null || href === void 0
			? void 0
			: href.match(/([^\/]+)\/([0-9a-f]{64})\.([a-z0-9]+)$/);
	if (match) {
		const [, name, hash, ext] = match;
		return {
			alias: (a === null || a === void 0 ? void 0 : a.innerHTML) || name,
			description:
				((_a = li.querySelector('.description')) === null ||
				_a === void 0
					? void 0
					: _a.innerHTML) || '',
			name,
			hash,
			ext,
			li,
		};
	} else {
		return {
			alias: 'Error: invalid entry',
			description: '',
			name: href || '',
			hash: '',
			ext: '',
			li,
		};
	}
});
function render(file) {
	for (const child of [...file.li.querySelectorAll('*')]) {
		file.li.removeChild(child);
	}
	const delb = document.createElement('span');
	delb.classList.add('embtn');
	delb.innerHTML = '🗑️';
	delb.addEventListener('click', () => {
		filelist === null || filelist === void 0
			? void 0
			: filelist.removeChild(file.li);
		update();
	});
	file.li.appendChild(delb);
	const anchor = document.createElement('a');
	anchor.href = `${file.name}/${file.hash}.${file.ext}`;
	anchor.innerHTML = file.alias || file.name;
	file.li.appendChild(anchor);
	const rename = document.createElement('span');
	rename.classList.add('embtn');
	rename.innerHTML = '🖍️';
	rename.addEventListener('click', () => {
		file.alias = prompt('New file name', file.alias) || file.alias;
		update(file);
	});
	file.li.appendChild(rename);
	const description = document.createElement('span');
	description.classList.add('description');
	description.innerHTML = file.description;
	file.li.appendChild(description);
	const edit_description = document.createElement('span');
	edit_description.classList.add('embtn');
	edit_description.innerHTML = '🖍️';
	edit_description.addEventListener('click', () => {
		file.description =
			prompt('New description', file.description) || file.description;
		update(file);
	});
	file.li.appendChild(edit_description);
}
for (const file of files) {
	render(file);
}
async function send_something(what_to_set) {
	var _a;
	const res = await fetch('/static/put', {
		method: 'PUT',
		body: what_to_set,
	});
	const hash =
		((_a = res.headers.get('content-type')) === null || _a === void 0
			? void 0
			: _a.toLowerCase()) == 'application/json'
			? (await res.json()).hash
			: await res.text();
	return hash;
}
let next_update_id = 0;
let latest_update_id = 0;
async function update(file) {
	const update_id = (latest_update_id = next_update_id++);
	if (file) {
		render(file);
	}
	const hash = await send_something(document.documentElement.innerHTML);
	if (update_id == latest_update_id && hash.length == 64) {
		history.pushState('', '', `${hash}.html`);
	}
}
const size_s_powers = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
function get_size_s(size) {
	let power = 0;
	while (size > 1024) {
		++power;
		size /= 102.4;
		size = Math.round(size);
		size /= 10;
	}
	return `${size} ${size_s_powers[power]}`;
}
(_a = document.querySelector('#upload')) === null || _a === void 0
	? void 0
	: _a.addEventListener('click', () => {
			const input = document.createElement('input');
			input.setAttribute('multiple', 'multiple');
			input.setAttribute('type', 'file');
			input.onchange = (e) => {
				if (!input.files) return input.click();
				[...input.files].forEach(async (file) => {
					const hash = await send_something(file);
					const li = document.createElement('li');
					li.classList.add('file');
					const name_parts = file.name.split('.');
					const ext =
						(name_parts.length > 1 && name_parts.pop()) || 'txt';
					const f = {
						alias: file.name,
						description: `type: ${
							file.type || ext
						}, size: ${get_size_s(
							file.size
						)}, last modified: ${new Date(file.lastModified)}`,
						name: file.name,
						hash,
						ext,
						li,
					};
					files.push(f);
					filelist === null || filelist === void 0
						? void 0
						: filelist.appendChild(li);
					update(f);
				});
			};
			input.click();
	  });
