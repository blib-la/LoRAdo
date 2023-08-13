// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse<Data>,
) {
  switch (request.method) {
    case "POST":
      response.status(201).json({ message: "John Doe" });
      break;
    default:
      response.status(405).json({ message: "NOT_IMPLEMENTED" });
      break;
  }
}
