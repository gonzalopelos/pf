/* eslint-disable */
import React from "react";
import { Chart } from "react-google-charts";
import * as moment from 'moment';
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import Grid from "@material-ui/core/Grid";
var _ = require('underscore');

const anualData = [
    ["Mes", "Santander UYU", "BROU USD", "BROU UYU"]
];


const yearsOptions = [
    { value: 2018, label: '2018' }, { value: 2019, lbel: '2019' }, { value: 2020, label: '2020' }, { value: 2021, label: '2021' }, { value: 2022, label: '2022' }, { value: 2023, label: '2023' }
];

const brou_uyu = "001298002-00001";
const boru_usd = "001251612-00001";
const santander_uyu = "007000081226";

class AccountBalances extends React.Component {

    constructor() {
        super();
        this.state = {
            accountBalancesData: anualData,
            selectedYear: yearsOptions[0],
        }
        this.selectedYearChange = this.selectedYearChange.bind(this);
    };

    componentDidMount() {
        this.getAccountBalances(2018);
    }


    selectedYearChange(year) {
        this.setState({ selectedYear: year });
        this.getAccountBalances(year.value);
    }
    getAccountBalances(year) {
        fetch("http://localhost:3001/accountsBalances?year=" + year)
            .then(results => results.json())
            .then(balances => {

                var groups = _.groupBy(balances, function (balance) {
                    return moment(balance.date).startOf('month').format();
                });
                var balancesData = [];
                balancesData.push(anualData[0]);
                Object.keys(groups).map((key) => {
                    if (groups[key].length == 3) {
                        var date = new Date(key);
                        var month = date.getMonth();
                        var santanderBalance = groups[key].find(((b) => b.accountNumber === santander_uyu));
                        var brou_uyu_balance = groups[key].find(((b) => b.accountNumber === brou_uyu));
                        var boru_usd_balance = groups[key].find(((b) => b.accountNumber === boru_usd));
                        balancesData.push([month, santanderBalance.balance, boru_usd_balance.balance, brou_uyu_balance.balance]);
                    }
                    else {

                    }
                    console.log(balancesData);
                });

                this.setState({
                    accountBalancesData: balancesData,
                    options: {
                        title: "Balances de cuentas anual",
                        curveType: "function",
                        legend: { position: "bottom" }
                    }
                });
                console.log(balancesData);
            });
    }

    render() {
        return (
            <div>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <p>Año de consulta:</p>
                    </Grid>
                    <Grid item xs={6}>
                        <Dropdown options={yearsOptions} onChange={this.selectedYearChange} value={this.state.selectedYear} placeholder="Select an option" />
                    </Grid>
                </Grid>
                {
                    this.state.accountBalancesData.length > 1 && (
                        <Chart
                            chartType="LineChart"
                            width="100%"
                            height="400px"
                            data={this.state.accountBalancesData}
                            options={this.state.options}
                        />
                    )
                }


            </div>
        )
    }
}


export default (AccountBalances);