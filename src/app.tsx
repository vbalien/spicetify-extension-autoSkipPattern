import { SettingsSection } from 'spcr-settings';

async function setupSettings(): Promise<SettingsSection> {
  const settings = new SettingsSection('Auto skip pattern', 'auto-skip-pattern');
  settings.addToggle('toggle-extension', 'Enable', true);
  settings.addInput('pattern-title', 'Title pattern(regular expression)', '');
  settings.addInput('pattern-artist', 'Artist pattern(regular expression)', '');

  await settings.pushSettings();
  return settings;
}

function parsePattern(pattern?: string): RegExp | null {
  if (!pattern) {
    return null;
  }
  const match = pattern.match(new RegExp('^/(.*?)/([gimy]*)$'));
  if (match) {
    return new RegExp(match[1], match[2]);
  } else {
    return null;
  }
}

async function main() {
  const settings = await setupSettings();

  Spicetify.Player.addEventListener('songchange', () => {
    if (!settings.getFieldValue('toggle-extension')) {
      return;
    }
    const data = Spicetify.Player.data || Spicetify.Queue;
    if (!data || !data.track) {
      return;
    }
    const meta = data.track.metadata;
    if (!meta) {
      return;
    }

    const title: string = meta.title ?? '';
    const artist: string = meta.artist_name ?? '';

    const titlePattern = parsePattern(settings.getFieldValue('pattern-title'));
    const artistPattern = parsePattern(
      settings.getFieldValue('pattern-artist')
    );

    if (
      (titlePattern && titlePattern.test(title)) ||
      (artistPattern && artistPattern.test(artist))
    ) {
      Spicetify.Player.next();
    }
  });
}

export default main;
