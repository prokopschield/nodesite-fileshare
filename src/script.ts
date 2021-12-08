const filelist: HTMLUListElement | null = document.querySelector('ul#files');
if (!filelist) {
	console.error('Malformed html, missing ul#files.');
}

const upload: HTMLButtonElement | null =
	document.querySelector('button#upload');
if (!upload) {
	console.error('Malformed html, missing button#upload.');
}

interface file_t {
	alias: string;
	description: string;
	name: string;
	hash: string;
	ext: string;
	li: HTMLLIElement;
}

const files: Array<file_t> = [...(filelist?.querySelectorAll('li') || [])].map(
	(li: HTMLLIElement): file_t => {
		const a = li.querySelector('a');
		const href = a?.href;
		const match = href?.match(/([^\/]+)\/([0-9a-f]{64})\.([a-z0-9]+)$/);
		if (match) {
			const [, name, hash, ext] = match;
			return {
				alias: a?.innerHTML || name,
				description: li.querySelector('.description')?.innerHTML || '',
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
	}
);

function render(file: file_t) {
	for (const child of [...file.li.querySelectorAll('*')]) {
		file.li.removeChild(child);
	}

	const delb = document.createElement('span');
	delb.classList.add('embtn');
	delb.innerHTML = '🗑️';
	delb.addEventListener('click', () => {
		filelist?.removeChild(file.li);
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

async function send_something(what_to_set: string | Blob) {
	const res = await fetch('/static/put', {
		method: 'PUT',
		body: what_to_set,
	});

	const hash =
		res.headers.get('content-type')?.toLowerCase() == 'application/json'
			? (await res.json()).hash
			: await res.text();

	return hash;
}

let next_update_id = 0;
let latest_update_id = 0;

async function update(file?: file_t) {
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

function get_size_s(size: number) {
	let power = 0;
	while (size > 1024) {
		++power;
		size /= 102.4;
		size = Math.round(size);
		size /= 10;
	}
	return `${size} ${size_s_powers[power]}`;
}

document.querySelector('#upload')?.addEventListener('click', () => {
	const input = document.createElement('input');
	input.setAttribute('multiple', 'multiple');
	input.setAttribute('type', 'file');
	input.onchange = (e: Event) => {
		if (!input.files) return input.click();
		[...input.files].forEach(async (file) => {
			const hash = await send_something(file);
			const li = document.createElement('li');
			li.classList.add('file');

			const name_parts = file.name.split('.');
			const ext = (name_parts.length > 1 && name_parts.pop()) || 'txt';

			const f: file_t = {
				alias: file.name,
				description: `type: ${file.type || ext}, size: ${get_size_s(
					file.size
				)}, last modified: ${new Date(file.lastModified)}`,
				name: file.name.replace(/[^a-z0-9\-\.]/gi, ''),
				hash,
				ext,
				li,
			};
			files.push(f);
			filelist?.appendChild(li);
			update(f);
		});
	};
	input.click();
});
