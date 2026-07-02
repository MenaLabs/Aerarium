import { Heart } from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { platform } from '@/shared/platform';
import { useT } from '@/shared/i18n';
import { MONOBANK_JAR_URL, KOFI_URL, CRYPTO_DONATION_ADDRESS } from '@/shared/utils/donationLinks';

export function DonationSection() {
  const { t } = useT();
  const links = [
    { url: MONOBANK_JAR_URL, label: t('donations_monobank') },
    { url: KOFI_URL, label: t('donations_kofi') },
    { url: CRYPTO_DONATION_ADDRESS, label: t('donations_crypto') },
  ].filter((link) => link.url);

  if (links.length === 0) return null;

  return (
    <Card>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
        <Heart size={14} className="text-[var(--red)]" /> {t('donations_title')}
      </h3>
      <p className="text-xs text-[var(--text-2)] mb-3">{t('donations_description')}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {links.map((link) => (
          <Button key={link.label} variant="ghost" onClick={() => platform.openExternal(link.url)}>
            {link.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
