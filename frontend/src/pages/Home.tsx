import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/common/Sparkline";
import { CoinThumb } from "@/components/common/CoinThumb";
import { useGasOracle, useMarketGlobal, useTopCoins } from "@/hooks/queries";
import { changeColor, formatCompact, formatCurrency, formatPct } from "@/lib/utils";
import { NAV_SECTIONS } from "@/routes/config";
import { leafSlug } from "@/i18n";

export function HomePage() {
  const { t } = useTranslation();
  // Hide wallet hub from logged-out home; it's still in the sidebar after connect.
  const hubs = NAV_SECTIONS.filter((s) => !s.walletGated);
  const global = useMarketGlobal();
  const top = useTopCoins({ perPage: 8 });
  const gas = useGasOracle();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="DeFi Command Center"
        title={t("home.title")}
        description={t("home.tagline")}
      />
      <QueryState isLoading={global.isLoading} error={global.error}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label={t("home.metric.totalMarketCap")}
            value={formatCompact(global.data?.total_market_cap, "USD")}
            change={global.data?.market_cap_change_24h ?? null}
          />
          <MetricCard
            label={t("home.metric.volume24h")}
            value={formatCompact(global.data?.total_volume, "USD")}
          />
          <MetricCard
            label={t("home.metric.btcDominance")}
            value={`${(global.data?.btc_dominance ?? 0).toFixed(2)}%`}
            hint={t("home.metric.ethDominanceHint", {
              value: global.data?.eth_dominance?.toFixed(2) ?? "—",
            })}
          />
          <MetricCard
            label={t("home.metric.fearGreed")}
            value={
              global.data?.fear_greed
                ? `${global.data.fear_greed.value} · ${global.data.fear_greed.classification}`
                : "—"
            }
            hint={t("home.metric.fearGreedSource")}
          />
        </div>
      </QueryState>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("home.topByMcap")}</CardTitle>
            <Link to="/markets/overview" className="text-xs text-primary hover:underline">
              {t("common.viewAll")} <ArrowRight className="inline h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <QueryState isLoading={top.isLoading} error={top.error}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(top.data?.coins ?? []).map((c) => (
                  <Link
                    key={c.id}
                    to={`/tokens/${c.id}`}
                    className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 p-2 transition hover:bg-accent"
                  >
                    <CoinThumb src={c.image} alt={c.symbol} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{c.name}</span>
                        <span className="num font-medium">{formatCurrency(c.current_price)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="uppercase">{c.symbol}</span>
                        <span className={`num ${changeColor(c.price_change_percentage_24h)}`}>
                          {formatPct(c.price_change_percentage_24h)}
                        </span>
                      </div>
                    </div>
                    <Sparkline
                      data={c.sparkline_7d}
                      positive={(c.price_change_percentage_24h ?? 0) >= 0}
                    />
                  </Link>
                ))}
              </div>
            </QueryState>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("home.liveGas")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <QueryState isLoading={gas.isLoading} error={gas.error}>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md border border-border/60 p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">{t("home.gas.slow")}</div>
                  <div className="num text-base font-semibold">{gas.data?.safe ?? "—"}</div>
                </div>
                <div className="rounded-md border border-primary/40 bg-primary/10 p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">{t("home.gas.std")}</div>
                  <div className="num text-base font-semibold">{gas.data?.propose ?? "—"}</div>
                </div>
                <div className="rounded-md border border-border/60 p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">{t("home.gas.fast")}</div>
                  <div className="num text-base font-semibold">{gas.data?.fast ?? "—"}</div>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{t("home.gas.baseFee")}</span>
                <span className="num">
                  {gas.data?.base_fee ? `${gas.data.base_fee.toFixed(2)} gwei` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{t("home.gas.block")}</span>
                <span className="num">{gas.data?.block ?? "—"}</span>
              </div>
              <Link to="/tools/gas" className="block text-right text-xs text-primary hover:underline">
                {t("home.openGasTools")}
              </Link>
            </QueryState>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="label-eyebrow">Index</div>
            <h2 className="font-display text-xl font-semibold leading-tight md:text-[1.6rem]">
              {t("home.browseTitle")}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t("home.browseSub")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hubs.map((s, idx) => {
            const Icon = s.icon;
            const sectionLabel = t(`nav.sections.${s.id}.label`, { defaultValue: s.label });
            const sectionDesc = t(`nav.sections.${s.id}.description`, {
              defaultValue: s.description,
            });
            return (
              <Link
                key={s.id}
                to={s.landingPath}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="fade-rise group relative flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card p-4 transition hover:border-primary/50 hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2 text-primary ring-1 ring-primary/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-display text-base font-semibold leading-tight">
                    {sectionLabel}
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{sectionDesc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.items.slice(0, 4).map((leaf) => {
                    const slug = leafSlug(s.basePath, leaf.to);
                    const leafLabel = t(`nav.items.${s.id}.${slug}.label`, {
                      defaultValue: leaf.label,
                    });
                    return (
                      <span
                        key={leaf.to}
                        className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {leafLabel}
                      </span>
                    );
                  })}
                  {s.items.length > 4 ? (
                    <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                      +{s.items.length - 4}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
