import { useMemo, useState } from "react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ToolsIlCalculatorPage() {
  const [tokenAStart, setTokenAStart] = useState("100");
  const [tokenBStart, setTokenBStart] = useState("4000");
  const [tokenANow, setTokenANow] = useState("80");
  const [tokenBNow, setTokenBNow] = useState("4500");
  const [amountA, setAmountA] = useState("10");
  const [amountB, setAmountB] = useState("0.25");

  const result = useMemo(() => {
    const pA = Number(tokenAStart);
    const pB = Number(tokenBStart);
    const pAnow = Number(tokenANow);
    const pBnow = Number(tokenBNow);
    const a = Number(amountA);
    const b = Number(amountB);
    if (!pA || !pB || !pAnow || !pBnow || !a || !b) return null;
    const k = a * b;
    const newA = Math.sqrt(k * (pBnow / pAnow));
    const newB = Math.sqrt(k * (pAnow / pBnow));
    const valueLp = newA * pAnow + newB * pBnow;
    const valueHold = a * pAnow + b * pBnow;
    const il = valueLp / valueHold - 1;
    return {
      valueLp,
      valueHold,
      ilPct: il * 100,
      newA,
      newB,
    };
  }, [tokenAStart, tokenBStart, tokenANow, tokenBNow, amountA, amountB]);

  return (
    <div className="space-y-4">
      <PageHeader title="Impermanent Loss Calculator" description="Estimate IL for a 50/50 constant-product LP position." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Token A entry price</Label>
                <Input value={tokenAStart} onChange={(e) => setTokenAStart(e.target.value)} />
              </div>
              <div>
                <Label>Token B entry price</Label>
                <Input value={tokenBStart} onChange={(e) => setTokenBStart(e.target.value)} />
              </div>
              <div>
                <Label>Token A now</Label>
                <Input value={tokenANow} onChange={(e) => setTokenANow(e.target.value)} />
              </div>
              <div>
                <Label>Token B now</Label>
                <Input value={tokenBNow} onChange={(e) => setTokenBNow(e.target.value)} />
              </div>
              <div>
                <Label>Token A amount</Label>
                <Input value={amountA} onChange={(e) => setAmountA(e.target.value)} />
              </div>
              <div>
                <Label>Token B amount</Label>
                <Input value={amountB} onChange={(e) => setAmountB(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Hold value</div>
                  <div className="num text-2xl font-semibold">${result.valueHold.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">LP value</div>
                  <div className="num text-2xl font-semibold">${result.valueLp.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Impermanent loss</div>
                  <div className={`num text-3xl font-semibold ${result.ilPct < 0 ? "ticker-down" : "ticker-up"}`}>
                    {result.ilPct.toFixed(2)}%
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Adjusted balances: {result.newA.toFixed(4)} A · {result.newB.toFixed(4)} B
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Enter all fields to compute.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
