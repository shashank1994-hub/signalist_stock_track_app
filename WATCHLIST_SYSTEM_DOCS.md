# Watchlist System Documentation

This document explains the complete watchlist and daily news system implementation.

## 📁 File Structure

```
stock_test/
├── database/
│   └── models/
│       └── watchlist.model.ts          # Watchlist Mongoose model
├── lib/
│   ├── actions/
│   │   ├── watchlist.actions.ts        # Watchlist database operations
│   │   ├── finnhub.actions.ts          # News fetching from Finnhub API
│   │   └── user.actions.ts             # User operations
│   ├── inngest/
│   │   └── functions.ts                # Inngest background jobs
│   └── utils.ts                        # Utility functions
└── app/
    └── api/
        └── inngest/
            └── route.ts                # Inngest API endpoint
```

---

## 🗄️ 1. Watchlist Model

**File:** `database/models/watchlist.model.ts`

### Schema Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `userId` | String | User's unique ID from Better Auth | Required, Indexed |
| `symbol` | String | Stock symbol (e.g., "AAPL") | Required, Uppercase, Trimmed |
| `company` | String | Company name (e.g., "Apple Inc.") | Required, Trimmed |
| `addedAt` | Date | When stock was added to watchlist | Default: `Date.now()` |

### Indexes

- **Single Index:** `userId` (for fast user lookups)
- **Compound Unique Index:** `userId + symbol` (prevents duplicate stocks per user)

### TypeScript Interface

```typescript
interface WatchlistItem extends Document {
    userId: string;
    symbol: string;
    company: string;
    addedAt: Date;
}
```

---

## 🔧 2. Watchlist Actions

**File:** `lib/actions/watchlist.actions.ts`

### Functions

#### `getWatchlistSymbolsByEmail(email: string): Promise<string[]>`

Fetches all watchlist symbols for a user by their email address.

**Flow:**
1. Connect to database
2. Find user by email in Better Auth's user collection
3. Query watchlist by `userId`
4. Return array of symbols (uppercase)

**Returns:**
- Array of symbols: `["AAPL", "GOOGL", "TSLA"]`
- Empty array if user not found or error occurs

**Error Handling:**
- Logs errors to console
- Returns empty array on failure (graceful degradation)

#### `getWatchlistSymbols(): Promise<string[]>`

Gets watchlist symbols for the currently authenticated user.

**Usage:**
```typescript
const symbols = await getWatchlistSymbols();
// ["AAPL", "MSFT", "NVDA"]
```

---

## 📰 3. Finnhub Actions

**File:** `lib/actions/finnhub.actions.ts`

### Configuration

```typescript
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
```

### Functions

#### `fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T>`

Internal helper for fetching JSON data with optional caching.

**Parameters:**
- `url`: Full API URL
- `revalidateSeconds`: Optional cache duration (uses `force-cache` if provided)

**Behavior:**
- With `revalidateSeconds`: Caches response and revalidates after specified seconds
- Without: Uses `no-store` (always fresh data)
- Throws error on non-200 responses

---

#### `getNews(symbols?: string[]): Promise<MarketNewsArticle[]>`

Fetches news articles for specific symbols or general market news.

**Parameters:**
- `symbols`: Optional array of stock symbols (e.g., `["AAPL", "GOOGL"]`)

**Returns:**
- Array of max 6 formatted news articles
- Sorted by datetime (newest first)

**Logic Flow:**

##### With Symbols (Company News):
1. Clean and uppercase symbols
2. Calculate date range (last 5 days)
3. **Round-robin fetching:**
   - Loop max 6 times
   - Each round: `round % symbols.length` to get next symbol
   - Fetch company news for that symbol
   - Take first valid article
   - Add to results
4. Sort by datetime
5. Return articles

**Example:**
```typescript
// User has 3 symbols: ["AAPL", "GOOGL", "TSLA"]
// Round 0: AAPL (0 % 3 = 0)
// Round 1: GOOGL (1 % 3 = 1)
// Round 2: TSLA (2 % 3 = 2)
// Round 3: AAPL (3 % 3 = 0)
// Round 4: GOOGL (4 % 3 = 1)
// Round 5: TSLA (5 % 3 = 2)
// Result: 2 articles per symbol, balanced distribution
```

##### Without Symbols (General News):
1. Fetch general market news
2. Filter valid articles (must have headline, summary, url, datetime)
3. Deduplicate by `id + url + headline`
4. Take top 6 articles
5. Format and return

**Error Handling:**
- Logs errors per symbol
- Continues with next symbol if one fails
- Falls back to general news if no company news found
- Throws `"Failed to fetch news"` on critical errors

---

#### `getQuote(symbol: string): Promise<QuoteData>`

Fetches current price and change data for a stock.

**Caching:** 60 seconds

---

#### `searchStocks(query: string): Promise<FinnhubSearchResponse>`

Searches for stocks by query string.

**Caching:** 300 seconds (5 minutes)

---

## ⚙️ 4. Inngest Functions

**File:** `lib/inngest/functions.ts`

### Function 1: `sendSignUpEmail`

**Trigger:** Event `app/user.created`

**Purpose:** Send personalized welcome email when user signs up

**Steps:**
1. Build user profile from sign-up data
2. Generate personalized intro using Gemini AI
3. Send welcome email via nodemailer

---

### Function 2: `sendDailyNewsSummary`

**Triggers:**
- **Cron:** `'0 12 * * *'` (Every day at 12:00 PM UTC = 5:30 PM IST)
- **Event:** `app/send.daily.news` (Manual trigger)

**Purpose:** Send daily personalized news summary to all users

**Steps:**

#### Step 1: Get All Users
```typescript
const users = await step.run('get-all-users', getALlUsersForEmail);
```
- Fetches all users with valid email and name
- Returns array: `[{ id, email, name }, ...]`

#### Step 2: Fetch Personalized News Per User
```typescript
const newsPerUser = await step.run('fetch-news-per-user', async () => {
    for (const user of users) {
        const symbols = await getWatchlistSymbolsByEmail(user.email);
        const news = await getNews(symbols.length > 0 ? symbols : undefined);
        results.push({ user, news });
    }
});
```

**Logic:**
- For each user:
  - Get their watchlist symbols
  - If they have symbols: Fetch company news (round-robin, max 6)
  - If no symbols: Fetch general market news (max 6)
  - Store result even if news fetch fails (empty array)

#### Step 3: Summarize News via AI
```typescript
const summaries = await step.run('summarize-news-ai', async () => {
    return newsPerUser.map(({ user, news }) => ({
        user,
        news,
        summary: `Daily market summary with ${news.length} articles`,
    }));
});
```

**Status:** Placeholder (TODO: Implement AI summarization)

#### Step 4: Send Emails
```typescript
await step.run('send-summary-emails', async () => {
    for (const { user, news, summary } of summaries) {
        if (news.length === 0) continue;
        // await sendDailyNewsEmail({ email, name, news, summary });
    }
});
```

**Status:** Placeholder (TODO: Implement email sending)

**Return Value:**
```typescript
{
    success: true,
    message: "Daily news summary sent to X users",
    stats: {
        totalUsers: 10,
        usersWithNews: 8
    }
}
```

---

## 🔄 Data Flow Diagram

```
User Signs Up
    ↓
sendSignUpEmail (Inngest)
    ↓
Welcome Email Sent

---

Daily Cron (12 PM UTC)
    ↓
sendDailyNewsSummary (Inngest)
    ↓
Get All Users → [User1, User2, ...]
    ↓
For Each User:
    ↓
    Get Watchlist Symbols → ["AAPL", "GOOGL"]
    ↓
    Fetch News (Round-Robin) → [Article1, Article2, ...]
    ↓
    Summarize via AI → "Market Summary..."
    ↓
    Send Email → ✉️
```

---

## 📊 News Distribution Examples

### Example 1: User with 2 Symbols
```
Symbols: ["AAPL", "GOOGL"]
Rounds: 6
Distribution:
  Round 0: AAPL   → Article 1
  Round 1: GOOGL  → Article 2
  Round 2: AAPL   → Article 3
  Round 3: GOOGL  → Article 4
  Round 4: AAPL   → Article 5
  Round 5: GOOGL  → Article 6
Result: 3 AAPL articles, 3 GOOGL articles
```

### Example 2: User with 5 Symbols
```
Symbols: ["AAPL", "GOOGL", "TSLA", "MSFT", "NVDA"]
Rounds: 6
Distribution:
  Round 0: AAPL   → Article 1
  Round 1: GOOGL  → Article 2
  Round 2: TSLA   → Article 3
  Round 3: MSFT   → Article 4
  Round 4: NVDA   → Article 5
  Round 5: AAPL   → Article 6
Result: 2 AAPL articles, 1 each for others
```

### Example 3: User with No Symbols
```
Symbols: []
Fallback: General Market News
Result: 6 general market articles
```

---

## 🧪 Testing

### Test Watchlist Actions
```typescript
// Get symbols for a user
const symbols = await getWatchlistSymbolsByEmail('user@example.com');
console.log(symbols); // ["AAPL", "GOOGL", "TSLA"]
```

### Test News Fetching
```typescript
// Company news
const companyNews = await getNews(["AAPL", "GOOGL"]);
console.log(companyNews.length); // Max 6

// General news
const generalNews = await getNews();
console.log(generalNews.length); // Max 6
```

### Test Inngest Function Manually
```bash
# Start Inngest dev server
npx inngest-cli@latest dev

# Trigger manually via event
POST http://localhost:3000/api/inngest
{
  "name": "app/send.daily.news",
  "data": {}
}
```

---

## 🔐 Environment Variables Required

```env
# Finnhub API
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_api_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/signalist

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

---

## ✅ Key Features

1. **Graceful Degradation:** All functions return empty arrays on errors
2. **Round-Robin News:** Balanced distribution across watchlist symbols
3. **Max 6 Articles:** Never overwhelm users
4. **Fallback to General:** If no watchlist or no company news found
5. **Deduplication:** Prevents duplicate articles
6. **Validation:** Only includes articles with required fields
7. **Caching:** Smart caching for quotes and search results
8. **Type Safety:** Strong TypeScript typing throughout

---

## 🚀 Next Steps

1. **Implement AI Summarization** (Step 3 in `sendDailyNewsSummary`)
2. **Implement Email Sending** (Step 4 in `sendDailyNewsSummary`)
3. **Add User Preferences** (e.g., preferred news time, frequency)
4. **Add Analytics** (track open rates, click rates)
5. **Add Unsubscribe** (allow users to opt out)

---

## 📝 Notes

- All times in cron are UTC (remember to convert from IST)
- Watchlist uses compound index to prevent duplicates
- News fetching is resilient to individual symbol failures
- System continues even if some users fail
- All errors are logged but don't stop execution
