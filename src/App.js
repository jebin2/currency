import React, { useState, useEffect } from 'react';
import './App.css';
import githublogo from './images/github-mark-white.png';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';
import { Popper } from '@mui/material';
import ReactPWAPrompt from 'react-ios-pwa-prompt';

function App() {
    const [error, setError] = useState("Loading...");
    const [supportedCurrencies, setSupportedCurrencies] = useState([]);
    const [displaySelectedRates, setDisplaySelectedRates] = useState("");
    const [updatedTime, setUpdatedTime] = useState("");
    const [loading, setLoading] = useState(true);
    const [fromCurrencyValue, setFromCurrencyValue] = useState(localStorage.getItem('fromCur') ? localStorage.getItem('fromCur') : "USD");
    const [fromCurrencyInputValue, setFromCurrencyInputValue] = useState("0");
    const [toCurrencyValue, setToCurrencyValue] = useState(localStorage.getItem('toCur') ? localStorage.getItem('toCur') : "INR");
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
        if (from === to) return Number(amount) % 1 === 0 ? Number(amount) : Number(amount).toFixed(2);

        const fromRate = exchangeRates[from];
        const toRate = exchangeRates[to];

        if (!fromRate || !toRate) return 0;

        const convertedAmount = amount * (toRate / fromRate);
        const finalVal = Number(convertedAmount);
        return finalVal % 1 === 0 ? finalVal : finalVal.toFixed(2);
    }

    const processData = (data) => {
        setSupportedCurrencies(Object.keys(data.rates));
        updateDisplayContent();
        handleCurrencyInputChange({ target: { value: 1 } }, "from", 'ignoreFocus');
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const fetchedDate = new Date(Number(localStorage.getItem('currencyFetchTime'))).toLocaleDateString('en-GB');
                const today = new Date().toLocaleDateString('en-GB');
                let currencyData = localStorage.getItem('currencyData');

                if (fetchedDate !== today) {
                    currencyData = null;
                }

                if (currencyData) {
                    processData(JSON.parse(currencyData));
                } else {
                    const response = await fetch('https://jeapis.netlify.app/.netlify/functions/currency?from=USD&to=INR');
                    const data = await response.json();
                    for (let cur in data.rates) {
                        data.rates[cur] = data.rates[cur].toFixed(2);
                    }
                    localStorage.setItem('currencyData', JSON.stringify(data));
                    localStorage.setItem('currencyFetchTime', new Date().getTime());
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

    const CustomPopper = styled(Popper)(({ theme }) => ({
        '& .MuiAutocomplete-listbox': {
            backgroundColor: 'black',
            color: 'white',
            '& .MuiMenuItem-root': {
                backgroundColor: 'black',
                color: 'white'
            },
            '& .MuiAutocomplete-option.Mui-focused': {
                color: 'white',
                boxShadow: "0 0 8px rgba(0, 255, 0, 0.5)",
                outline: "none",
            }
        },
    }));

    const CustomTextField = styled(TextField)(({ theme }) => ({
        '& .MuiInputBase-root': {
            borderRadius: "2px",
            backgroundColor: "black",
            color: "white",
            transition: 'background-color 0.3s',
            fontSize: '1rem',
            width: '100%',
            paddingRight: '0px !important',
            border: "1px solid white",
            '&:hover, &.Mui-focused': {
                border: '1px solid #002700',
                boxShadow: "0 0 8px rgba(0, 255, 0, 0.5)",
                outline: "none",
            },
            '& .MuiAutocomplete-endAdornment': {
                '& .MuiButtonBase-root': {
                    color: 'white',
                }
            },
        },
        '& .MuiAutocomplete-inputRoot': {
            border: 'none',
        },
        '& .MuiOutlinedInput-root': {
            fontWeight: "600 !important",
            letterSpacing: "0.1rem !important",
            '& fieldset': {
                borderColor: 'transparent', // Default border color
            },
            '&:hover fieldset': {
                borderColor: 'transparent', // Remove border on hover
            },
            '&.Mui-focused fieldset': {
                borderColor: 'transparent', // Remove border on focus
            },
            '&.Mui-focused:hover fieldset': {
                borderColor: 'transparent',
            },
        },
    }));

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
        <>
            <div className="header">Currency Rates</div>
            <div className="container">
                {loading || error !== "Loading..." ? (
                    <div id="loading" className="loading">{error}</div>
                ) : (
                    <>
                        <div className="exchange-rate">{displaySelectedRates}</div>
                        <div className="card" id="apiCard">
                            {['from', 'to'].map((type) => (
                                <div className="form-group" key={type}>
                                    <Autocomplete
                                        disableClearable
                                        disablePortal
                                        options={supportedCurrencies}
                                        value={type === 'from' ? fromCurrencyValue : toCurrencyValue}
                                        onChange={(event, newValue) => {
                                            if (type === 'from') {
                                                setFromCurrencyValue(newValue);
                                                setToCurrencyInputValue(convertCurrency(fromCurrencyInputValue, newValue, toCurrencyValue));
                                            } else {
                                                setToCurrencyValue(newValue);
                                                setToCurrencyInputValue(convertCurrency(fromCurrencyInputValue, fromCurrencyValue, newValue));
                                            }
                                        }}
                                        size='small'
                                        sx={{
                                            color: "white",
                                            width: "80px",
                                            borderRadius: "2px",
                                        }}
                                        renderInput={(params) => (
                                            <CustomTextField {...params} variant="outlined" size="small"
                                                sx={{
                                                    fontWeight: "600 !important",
                                                    letterSpacing: "0.1rem !important",
                                                }} />
                                        )}
                                        PopperComponent={CustomPopper}
                                    />
                                    <CustomTextField
                                        value={type === 'from' ? fromCurrencyInputValue : toCurrencyInputValue}
                                        onChange={(e) => handleCurrencyInputChange(e, type)}
                                        autoFocus={typeField === type}
                                        sx={{
                                            color: "white",
                                            width: "200px",
                                            borderRadius: "2px",
                                            fontWeight: "600 !important",
                                            letterSpacing: "0.1rem !important",
                                        }}
                                        variant="outlined"
                                        size="small"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className='updateInfoDiv'>{updatedTime}</div>
                    </>
                )}
            </div>
            <div className="footer">
                <a href="https://github.com/jebin2" target="_blank" rel="noopener noreferrer">
                    <img src={githublogo} alt="GitHub logo" />
                </a>
            </div>
            <div className='promtPWA'>
                <ReactPWAPrompt
                    timesToShow={5}
                    promptOnVisit={1}
                    appIconPath="/currency/favicon.ico"
                />
            </div>
        </>
    );
}

export default App;