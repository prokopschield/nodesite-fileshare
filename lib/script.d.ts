declare const filelist: HTMLUListElement | null;
declare const upload: HTMLButtonElement | null;
interface file_t {
	alias: string;
	description: string;
	name: string;
	hash: string;
	ext: string;
	li: HTMLLIElement;
}
declare const files: Array<file_t>;
declare function render(file: file_t): void;
declare function send_something(what_to_set: string | Blob): Promise<any>;
declare let next_update_id: number;
declare let latest_update_id: number;
declare function update(file?: file_t): Promise<void>;
declare const size_s_powers: string[];
declare function get_size_s(size: number): string;
