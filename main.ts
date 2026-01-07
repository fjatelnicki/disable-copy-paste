import { Plugin, Notice, PluginSettingTab, App, Setting } from 'obsidian';

interface DisableCopyPasteSettings {
	disableCopy: boolean;
	disableCut: boolean;
	disablePaste: boolean;
	allowImages: boolean;
	allowEmojis: boolean;
	allowCopyUrls: boolean;
	allowPasteUrls: boolean;
}

const DEFAULT_SETTINGS: DisableCopyPasteSettings = {
	disableCopy: true,
	disableCut: true,
	disablePaste: true,
	allowImages: true,
	allowEmojis: true,
	allowCopyUrls: true,
	allowPasteUrls: true,
};

export default class DisableCopyPastePlugin extends Plugin {
	settings: DisableCopyPasteSettings;

	// Regex to match emoji characters
	private emojiRegex = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}\s]+$/u;

	// Regex to match URLs
	private urlRegex = /^(https?:\/\/[^\s]+)$/i;

	private isOnlyEmoji(text: string): boolean {
		return this.emojiRegex.test(text.trim());
	}

	private isUrl(text: string): boolean {
		return this.urlRegex.test(text.trim());
	}

	private getSelectedText(): string {
		const selection = window.getSelection();
		return selection ? selection.toString() : '';
	}

	private handleKeyDown = (event: KeyboardEvent) => {
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		const modifierKey = isMac ? event.metaKey : event.ctrlKey;

		if (modifierKey && event.key === 'c' && this.settings.disableCopy) {
			// Check if copying a URL is allowed
			if (this.settings.allowCopyUrls) {
				const selectedText = this.getSelectedText();
				if (selectedText && this.isUrl(selectedText)) {
					return;
				}
			}

			event.preventDefault();
			event.stopPropagation();
			new Notice('Copying is disabled in this vault');
		}
	};

	private handlePaste = (event: ClipboardEvent) => {
		if (!this.settings.disablePaste) return;

		const clipboardData = event.clipboardData;
		if (!clipboardData) return;

		// Check if pasting files (images)
		if (this.settings.allowImages) {
			if (clipboardData.files && clipboardData.files.length > 0) {
				return;
			}
			const types = clipboardData.types;
			if (types.includes('Files') || types.some(t => t.startsWith('image/'))) {
				return;
			}
		}

		// Check if pasting only emojis
		if (this.settings.allowEmojis) {
			const text = clipboardData.getData('text/plain');
			if (text && this.isOnlyEmoji(text)) {
				return;
			}
		}

		// Check if pasting a URL is allowed
		if (this.settings.allowPasteUrls) {
			const text = clipboardData.getData('text/plain');
			if (text && this.isUrl(text)) {
				return;
			}
		}

		// Block text paste
		event.preventDefault();
		event.stopPropagation();
		new Notice('Pasting text is disabled in this vault');
	};

	private handleCopy = (event: ClipboardEvent) => {
		if (!this.settings.disableCopy) return;

		// Check if copying a URL is allowed
		if (this.settings.allowCopyUrls) {
			const selectedText = this.getSelectedText();
			if (selectedText && this.isUrl(selectedText)) {
				return;
			}
		}

		event.preventDefault();
		event.stopPropagation();
		new Notice('Copying is disabled in this vault');
	};

	private handleCut = (event: ClipboardEvent) => {
		if (!this.settings.disableCut) return;

		event.preventDefault();
		event.stopPropagation();
		new Notice('Cutting is disabled in this vault');
	};

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new DisableCopyPasteSettingTab(this.app, this));

		// Listen for keyboard shortcuts (only for copy)
		this.registerDomEvent(document, 'keydown', this.handleKeyDown, true);

		// Listen for clipboard events
		this.registerDomEvent(document, 'paste', this.handlePaste, true);
		this.registerDomEvent(document, 'copy', this.handleCopy, true);
		this.registerDomEvent(document, 'cut', this.handleCut, true);
	}

	onunload() {
		// Event listeners are automatically cleaned up by registerDomEvent
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class DisableCopyPasteSettingTab extends PluginSettingTab {
	plugin: DisableCopyPastePlugin;

	constructor(app: App, plugin: DisableCopyPastePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Disable Copy Paste Settings' });

		new Setting(containerEl)
			.setName('Disable copy')
			.setDesc('Block copying text from the vault')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.disableCopy)
				.onChange(async (value) => {
					this.plugin.settings.disableCopy = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Disable cut')
			.setDesc('Block cutting text from the vault')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.disableCut)
				.onChange(async (value) => {
					this.plugin.settings.disableCut = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Disable paste')
			.setDesc('Block pasting text into the vault')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.disablePaste)
				.onChange(async (value) => {
					this.plugin.settings.disablePaste = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Exceptions (when copy is disabled)' });

		new Setting(containerEl)
			.setName('Allow copying URLs')
			.setDesc('Allow copying URLs even when copy is disabled')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.allowCopyUrls)
				.onChange(async (value) => {
					this.plugin.settings.allowCopyUrls = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Exceptions (when paste is disabled)' });

		new Setting(containerEl)
			.setName('Allow images')
			.setDesc('Allow pasting images and screenshots even when paste is disabled')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.allowImages)
				.onChange(async (value) => {
					this.plugin.settings.allowImages = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Allow emojis')
			.setDesc('Allow pasting emoji-only content even when paste is disabled')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.allowEmojis)
				.onChange(async (value) => {
					this.plugin.settings.allowEmojis = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Allow pasting URLs')
			.setDesc('Allow pasting URLs even when paste is disabled')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.allowPasteUrls)
				.onChange(async (value) => {
					this.plugin.settings.allowPasteUrls = value;
					await this.plugin.saveSettings();
				}));
	}
}
