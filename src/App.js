import React, { Suspense, lazy, useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import githublogo from './images/github-mark-white.png';
import CurrencySelector from './CurrencySelector';

const MemoizedCurrencySelector = React.memo(CurrencySelector);
const ReactPWAPrompt = lazy(() => import('react-ios-pwa-prompt'));
// const color = "#FF6B6B";
const color = "white";

const normalizeAmountInput = (rawValue) => {
    let value = String(rawValue ?? '').trim();
    if (!value) return '';

    value = value
        .replace(/[^\d.,]/g, '')
        .replace(/\s/g, '');

    if (!value) return '';

    if (value.includes('.')) {
        value = value.replace(/,/g, '');
    } else if (value.includes(',')) {
        const commaParts = value.split(',');
        const lastPart = commaParts[commaParts.length - 1];
        const singleDecimalComma = commaParts.length === 2 && lastPart.length > 0 && lastPart.length <= 2;
        value = singleDecimalComma
            ? `${commaParts[0]}.${lastPart}`
            : commaParts.join('');
    }

    const [wholePart, ...decimalParts] = value.split('.');
    const whole = wholePart.replace(/\D/g, '');
    const decimal = decimalParts.join('').replace(/\D/g, '');
    const normalized = decimalParts.length > 0 ? `${whole || '0'}.${decimal}` : whole;

    return normalized;
};


function App() {
    const [error, setError] = useState("");
    const [supportedCurrencies, setSupportedCurrencies] = useState([]);
    const [displaySelectedRates, setDisplaySelectedRates] = useState("");
    const [updatedTime, setUpdatedTime] = useState("");
    const [loading, setLoading] = useState(true);
    const [fromCurrencyValue, setFromCurrencyValue] = useState(localStorage.getItem('fromCur') || "USD");
    const [fromCurrencyInputValue, setFromCurrencyInputValue] = useState("1");
    const [toCurrencyValue, setToCurrencyValue] = useState(localStorage.getItem('toCur') || "INR");
    const [toCurrencyInputValue, setToCurrencyInputValue] = useState("0");
    const [isOffline, setIsOffline] = useState(false);
    const [hasCachedData, setHasCachedData] = useState(false);
    const [showPwaPrompt, setShowPwaPrompt] = useState(false);
    const hasLoadedData = useRef(false);

    const convertCurrency = useCallback((amount, from = fromCurrencyValue, to = toCurrencyValue) => {
        const exchangeRates = JSON.parse(localStorage.getItem('currencyData'))?.rates;
        if (amount === '' || amount === null || amount === undefined || !exchangeRates) return '';
        const numericAmount = Number(amount);
        if (Number.isNaN(numericAmount)) return '';
        from = (from + "").includes(" - ") ? from.split(" - ")[0] : from;
        to = (to + "").includes(" - ") ? to.split(" - ")[0] : to;
        if (from === to) return numericAmount % 1 === 0 ? numericAmount : numericAmount.toFixed(2);

        const fromRate = exchangeRates[from];
        const toRate = exchangeRates[to];

        if (!fromRate || !toRate) return 0;

        const convertedAmount = numericAmount * (toRate / fromRate);
        const finalVal = Number(convertedAmount);
        return finalVal % 1 === 0 ? finalVal : finalVal.toFixed(2);
    }, [fromCurrencyValue, toCurrencyValue]);

    const updateDisplayContent = useCallback(() => {
        setDisplaySelectedRates(`1 ${fromCurrencyValue} = ${convertCurrency(1)} ${toCurrencyValue}`);
        const fetchTime = localStorage.getItem('currencyFetchTime');
        if (fetchTime) {
            setUpdatedTime("Updated on " + new Date(Number(fetchTime)).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }));
        }
    }, [fromCurrencyValue, toCurrencyValue, convertCurrency]);

    // Separate effect for updating display and localStorage when currencies change
    useEffect(() => {
        const exchangeRates = JSON.parse(localStorage.getItem('currencyData'))?.rates;
        if (exchangeRates && exchangeRates[fromCurrencyValue] && exchangeRates[toCurrencyValue]) {
            updateDisplayContent();
            localStorage.setItem('fromCur', fromCurrencyValue);
            localStorage.setItem('toCur', toCurrencyValue);
        }
    }, [fromCurrencyValue, toCurrencyValue, updateDisplayContent]);

    // Effect to handle initial conversion when data is first loaded
    useEffect(() => {
        const exchangeRates = JSON.parse(localStorage.getItem('currencyData'))?.rates;
        if (exchangeRates && supportedCurrencies.length > 0 && fromCurrencyInputValue === "1" && toCurrencyInputValue === "0") {
            const convertedValue = convertCurrency("1");
            if (convertedValue && convertedValue !== "0") {
                setToCurrencyInputValue(convertedValue);
            }
        }
    }, [supportedCurrencies, convertCurrency, fromCurrencyInputValue, toCurrencyInputValue]);

    const fetchLatestData = useCallback(async () => {
        try {
            const response = await fetch('https://jeapis.netlify.app/.netlify/functions/currency?from=USD&to=INR', {
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            if (!response.ok) {
                throw new Error("Server error");
            }

            const data = await response.json();
            for (let cur in data.rates) {
                data.rates[cur] = data.rates[cur].toFixed(2);
            }
            localStorage.setItem('currencyData', JSON.stringify(data));
            localStorage.setItem('currencyFetchTime', new Date().getTime());
            setIsOffline(false);
            return data;
        } catch (error) {
            console.log("Fetch error:", error.message);
            setIsOffline(true);
            return null;
        }
    }, []);

    const updateAmount = useCallback((rawValue, type) => {
        const value = normalizeAmountInput(rawValue);
        if (type === "from") {
            setFromCurrencyInputValue(value);
            setToCurrencyInputValue(convertCurrency(value));
        } else {
            setToCurrencyInputValue(value);
            setFromCurrencyInputValue(convertCurrency(value, toCurrencyValue, fromCurrencyValue));
        }
    }, [fromCurrencyValue, toCurrencyValue, convertCurrency]);

    const handleCurrencyInputChange = useCallback((e, type) => {
        updateAmount(e.target.value, type);
    }, [updateAmount]);

    const handleCurrencyPaste = useCallback((e, type) => {
        e.preventDefault();
        updateAmount(e.clipboardData.getData('text'), type);
    }, [updateAmount]);

    const processData = useCallback((data) => {
        if (!data || !data.supportedCurrency || !data.rates) {
            return false;
        }

        var curr = [];
        for (const key in data.supportedCurrency) {
            if (data.supportedCurrency.hasOwnProperty(key)) {
                curr.push(key + " - " + data.supportedCurrency[key]);
            }
        }
        setSupportedCurrencies(curr);

        // Set initial values when first loading
        // if (!fromCurrencyInputValue || fromCurrencyInputValue === "0") {
        //     const initialFromValue = "0";
        //     setFromCurrencyInputValue(initialFromValue);

        //     // Calculate the conversion directly here with the new data
        //     const fromCode = fromCurrencyValue.includes(" - ") ? fromCurrencyValue.split(" - ")[0] : fromCurrencyValue;
        //     const toCode = toCurrencyValue.includes(" - ") ? toCurrencyValue.split(" - ")[0] : toCurrencyValue;

        //     if (data.rates[fromCode] && data.rates[toCode]) {
        //         const convertedAmount = initialFromValue * (data.rates[toCode] / data.rates[fromCode]);
        //         const finalVal = Number(convertedAmount);
        //         const result = finalVal % 1 === 0 ? finalVal : finalVal.toFixed(2);
        //         setToCurrencyInputValue(result);
        //     }
        // }

        updateDisplayContent();
        return true;
    }, [updateDisplayContent]);

    useEffect(() => {
        if (hasLoadedData.current) {
            return;
        }
        hasLoadedData.current = true;

        async function fetchData() {
            // First try to use cached data to show something immediately
            let cachedData = null;
            const storedDataStr = localStorage.getItem('currencyData');

            if (storedDataStr) {
                try {
                    cachedData = JSON.parse(storedDataStr);
                    if (processData(cachedData)) {
                        // If we have valid cached data, update UI immediately
                        setError("");
                        setLoading(false);
                        setHasCachedData(true);
                    }
                } catch (e) {
                    console.error("Error parsing cached data:", e);
                }
            }

            // Check if we need to fetch new data
            const isSameDay = () => {
                const fetchTime = localStorage.getItem('currencyFetchTime');
                if (!fetchTime) return false;

                const fetchDate = new Date(Number(fetchTime)).toLocaleDateString('en-GB');
                const today = new Date().toLocaleDateString('en-GB');
                return fetchDate === today;
            };

            // Fetch new data if it's not from today
            if (!isSameDay()) {
                try {
                    const newData = await fetchLatestData();

                    if (newData) {
                        // Process new data in the background
                        processData(newData);
                        setError("");
                    } else if (!cachedData) {
                        // Only show error if we don't have cached data
                        setError("Please connect to internet and try again");
                    }
                } catch (err) {
                    console.error("Error fetching data:", err);

                    if (!cachedData) {
                        setError("Please connect to internet and try again");
                    }
                }
            }

            // Ensure we turn off loading state even if there was an error
            // but only if we don't have cached data
            if (!cachedData) {
                setLoading(false);
            }
        }

        fetchData();
    }, [fetchLatestData, processData]);

    useEffect(() => {
        const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
        const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        if (!isIos || isStandalone) return undefined;

        const showPrompt = () => setShowPwaPrompt(true);
        if ('requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(showPrompt, { timeout: 3000 });
            return () => window.cancelIdleCallback(idleId);
        }

        const timeoutId = window.setTimeout(showPrompt, 2500);
        return () => window.clearTimeout(timeoutId);
    }, []);

    return (
        <main className="app">
            <h1 className="app-title">Currency Converter</h1>
            {isOffline && <div style={{ color: color, textAlign: 'center', marginBottom: '10px', display: 'none' }}>
                Offline Mode - Using cached data
            </div>}
            {loading && !hasCachedData ? (
                <div id="loading" className="loading">{error || "Loading..."}</div>
            ) : error && !hasCachedData ? (
                <div id="loading" className="loading">{error}</div>
            ) : (
                <>
                    <div className="exchange-rate">{displaySelectedRates}</div>
                    <div className="converter-card">
                        {['from', 'to'].map((type) => (
                            <div key={type} style={type === "to" ? {} : { marginBottom: '20px' }}>
                                <MemoizedCurrencySelector
                                    type={type}
                                    fromCurrencyValue={fromCurrencyValue}
                                    toCurrencyValue={toCurrencyValue}
                                    setFromCurrencyValue={setFromCurrencyValue}
                                    setToCurrencyValue={setToCurrencyValue}
                                    fromCurrencyInputValue={fromCurrencyInputValue}
                                    setToCurrencyInputValue={setToCurrencyInputValue}
                                    convertCurrency={convertCurrency}
                                    supportedCurrencies={supportedCurrencies}
                                />
                                <input
                                    className="retro-input amount-input"
                                    value={type === 'from' ? fromCurrencyInputValue : toCurrencyInputValue}
                                    onChange={(e) => handleCurrencyInputChange(e, type)}
                                    onPaste={(e) => handleCurrencyPaste(e, type)}
                                    onFocus={(e) => e.target.select()}
                                    placeholder="0.00"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    aria-label={type === 'from' ? 'From currency amount' : 'To currency amount'}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="update-info">{updatedTime}</div>
                </>
            )}
            <div className="footer">
                <a href="https://github.com/jebin2" target="_blank" rel="noopener noreferrer">
                    <img src={githublogo} alt="GitHub logo" />
                </a>
            </div>
            {showPwaPrompt && (
                <div className="pwa-prompt">
                    <Suspense fallback={null}>
                        <ReactPWAPrompt
                            timesToShow={5}
                            promptOnVisit={1}
                            appIconPath={`${process.env.PUBLIC_URL}/favicon.ico`}
                        />
                    </Suspense>
                </div>
            )}
        </main>
    );
}

export default App;
