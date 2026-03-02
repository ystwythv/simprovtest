"use client";

import { useState } from "react";

const ICCIDS = [
  "8944122666636034235",
  "8944122666636034227",
  "8944122666636034201",
  "8944122666636034193",
  "8944122666636034185",
];

type SimState = {
  loading: boolean;
  msisdn: string | null;
  error: string | null;
};

export default function Home() {
  const [sims, setSims] = useState<Record<string, SimState>>({});

  async function activate(iccid: string) {
    setSims((prev) => ({
      ...prev,
      [iccid]: { loading: true, msisdn: null, error: null },
    }));

    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iccid }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSims((prev) => ({
          ...prev,
          [iccid]: { loading: false, msisdn: null, error: data.error || `HTTP ${res.status}` },
        }));
        return;
      }

      setSims((prev) => ({
        ...prev,
        [iccid]: { loading: false, msisdn: data.msisdn, error: null },
      }));
    } catch (err) {
      setSims((prev) => ({
        ...prev,
        [iccid]: { loading: false, msisdn: null, error: String(err) },
      }));
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-xl font-bold mb-6">iq sim provision test</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">ICCID</th>
            <th className="py-2 w-28">Action</th>
            <th className="py-2">MSISDN</th>
          </tr>
        </thead>
        <tbody>
          {ICCIDS.map((iccid) => {
            const state = sims[iccid];
            const activated = state?.msisdn != null;
            const loading = state?.loading ?? false;

            return (
              <tr key={iccid} className="border-b">
                <td className="py-2 font-mono">{iccid}</td>
                <td className="py-2">
                  <button
                    onClick={() => activate(iccid)}
                    disabled={activated || loading}
                    className="px-3 py-1 bg-black text-white text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800"
                  >
                    {loading ? "Activating…" : activated ? "Activated" : "Activate"}
                  </button>
                </td>
                <td className="py-2 font-mono">
                  {state?.msisdn && <span className="text-green-700">{state.msisdn}</span>}
                  {state?.error && <span className="text-red-600">{state.error}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
