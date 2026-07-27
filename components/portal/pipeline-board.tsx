"use client";

import { useState, type DragEvent } from "react";
import { GripVertical } from "lucide-react";
import {
  pipelineCards as seed,
  PIPELINE_STAGES,
  type PipelineCard,
  type PipelineStage,
} from "@/lib/data/pipeline";
import { formatCurrency, cn } from "@/lib/utils";

const stageAccent: Record<PipelineStage, string> = {
  Found: "border-t-navy",
  Qualified: "border-t-success",
  Contacted: "border-t-gold",
  Meeting: "border-t-blue-500",
  Bid: "border-t-purple-500",
  "Won/Lost": "border-t-ink",
};

export function PipelineBoard() {
  const [cards, setCards] = useState<PipelineCard[]>(seed);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<PipelineStage | null>(null);

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDrop(stage: PipelineStage) {
    if (dragId) {
      setCards((cs) =>
        cs.map((c) => (c.id === dragId ? { ...c, stage } : c))
      );
    }
    setDragId(null);
    setOverStage(null);
  }

  function allowDrop(e: DragEvent, stage: PipelineStage) {
    e.preventDefault();
    if (overStage !== stage) setOverStage(stage);
  }

  return (
    // `min-w-0` keeps the wide column strip scrolling inside this box rather
    // than stretching the page sideways on a phone.
    <div className="flex min-w-0 gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => {
        const stageCards = cards.filter((c) => c.stage === stage);
        const total = stageCards.reduce((s, c) => s + c.estValue, 0);
        return (
          <div
            key={stage}
            onDragOver={(e) => allowDrop(e, stage)}
            onDrop={() => onDrop(stage)}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-2xl border border-t-4 border-navy/10 bg-surface p-3 transition-colors",
              stageAccent[stage],
              overStage === stage && "bg-gold/5 ring-2 ring-gold/40"
            )}
          >
            <div className="flex items-center justify-between px-1 pb-3">
              <h3 className="text-sm font-semibold text-navy-deep">{stage}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-ink/60">
                {stageCards.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2.5">
              {stageCards.map((card) => (
                <article
                  key={card.id}
                  draggable
                  onDragStart={() => onDragStart(card.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverStage(null);
                  }}
                  className={cn(
                    "group cursor-grab rounded-xl border border-navy/10 bg-white p-3 shadow-sm transition-all active:cursor-grabbing",
                    dragId === card.id && "opacity-50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-ink/25 group-hover:text-ink/40" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug text-navy-deep">
                        {card.title}
                      </p>
                      {/* Wrap the agency name so it is not cut off mid-word. */}
                      <p className="mt-1 break-words text-xs text-ink/50">
                        {card.agency}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-success">
                          {formatCurrency(card.estValue)}
                        </span>
                        <span className="rounded bg-navy-deep px-1.5 py-0.5 text-[10px] font-bold text-gold">
                          {card.fitScore}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {stageCards.length === 0 && (
                <div className="rounded-xl border border-dashed border-navy/15 py-8 text-center text-xs text-ink/40">
                  Drop here
                </div>
              )}
            </div>

            <p className="mt-3 border-t border-navy/10 px-1 pt-2 text-xs text-ink/50">
              {formatCurrency(total)} total
            </p>
          </div>
        );
      })}
    </div>
  );
}
