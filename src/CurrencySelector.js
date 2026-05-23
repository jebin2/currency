import React, { useState, useCallback, useMemo } from 'react';
import styled from '@mui/material/styles/styled';
import {
    Dialog,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Button,
} from '@mui/material';

// const color = "#FF6B6B";
const color = "white";

const RetroDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        backgroundColor: '#1A535C',
        border: `4px solid ${color}`,
        borderRadius: '10px',
        color: `${color}`,
        minHeight: '50vh',  // Avoid full height causing layout shifts
        maxHeight: '80vh',  // Prevent excessive recalculations
    },
});

const RetroDialogContent = styled(DialogContent)({
    padding: '20px',
});

const RetroList = styled(List)({
    maxHeight: '300px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
        width: '10px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#1A535C',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#4ECDC4',
        borderRadius: '5px',
    },
});

const RetroListItem = styled(ListItem)({
    '&:hover': {
        backgroundColor: '#4ECDC4',
    },
});

const RetroListItemText = styled(ListItemText)({
    '& .MuiListItemText-primary': {
        fontSize: '1rem',
        fontWeight: 'bold',
    },
});

const RetroButton = styled(Button)({
    backgroundColor: `${color}`,
    color: 'black',
    fontWeight: 'bold',
});

const MemoizedRetroListItem = React.memo(RetroListItem);
const MemoizedRetroListItemText = React.memo(RetroListItemText);

const CurrencySelector = ({ type, fromCurrencyValue, toCurrencyValue, setFromCurrencyValue, setToCurrencyValue, fromCurrencyInputValue, setToCurrencyInputValue, convertCurrency, supportedCurrencies, RetroTextField }) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const filteredCurrencies = useMemo(() => 
        supportedCurrencies.filter(currency =>
            currency.toLowerCase().includes(searchValue.toLowerCase())
        ), 
      [supportedCurrencies, searchValue] // Only re-run when these change
    );

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSearchValue('');
    };
    const handleClick = useCallback((currency) => {
        if (type === 'from') {
            setFromCurrencyValue(currency.split(" - ")[0]);
            setToCurrencyInputValue(convertCurrency(fromCurrencyInputValue, currency, toCurrencyValue));
        } else {
            setToCurrencyValue(currency.split(" - ")[0]);
            setToCurrencyInputValue(convertCurrency(fromCurrencyInputValue, fromCurrencyValue, currency));
        }
        handleClose();
    }, [type, fromCurrencyInputValue, fromCurrencyValue, toCurrencyValue, convertCurrency]);

    return (
        <div>
            <RetroTextField
                value={type === 'from' ? fromCurrencyValue : toCurrencyValue}
                onClick={handleOpen}
                readOnly
                sx={{
                    color: `${color}`,
                    width: "100%",                
                    borderRadius: "2px",
                    fontWeight: "600 !important",
                    letterSpacing: "0.1rem !important",
                }}
                variant="outlined"
                size="small"
                slotProps={{
                    htmlInput: {
                        'aria-label': type === 'from' ? 'Select from currency' : 'Select to currency'
                    }
                }}
            />
            <RetroDialog open={open} onClose={handleClose}>
                {/* <RetroDialogTitle>Select Currency</RetroDialogTitle> */}
                <RetroDialogContent>
                    <RetroTextField
                        autoFocus
                        margin="dense"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={searchValue}
                        placeholder="Search"
                        onChange={(e) => setSearchValue(e.target.value)}
                        slotProps={{
                            htmlInput: {
                                'aria-label': "Search for a currency"
                            }
                        }}
                    />
                    <RetroList>
                        {filteredCurrencies.map((currency) => (
                            <MemoizedRetroListItem key={currency} button onClick={() => handleClick(currency)}>
                                <MemoizedRetroListItemText primary={currency} />
                            </MemoizedRetroListItem>
                        ))}
                    </RetroList>
                </RetroDialogContent>
                <DialogActions>
                    <RetroButton onClick={handleClose}>
                        Cancel
                    </RetroButton>
                </DialogActions>
            </RetroDialog>
        </div>
    );
};

export default CurrencySelector;
