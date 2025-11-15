import React, { useState, useCallback, useMemo } from 'react';
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
import Search from '@mui/icons-material/Search';
import { FixedSizeList } from 'react-window';

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
const MemoizedRetroListItem = React.memo(RetroListItem);
const MemoizedRetroListItemText = React.memo(RetroListItemText);

const Row = ({ index, style, data }) => (
    <MemoizedRetroListItem style={style} button onClick={() => data.handleClick(data.items[index])}>
        <MemoizedRetroListItemText primary={data.items[index]} />
    </MemoizedRetroListItem>
);

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
                        onChange={(e) => setSearchValue(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <RetroIconButton>
                                    <Search />
                                </RetroIconButton>
                            ),
                        }}
                        slotProps={{
                            htmlInput: {
                                'aria-label': "Search for a currency"
                            }
                        }}
                    />
                    <RetroList>
                    <FixedSizeList
                        height={300} // Set a fixed height for performance
                        itemSize={40} // Each item takes 40px
                        itemCount={filteredCurrencies.length}
                        itemData={{ items: filteredCurrencies, handleClick }}
                    >
                        {Row}
                    </FixedSizeList>
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