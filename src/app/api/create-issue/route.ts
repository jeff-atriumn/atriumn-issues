import { Octokit } from "@octokit/rest";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
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
    async jwt({ token, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
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

  const { title, feature, motivation } = await request.json();
  const octokit = new Octokit({ auth: (session as { accessToken?: string }).accessToken });

  const [owner, repo] = process.env.GITHUB_REPO!.split("/");
  console.log('Creating issue for:', { owner, repo, title, hasToken: !!(session as any).accessToken });
  
  const templateBody = `## Feature Request

**What's the feature?**
${feature}

**Why is this important?**
${motivation}

**Additional Context**
`;

  try {
    await octokit.rest.issues.create({
      owner,
      repo,
      title: `[Feature] ${title}`,
      body: templateBody,
      labels: ["feature", "triage"],
    });
  } catch (error) {
    console.error('GitHub API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}