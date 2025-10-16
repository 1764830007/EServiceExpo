import equipmentDetailStore from "@/hooks/equipments/EquipmentDetailStore";
import { useLocalization } from "@/hooks/locales/LanguageContext";
import { ConfigDto } from "@/models/equipments/EquipmentDetail";
import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Appbar, Button, Card } from "react-native-paper";

export default function EquipmentConfig() {
  const { t } = useLocalization();
  const router = useRouter();
  const equipDetailStore = equipmentDetailStore.useStore();
  const { equipDetail } = equipDetailStore;

  type ConfigProps = {
    config: ConfigDto
  }

  const Config = ({config} : ConfigProps) => {
    return (
      <Card style={{marginBottom: 10, 
        backgroundColor: 'white', borderRadius: 10 }} theme={{ colors: { secondaryContainer: "white" } }}>
        <Card.Title title="配置信息" />
        <Card.Content>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text>配置</Text>
            <Text>{config?.configuration}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text>配置描述</Text>
            <Text>{config?.configValueDesc}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text>实选配置</Text>
            <Text>{config?.configurationValue}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text>配置选项描述</Text>
            <Text>{config?.configValueDesc}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* header bar of the equipment detal  */}
      <Appbar.Header style={styles.bar} elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={t("equipment.configDetail")}
          titleStyle={{ fontSize: 16, fontWeight: 600 }}
        />
      </Appbar.Header>
      <View style={{flex: 1, paddingHorizontal: 10, marginTop: 10}}>
         <FlatList data={equipDetail?.configDto}
          renderItem={({item}) =>  <Config config={item} /> }
          keyExtractor={item => item.configuration}  />
      </View>
     

      {/* 申请解绑，修改设备详情 */}
      <View style={styles.bottomBtns}>
        <Button mode="contained">申请解绑</Button>
        <Button mode="contained">修改设备详情</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#f6f6f6",
    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
  },
  bottomBtns: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
});
