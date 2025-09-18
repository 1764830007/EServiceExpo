import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Appbar, Icon } from 'react-native-paper';

export default function DeviceScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.bar}>
        {/* 占位 */}
        <Appbar.Content
          title="设备管理"
        />
      </Appbar.Header>
      <TouchableOpacity
        style={styles.profileList}
        onPress={() => console.log('设备管理汇总点击')}
      >
        <View style={styles.leftContent}>
          <Icon source="file" size={30} />
          <Text style={styles.profileListContent}>设备管理汇总</Text>
        </View>
        <Icon
          source="chevron-right"
          size={20}
          color="#999"
        />
      </TouchableOpacity>

      <View style={[styles.profileList]}>
        <View style={styles.leftContent}>
          <Icon source="file" size={30} />
          <Text style={styles.profileListContent}>设备统计报告</Text>
        </View>
        <Icon
          source="chevron-right"  // 向右箭头图标
          size={20}
          color="#999"            // 灰色箭头
        />
      </View>

      <View style={[styles.profileList]}>
        <View style={styles.leftContent}>
          <Icon source="file" size={30} />
          <Text style={styles.profileListContent}>设备故障报警</Text>
        </View>
        <Icon
          source="chevron-right"  // 向右箭头图标
          size={20}
          color="#999"            // 灰色箭头
        />
      </View>

      <View style={[styles.profileList]}>
        <View style={styles.leftContent}>
          <Icon source="file" size={30} />
          <Text style={styles.profileListContent}>电子围栏</Text>
        </View>
        <Icon
          source="chevron-right"  // 向右箭头图标
          size={20}
          color="#999"            // 灰色箭头
        />
      </View>
      <View style={[styles.profileList]}>
        <View style={styles.leftContent}>
          <Icon source="file" size={30} />
          <Text style={styles.profileListContent}>设备绑定申请列表</Text>
        </View>
        <Icon
          source="chevron-right"  // 向右箭头图标
          size={20}
          color="#999"            // 灰色箭头
        />
      </View>
      <View style={[styles.profileList]}>
        <View style={styles.leftContent}>
          <Icon source="file" size={30} />
          <Text style={styles.profileListContent}>创建绑定申请</Text>
        </View>
        <Icon
          source="chevron-right"  // 向右箭头图标
          size={20}
          color="#999"            // 灰色箭头
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E8E8E8',
    height: '100%',
  },
  bar: {
    elevation: 4,

    // iOS 阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // 确保阴影可见（iOS需要设置背景色）
    zIndex: 1,
  },
  barIcon: {
    backgroundColor: 'white',
  },
  profileList: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',    // 横向排列
    alignItems: 'center',    // 垂直居中
    justifyContent: 'space-between', // 左右两端对齐
    paddingVertical: 12,     // 垂直内边距
    paddingHorizontal: 16,   // 水平内边距
    height: 100,
    marginTop: 15
  },

  leftContent: {
    flexDirection: 'row',    // 图标和文字横向排列
    alignItems: 'center',    // 垂直居中
  },
  profileListContent: {
    marginLeft: 12,          // 文字与左边图标的间距
    fontSize: 16,
  },
});
