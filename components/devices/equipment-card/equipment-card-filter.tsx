import {
  LoadCountryOptions,
  LoadDealerOptions,
  LoadModelOptions,
} from "@/app/services/equipments/EquipmentService";
import equipmentStore from "@/hooks/equipments/EquipmentStore";
import { useLocalization } from "@/hooks/locales/LanguageContext";
import { EquipmentSearchDto, Helpers } from "@/models/equipments/EquipmentList";
import { deriveDict } from "helux";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import {
  Button,
  Checkbox,
  Chip,
  Icon,
  Searchbar,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyDrawer from "../EmptyDrawer";

interface FilterProps {
  filter: EquipmentSearchDto;
  outhelpers: Helpers;
}
type ClickedEl = "dealer" | "model" | "location";

const equipTypeClips = [
  { key: "all", value: "all" },
  { key: "WL", value: "Wheel Loader" },
  { key: "TTT", value: "Track Type Tractor" },
  { key: "MG", value: "Motor Grader" },
  { key: "SC", value: "Scoll Compactor" },
];

const equipStatusClips = [
  { key: "all", value: "all" },
  { key: "online", value: "online" },
  { key: "olffline", value: "others" },
];

export default function EquipmentCardFilter({ filter, outhelpers }: FilterProps) {
  const [clickedEl, setClickedEl] = useState<ClickedEl>("dealer");
  const [dealerSearchText, setDealerSearchText] = useState("");
  const equipStore = equipmentStore.useStore();
  //const { selectedDealers } = equipStore;
  const selectedDealers = deriveDict(() => ({
    result: equipStore.dealerList
      .filter((p) => p.checked === true)
      .map((p) => p.dealerName)
      .join(","),
  }));
  const selectedModels = deriveDict(() => ({
    result: equipStore.machineModels
      .filter((p) => p.selected)
      .map((p) => p.text)
      .join(","),
  }));
  const selectedNations = deriveDict(() => ({
    result: equipStore.nationCodes
      .filter((p) => p.selected)
      .map((p) => p.text)
      .join(","),
  }));
  const { locale, t } = useLocalization();

  // 加载dealers
  const loadDealers = useCallback(async () => {
    const dealers = await LoadDealerOptions();
    dealers.forEach((p) => {
      p.dealerName = locale === "zh" ? p.dealerName_CN : p.dealerName_EN;
      p.checked = false;
    });
    equipStore.setDealerList(dealers);
  }, [clickedEl]);
  // 加载models
  const loadModels = useCallback(async () => {
    const res = await LoadModelOptions();
    equipStore.setMachineModels(res);
  }, [clickedEl]);
  // 加载位置
  const loadLocations = useCallback(async() => {
    const res = await LoadCountryOptions();
    equipStore.setNationCodes(res);
  }, [clickedEl]);

  // todo: useFocusEffect
  useEffect(() => {
    if (clickedEl === "dealer") {
      console.log("loading dealers");
      loadDealers();
    } else if (clickedEl === "model") {
      console.log("loading models");
      loadModels();
    } else if (clickedEl === "location") {
      loadLocations();
    }
    return () => {
      console.log("search unmounted");
    };
  }, [clickedEl, loadDealers, loadModels]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* 点击经销商，打开侧边栏，选择经销商，点击确认 */}
      <EmptyDrawer
        drawerContent={(helpers: Helpers) => (
          <View>
            {/* dealer经销商进一步选择 */}
            {clickedEl === "dealer" && (
              <View>
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
              </View>
            )}
            {clickedEl === "model" && (
              <View>
                <FlatList
                  data={equipStore.machineModels}
                  renderItem={({ item }) => (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Checkbox
                        status={item.selected ? "checked" : "unchecked"}
                        onPress={() => equipStore.setModelToggle(item.value)}
                      />
                      <Text>{item.text}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.value}
                />
              </View>
            )}
            {clickedEl === "location" && (
              <View>
                <FlatList
                  data={equipStore.nationCodes}
                  renderItem={({ item }) => (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Checkbox
                        status={item.selected ? "checked" : "unchecked"}
                        onPress={() => equipStore.setNationToggle(item.value)}
                      />
                      <Text>{item.text}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.value}
                />
              </View>
            )}
          </View>
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
                  onPress={() => setClickedEl("dealer")}
                >
                  <Text>{selectedDealers.result}</Text>
                  <View>
                    <Icon source="chevron-right" size={20} />
                  </View>
                </TouchableOpacity>
              </GestureDetector>
            </View>
            {/* 设备型号 */}
            <View style={{ marginTop: 20 }}>
              <Text style={{ paddingHorizontal: 10 }}>设备型号</Text>
              <GestureDetector gesture={helpers.openDrawer}>
                <TouchableOpacity
                  style={styles.dealerOrModel}
                  onPress={() => setClickedEl("model")}
                >
                  <Text>{selectedModels.result}</Text>
                  <Icon source="chevron-right" size={20} />
                </TouchableOpacity>
              </GestureDetector>
            </View>
            {/* 设备类型 */}
            <View style={{ marginTop: 20 }}>
              <Text style={{ paddingHorizontal: 10 }}>设备类型</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {equipTypeClips.map((p) => (
                  <Chip
                    style={{ borderRadius: 20 }}
                    textStyle={{ paddingHorizontal: 10 }}
                    mode="outlined"
                    showSelectedOverlay
                    selectedColor="#013b84"
                    selected={false}
                    key={p.key}
                    onPress={(e) => console.log(p.key)}
                  >
                    {p.value}
                  </Chip>
                ))}
              </View>
            </View>
            {/* 总工时 */}
            <View style={{ marginTop: 20 }}>
              <Text>总工时</Text>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                <TextInput
                  mode="outlined"
                  style={{ width: 100 }}
                  outlineStyle={{ borderRadius: 20 }}
                  placeholder="0"
                  dense
                  right={<TextInput.Affix text="h" />}
                />
                <Text>to</Text>
                <TextInput
                  mode="outlined"
                  style={{ width: 100 }}
                  outlineStyle={{ borderRadius: 20 }}
                  placeholder="0"
                  dense
                  right={<TextInput.Affix text="h" />}
                />
              </View>
            </View>
            {/* 设备状态 */}
            <View style={{ marginTop: 20 }}>
              <Text style={{ paddingHorizontal: 10 }}>设备状态</Text>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {equipStatusClips.map((p) => (
                  <Chip
                    style={{ borderRadius: 20 }}
                    textStyle={{ paddingHorizontal: 10 }}
                    mode="outlined"
                    showSelectedOverlay
                    selectedColor="#013b84"
                    selected={false}
                    key={p.key}
                  >
                    {p.value}
                  </Chip>
                ))}
              </View>
            </View>
            {/* 位置 */}
            <View style={{ marginTop: 20 }}>
              <Text style={{ paddingHorizontal: 10 }}>位置</Text>
              <GestureDetector gesture={helpers.openDrawer}>
                <TouchableOpacity
                  style={styles.dealerOrModel}
                  onPress={() => setClickedEl('location') }
                >
                  <Text>{selectedNations.result}</Text>
                  <Icon source="chevron-right" size={20} />
                </TouchableOpacity>
              </GestureDetector>
            </View>
            {/* 按钮 */}
            <View style={styles.bottomBtns}>
                <GestureDetector gesture={outhelpers.closeDrawer}>
                   <Button mode="contained" uppercase onPress={() => {}}>cancel</Button>
                </GestureDetector>
                 <GestureDetector gesture={outhelpers.closeDrawer}>
                   <Button mode="contained" uppercase>confirm</Button>
                </GestureDetector>
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
  bottomBtns: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
});
