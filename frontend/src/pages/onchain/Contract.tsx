import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/feedback/QueryState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api";
import type { ContractInfo } from "@/types/api";
import { shortAddress } from "@/lib/utils";

export function OnchainContractPage() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const ok = input.trim().match(/^0x[0-9a-fA-F]{40}$/);

  const data = useQuery<ContractInfo>({
    enabled: !!submitted,
    queryKey: ["onchain", "contract", submitted],
    queryFn: () =>
      apiGet<ContractInfo>(`/api/onchain/contract?address=${encodeURIComponent(submitted ?? "")}`),
    staleTime: 5 * 60_000,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Contract Inspector"
        description="Verified source, ABI, and metadata for any Ethereum contract address."
      />
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
          <div className="min-w-[280px] flex-1">
            <label className="text-xs text-muted-foreground">Contract address</label>
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="0x…" />
          </div>
          <Button type="button" disabled={!ok} onClick={() => setSubmitted(input.trim())}>
            Inspect
          </Button>
        </CardContent>
      </Card>
      {submitted ? (
        <QueryState isLoading={data.isLoading} error={data.error}>
          {data.data ? <ContractView info={data.data} /> : null}
        </QueryState>
      ) : null}
    </div>
  );
}

interface AbiEntry {
  type?: string;
  name?: string;
  stateMutability?: string;
  inputs?: { name?: string; type?: string }[];
  outputs?: { name?: string; type?: string }[];
}

function summariseAbi(abi: unknown): string[] {
  if (!Array.isArray(abi)) return [];
  return abi
    .filter((entry): entry is AbiEntry => typeof entry === "object" && entry !== null)
    .filter((entry) => entry.type === "function" || entry.type === "event")
    .slice(0, 40)
    .map((entry) => {
      const params = (entry.inputs ?? [])
        .map((p) => `${p.type ?? "?"} ${p.name ?? ""}`.trim())
        .join(", ");
      const ret = (entry.outputs ?? []).map((p) => p.type ?? "?").join(", ");
      const mut = entry.stateMutability ? ` [${entry.stateMutability}]` : "";
      const tag = entry.type === "event" ? "event" : "fn";
      return `${tag} ${entry.name ?? "?"}(${params})${ret ? ` → (${ret})` : ""}${mut}`;
    });
}

function ContractView({ info }: { info: ContractInfo }) {
  const abiPreview = summariseAbi(info.abi);
  const sourcePreview = info.source_code ? info.source_code.slice(0, 4000) : null;
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {info.contract_name ?? "Contract"}{" "}
            <span className="font-mono text-xs text-muted-foreground">
              {shortAddress(info.address)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            {info.source_verified ? (
              <Badge variant="success">verified</Badge>
            ) : (
              <Badge variant="warning">unverified</Badge>
            )}
            {info.compiler ? <Badge variant="outline">{info.compiler}</Badge> : null}
            {info.proxy ? (
              <Badge variant="secondary">
                proxy → {shortAddress(info.implementation ?? "")}
              </Badge>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">
            {abiPreview.length} ABI entries · source {sourcePreview ? `${sourcePreview.length}` : "0"} chars
          </div>
        </CardContent>
      </Card>
      {abiPreview.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ABI preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-72 overflow-auto rounded-md border border-border/60 bg-muted/20 p-3 text-[11px] leading-relaxed">
              {abiPreview.join("\n")}
            </pre>
          </CardContent>
        </Card>
      ) : null}
      {sourcePreview ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Source preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded-md border border-border/60 bg-muted/20 p-3 text-[11px] leading-relaxed">
              {sourcePreview}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
