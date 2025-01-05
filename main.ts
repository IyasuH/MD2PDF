import { Plugin, Notice } from 'obsidian';

import { execFile, exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

export default class MDToPDF extends Plugin {
	
	async buildGo(go_path: string) {
		const exeAsync = promisify(exec)
		console.log('Building go binary');
		try{
			const { stdout, stderr } = await exeAsync(`go build -C ${go_path} -o md2pdf`);
			if (stderr) {
				console.error('Error while building:', stderr);
				new Notice('Error: ' + stderr);
				return;
			}
			console.log('stdout:', stdout);	
		}
		catch (error) {
			console.error('Error:', error);
			new Notice('Error: ' + error);
			throw error;
		}
	}

	async onload() {
		const execFileAsync = promisify(execFile);
		const plugin_path = '.obsidian/plugins/MD2PDF'; 
		const plugin_path_abs = path.join(this.app.vault.adapter.basePath, plugin_path);
		const go_path = path.join(plugin_path_abs, "mdpdf");

		await this.buildGo(go_path); // build go binary -> this might slow it down

		console.log('loading MDToPDF plugin');
		this.addRibbonIcon('dice', 'MD to PDF', async () => {
			console.log('MD to PDF clicked');
			const file = this.app.workspace.getActiveFile();
			if (file) {
				const fullPath = this.app.vault.getAbstractFileByPath(file.path);
				const file_name = this.app.workspace.getActiveFile()?.basename;
				if (!file_name) {
					console.error('Error: file_name is undefined');
					return;
				}
				const copy_path = path.join(plugin_path, file_name);

				await fullPath?.vault.copy(file, copy_path);

				const md_path = await this.app.fileManager.getAvailablePathForAttachment(copy_path)

				try {
					const binary_path = path.join(go_path, "md2pdf");
					const { stdout, stderr } = await execFileAsync(binary_path, [md_path]);
					if (stderr) {
						console.error('Error:', stderr);
						new Notice('Error: ' + stderr);
						return;
					}
					console.log('MD2PDF:', stdout);

					console.log(`PDF generated inside ${plugin_path_abs}`);
					new Notice(`PDF generated inside ${plugin_path_abs}`);
				} catch (error) {
					console.log('Error during file conversition: ' + error);
					new Notice('Error during file conversition: ' + error);
					throw error;
				}
			}
		});
	}
}
