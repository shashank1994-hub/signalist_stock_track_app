import { inngest } from "@/lib/inngest/client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import { getALlUsersForEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { error } from "better-auth/api";
import { formatDateToday } from "@/lib/utils";

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created' },
    async ({ event, step }) => {
        const userProfile = `
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred Industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.0-flash-exp' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            }
        })

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.'

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        })

        return {
            success: true,
            message: 'WELCOME email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary' },
    [{ event: 'app/send.daily.news' }, { cron: '0 14 * * *' }],
    async ({ step }) => {

        // Step 1: Get all users for news delivery
        const users = await step.run('get-all-users', getALlUsersForEmail);

        if (!users || users.length === 0) {
            return { success: false, message: 'No users found for news email.' };
        }

        console.log(`Found ${users.length} users for daily news summary`);

        // Step 2: Fetch personalized news for each user
        const newsPerUser = await step.run('fetch-news-per-user', async () => {
            const results: Array<{ user: typeof users[0]; news: MarketNewsArticle[] }> = [];

            for (const user of users) {
                try {
                    // Get user's watchlist symbols
                    const symbols = await getWatchlistSymbolsByEmail(user.email);

                    console.log(`User ${user.email} has ${symbols.length} watchlist symbols`);

                    // Fetch news based on watchlist (or general if empty)
                    const news = await getNews(symbols.length > 0 ? symbols : undefined);

                    results.push({ user, news });

                    console.log(`Fetched ${news.length} articles for ${user.email}`);
                } catch (error) {
                    console.error(`Error fetching news for ${user.email}:`, error);
                    // Continue with next user even if one fails
                    results.push({ user, news: [] });
                }
            }

            return results;
        });

        // Step 3: Summarize news via AI for each user
        const summaries = await step.run('summarize-news-ai', async () => {
            // TODO: Implement AI summarization
            // For now, just prepare the data structure
            return newsPerUser.map(({ user, news }) => ({
                user,
                news,
                summary: `Daily market summary with ${news.length} articles`, // Placeholder
            }));
        });

        const userNewsSummaries: { user: User; newsContent: string | null }[] = [];

        for (const { user, news } of newsPerUser) {
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(news, null, 2));

                const response = await step.ai.infer(`summarize-news-${user.email}`, {
                    model: step.ai.models.gemini({ model: 'gemini-2.0-flash-exp' }),
                    body: {
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    }
                });
                const part = response.candidates?.[0]?.content?.parts?.[0];
                const newsContent = (part && 'text' in part ? part.text : null) || 'No market news.'

                userNewsSummaries.push({ user, newsContent });

            } catch (e) {
                console.error('Failed to summarize news for :', user.email);
                userNewsSummaries.push({ user, newsContent: null })
            }
        }

        // Step 4: Send emails to all users
        await step.run('send-summary-emails', async () => {
            await Promise.all(
                userNewsSummaries.map(async ({ user, newsContent }) => {
                    if (!newsContent) return false;

                    return await sendNewsSummaryEmail({ email: user.email, date: formatDateToday, newsContent })
                })
            )
        });

        return {
            success: true,
            message: `Daily news summary sent to ${users.length} users`,
            stats: {
                totalUsers: users.length,
                usersWithNews: newsPerUser.filter(n => n.news.length > 0).length,
            }
        };
    }
)
