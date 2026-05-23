import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';

const CurrencySelector = ({
    type,
    fromCurrencyValue,
    toCurrencyValue,
    setFromCurrencyValue,
    setToCurrencyValue,
    fromCurrencyInputValue,
    setToCurrencyInputValue,
    convertCurrency,
    supportedCurrencies,
}) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const searchRef = useRef(null);

    const filteredCurrencies = useMemo(() =>
        supportedCurrencies.filter(currency =>
            currency.toLowerCase().includes(searchValue.toLowerCase())
        ),
      [supportedCurrencies, searchValue]
    );

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = useCallback(() => {
        setOpen(false);
        setSearchValue('');
    }, []);

    const handleClick = useCallback((currency) => {
        if (type === 'from') {
            setFromCurrencyValue(currency.split(" - ")[0]);
            setToCurrencyInputValue(convertCurrency(fromCurrencyInputValue, currency, toCurrencyValue));
        } else {
            setToCurrencyValue(currency.split(" - ")[0]);
            setToCurrencyInputValue(convertCurrency(fromCurrencyInputValue, fromCurrencyValue, currency));
        }
        handleClose();
    }, [type, fromCurrencyInputValue, fromCurrencyValue, toCurrencyValue, convertCurrency, setFromCurrencyValue, setToCurrencyInputValue, setToCurrencyValue, handleClose]);

    useEffect(() => {
        if (!open) return undefined;

        const timeoutId = window.setTimeout(() => {
            searchRef.current?.focus();
        }, 0);

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.clearTimeout(timeoutId);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, handleClose]);

    return (
        <div>
            <button
                type="button"
                className="retro-input currency-button"
                onClick={handleOpen}
                aria-label={type === 'from' ? 'Select from currency' : 'Select to currency'}
            >
                {type === 'from' ? fromCurrencyValue : toCurrencyValue}
            </button>

            {open && (
                <div className="dialog-backdrop" role="presentation" onMouseDown={handleClose}>
                    <div
                        className="currency-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Select currency"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="dialog-content">
                            <input
                                ref={searchRef}
                                className="retro-input search-input"
                                type="text"
                                value={searchValue}
                                placeholder="Search"
                                onChange={(event) => setSearchValue(event.target.value)}
                                aria-label="Search for a currency"
                            />
                            <div className="currency-list" role="listbox">
                                {filteredCurrencies.map((currency) => (
                                    <button
                                        type="button"
                                        className="currency-option"
                                        key={currency}
                                        onClick={() => handleClick(currency)}
                                        role="option"
                                    >
                                        {currency}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="dialog-actions">
                            <button type="button" className="cancel-button" onClick={handleClose}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencySelector;
