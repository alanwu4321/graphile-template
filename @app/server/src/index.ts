#!/usr/bin/env node
/* eslint-disable no-console */
import chalk from "chalk";
import { createServer as httpsServer } from "https";
import { createServer as httpServer } from "http";

const fs = require("fs");

import { getShutdownActions, makeApp } from "./app";

// @ts-ignore
const packageJson = require("../../../package.json");
const isDev = process.env.NODE_ENV === "development";
async function main() {
  // Create our HTTP server
  const server = isDev
    ? httpsServer({
        key: fs.readFileSync("/Users/alwu/localhost+2-key.pem"),
        cert: fs.readFileSync("/Users/alwu/localhost+2.pem"),
      })
    : httpServer();

  // Make our application (loading all the middleware, etc)
  const app = await makeApp({ httpServer: server });

  // Add our application to our HTTP server
  server.addListener("request", app);

  // And finally, we open the listen port
  const PORT = parseInt(process.env.PORT || "", 10) || 3000;
  server.listen(PORT, () => {
    const address = server.address();
    const actualPort: string =
      typeof address === "string"
        ? address
        : address && address.port
        ? String(address.port)
        : String(PORT);
    console.log();
    console.log(
      chalk.green(
        `${chalk.bold(packageJson.name)} listening on port ${chalk.bold(
          actualPort
        )}`
      )
    );
    console.log();
    console.log(`Serving over ${isDev ? "HTTPS" : "HTTP"}`);
    console.log(
      `  Site:     ${chalk.bold.underline(
        `${JSON.stringify(server.address())}:${actualPort}`
      )}`
    );
    console.log(
      `  GraphiQL: ${chalk.bold.underline(
        `http://localhost:${actualPort}/graphiql`
      )}`
    );
    console.log();
  });

  // Nodemon SIGUSR2 handling
  const shutdownActions = getShutdownActions(app);
  shutdownActions.push(() => {
    server.close();
  });
}

main().catch((e) => {
  console.error("Fatal error occurred starting server!");
  console.error(e);
  process.exit(101);
});
