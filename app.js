if ('serviceWorker' in navigator) {
    function updateSelectedValue(exchangeRateElement, fromSelect, toSelect, exchangeRates) {
        const fromCurrency = fromSelect.value;
        const toCurrency = toSelect.value;
        const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
        exchangeRateElement.textContent = `1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`;
    }

    function convertCurrency(amount, fromCurrency, toCurrency, rates) {
        if (fromCurrency === toCurrency) {
            return amount;
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

        return convertedAmount;
    }
    function updateAmounts(fromSelect, toSelect, rates) {
        const fromCurrency = fromSelect.value;
        const toCurrency = toSelect.value;

        if (fromCurrency === toCurrency) {
            toAmount.value = fromAmount.value;
        } else {
            const convertedAmount = convertCurrency(fromAmount.value, fromCurrency, toCurrency, rates);
            toAmount.value = convertedAmount.toFixed(6);
        }
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

        updateSelectedValue(exchangeRateElement, fromSelect, toSelect, rates);

        fromSelect.addEventListener('change', () => {
            convertCurrency(1, fromSelect.value, toSelect.value, rates);
            updateSelectedValue(exchangeRateElement, fromSelect, toSelect, rates);
            updateAmounts(fromSelect, toSelect, rates);
        });

        toSelect.addEventListener('change', () => {
            updateSelectedValue(exchangeRateElement, fromSelect, toSelect, rates);
            updateAmounts(fromSelect, toSelect, rates);
        });

        fromAmount.addEventListener('input', () => {
            updateAmounts(fromSelect, toSelect, rates);
        });

        toAmount.addEventListener('input', () => {
            updateAmounts(fromSelect, toSelect, rates);
        });
    }
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/currency/service-worker.js')
            .then(registration => {
                const currencyData = localStorage.getItem('currencyData' + new Date().toLocaleDateString());
                if(currencyData) {
                    processData(JSON.parse(currencyData));
                } else {
                    localStorage.clear();
                    fetch('https://jeapis.netlify.app/.netlify/functions/currency?from=USD&to=INR')
                    .then(response => response.json())
                    .then(data => {
                        localStorage.setItem('currencyData' + new Date().toLocaleDateString(), JSON.stringify(data));
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