import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import GitHubProvider from "next-auth/providers/github";

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "repo" } },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account }: { token: any; account: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      return {
        ...session,
        accessToken: token.accessToken,
      };
    },
  },
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { title, description, type } = await request.json();
  const octokit = new Octokit({ auth: (session as { accessToken?: string }).accessToken });

  const [owner, repo] = process.env.GITHUB_REPO!.split("/");
  console.log('Creating issue for:', { owner, repo, title, hasToken: !!(session as { accessToken?: string }).accessToken });
  
  const templateBody = type === "bug" 
    ? `## Bug Report

${description}

**Environment:**
- Browser: 
- OS: 
- Version: `
    : `## Feature Request

${description}`;

  try {
    await octokit.rest.issues.create({
      owner,
      repo,
      title: type === "bug" ? `[Bug] ${title}` : `[Feature] ${title}`,
      body: templateBody,
      labels: type === "bug" ? ["bug", "triage"] : ["feature", "triage"],
    });
  } catch (error) {
    console.error('GitHub API Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}