import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({ serviceName: "research-at-home-better-ui" });
}
