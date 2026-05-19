import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Activity, BarChart3, Flame, Zap } from "lucide-react";
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
  const hubs = NAV_SECTIONS.filter((s) => !s.walletGated);
  const global = useMarketGlobal();
  const top = useTopCoins({ perPage: 8 });
  const gas = useGasOracle();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Command Center"
        title={t("home.title")}
        description={t("home.tagline")}
      />

      {/* Bento Grid — asymmetric layout */}
      <QueryState isLoading={global.isLoading} error={global.error}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {/* Row 1: 4 metric cards */}
          <div className="col-span-2 lg:col-span-2">
            <MetricCard
              label={t("home.metric.totalMarketCap")}
              value={formatCompact(global.data?.total_market_cap, "USD")}
              change={global.data?.market_cap_change_24h ?? null}
              icon={<BarChart3 className="h-3.5 w-3.5" />}
            />
          </div>
          <div className="col-span-2 lg:col-span-2">
            <MetricCard
              label={t("home.metric.volume24h")}
              value={formatCompact(global.data?.total_volume, "USD")}
              icon={<Activity className="h-3.5 w-3.5" />}
            />
          </div>
          <MetricCard
            label={t("home.metric.btcDominance")}
            value={`${(global.data?.btc_dominance ?? 0).toFixed(1)}%`}
            hint={`ETH ${global.data?.eth_dominance?.toFixed(1) ?? "-"}%`}
          />
          <MetricCard
            label={t("home.metric.fearGreed")}
            value={
              global.data?.fear_greed
                ? `${global.data.fear_greed.value}`
                : "-"
            }
            hint={global.data?.fear_greed?.classification}
            icon={<Zap className="h-3.5 w-3.5" />}
          />
        </div>
      </QueryState>

      {/* Row 2: Top coins (wide) + Gas (narrow) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        {/* Top Coins — spans 3 cols on lg */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-xs">{t("home.topByMcap")}</CardTitle>
            <Link
              to="/markets/overview"
              className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              {t("common.viewAll")}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <QueryState isLoading={top.isLoading} error={top.error}>
              <div className="space-y-1">
                {(top.data?.coins ?? []).map((c, idx) => (
                  <Link
                    key={c.id}
                    to={`/tokens/${c.id}`}
                    className="group flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/40"
                  >
                    <span className="w-5 text-[10px] font-mono text-muted-foreground">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <CoinThumb src={c.image} alt={c.symbol} size={24} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-medium">
                          {c.name}
                        </span>
                        <span className="num flex-shrink-0 text-sm font-medium">
                          {formatCurrency(c.current_price)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] uppercase text-muted-foreground">
                          {c.symbol}
                        </span>
                        <span
                          className={`num text-[11px] font-medium ${changeColor(c.price_change_percentage_24h)}`}
                        >
                          {formatPct(c.price_change_percentage_24h)}
                        </span>
                      </div>
                    </div>
                    <Sparkline
                      data={c.sparkline_7d}
                      positive={(c.price_change_percentage_24h ?? 0) >= 0}
                      className="hidden flex-shrink-0 sm:block"
                    />
                  </Link>
                ))}
              </div>
            </QueryState>
          </CardContent>
        </Card>

        {/* Gas + Quick Actions — spans 2 cols on lg */}
        <div className="space-y-3 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-xs">
                <Flame className="h-3.5 w-3.5 text-primary" />
                {t("home.liveGas")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QueryState isLoading={gas.isLoading} error={gas.error}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border border-border/60 bg-muted/20 p-2">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      {t("home.gas.slow")}
                    </div>
                    <div className="num mt-0.5 text-base font-bold">
                      {gas.data?.safe ?? "-"}
                    </div>
                  </div>
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-2">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      {t("home.gas.std")}
                    </div>
                    <div className="num mt-0.5 text-base font-bold text-primary">
                      {gas.data?.propose ?? "-"}
                    </div>
                  </div>
                  <div className="rounded-md border border-border/60 bg-muted/20 p-2">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      {t("home.gas.fast")}
                    </div>
                    <div className="num mt-0.5 text-base font-bold">
                      {gas.data?.fast ?? "-"}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{t("home.gas.baseFee")}</span>
                  <span className="num">
                    {gas.data?.base_fee
                      ? `${gas.data.base_fee.toFixed(2)} gwei`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{t("home.gas.block")}</span>
                  <span className="num">{gas.data?.block ?? "-"}</span>
                </div>
                <Link
                  to="/tools/gas"
                  className="flex items-center justify-end gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  {t("home.openGasTools")}
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </QueryState>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 3: Section hubs — bento grid with varied sizes */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="label-eyebrow">Index</div>
            <h2 className="font-display text-base font-bold uppercase tracking-wider md:text-lg">
              {t("home.browseTitle")}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              {t("home.browseSub")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hubs.map((s, idx) => {
            const Icon = s.icon;
            const sectionLabel = t(`nav.sections.${s.id}.label`, {
              defaultValue: s.label,
            });
            const sectionDesc = t(`nav.sections.${s.id}.description`, {
              defaultValue: s.description,
            });
            return (
              <Link
                key={s.id}
                to={s.landingPath}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="fade-rise group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card/40 p-4 backdrop-blur-sm transition-all duration-200 hover:border-primary/25 hover:bg-card/60 hover:shadow-md hover:shadow-primary/[0.03]"
              >
                {/* Top accent line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold leading-tight">
                      {sectionLabel}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {sectionDesc}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {s.items.slice(0, 3).map((leaf) => {
                    const slug = leafSlug(s.basePath, leaf.to);
                    const leafLabel = t(`nav.items.${s.id}.${slug}.label`, {
                      defaultValue: leaf.label,
                    });
                    return (
                      <span
                        key={leaf.to}
                        className="rounded border border-border/60 bg-muted/20 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {leafLabel}
                      </span>
                    );
                  })}
                  {s.items.length > 3 ? (
                    <span className="rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      +{s.items.length - 3}
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
