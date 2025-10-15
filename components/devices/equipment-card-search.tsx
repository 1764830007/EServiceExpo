import { LoadDealerOptions } from "@/app/services/equipments/EquipmentService";
import equipmentStore from "@/hooks/equipments/EquipmentStore";
import { useLocalization } from "@/hooks/locales/LanguageContext";
import { EquipmentSearchDto } from "@/models/equipments/EquipmentList";
import { deriveDict } from "helux";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { Button, Checkbox, Chip, Icon, Searchbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyDrawer, { Helpers } from "./EmptyDrawer";

interface FilterProps {
  filter: EquipmentSearchDto;
}
type ClickedEl = "dealer" | "model" | "location";

const confirmDealer = () => {};

export default function EquipmentCardSearch({ filter }: FilterProps) {
  let clickedEl: ClickedEl = "dealer";
  const [dealerSearchText, setDealerSearchText] = useState("");
  const equipStore = equipmentStore.useStore();
  //const { selectedDealers } = equipStore;
  const selectedDealers = deriveDict(() => ({
    result: equipStore.dealerList
      .filter((p) => p.checked === true)
      .map((p) => p.dealerName)
      .join(","),
  }));
  const { locale, t } = useLocalization();

  const loadDealers = async () => {
    const dealers = await LoadDealerOptions();
    dealers.forEach((p) => {
      p.dealerName = locale === "zh" ? p.dealerName_CN : p.dealerName_EN;
      p.checked = false;
    });
    equipStore.setDealerList(dealers);
  };

  // watch(() => {

  // }, () => [clickedEl]);

  // watch(() => {
  //   console.log('watch', equipStore.dealerList);
  // }, {deps: () => [equipStore.dealerList]});

  useEffect(() => {
    if (clickedEl === "dealer") {
      console.log("loading dealers");
      loadDealers();
    } else if (clickedEl === "model") {
    } else if (clickedEl === "location") {
    }
  }, [clickedEl]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* 点击经销商，打开侧边栏，选择经销商，点击确认 */}
      <EmptyDrawer
        drawerContent={(helpers: Helpers) => (
          <>
            {/* dealer经销商进一步选择 */}
            {clickedEl === "dealer" && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Searchbar
                    style={{ flexDirection: "row", width: "80%" }}
                    mode="view"
                    placeholder="search"
                    value={dealerSearchText}
                    onChangeText={setDealerSearchText}
                  />
                  <View style={{ flexBasis: "auto", flexShrink: 0 }}>
                    <GestureDetector gesture={helpers.closeDrawer}>
                      <Button onPress={() => {}}>confirm</Button>
                    </GestureDetector>
                  </View>
                </View>
                <View>
                  <FlatList
                    data={equipStore.dealerList}
                    renderItem={({ item }) => (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Checkbox
                          status={item.checked ? "checked" : "unchecked"}
                          onPress={() =>
                            equipStore.setDealerToggle(item.dealerCode)
                          }
                        />
                        <Text>{item.dealerName}</Text>
                      </View>
                    )}
                    keyExtractor={(item) => item.dealerCode}
                  />
                </View>
              </>
            )}
            {clickedEl === "model" && <View></View>}
          </>
        )}
      >
        {/* filter 正文 */}
        {(helpers: Helpers) => (
          <>
            {/* 经销商 */}
            <View style={{}}>
              <Text style={{ paddingHorizontal: 10 }}>经销商</Text>
              <GestureDetector gesture={helpers.openDrawer}>
                <TouchableOpacity
                  style={styles.dealerOrModel}
                  onPress={() => (clickedEl = "dealer")}
                >
                  <Text>{selectedDealers.result}</Text>
                  <View>
                    <Icon source="chevron-right" size={20} />
                  </View>
                </TouchableOpacity>
              </GestureDetector>
            </View>
            {/* 设备型号 */}
            <View style={{marginTop: 20}}>
              <Text style={{ paddingHorizontal: 10 }}>设备型号</Text>
              <GestureDetector gesture={helpers.openDrawer}>
                <TouchableOpacity
                  style={styles.dealerOrModel}
                  onPress={() => (clickedEl = "model")}
                >
                  <Text>{equipStore.machineModel}</Text>
                  <Icon source="chevron-right" size={20} />
                </TouchableOpacity>
              </GestureDetector>
            </View>
            {/* 设备类别 */}
            <View style={{marginTop: 20}}>
              <Text style={{ paddingHorizontal: 10 }}>设备类别</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                <Chip
                  style={{ borderRadius: 20 }}
                  textStyle={{ paddingHorizontal: 10 }}
                  mode="outlined"
                  showSelectedOverlay
                  selectedColor="green"
                  selected={false}
                >
                  全部
                </Chip>
                <Chip
                  style={{ borderRadius: 20 }}
                  textStyle={{ paddingHorizontal: 10 }}
                  mode="outlined"
                  selected
                  showSelectedCheck={false}
                >
                  装载机
                </Chip>
                <Chip
                  style={{ borderRadius: 20 }}
                  textStyle={{ paddingHorizontal: 10 }}
                  mode="outlined"
                  selected
                  showSelectedCheck={false}
                >
                  推土机
                </Chip>
                <Chip
                  style={{ borderRadius: 20 }}
                  textStyle={{ paddingHorizontal: 10 }}
                  mode="outlined"
                  selected
                  showSelectedCheck={false}
                >
                  平地机
                </Chip>
                <Chip
                  style={{ borderRadius: 20 }}
                  textStyle={{ paddingHorizontal: 10 }}
                  mode="outlined"
                  selected
                  showSelectedCheck={false}
                >
                  压路机
                </Chip>
              </View>
              {/* 总工时 */}
              <View></View>

              {/* 设备状态 */}
              <View style={{marginTop: 20 }}>
                <Text style={{ paddingHorizontal: 10 }}>设备状态</Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  <Chip
                    style={{ borderRadius: 20 }}
                    textStyle={{ paddingHorizontal: 10 }}
                    mode="outlined"
                    showSelectedOverlay
                    selectedColor="green"
                    selected={false}
                  >
                    全部
                  </Chip>

                  <Chip
                    style={{ borderRadius: 20 }}
                    textStyle={{ paddingHorizontal: 10 }}
                    mode="outlined"
                    showSelectedOverlay
                    selectedColor="green"
                    selected={false}
                  >
                    在线
                  </Chip>
                  <Chip
                    style={{ borderRadius: 20 }}
                    textStyle={{ paddingHorizontal: 10 }}
                    mode="outlined"
                    showSelectedOverlay
                    selectedColor="green"
                    selected={false}
                  >
                    离线
                  </Chip>
                </View>
              </View>

              {/* 位置 */}
            </View>
          </>
        )}
      </EmptyDrawer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dealerOrModel: {
    paddingLeft: 20,
    paddingRight: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
