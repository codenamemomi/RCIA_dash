const API_BASE = 'https://api.konasalti.com/rcia/api/v1';

export const fetchDashboardData = async () => {
    try {
        const urls = [
            `${API_BASE}/agent/status`,
            `${API_BASE}/agent/reputation`,
            `${API_BASE}/agent/validation`,
            `${API_BASE}/agent/history`,
            `${API_BASE}/agent/sandbox-balance`
        ];

        const responses = await Promise.all(
            urls.map(url => fetch(url).catch(() => null))
        );

        const status = responses[0] && responses[0].ok ? await responses[0].json() : null;
        const reputation = responses[1] && responses[1].ok ? await responses[1].json() : { trust_score: 0 };
        const artifacts = responses[2] && responses[2].ok ? await responses[2].json() : [];
        const history = responses[3] && responses[3].ok ? await responses[3].json() : [];
        const sandbox = responses[4] && responses[4].ok ? await responses[4].json() : { balance: 0 };

        if (!status) return null;

        const currentPrice = status.metrics?.current_price || 0;
        const timeLabel = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        return {
            status,
            reputation,
            artifacts: artifacts.reverse(),
            tradeHistory: history,
            sandbox,
            pricePoint: { time: timeLabel, price: currentPrice },
            pnlPoint: { time: timeLabel, pnl: (status.risk?.cumulative_pnl * 100 || 0).toFixed(2) }
        };
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
};

export const triggerEvaluation = async (symbol = "BTC/USDT") => {
    try {
        const res = await fetch(`${API_BASE}/agent/evaluate?symbol=${symbol}`, {
            method: 'POST'
        });
        return await res.json();
    } catch (err) {
        console.error('Evaluation Error:', err);
        return { status: "error", message: "Failed to reach backend" };
    }
};

export const claimCapital = async () => {
    try {
        const res = await fetch(`${API_BASE}/agent/claim-capital`, {
            method: 'POST'
        });
        return await res.json();
    } catch (err) {
        console.error('Claim Capital Error:', err);
        return { status: "error", message: "Failed to reach backend" };
    }
};
