import React, { useState, useEffect } from 'react';
import './App.css';
import githublogo from './images/github-mark-white.png';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material/styles';
import { Popper } from '@mui/material';

function App() {
    let exchangeRates = {};
    const [supportedCurrencies, setSupportedCurrencies] = useState([]);
    const [displaySelectedRates, setDisplaySelectedRates] = useState("");
    const [updatedTime, setUpdatedTime] = useState("");
    const [loading, setLoading] = useState(true);
    const [fromCurrencyValue, setFromCurrencyValue] = useState("USD");
    const [fromCurrencyInputValue, setFromCurrencyInputValue] = useState(0);
    const [toCurrencyValue, setToCurrencyValue] = useState("INR");
    const [toCurrencyInputValue, setToCurrencyInputValue] = useState(0);
    const [typeField, setTypeField] = useState("from");

    useEffect(() => {
        exchangeRates = JSON.parse(localStorage.getItem('currencyData'));
        exchangeRates = exchangeRates ? exchangeRates.rates : {};
        if (exchangeRates[fromCurrencyValue] && exchangeRates[toCurrencyValue]) {
            updateDisplayContent();
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
        exchangeRates = JSON.parse(localStorage.getItem('currencyData'));
        exchangeRates = exchangeRates ? exchangeRates.rates : {};
        if (!amount) {
            return 0;
        }
        if (from === to) {
            return amount % 1 === 0 ? amount : amount.toFixed(6);
        }

        const fromRate = exchangeRates[from];
        const toRate = exchangeRates[to];

        if (fromRate === undefined || toRate === undefined) {
            return 0;
        }

        const convertedAmount = amount * (toRate / fromRate);

        for (let cur in exchangeRates) {
            exchangeRates[cur] = exchangeRates[cur] / fromRate;
        }

        return convertedAmount % 1 === 0 ? convertedAmount : convertedAmount.toFixed(6);
    }
    const processData = (data) => {
        exchangeRates = data.rates;
        setSupportedCurrencies(Object.keys(exchangeRates));
        updateDisplayContent();
    }
    useEffect(() => {
        async function fetchData() {
            try {
                let fetchedDate = new Date(Number(localStorage.getItem('currencyFetchTime'))).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                })
                let today = new Date().toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                });
                let currencyData = localStorage.getItem('currencyData');
                if (fetchedDate !== today) {
                    currencyData = null;
                }
                if (currencyData) {
                    processData(JSON.parse(currencyData));
                    setLoading(false);
                } else {
                    fetch('https://jeapis.netlify.app/.netlify/functions/currency?from=USD&to=INR')
                        .then(response => response.json())
                        .then(data => {
                            localStorage.clear();
                            localStorage.setItem('currencyData', JSON.stringify(data));
                            localStorage.setItem('currencyFetchTime', new Date().getTime());
                            processData(data);
                            setLoading(false);
                        })
                        .catch(error => {
                            currencyData = localStorage.getItem('currencyData');
                            if (currencyData) {
                                processData(JSON.parse(currencyData));
                            } else {
                                document.getElementById('loading').textContent = 'Failed to load data. Please try again later.';
                            }
                            setLoading(false);
                        });
                }
            } catch (error) {
                setLoading(false);
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
                color: 'white',
                '&:hover': {
                    backgroundColor: '#4caf50',
                },
                '&.Mui-selected': {
                    backgroundColor: '#4caf50 !important',
                    color: 'white',
                },
                '&.Mui-selected:hover': {
                    backgroundColor: '#4caf50 !important',
                },
            },
            '& .MuiMenuItem-root:hover': {
                backgroundColor: '#4caf50',
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
            borderRadius: "2px",
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: "#4caf50",
                boxShadow: "0 0 8px rgba(0, 255, 0, 0.5)",
                outline: "none",
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: "#4caf50",
                boxShadow: "0 0 8px rgba(0, 255, 0, 0.5)",
                outline: "none",
            },
            '& .MuiAutocomplete-endAdornment': {
                display: 'none',
            },
        },
    }));
    return (
        <>
            <div className="header">
                Currency Rates
            </div>
            <div className="container">
                {
                    loading ?
                        <div id="loading" className="loading">Loading...</div>
                        :
                        <>
                            <div className="exchange-rate">
                                {displaySelectedRates}
                            </div>
                            <div className="card" id="apiCard">
                                <div className="form-group">
                                    <Autocomplete
                                        disablePortal
                                        options={supportedCurrencies}
                                        value={fromCurrencyValue}
                                        onChange={(event, newValue) =>{
                                            setFromCurrencyValue(newValue);
                                            setToCurrencyInputValue(convertCurrency(fromCurrencyInputValue, newValue, toCurrencyValue));
                                        }}
                                        size='small'
                                        sx={{
                                            color: "white",
                                            border: "1px solid white",
                                            width: "80px",
                                            borderRadius: "2px",
                                        }}
                                        renderInput={(params) => (<CustomTextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                        />
                                        )}
                                        PopperComponent={(props) => <CustomPopper {...props} />}
                                    />
                                    <CustomTextField
                                        value={fromCurrencyInputValue}
                                        onChange={(e) => {
                                            setTypeField("from");
                                            if(isNaN(e.target.value)) {
                                                return false;
                                            }
                                            setFromCurrencyInputValue(e.target.value);
                                            exchangeRates = JSON.parse(localStorage.getItem('currencyData'));
                                            exchangeRates = exchangeRates ? exchangeRates.rates : {};
                                            setToCurrencyInputValue(convertCurrency(e.target.value));
                                        }}
                                        autoFocus={typeField === "from"}
                                        sx={{
                                            color: "white",
                                            border: "1px solid white",
                                            width: "200px !important",
                                            borderRadius: "2px",
                                        }}
                                        variant="outlined"
                                        size="small"
                                    />
                                </div>
                                <div className="form-group">

                                    <Autocomplete
                                        disablePortal
                                        options={supportedCurrencies}
                                        value={toCurrencyValue}
                                        onChange={(event, newValue) =>{
                                            setToCurrencyValue(newValue);
                                            setToCurrencyInputValue(convertCurrency(toCurrencyInputValue, fromCurrencyValue, newValue));
                                        }}
                                        size='small'
                                        sx={{
                                            color: "white",
                                            border: "1px solid white",
                                            width: "80px",
                                            borderRadius: "2px",
                                        }}
                                        renderInput={(params) => (<CustomTextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                        />
                                        )}
                                        PopperComponent={(props) => <CustomPopper {...props} />}
                                    />
                                    <CustomTextField
                                        value={toCurrencyInputValue}
                                        onChange={(e) => {
                                            setTypeField("to");
                                            if(isNaN(e.target.value)) {
                                                return false;
                                            }
                                            setToCurrencyInputValue(e.target.value);
                                            exchangeRates = JSON.parse(localStorage.getItem('currencyData'));
                                            exchangeRates = exchangeRates ? exchangeRates.rates : {};
                                            setFromCurrencyInputValue(convertCurrency(e.target.value, toCurrencyValue, fromCurrencyValue));
                                        }}
                                        autoFocus={typeField === "to"}
                                        sx={{
                                            color: "white",
                                            border: "1px solid white",
                                            width: "200px",
                                            borderRadius: "2px",
                                        }}
                                        variant="outlined"
                                        size="small"
                                    />
                                </div>
                            </div>
                            <div className='updateInfoDiv'>
                                {updatedTime}
                            </div>
                        </>
                }
            </div>
            <div className="footer">
                <a href="https://github.com/jebin2/apis" target="_blank" rel="noopener noreferrer">
                    <img src={githublogo} />
                </a>
            </div>
        </>
    );
}

export default App;