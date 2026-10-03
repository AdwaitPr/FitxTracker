"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { ResultsPanel } from "./results-panel";
import type { SessionResultData } from "./types";

interface SessionDetailClientProps {
    sessionData: SessionResultData;
}

export function SessionDetailClient({ sessionData }: SessionDetailClientProps) {
    const router = useRouter();

    const dateObj = new Date(sessionData.dateISO);
    const formattedEyebrow = dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const shortId = sessionData.id ? `#${sessionData.id.slice(-6)}` : "#LIVE";

    return (
        <div className="space-y-6">
            {/* Back to Sessions */}
            <div className="rise">
                <Link
                    href="/cognitype/sessions"
                    className="inline-flex h-10 items-center gap-2 rounded-full pl-2 pr-4 text-[13.5px] font-semibold text-ink-soft hover:bg-surface hover:text-primary transition-colors"
                >
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-hairline">
                        <ArrowLeft className="h-4 w-4" />
                    </span>
                    Sessions
                </Link>
            </div>

            <PageHeader
                eyebrow={formattedEyebrow}
                title={`Session ${shortId}`}
                actions={
                    <Button
                        variant="outline"
                        icon={<RotateCcw className="h-4 w-4" />}
                        onClick={() => router.push("/cognitype")}
                    >
                        Repeat setup
                    </Button>
                }
            />

            <ResultsPanel data={sessionData} />
        </div>
    );
}
