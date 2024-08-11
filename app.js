if ('serviceWorker' in navigator) {
    function updateDisplayContent(exchangeRateElement, fromSelect, toSelect, exchangeRates) {
        const fromCurrency = fromSelect.value;
        const toCurrency = toSelect.value;
        exchangeRateElement.textContent = `1 ${fromCurrency} = ${convertCurrency(1, fromCurrency, toCurrency, exchangeRates)} ${toCurrency}`;
        
        document.getElementById("updateInfoDiv").textContent  = "Updated on " + new Date(Number(localStorage.getItem('currencyFetchTime'))).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    function convertCurrency(amount, fromCurrency, toCurrency, rates) {
        if(!amount) {
            return 0;
        }
        if (fromCurrency === toCurrency) {
            return parseFloat(amount % 1 === 0 ? amount : amount.toFixed(6));
        }

        const fromRate = rates[fromCurrency];
        const toRate = rates[toCurrency];

        if (fromRate === undefined || toRate === undefined) {
            throw new Error(`Unsupported currency code: ${fromCurrency} or ${toCurrency}`);
        }

        const convertedAmount = amount * (toRate / fromRate);

        for (let cur in rates) {
            rates[cur] = rates[cur] / fromRate;
        }

        return parseFloat(convertedAmount % 1 === 0 ? convertedAmount : convertedAmount.toFixed(6));
    }
    function updateAmounts(value, field, type, fromSelect, toSelect, rates) {
        const fromCurrency = fromSelect.value;
        const toCurrency = toSelect.value;

        const convertedAmount = convertCurrency(parseFloat(value), type === "from" ? fromCurrency : toCurrency, type === "from" ? toCurrency : fromCurrency, rates);
        field.value = convertedAmount.toFixed(6);
    }
    function processData(data) {
        
        const loadingElement = document.getElementById('loading');
        const exchangeRateElement = document.getElementById('exchangeRate');
        const fromSelect = document.getElementById('fromSelect');
        const toSelect = document.getElementById('toSelect');
        const fromAmount = document.getElementById('fromAmount');
        const toAmount = document.getElementById('toAmount');

        const rates = data.rates;
        loadingElement.style.display = 'none';

        let currencies = Object.keys(rates);
        let currencyOptions = currencies.map(cur => `<option value="${cur}">${cur}</option>`).join('');
        fromSelect.innerHTML = currencyOptions;
        fromSelect.value = "USD";
        toSelect.innerHTML = currencyOptions;
        toSelect.value = "INR";

        updateDisplayContent(exchangeRateElement, fromSelect, toSelect, rates);

        fromSelect.addEventListener('change', () => {
            convertCurrency(1, fromSelect.value, toSelect.value, rates);
            updateDisplayContent(exchangeRateElement, fromSelect, toSelect, rates);
            updateAmounts(fromAmount.value, toAmount, "from", fromSelect, toSelect, rates);
        });

        toSelect.addEventListener('change', () => {
            updateDisplayContent(exchangeRateElement, fromSelect, toSelect, rates);
            updateAmounts(toAmount.value, fromAmount, "to", fromSelect, toSelect, rates);
        });

        fromAmount.addEventListener('input', (e) => {
            updateAmounts(e.target.value, toAmount, "from", fromSelect, toSelect, rates);
        });

        toAmount.addEventListener('input', (e) => {
            updateAmounts(e.target.value, fromAmount, "to", fromSelect, toSelect, rates);
        });
    }
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/currency/service-worker.js')
            .then(registration => {
                const currencyData = localStorage.getItem('currencyData' + new Date().toLocaleDateString());
                if(!currencyData && !navigator.onLine) {
                    currencyData = localStorage.getItem(Object.keys(localStorage)[0]);
                }
                if(currencyData) {
                    processData(JSON.parse(currencyData));
                } else {
                    localStorage.clear();
                    fetch('https://jeapis.netlify.app/.netlify/functions/currency?from=USD&to=INR')
                    .then(response => response.json())
                    .then(data => {
                        localStorage.setItem('currencyData' + new Date().toLocaleDateString(), JSON.stringify(data));
                        localStorage.setItem('currencyFetchTime', new Date().getTime());
                        processData(data);
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        document.getElementById('loading').textContent = 'Failed to load data. Please try again later.';
                    });
                }
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}