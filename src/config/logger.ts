import pino from "pino";
import { env } from "@/config/env";

export const logger = pino({
  level: env.isProd ? "info" : "debug",
  base: { service: "zyntra-backend" },
  ...(env.isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname,service" },
        },
      }
    : {}),
});
