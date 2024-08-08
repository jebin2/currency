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
    function processData() {
        
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
        });

        toSelect.addEventListener('change', () => {
            updateSelectedValue(exchangeRateElement, fromSelect, toSelect, rates);
        });

        fromAmount.addEventListener('input', (event) => {
            toAmount.value = event.target.value * rates[toSelect.value];
        });

        toAmount.addEventListener('input', (event) => {
            fromAmount.value =  event.target.value / rates[toSelect.value];
        });
    }
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/currency/service-worker.js')
            .then(registration => {
                const loadingElement = document.getElementById('loading');

                const currencyData = localStorage.getItem('currencyData');
                if(currencyData) {
                    processData(currencyData);
                } else {
                    fetch('https://jeapis.netlify.app/.netlify/functions/currency?from=USD&to=INR')
                    .then(response => response.json())
                    .then(data => {
                        localStorage.setItem('currencyData', JSON.stringify(data));
                        processData(data);
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        loadingElement.textContent = 'Failed to load data. Please try again later.';
                    });
                }
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}