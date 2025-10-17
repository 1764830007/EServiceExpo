import { View } from "react-native";
import WaveCircle from "./wave-circle";

export default function RealTimeData() {
    return (
        <View style={{marginTop: 20}}>
            <WaveCircle size={150} progress={0.5} backgroundColor="white" />
        </View>
    );
}
