import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateCartPricing } from '../../server/pricing';
import { Badge } from '../components/Badge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { QuantityStepper } from '../components/QuantityStepper';
import { SafeImage } from '../components/SafeImage';
import { useAppContext } from '../hooks/useAppContext';
import { useAddBatchToCart, useProducts } from '../hooks/useStore';
import { formatBdt, formatWeight } from '../lib/format';
import { usePageTitle } from '../lib/usePageTitle';

export function BasketBuilderPage() {
  const { lang, showToast, t } = useAppContext();
  const { data, isLoading } = useProducts({ pageSize: 48 });
  const { addBatch, isPending: submitting } = useAddBatchToCart();
  const navigate = useNavigate();

  usePageTitle('Build Your Weekly Basket');

  const eligibleProducts = useMemo(
    () => (data?.items ?? []).filter((p) => p.basket_eligible && p.variants.length > 0),
    [data]
  );

  const [selectedQty, setSelectedQty] = useState<Record<string, number>>({});

  useEffect(() => {
    if (eligibleProducts.length > 0 && Object.keys(selectedQty).length === 0) {
      const defaults: Record<string, number> = {};
      const starterSlugs = [
        'bogura-red-potatoes',
        'pabna-country-onions',
        'deshi-tomato',
        'tender-bottle-gourd-lau',
      ];
      for (const p of eligibleProducts) {
        if (starterSlugs.includes(p.slug)) {
          defaults[p.id] = 1;
        }
      }
      setSelectedQty(defaults);
    }
  }, [eligibleProducts, selectedQty]);

  const previewItems = useMemo(() => {
    return eligibleProducts
      .filter((p) => (selectedQty[p.id] ?? 0) > 0)
      .map((p) => {
        const v = p.variants[0];
        return {
          product_id: p.id,
          variant_id: v.id,
          unit_price_bdt: v.price_bdt,
          quantity: selectedQty[p.id],
          basket_eligible: true,
          unit_weight_grams: v.unit_weight_grams,
        };
      });
  }, [eligibleProducts, selectedQty]);

  const pricing = useMemo(() => calculateCartPricing(previewItems, null), [previewItems]);

  const toggleProduct = (productId: string) => {
    setSelectedQty((prev) => {
      const current = prev[productId] ?? 0;
      return { ...prev, [productId]: current > 0 ? 0 : 1 };
    });
  };

  const addAllToCart = () => {
    if (previewItems.length === 0) {
      showToast('Select at least one item for your basket.', 'info');
      return;
    }

    addBatch(
      previewItems.map((item) => ({ variantId: item.variant_id, quantity: item.quantity })),
      () => navigate('/cart')
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: t('buildYourBasket') }]} />

      <div className="mb-6">
        <Badge tone="primary" className="mb-2">Auto 15% Off on 4+ Distinct Staples</Badge>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">
          {t('weeklyBasketTitle')}
        </h1>
        <p className="text-sm text-on-surface-variant font-bengali mt-1">
          {t('weeklyBasketSub')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="h-64 bg-cream rounded-card animate-pulse" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {eligibleProducts.map((p) => {
                const v = p.variants[0];
                const qty = selectedQty[p.id] ?? 0;
                const active = qty > 0;
                return (
                  <div
                    key={p.id}
                    className={`rounded-card p-3.5 flex gap-3 items-center transition-colors ${
                      active
                        ? 'bg-cream/80 border-2 border-primary'
                        : 'bg-white ghost-border'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream shrink-0">
                      <SafeImage src={p.image_url} alt={p.name_en} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-sm text-ink truncate">
                        {lang === 'bn' ? p.name_bn : p.name_en}
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        {v.label_en} · <strong className="text-primary tabular-nums">{formatBdt(v.price_bdt, lang)}</strong>
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {active ? (
                          <QuantityStepper
                            value={qty}
                            min={0}
                            max={10}
                            lang={lang}
                            onChange={(next) => setSelectedQty((prev) => ({ ...prev, [p.id]: next }))}
                          />
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => toggleProduct(p.id)}>
                            <Icon name="add" className="!text-[16px]" />
                            Include
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 bg-cream/60 rounded-card ghost-border p-6 space-y-4 sticky top-24">
          <h2 className="font-display font-bold text-lg text-ink">Your Custom Basket</h2>
          <p className="text-xs text-on-surface-variant">
            {pricing.distinct_basket_eligible_count >= 4
              ? '15% Weekly Basket Saving unlocked!'
              : `Select ${4 - pricing.distinct_basket_eligible_count} more distinct staple(s) to unlock 15% OFF.`}
          </p>

          <div className="space-y-1.5 text-sm border-t border-primary/10 pt-3">
            <div className="flex justify-between text-on-surface-variant">
              <span>Selected Items</span>
              <span className="tabular-nums font-medium">{pricing.item_count}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Estimated Weight</span>
              <span className="tabular-nums font-medium">{formatWeight(pricing.total_weight_grams, lang)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>{t('subtotal')}</span>
              <span className="tabular-nums">{formatBdt(pricing.subtotal_bdt, lang)}</span>
            </div>
            {pricing.basket_discount_bdt > 0 && (
              <div className="flex justify-between text-primary font-semibold">
                <span>{t('weeklyBasketSaving')}</span>
                <span className="tabular-nums">−{formatBdt(pricing.basket_discount_bdt, lang)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-ink pt-2 border-t border-primary/10">
              <span>Estimated Basket Price</span>
              <span className="tabular-nums text-primary">
                {formatBdt(pricing.subtotal_bdt - pricing.basket_discount_bdt, lang)}
              </span>
            </div>
          </div>

          <Button fullWidth size="lg" loading={submitting} onClick={addAllToCart}>
            <Icon name="shopping_basket" className="!text-[18px]" />
            <span>Add Custom Basket to Cart</span>
          </Button>
        </aside>
      </div>
    </div>
  );
}
