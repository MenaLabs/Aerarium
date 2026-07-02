import { Card } from '@/shared/components/Card';
import { useStore } from '@/store';
import { useT } from '@/shared/i18n';
import { THEMES } from '@/shared/utils/themes';

export function ThemeSection() {
  const themeId = useStore((s) => s.settings.themeId);
  const setThemeId = useStore((s) => s.setThemeId);
  const { t } = useT();

  return (
    <Card>
      <h3 className="text-sm font-medium mb-3">{t('settings_theme')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {THEMES.map((theme) => {
          const active = theme.id === themeId;
          return (
            <button
              key={theme.id}
              onClick={() => setThemeId(theme.id)}
              className={`flex flex-col gap-2 items-stretch p-2.5 rounded-xl border text-left transition ${
                active
                  ? 'border-[var(--blue)] ring-1 ring-[var(--blue)]'
                  : 'border-[var(--border)] hover:border-[var(--text-3)]'
              }`}
              style={{ backgroundColor: theme.tokens['--bg-base'] }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-4 flex-1 rounded"
                  style={{ background: theme.tokens['--accent-gradient'] }}
                />
                <span
                  className="w-4 h-4 rounded-full border"
                  style={{
                    backgroundColor: theme.tokens['--bg-card'],
                    borderColor: theme.tokens['--border'],
                  }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: theme.tokens['--text-1'] }}>
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
