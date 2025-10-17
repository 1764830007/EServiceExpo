
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import WebView from "react-native-webview";

const getToken = async() => {
    const token = await AsyncStorage.getItem('authToken');
    return token;
};

type AnalysisProps = {
    timeSpan: string;
    setTimeSpan: (val: string) => void;
};  
const filters = {
        MapType: 1,
        Province: '',
        City: '',
        Contains: '',
        SerialNumbers: '',
        OrderType: null,
        Model: null,
        EqptType: null,
        Dealer: null,
        EndCustomes: null
    };

export default function UseAnalysis({timeSpan, setTimeSpan}: AnalysisProps) {

    const url = `https://dcpqa.semdcp.com/ecservice/#reportMap?query=${encodeURIComponent(JSON.stringify(filters))}&userType=EndCustomer&token=${getToken}`;

    return (
        <>
            <RNPickerSelect value={timeSpan} onValueChange={val => setTimeSpan(val)} 
                items={[
                    {label: 'Total Hour And Fuel Statistic', value: 'totalHour'},
                    {label: 'Average Hour And Fuel Statistic', value: 'averageHour'},
                    {label: 'Working Hours And Distribution Statistic', value: 'workingHour'},
                    {label: 'Fault Statistic', value: 'faultStatistic'}
                ]} />
            <WebView style={{flex: 1}} source={ {uri: url} } />
        </>
    );
}