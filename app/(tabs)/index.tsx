import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet, Text,
  View
} from 'react-native';
import { Appbar, Avatar, Button, Icon, PaperProvider, useTheme } from 'react-native-paper';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import DeviceForm from '../DeviceForm';
import SecondTab from '../SecondTab';
import { api } from '../services/api';

export default function Index() {
  const router = useRouter();
  const { currentTheme } = useCustomTheme();
  const theme = useTheme();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [devices, setDevices] = useState<{ name: string; type: string }[]>([]);
  const [deviceCount, setDeviceCount] = useState(0);
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get('window');
  const [dashboardData, setDashboardData] = useState({
    all: 0,
    online: 0,
    others: 0,
    faultAlert: 0,
    executingService: 0
  });

  // 获取数字仪表板数据
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('services/app/EquipmentService/GetDigitalDashborad');
      console.log('仪表板数据:', data);
      
      if (data && data.result) {
        setDashboardData(data.result);
        setDeviceCount(data.result.all);
      }
    } catch (err: any) {
      setError(err.message || '获取仪表板数据失败');
      console.error('API请求失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddDeviceClick = () => {
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  const handleAddDevice = (name: string, type: string) => {
    const newDevice = { name, type };
    setDevices([...devices, newDevice]);
    setDeviceCount(prev => prev + 1);
    setIsFormVisible(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('username');

      // 使用 router 进行导航，兼容移动端和 web 端
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 保存token到本地存储
  const saveToken = async () => {
    try {
      await AsyncStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjE1MTIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiRjhNSl9saW1pbmdodSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6ImxpYW5nLmxpLm1pbkBzaW1lZGFyYnkuY29tLmhrIiwiQXNwTmV0LklkZW50aXR5LlNlY3VyaXR5U3RhbXAiOiIzNDQ4ZWFiMS0zYWNkLTNiZDgtZDU0Yi0zOWZhMjUxYjYyMGMiLCJzdWIiOiIxNTEyIiwianRpIjoiYWIwNGY2NGQtZGNlNC00MTk3LWEyYzItNWY5OTExYzZiMGI2IiwiaWF0IjoxNzU4MDg5MzU4LCJTZXNzaW9uLk1haW5EZWFsZXJDb2RlIjoiRjhNSiIsIm5iZiI6MTc1ODA4OTM1OCwiZXhwIjoxNzU4MTc1NzU4LCJpc3MiOiJEQ1AiLCJhdWQiOiJEQ1AifQ.rVoiTUgyRpaUGNCkI080-W26XNGR2MAXUU-g2MNpco0');
      Alert.alert('Token已保存', '认证token已成功保存到本地存储');
    } catch (error) {
      Alert.alert('保存失败', '保存token时发生错误');
    }
  };

  // 获取设备列表
  const handleGetEquipments = async () => {
    setLoading(true);
    setError(null);
    try {
      // 使用POST方法，参数为JSON格式
      const data = await api.post('services/app/EquipmentService/Equipments', {
        limit: 10,
        offset: 0
      });
      console.log('API响应数据:', data);
      setApiData(data);

      // 根据API响应结构正确获取设备数量
      const deviceCount = Array.isArray(data) ? data.length : (data as any)?.result?.length || 0;
      Alert.alert('API测试成功', `成功获取设备列表，共${deviceCount}台设备`);
    } catch (err: any) {
      setError(err.message || 'API请求失败');
      Alert.alert('请求失败', err.message || '请检查网络连接和服务器状态');
    } finally {
      setLoading(false);
    }
  };

  // POST请求示例
  const handlePostApiCall = async () => {
    setLoading(true);
    setError(null);
    try {
      // 示例：创建一个新的帖子
      const data = await api.post('https://jsonplaceholder.typicode.com/posts', {
        title: '测试标题',
        body: '测试内容',
        userId: 1,
      });
      setApiData(data);
      Alert.alert('POST请求成功', '数据已成功创建');
    } catch (err: any) {
      setError(err.message || 'POST请求失败');
      Alert.alert('POST请求失败', err.message || '请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 轮播图数据 - 使用图片
  const carouselData = [
    {
      id: 1,
      image: require('../../assets/images/03-1.jpg'),
    },
    {
      id: 2,
      image: require('../../assets/images/03-3.jpg'),
    },
    {
      id: 3,
      image: require('../../assets/images/03-4.jpg'),
    },
  ];

  // 轮播图滚动处理
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentSlide(currentIndex);
  };

  // 跳转到指定轮播图
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  };

  return (
    <PaperProvider>
      <ScrollView>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Appbar.Header style={[styles.bar, { backgroundColor: currentTheme === 'dark' ? '#333' : '#fff' }]}>
            <Appbar.Content
              title="袁满华"
              titleStyle={{
                color: currentTheme === 'dark' ? '#fff' : '#000'  // 暗黑模式文字为白色，明亮模式为黑色
              }}
            />
            <Appbar.Action icon="headset" style={styles.barIcon} onPress={() => { }} />
            <Appbar.Action icon="bell" style={styles.barIcon} onPress={() => { }} />
          </Appbar.Header>

          {/* 轮播图模块 */}
          <View style={[styles.carouselContainer, { backgroundColor: theme.colors.surface }]}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.carouselScrollView}
            >
              {carouselData.map((item, index) => (
                <View key={item.id} style={[styles.carouselSlide, { width: screenWidth }]}>
                  <Image
                    source={item.image}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>

            {/* 指示器 */}
            <View style={styles.indicatorContainer}>
              {carouselData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentSlide === index ? styles.activeIndicator : styles.inactiveIndicator
                  ]}
                  onTouchEnd={() => goToSlide(index)}
                />
              ))}
            </View>
          </View>

          <LinearGradient
            colors={['#D2B48C', '#F5DEB3']} // 浅棕色到浅黄色
            start={{ x: 0, y: 0 }}           // 从左开始
            end={{ x: 1, y: 0 }}             // 到右结束
            style={[styles.addDevice, { padding: 20, justifyContent: 'space-between' }]}
          >
            {/* 你的现有内容 */}
            <View>
              <Text>设备总数</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* 显示更新后的设备数量 */}
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{dashboardData.all}</Text>
                <Text style={{ marginLeft: 15 }}>台</Text>
                <Icon source="chevron-right" size={20} color="#999" />
              </View>
            </View>
            <View>
              <Button
                onPress={handleAddDeviceClick} // 修改为打开表单
                mode="contained"
                style={styles.loginButton}
                buttonColor="orange"
                icon="plus"
              >
                添加设备
              </Button>
            </View>
          </LinearGradient>

          <View style={[styles.addDevice, { backgroundColor: theme.colors.surface, padding: 20, marginTop: 20 }]}>
            <View style={[styles.rowContainer, {
              backgroundColor: theme.colors.surface,
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%'  // 确保容器占满宽度
            }]}>
              <View style={[styles.centeredItem, {
                backgroundColor: theme.colors.surface,
                flex: 1,      // 每个项平均分配空间
                padding: 8    // 增加内边距避免内容过挤
              }]}>
                <Text style={{ color: theme.colors.onSurface }}>在线设备</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>{dashboardData.online}</Text>
              </View>
              <View style={[styles.centeredItem, { flex: 1, padding: 8 }]}>
                <Text style={{ color: theme.colors.onSurface }}>离线设备</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>{dashboardData.others}</Text>
              </View>
              <View style={[styles.centeredItem, { flex: 1, padding: 8 }]}>
                <Text style={{ color: theme.colors.onSurface }}>故障报警</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>{dashboardData.faultAlert}</Text>
              </View>
              <View style={[styles.centeredItem, { flex: 1, padding: 8 }]}>
                <Text style={{ color: theme.colors.onSurface }}>执行中工单</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.onSurface }}>{dashboardData.executingService}</Text>
              </View>
            </View>
          </View>

          

           
          <View style={{
            marginTop: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16
          }}>
            {/* 项目1 */}
            <View style={{ alignItems: 'center' }}>
              <Avatar.Icon size={40} icon="folder" style={{ backgroundColor: currentTheme === 'dark' ? '#424242' : 'white' }} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 4 }}>电子图册</Text>
            </View>

            {/* 项目2 */}
            <View style={{ alignItems: 'center' }}>
              <Avatar.Icon size={40} icon="folder" style={{ backgroundColor: currentTheme === 'dark' ? '#424242' : 'white' }} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 4 }}>服务手册</Text>
            </View>

            {/* 项目3 */}
            <View style={{ alignItems: 'center' }}>
              <Avatar.Icon size={40} icon="folder" style={{ backgroundColor: currentTheme === 'dark' ? '#424242' : 'white' }} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 4 }}>服务工单</Text>
            </View>

            {/* 项目4 */}
            <View style={{ alignItems: 'center' }}>
              <Avatar.Icon size={40} icon="folder" style={{ backgroundColor: currentTheme === 'dark' ? '#424242' : 'white' }} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 4 }}>保修信息</Text>
            </View>

            {/* 项目5 */}
            <View style={{ alignItems: 'center' }}>
              <Avatar.Icon size={40} icon="folder" style={{ backgroundColor: currentTheme === 'dark' ? '#424242' : 'white' }} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 4 }}>我的请求</Text>
            </View>
          </View>
          <View style={{
            height: 800,
            width: '95%',
            alignSelf: 'center',
            marginTop: 20,
            backgroundColor: theme.colors.surface
          }}>
            <TabsProvider defaultIndex={0} >
              <Tabs
                style={{ ...styles.tabsContainer, backgroundColor: theme.colors.surface }}
                tabLabelStyle={{ ...styles.tabLabel, color: theme.colors.onSurface }}
                theme={{
                  colors: {
                    primary: currentTheme === 'dark' ? '#90caf9' : 'blue' // 深色模式使用浅蓝色指示器
                  }
                }}
              >
                {/* 第一个标签页 */}
                <TabScreen label="设备列表">
                  <View>
                    <SecondTab />
                  </View>
                </TabScreen>

                {/* 第二个标签页 */}
                <TabScreen label="设备分组">
                  <View style={[styles.tabContent, { backgroundColor: theme.colors.background }]}>
                    <Text style={{ color: theme.colors.onSurface }}>这里是设备分组内容</Text>
                  </View>
                </TabScreen>

                {/* 第三个标签页 */}
                <TabScreen label="设备统计">
                  <View style={[styles.tabContent, { backgroundColor: theme.colors.background }]}>
                    <Text style={{ color: theme.colors.onSurface }}>这里是设备统计数据</Text>
                  </View>
                </TabScreen>

                <TabScreen label="我的设备">
                  <View style={[styles.tabContent, { backgroundColor: theme.colors.background }]}>
                    {devices.length > 0 ? (
                      devices.map((device, index) => (
                        <View key={index} style={[styles.deviceItem, {
                          borderBottomColor: currentTheme === 'dark' ? '#424242' : '#eee'
                        }]}>
                          <Text style={{ color: theme.colors.onSurface }}>{device.name} - {device.type}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={{ color: theme.colors.onSurface }}>暂无设备，请添加设备</Text>
                    )}
                  </View>
                </TabScreen>
              </Tabs>
            </TabsProvider>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={isFormVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <DeviceForm
            visible={isFormVisible}
            onClose={handleCloseForm}
            onAddDevice={handleAddDevice} // 传递回调函数给子组件
          />
        </View>
      </Modal>
    </PaperProvider>
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
  addDevice: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',    // 横向排列
    alignItems: 'center',    // 垂直居中

  },
  rowContainer: {
    flexDirection: 'row',       // 横向排列
    justifyContent: 'space-between', // 均匀分布（两端对齐）
    // 或者使用 'space-around' 让两侧也有间距
  },
  centeredItem: {
    alignItems: 'center',      // 每个项目内部居中
    flex: 1,                  // 每个项目平分空间
  },
  card: {
    margin: 16,
    elevation: 2,
    height: 350
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  viewAllText: {
    color: '#666',
    marginRight: 4,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
    marginTop: 16,
    fontSize: 14,
  },
  loginButton: {
    marginTop: 0,
    paddingVertical: 8,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  // 选中状态样式
  tabActive: {
    backgroundColor: '#1E90FF', // 蓝色背景
    borderRadius: 4,
  },
  // 未选中状态样式
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  apiButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  apiButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  apiResultContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  // 轮播图样式
  carouselContainer: {
    height: 160,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  carouselScrollView: {
    flex: 1,
  },
  carouselSlide: {
    height: 160,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 16,
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  }
});
