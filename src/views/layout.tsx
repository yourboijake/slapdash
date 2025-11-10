import type { FC } from "hono/jsx";

export const Layout: FC = (props) => {
  return (
    <html lang="en" style="height: 100%">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Slapdash</title>
        <link
          href="https://cdn.jsdelivr.net/npm/daisyui@5"
          rel="stylesheet"
          type="text/css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        ></link>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.7/dist/htmx.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/htmx-ext-ws@2.0.2"></script>
      </head>
      <body
        data-theme="dark"
        class="bg-base"
        style="font-family: Inter, sans-serif; height: 100%;"
      >
        {props.children}
      </body>
    </html>
  );
};
