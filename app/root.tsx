import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import { SSRProvider, SSRWait } from "next-ssr";
import { RemixHeadProvider, RemixHeadRoot } from "remix-head";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RemixHeadProvider>
      <html lang="ja">
        <SSRProvider>
          <head>
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <Meta />
            <Links />
            <SSRWait>
              <RemixHeadRoot />
            </SSRWait>
          </head>
          <body>
            {children}
            <ScrollRestoration />
            <Scripts />
          </body>
        </SSRProvider>
      </html>
    </RemixHeadProvider>
  );
}

export default function App() {
  return <Outlet />;
}
