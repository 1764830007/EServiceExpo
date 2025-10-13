import BasicData from "@/components/devices/equipment-card-detail/basic-data";
import RealTimeData from "@/components/devices/equipment-card-detail/realtime-data";
import { useLocalization } from "@/hooks/locales/LanguageContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Appbar, SegmentedButtons } from "react-native-paper";
import { WebView } from "react-native-webview";

export default function EquipmentCardDetail() {
  const { t } = useLocalization();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState("realtimeData");

  return (
    <View>
      {/* header bar of the equipment detal  */}
      <Appbar.Header style={styles.bar} elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={t("equipment.detail")}
          titleStyle={{ fontSize: 16, fontWeight: 600 }}
        />
      </Appbar.Header>

      <View style={{ paddingHorizontal: 10 }}>
        {/* 实时数据，使用分析，基本信息，维保记录 */}
        <SegmentedButtons
          theme={{
            colors: {
              secondaryContainer: "#013b84",
              onSecondaryContainer: "white",
            },
          }}
          style={{ marginTop: 20 }}
          value={selectedTab}
          onValueChange={setSelectedTab}
          buttons={[
            {
              value: "realtimeData",
              label: "实时数据",
              uncheckedColor: "grey",
              labelStyle: styles.labelTab,
              style: styles.Tab,
            },
            {
              value: "useAnalysis",
              label: "使用分析",
              uncheckedColor: "grey",
              labelStyle: styles.labelTab,
              style: styles.Tab,
            },
            {
              value: "basicData",
              label: "基本信息",
              uncheckedColor: "grey",
              labelStyle: styles.labelTab,
              style: styles.Tab,
            },
            {
              value: "maintainRecord",
              label: "维保记录",
              uncheckedColor: "grey",
              labelStyle: styles.labelTab,
              style: styles.Tab,
            },
          ]}
        />
        {selectedTab === 'realtimeData' && (
          <>
           <Text>real time data </Text>
            <RealTimeData />
          </>
        ) }
        {selectedTab === 'useAnalysis' && (
            <WebView source={{ uri: 'https://www.bilibili.com/' }} />
        ) }
        {selectedTab === 'basicData' && (
          <BasicData />
        ) }
        {selectedTab === 'maintainRecord' && (
          <View>
            <Text>matin ss</Text>
          </View>
        ) }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#f6f6f6",
    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
  },
  Tab: {
    borderRadius: 1,
  },
  labelTab: {
    fontSize: 10,
    fontWeight: 300
  }
});
