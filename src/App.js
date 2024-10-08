import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { TextField, Autocomplete, Popper } from '@mui/material';
import ReactPWAPrompt from 'react-ios-pwa-prompt';
import githublogo from './images/github-mark-white.png';
import CurrencySelector from './CurrencySelector';

// const color = "#FF6B6B";
const color = "white";

const RetroContainer = styled('div')({
    boxSizing: 'border-box',
});

const RetroHeader = styled('h1')({
    color: `${color}`,
    textAlign: 'center',
    fontSize: '2rem',
    //   textShadow: '3px 3px #FF6B6B',
});

const RetroCard = styled('div')({
    background: '#1A535C',
    border: `4px solid ${color}`,
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    maxWidth: '500px',
    margin: '0 auto',
});

const RetroTextField = styled(TextField)({
    '& .MuiInputBase-root': {
        fontWeight: 'bold',
        color: `${color}`,
        backgroundColor: '#1A535C',
        border: '2px solid #4ECDC4',
        borderRadius: '5px',
        '&:hover, &.Mui-focused': {
            border: `2px solid ${color}`,
            boxShadow: '0 0 10px rgba(255,230,109,0.5)',
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
});

const RetroExchangeRate = styled('div')({
    color: `${color}`,
    textAlign: 'center',
    fontSize: '1rem',
    marginBottom: '20px',
});

const RetroUpdateInfo = styled('div')({
    color: `${color}`,
    textAlign: 'center',
    fontSize: '1rem',
    marginTop: '20px',
});

const RetroFooter = styled('div')({
    color: `${color}`,
    textAlign: 'center',
    marginTop: '20px',
    '& img': {
        width: '30px',
        height: '30px',
    },
});

const RetroPWA = styled('div')({
    letterSpacing: 'normal',
});


function App() {
    const [error, setError] = useState("Loading...");
    const [supportedCurrencies, setSupportedCurrencies] = useState([]);
    const [displaySelectedRates, setDisplaySelectedRates] = useState("");
    const [updatedTime, setUpdatedTime] = useState("");
    const [loading, setLoading] = useState(true);
    const [fromCurrencyValue, setFromCurrencyValue] = useState(localStorage.getItem('fromCur') || "USD");
    const [fromCurrencyInputValue, setFromCurrencyInputValue] = useState("0");
    const [toCurrencyValue, setToCurrencyValue] = useState(localStorage.getItem('toCur') || "INR");
    const [toCurrencyInputValue, setToCurrencyInputValue] = useState("0");
    const [typeField, setTypeField] = useState("");

    useEffect(() => {
        const exchangeRates = JSON.parse(localStorage.getItem('currencyData'))?.rates;
        if (exchangeRates && exchangeRates[fromCurrencyValue] && exchangeRates[toCurrencyValue]) {
            updateDisplayContent();
            localStorage.setItem('fromCur', fromCurrencyValue);
            localStorage.setItem('toCur', toCurrencyValue);
        }
    }, [fromCurrencyValue, toCurrencyValue]);

    const updateDisplayContent = () => {
        setDisplaySelectedRates(`1 ${fromCurrencyValue} = ${convertCurrency(1)} ${toCurrencyValue}`);
        setUpdatedTime("Updated on " + new Date(Number(localStorage.getItem('currencyFetchTime'))).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }));
    }

    const convertCurrency = (amount, from = fromCurrencyValue, to = toCurrencyValue) => {
        const exchangeRates = JSON.parse(localStorage.getItem('currencyData'))?.rates;
        if (!amount || !exchangeRates) return 0;
        from = (from + "").includes(" - ") ? from.split(" - ")[0] : from;
        to = (to + "").includes(" - ") ? to.split(" - ")[0] : to;
        if (from === to) return Number(amount) % 1 === 0 ? Number(amount) : Number(amount).toFixed(2);

        const fromRate = exchangeRates[from];
        const toRate = exchangeRates[to];

        if (!fromRate || !toRate) return 0;

        const convertedAmount = amount * (toRate / fromRate);
        const finalVal = Number(convertedAmount);
        return finalVal % 1 === 0 ? finalVal : finalVal.toFixed(2);
    }

    const processData = (data) => {
        var curr = [];
        for (const key in data.supportedCurrency) {
            if (data.supportedCurrency.hasOwnProperty(key)) {
                curr.push(key + " - " + data.supportedCurrency[key]);
            }
        }
        setSupportedCurrencies(curr);
        updateDisplayContent();
        handleCurrencyInputChange({ target: { value: 1 } }, "from", 'ignoreFocus');
    }

    const fetchLatestData = async () => {
        try {
            const response = await fetch('https://jeapis.netlify.app/.netlify/functions/currency?from=USD&to=INR');
            const data = await response.json();
            for (let cur in data.rates) {
                data.rates[cur] = data.rates[cur].toFixed(2);
            }
            localStorage.setItem('currencyData', JSON.stringify(data));
            localStorage.setItem('currencyFetchTime', new Date().getTime());
            return data;
        } catch (error) {
            return null;
        }
    }

    useEffect(() => {
        async function fetchData() {
            try {
                let currencyData = localStorage.getItem('currencyData');
                const fetchedDate = new Date(Number(localStorage.getItem('currencyFetchTime'))).toLocaleDateString('en-GB');
                const today = new Date().toLocaleDateString('en-GB');

                if (currencyData) {
                    processData(JSON.parse(currencyData));
                    if (fetchedDate !== today) {
                        fetchLatestData().then(data => {
                            if (data) {
                                processData(data);
                            }
                        });
                    }
                } else {
                    const data = await fetchLatestData();
                    processData(data);
                }
            } catch (error) {
                let currencyData = localStorage.getItem('currencyData');
                if (currencyData) {
                    processData(JSON.parse(currencyData));
                } else {
                    setError("Please connect to internet and try again");
                }
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleCurrencyInputChange = (e, type, ignoreFocus) => {
        setTypeField(ignoreFocus === "ignoreFocus" ? "" : type);
        if (isNaN(e.target.value)) return;

        const value = e.target.value;
        if (type === "from") {
            setFromCurrencyInputValue(value);
            setToCurrencyInputValue(convertCurrency(value));
        } else {
            setToCurrencyInputValue(value);
            setFromCurrencyInputValue(convertCurrency(value, toCurrencyValue, fromCurrencyValue));
        }
    };

    return (
        <RetroContainer>
            <RetroHeader>Currency Converter</RetroHeader>
            {loading || error !== "Loading..." ? (
                <div id="loading" className="loading">{error}</div>
            ) : (
                <>
                    <RetroExchangeRate>{displaySelectedRates}</RetroExchangeRate>
                    <RetroCard>
                        {['from', 'to'].map((type) => (
                            <div key={type} style={type == "to" ? {} : { marginBottom: '20px' }}>
                                <CurrencySelector
                                    type={type}
                                    fromCurrencyValue={fromCurrencyValue}
                                    toCurrencyValue={toCurrencyValue}
                                    setFromCurrencyValue={setFromCurrencyValue}
                                    setToCurrencyValue={setToCurrencyValue}
                                    fromCurrencyInputValue={fromCurrencyInputValue}
                                    setToCurrencyInputValue={setToCurrencyInputValue}
                                    convertCurrency={convertCurrency}
                                    supportedCurrencies={supportedCurrencies}
                                    RetroTextField={RetroTextField}
                                />
                                <RetroTextField
                                    style={{ marginTop: '10px' }}
                                    value={type === 'from' ? fromCurrencyInputValue : toCurrencyInputValue}
                                    onChange={(e) => handleCurrencyInputChange(e, type)}
                                    variant="outlined"
                                    fullWidth
                                    slotProps={{
                                        htmlInput: {
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*'
                                        }
                                    }}
                                // autoFocus={typeField === type}
                                />
                            </div>
                        ))}
                    </RetroCard>
                    <RetroUpdateInfo>{updatedTime}</RetroUpdateInfo>
                </>
            )}
            <RetroFooter>
                <a href="https://github.com/jebin2" target="_blank" rel="noopener noreferrer">
                    <img src={githublogo} alt="GitHub logo" />
                </a>
            </RetroFooter>
            <RetroPWA>
                <ReactPWAPrompt
                    timesToShow={5}
                    promptOnVisit={1}
                    appIconPath="/currency/favicon.ico"
                />
            </RetroPWA>
        </RetroContainer>
    );
}

export default App;