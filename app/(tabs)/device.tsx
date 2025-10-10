import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Appbar, Icon } from "react-native-paper";

export default function DeviceScreen() {
  const router = useRouter();

  return (
    <ScrollView>
      <View style={styles.container}>
        <Appbar.Header style={styles.bar} elevated>
          <Appbar.Content
            title="设备管理"
            titleStyle={{ fontSize: 16, fontWeight: 600 }}
          />
        </Appbar.Header>
        {/* 设备管理汇总 */}
        <TouchableOpacity
          style={styles.deviceCard}
          onPress={() => router.push("/devices/equipment-manage", {})}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon source="account-card" size={24}></Icon>
            <Text style={{ marginLeft: 20 }}>设备管理汇总</Text>
          </View>
          <Icon source="chevron-right" size={24} />
        </TouchableOpacity>
        {/* 设备统计报告 */}
        <TouchableOpacity
          style={styles.deviceCard}
          onPress={() => router.push("/devices/equipment-manage")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon source="account-card" size={24}></Icon>
            <Text style={{ marginLeft: 20 }}>设备统计报告</Text>
          </View>
          <Icon source="chevron-right" size={24} />
        </TouchableOpacity>
        {/* 设备故障报警 */}
        <TouchableOpacity
          style={styles.deviceCard}
          onPress={() => router.push("/devices/equipment-manage")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon source="account-card" size={24}></Icon>
            <Text style={{ marginLeft: 20 }}>设备故障报警</Text>
          </View>
          <Icon source="chevron-right" size={24} />
        </TouchableOpacity>
        {/* 电子围栏 */}
        <TouchableOpacity
          style={styles.deviceCard}
          onPress={() => router.push("/devices/equipment-manage")}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon source="account-card" size={24}></Icon>
            <Text style={{ marginLeft: 20 }}>电子围栏</Text>
          </View>
          <Icon source="chevron-right" size={24} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f6f6f6",
  },
  bar: {
    backgroundColor: "#f6f6f6",
    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
  },
  deviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    margin: "auto",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 20, // 垂直内边距
    paddingHorizontal: 16, // 水平内边距
    marginTop: 20,
  },
});
