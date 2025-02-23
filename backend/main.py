from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import numpy as np
import os
import requests
import openai


app = FastAPI()

# To allow frontend (on http://localhost:3000 for dev) to call the backend
origins = [
    "http://localhost:5173",
    "https://pocket-trader-app.vercel.app"
    "https://pocket-trader-app.com"
    "https://www.pocket-trader-app.com"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Fintech AI Backend Running!"}


@app.get("/search")
async def search_stocks(q: str = Query(..., min_length=1)):
    """
    Search for stocks using Yahoo Finance API.
    Returns company symbols and names that match the query.
    """
    try:
        # Yahoo Finance search API
        url = "https://query2.finance.yahoo.com/v1/finance/search"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        params = {
            'q': q,
            'quotesCount': 6,
            'newsCount': 0,
            'enableFuzzyQuery': False,
            'quotesQueryId': 'tss_match_phrase_query'
        }

        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            return {"error": f"Yahoo Finance API error: {response.status_code}"}

        data = response.json()

        if 'quotes' not in data:
            return {"error": "No quotes found in response"}

        suggestions = []
        for quote in data['quotes']:
            if 'symbol' in quote and ('shortname' in quote or 'longname' in quote):
                suggestions.append({
                    'symbol': quote['symbol'],
                    'name': quote.get('shortname') or quote.get('longname', '')
                })

        return suggestions

    except Exception as e:
        return {"error": str(e)}

@app.get("/stock/{symbol}")
def get_stock_data(symbol: str):
    """
    Fetch financial data using yfinance for a specific stock symbol.
    Returns:
      - Basic company info
      - Latest close price
      - Historical price data (simple)
      - Some example financial metrics
    """
    try:
        ticker = yf.Ticker(symbol)
        
        # Company info
        info = ticker.info  # May need to switch to .fast_info or .get_info() if there's a deprecation
        
        # Historical data (past 1 year by default)
        hist = ticker.history(period="1y")
        hist.reset_index(inplace=True)
        
        # Basic financial metrics
        # (In production, you'd fetch real financial statements or use .financials)
        last_close = hist["Close"].iloc[-1] if not hist.empty else None
        market_cap = info.get("marketCap", None)
        sector = info.get("sector", None)
        long_business_summary = info.get("longBusinessSummary", "No summary available.")
        
        return {
            "symbol": symbol.upper(),
            "companyName": info.get("longName", symbol.upper()),
            "sector": sector,
            "marketCap": market_cap,
            "lastClosePrice": last_close,
            "businessSummary": long_business_summary,
            "historicalData": hist[["Date", "Close"]].to_dict(orient="records")
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/risk/{symbol}")
def get_stock_risk(symbol: str):
    """
    Provides a mock AI-based risk assessment:
      - Short-term: Based on volatility over the last 30 days.
      - Long-term: Based on 1-year trend (simple slope).
    """
    try:
        ticker = yf.Ticker(symbol)
        hist_1y = ticker.history(period="1y")
        if hist_1y.empty:
            return {"error": "No historical data found for symbol."}
        
        # Short-term: last 30 days volatility
        hist_30 = ticker.history(period="1mo")  # ~30 days
        if not hist_30.empty:
            daily_returns = hist_30["Close"].pct_change().dropna()
            short_term_volatility = np.std(daily_returns)  # standard deviation
        else:
            short_term_volatility = None
        
        # Long-term: simple slope to see if trending up or down
        hist_1y.reset_index(inplace=True)
        hist_1y["DayIndex"] = range(len(hist_1y))
        
        # Fit a linear regression: Close ~ DayIndex
        # For a quick approach, use numpy polyfit
        if len(hist_1y) > 1:
            slope, intercept = np.polyfit(hist_1y["DayIndex"], hist_1y["Close"], 1)
        else:
            slope = 0
        
        # Convert numeric results into textual “risk/outlook”
        short_term_risk = "High" if short_term_volatility and short_term_volatility > 0.02 else "Moderate"
        long_term_outlook = "Bullish" if slope > 0 else "Bearish"
        
        return {
            "symbol": symbol.upper(),
            "shortTermVolatility": float(short_term_volatility) if short_term_volatility else None,
            "shortTermRisk": short_term_risk,
            "longTermTrendSlope": float(slope),
            "longTermOutlook": long_term_outlook
        }
    except Exception as e:
        return {"error": str(e)}


# -------------------------------------------------------------------
# TRANSCRIPT + SUMMARIZATION ENDPOINTS
# -------------------------------------------------------------------

@app.get("/transcripts/{symbol}")
def get_earnings_call_transcript(symbol: str):
    """Fetch the most recent earnings call transcript via Finnhub."""

    try:
        # 1) Get a list of transcripts for this symbol
        list_url = f"https://discountingcashflows.com/api/transcript/?ticker={symbol}"
        list_resp = requests.get(list_url)
        if list_resp.status_code != 200:
            return {"error": f"Failed to fetch transcripts list (status {list_resp.status_code})."}

        detail_data = list_resp.json()
        transcript_data = detail_data[0]

        return {
            "symbol": symbol.upper(),
            "year": transcript_data["year"],
            "quarter": transcript_data["quarter"],
            "content": transcript_data["content"],

        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/transcripts/{symbol}/summary")
def get_earnings_call_summary(symbol: str):
    """
    1) Fetch the most recent transcript from Finnhub.
    2) Summarize it using OpenAI GPT.
    Returns a short summary + bullet points (example).
    """
    try:
        # STEP 1: Retrieve transcript text from the above endpoint
        transcript_resp = get_earnings_call_transcript(symbol)
        if "error" in transcript_resp:
            return transcript_resp  # pass the error through

        full_transcript = transcript_resp.get("content", "")
        if not full_transcript or full_transcript.startswith("No transcript"):
            return {"error": f"No transcript available for symbol: {symbol}"}

        # STEP 2: Summarize via OpenAI
        # NOTE: For very long transcripts, you'd need to chunk the text
        # and either do multiple summarizations or use the 16k/32k token models (like GPT-3.5 16k).

        prompt_text = (
            "Summarize the following earnings call transcript in a concise way. "
            "Focus on key insights, financial performance, outlook, and any guidance given. "
            "Format the key points on separate lines so they can be displayed as bullet points.\n\n"
            f"Transcript:\n{full_transcript}\n"
        )

        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # or "gpt-4"
            messages=[
                {"role": "system", "content": "You are a helpful financial assistant."},
                {"role": "user", "content": prompt_text}
            ],
            temperature=0.7,
            max_tokens=1000,  # adjust as needed for your use case
        )

        message_content = response.choices[0].message.content

        # Return the transcript meta info plus the summary
        return {
            "symbol": transcript_resp["symbol"],
            "year": transcript_resp["year"],
            "quarter": transcript_resp["quarter"],
            "summary": message_content
        }

    except Exception as e:
        return {"error": str(e)}