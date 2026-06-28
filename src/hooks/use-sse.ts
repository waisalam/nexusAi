"use client";

import { useEffect, useState } from "react";
import type { AgentLogEntry } from "@/types/agent";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useAgentStream(agentId: string | null) {
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!agentId) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const es = new EventSource(`${API_URL}/api/v1/projects/agents/${agentId}/stream?token=${token}`);

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) return;
        setLogs((prev) => [...prev, data]);
      } catch {
        // ignore parse errors from keepalive
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [agentId]);

  const clearLogs = () => setLogs([]);

  return { logs, connected, clearLogs };
}

export interface OrchestratorLogEntry {
  log_type: string;
  content: string;
  created_at: string;
}

export function useOrchestratorStream(runId: string | null) {
  const [logs, setLogs] = useState<OrchestratorLogEntry[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!runId) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const es = new EventSource(`${API_URL}/api/v1/projects/orchestrate/runs/${runId}/stream?token=${token}`);
    es.onopen = () => setConnected(true);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) return;
        setLogs((prev) => [...prev, data]);
      } catch {
        // keepalive
      }
    };
    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      setConnected(false);
    };
  }, [runId]);

  return { logs, connected };
}
