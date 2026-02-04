import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    label: "Connections",
    value: "12",
    description: "3 new this week",
  },
  {
    label: "Recent queries",
    value: "58",
    description: "12 executed today",
  },
  {
    label: "Active files",
    value: "24",
    description: "Synced across teams",
  },
];

const conversations = [
  {
    title: "Infra cost optimization",
    detail: "Last active 10m ago",
  },
  {
    title: "Customer retention dashboard",
    detail: "Last active 2h ago",
  },
  {
    title: "Realtime alerts pipeline",
    detail: "Last active yesterday",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Workspace overview</p>
            <h2 className="text-2xl font-semibold">Operations Command Center</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Monitor data pipelines, query context, and AI copilots from one workspace.
            </p>
          </div>
          <Button className="w-full lg:w-auto">New conversation</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60 bg-card/80">
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Recent conversations</CardTitle>
            <CardDescription>Pick up right where you left off.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.title}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3 transition-colors hover:border-border"
              >
                <div>
                  <p className="text-sm font-medium">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground">{conversation.detail}</p>
                </div>
                <Button variant="ghost" size="sm">
                  Open
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Shortcuts for your daily workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Connect a new data source
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Upload a dataset
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Invite a teammate
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
