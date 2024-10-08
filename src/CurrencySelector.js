import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Button,
    IconButton,
} from '@mui/material';
import { Search } from '@mui/icons-material';

// const color = "#FF6B6B";
const color = "white";

const RetroDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        backgroundColor: '#1A535C',
        border: `4px solid ${color}`,
        borderRadius: '10px',
        color: `${color}`,
        height: '100%',
    },
});

const RetroDialogContent = styled(DialogContent)({
    padding: '20px',
});

const RetroList = styled(List)({
    maxHeight: '80%',
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

const RetroIconButton = styled(IconButton)({
    color: '#4ECDC4',
});

const CurrencySelector = ({ type, fromCurrencyValue, toCurrencyValue, setFromCurrencyValue, setToCurrencyValue, fromCurrencyInputValue, setToCurrencyInputValue, convertCurrency, supportedCurrencies, RetroTextField }) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const filteredCurrencies = supportedCurrencies.filter(currency =>
        currency.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSearchValue('');
    };

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
                        onChange={(e) => setSearchValue(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <RetroIconButton>
                                    <Search />
                                </RetroIconButton>
                            ),
                        }}
                    />
                    <RetroList>
                        {filteredCurrencies.map((currency) => (
                            <RetroListItem
                                button
                                key={currency}
                                onClick={() => {
                                    if (type === 'from') {
                                        setFromCurrencyValue(currency);
                                        setToCurrencyInputValue(convertCurrency(fromCurrencyInputValue, currency, toCurrencyValue));
                                    } else {
                                        setToCurrencyValue(currency);
                                        setToCurrencyInputValue(convertCurrency(fromCurrencyInputValue, fromCurrencyValue, currency));
                                    }
                                    handleClose();
                                }}
                            >
                                <RetroListItemText primary={currency} />
                            </RetroListItem>
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