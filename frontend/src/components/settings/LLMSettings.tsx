"use client";

import { BrainCircuit, Cloud, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LLMProviderCard } from "@/components/settings/LLMProviderCard";

const providerOptions = [
  {
    name: "OpenAI",
    value: "openai",
    description: "GPT-4.1, GPT-4o, and enterprise-ready models.",
    freeTier: "$5 trial credits",
    setupUrl: "https://platform.openai.com/api-keys",
    logo: <Sparkles className="h-5 w-5" />,
  },
  {
    name: "Anthropic",
    value: "anthropic",
    description: "Claude 3.5 models optimized for safe reasoning.",
    freeTier: "Free developer tier",
    setupUrl: "https://console.anthropic.com/settings/keys",
    logo: <Wand2 className="h-5 w-5" />,
  },
  {
    name: "Azure OpenAI",
    value: "azure",
    description: "Bring your Azure deployment and region policies.",
    freeTier: "Azure trial subscription",
    setupUrl: "https://aka.ms/oai/access",
    logo: <Cloud className="h-5 w-5" />,
  },
  {
    name: "Google",
    value: "google",
    description: "Gemini models for multimodal and long context tasks.",
    freeTier: "Monthly quota",
    setupUrl: "https://ai.google.dev/",
    logo: <BrainCircuit className="h-5 w-5" />,
  },
];

export function LLMSettings() {
  const [defaultProvider, setDefaultProvider] = useState("openai");
  const [apiKeys, setApiKeys] = useState(
    providerOptions.reduce<Record<string, string>>((acc, provider) => {
      acc[provider.value] = "";
      return acc;
    }, {}),
  );

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="space-y-1">
        <CardTitle>LLM Providers</CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect model providers, validate credentials, and choose a default runtime.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[1fr,auto] md:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default provider</label>
            <Select value={defaultProvider} onValueChange={setDefaultProvider}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providerOptions.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full md:w-auto">Save keys</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          API keys are encrypted before storage and scoped to your workspace.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          {providerOptions.map((provider) => (
            <LLMProviderCard
              key={provider.value}
              name={provider.name}
              description={provider.description}
              freeTier={provider.freeTier}
              status={apiKeys[provider.value] ? "configured" : "not_configured"}
              setupUrl={provider.setupUrl}
              apiKey={apiKeys[provider.value]}
              onApiKeyChange={(value) =>
                setApiKeys((prev) => ({
                  ...prev,
                  [provider.value]: value,
                }))
              }
              logo={provider.logo}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
