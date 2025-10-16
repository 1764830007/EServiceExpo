import { EquipDetail } from "@/models/equipments/EquipmentDetail";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { Icon, Text } from "react-native-paper";

type DetailProps = {
  equipDetail: EquipDetail;
};

export default function BasicData({ equipDetail }: DetailProps) {
  const router = useRouter();

  console.log("equip detail", equipDetail);

  return (
    <GestureHandlerRootView>
      <ScrollView>
        {/* 设备信息 */}
          <View>
            <View
              style={{
                backgroundColor: "#fff",
                marginTop: 20,
                borderRadius: 2,
              }}
            >
              <Text style={{ margin: 10 }} variant="titleMedium">
                设备信息
              </Text>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">经销商</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.dealerName}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">设备序列号</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.serialNumber}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">产品型号</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.model}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">名称备注</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.nameNote}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">设备类型</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.equipmentType}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">订单类型</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.orderType}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">购买日期</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.purchasingDate
                    ? new Date(
                        equipDetail?.machineDto?.purchasingDate
                      )?.toLocaleString()
                    : ""}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">操作人信息</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.operator?.join(",")}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">国家或地区</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.nationCode}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">邮编</Text>
                <Text variant="bodyMedium">
                  {equipDetail?.machineDto?.postalCode}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text
                  style={{ flexShrink: 0, flexGrow: 0, flexBasis: "auto" }}
                  variant="bodyMedium"
                >
                  地址
                </Text>
                <Text
                  style={styles.addressText}
                  variant="bodyMedium"
                >
                  {equipDetail?.machineDto?.address}
                </Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">使用行业</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.industry}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">是否二手车</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.secondHand ? '是' : '否'}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">原经销商名称</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.previousDealer}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">最后修改人</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.lastEditedBy}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">最后修改时间</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.lastEditedTime ? 
                                              new Date(equipDetail.machineDto.lastEditedTime)?.toLocaleDateString() : ''}</Text>
              </View>
              <View style={styles.equipInfo}>
                <Text variant="bodyMedium">三包日期</Text>
                <Text variant="bodyMedium">{equipDetail?.machineDto?.purchasingDate ? new Date(equipDetail?.machineDto?.purchasingDate)?.toDateString() : ''}</Text>
              </View>
            </View>
            {/* 配置信息 */}
            <TouchableOpacity
              onPress={() => router.push("/devices/equipment-config")}
              style={styles.configTouch}
            >
              <Text style={{ fontWeight: 700 }}>配置信息</Text>
              <Icon source="chevron-right" size={24} />
            </TouchableOpacity>
          </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  equipInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 5,
    flexWrap: "nowrap",
  },
  addressText: {
    alignSelf: "center",
    textAlign: "right",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "auto"
  },
  configTouch: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 2,
    marginTop: 20,
    padding: 20,
  }
});
