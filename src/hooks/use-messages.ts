"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AgentMessage {
  id: string;
  from_agent_name: string;
  to_agent_name: string | null;
  message_type: string;
  text: string;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export function useMessages(projectId: string) {
  return useQuery<AgentMessage[]>({
    queryKey: ["messages", projectId],
    queryFn: () => apiClient.get(`/api/v1/projects/${projectId}/messages`),
    enabled: !!projectId,
    refetchInterval: 4000,
  });
}

export function useMessageStream(projectId: string | null) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);

  useEffect(() => {
    if (!projectId) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const es = new EventSource(`${API_URL}/api/v1/projects/${projectId}/messages/stream?token=${token}`);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) return;
        setMessages((prev) => [...prev, data]);
      } catch {
        // keepalive
      }
    };
    return () => es.close();
  }, [projectId]);

  return messages;
}
