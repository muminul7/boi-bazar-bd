import { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import initiatePaymentHandler, { type PaymentResponse } from "./src/server/payments/initiatePayment";

type DevRequest = IncomingMessage & { body?: unknown };

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return undefined;
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  if (!rawBody) {
    return undefined;
  }

  return JSON.parse(rawBody);
}

function attachPaymentRoute(middlewares: Connect.ServerStack) {
  middlewares.use(async (req, res, next) => {
    if (!req.url?.startsWith("/api/initiate-payment")) {
      next();
      return;
    }

    try {
      const devRequest = req as DevRequest;
      const devResponse: PaymentResponse = {
        status(code: number) {
          res.statusCode = code;
          return devResponse;
        },
        setHeader(name: string, value: string) {
          res.setHeader(name, value);
        },
        send(body: string) {
          res.end(body);
        },
        end() {
          res.end();
        },
      };

      if (devRequest.method === "POST") {
        devRequest.body = await readJsonBody(devRequest);
      }

      await initiatePaymentHandler(
        devRequest as Parameters<typeof initiatePaymentHandler>[0],
        devResponse as Parameters<typeof initiatePaymentHandler>[1],
      );
    } catch (error) {
      next(error as Error);
    }
  });
}

function paymentApiPlugin(): Plugin {
  return {
    name: "payment-api-dev",
    configureServer(server) {
      attachPaymentRoute(server.middlewares);
    },
    configurePreviewServer(server) {
      attachPaymentRoute(server.middlewares);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.entries(env).forEach(([key, value]) => {
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), paymentApiPlugin(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
