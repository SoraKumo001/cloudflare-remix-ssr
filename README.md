# cloudflare-remix-ssr

https://cloudflare-remix-ssr.pages.dev/

# Sample of Cloudflare Pages with Remix SSR

## root.tsx

RemixHeadProvider(head 制御用)と SSRProvider(SSR データ管理用)を設置します。さらに、head タグ内に RemixHeadRoot を設置して、title タグを出力する場所を作ります。

```tsx
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
```

## routes/\_index.tsx

千葉、東京、神奈川の天気予報のリンクを作成します。RemixHead で、タイトルタグは SSR 時に head 内に出力されます。

```tsx
import { Link } from "@remix-run/react";
import { RemixHead } from "remix-head";

export default function Index() {
  const codes = { 120000: "千葉", 130000: "東京", 140000: "神奈川" } as const;
  return (
    <div className="p-2">
      <RemixHead>
        <title>天気予報</title>
      </RemixHead>
      <a href="https://github.com/SoraKumo001/next-use-ssr">Source Code</a>
      <hr />
      <div className="flex flex-col">
        {Object.entries(codes).map(([key, value]) => (
          <Link key={key} to={`/weather/${key}`} className="underline">
            {value}の天気
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### weather.$id.tsx

useSSR を使って、天気予報のデータを取得します。SSR 時は内部で`throw promise`を行い、データの取得が完了するまでコンポーネントの評価をスキップします。データルーティングも自動で行われるため、クライアント側で処理される時点で、データは持った状態で始まります。その後、ユーザーの操作によってデータを再取得することも可能です。

また、動作がわかりやすいように 500ms の遅延を追加しています。

```tsx
import { Link, useParams } from "@remix-run/react";
import { useSSR } from "next-ssr";
import { RemixHead } from "remix-head";

export interface WeatherType {
  publishingOffice: string;
  reportDatetime: string;
  targetArea: string;
  headlineText: string;
  text: string;
}

const Weather = ({ code }: { code: number }) => {
  const { data, reload, isLoading } = useSSR<WeatherType>(
    () =>
      fetch(
        `https://www.jma.go.jp/bosai/forecast/data/overview_forecast/${code}.json`
      )
        .then((r) => r.json<WeatherType>())
        .then(
          // Additional weights (500 ms)
          (r) => new Promise((resolve) => setTimeout(() => resolve(r), 500))
        ),
    { key: code }
  );
  if (!data) return <div>loading</div>;
  const { targetArea, reportDatetime, headlineText, text } = data;
  return (
    <>
      <div>
        <Link to="..">戻る</Link>
      </div>
      <div className={`mt-4${isLoading ? " bg-gray-500 relative" : ""}`}>
        {isLoading && (
          <div className="absolute text-white top-1/2 left-1/2">loading</div>
        )}
        <RemixHead>
          <title>{`${targetArea}の天気`}</title>
        </RemixHead>
        <h1 className="flex text-4xl font-extrabold leading-none items-center gap-2">
          {targetArea}
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={reload}
          >
            Reload
          </button>
        </h1>

        <div>
          {new Date(reportDatetime).toLocaleString("ja-JP", {
            timeZone: "JST",
          })}
        </div>
        <div>{headlineText}</div>
        <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>
      </div>
    </>
  );
};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <Weather code={Number(id)} />;
}
```
