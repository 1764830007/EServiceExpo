import { EquipmentMenuProps } from "@/constants/types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-paper";

export default function EquipmentItem({ equipmentMenu }: EquipmentMenuProps) {
  return (
    <TouchableOpacity
      style={styles.profileList}
      onPress={() => console.log(`Clicked on ${equipmentMenu.title}`)}
    >
      <View style={styles.leftContent}>
        <Icon source={equipmentMenu.icon} size={24} />
        <Text style={styles.profileListContent}>{equipmentMenu.title}</Text>
      </View>
      <Icon source="chevron-right" size={24} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#eee",
  },
  bar: {
    elevation: 4,

    // iOS 阴影
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // 确保阴影可见（iOS需要设置背景色）
    zIndex: 1,
  },
  barIcon: {
    backgroundColor: "white",
  },
  profileList: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row", // 横向排列
    alignItems: "center", // 垂直居中
    justifyContent: "space-between", // 左右两端对齐
    paddingVertical: 12, // 垂直内边距
    paddingHorizontal: 16, // 水平内边距
    height: 60,
    marginTop: 15,
    width: "90%",
    margin: "auto",
    borderRadius: 8,
  },

  leftContent: {
    flexDirection: "row", // 图标和文字横向排列
    alignItems: "center", // 垂直居中
  },
  profileListContent: {
    marginLeft: 12, // 文字与左边图标的间距
    fontSize: 16,
  },
});
