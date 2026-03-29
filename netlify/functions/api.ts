import serverless from "serverless-http";
import { createServer } from "../../server/index";

const app = createServer();

// Netlify Functions handler - serverless-http ile Express'i wrap et
export const handler = serverless(app);
