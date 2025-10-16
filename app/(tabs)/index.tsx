import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Appbar, Avatar, Button, Card, Icon, PaperProvider, useTheme } from 'react-native-paper';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import DeviceForm from '../DeviceForm';
import api from '../services/api';

interface Equipment {
  id: string;
  serialNumber: string;
  equipmentModel: string;
  nameNote?: string;
  equipmentType: string;
  boundStatus: boolean;
  customer?: string;
  dealerCode: string;
  location: string;
  totalHours: number;
  locationTime: string;
  status: string;
  connect: number;
  isFault: string;
}

interface CarouselItem {
  base64String: string;
  name: string;
  url: string;
  index: number;
}

export default function Index() {
  const router = useRouter();
  const { currentTheme } = useCustomTheme();
  const theme = useTheme();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [devices, setDevices] = useState<{ name: string; type: string }[]>([]);
  const [deviceCount, setDeviceCount] = useState(0);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
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
  const [carouselData, setCarouselData] = useState<CarouselItem[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [user, setUser] = useState<string>('');

  // 获取数字仪表板数据
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/services/app/EquipmentService/GetDigitalDashborad');
      const token = await AsyncStorage.getItem('authToken');
      console.log('token:', token);
      console.log('仪表板数据:', response.data);

      if (response.data && response.data.result) {
        setDashboardData(response.data.result);
        setDeviceCount(response.data.result.all);
      }
    } catch (err: any) {
      setError(err.message || '获取仪表板数据失败');
      console.error('API请求失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取轮播图数据
  const fetchCarouselData = async () => {
    setCarouselLoading(true);
    try {
      console.log('开始获取轮播图数据...');
      const response = await api.get('/services/app/EquipmentService/GetCarouselpictures');
      console.log('轮播图API响应:', response.data);

      if (response.data && response.data.success && Array.isArray(response.data.result)) {
        setCarouselData(response.data.result);
        console.log('成功设置轮播图数据:', response.data.result.length, '张图片');
      } else {
        console.log('轮播图API返回数据格式不正确或为空');
        // 如果API没有数据，使用默认图片
        setCarouselData([]);
      }
    } catch (err: any) {
      console.error('获取轮播图数据失败:', err);
      // 如果API调用失败，使用默认图片
      setCarouselData([]);
    } finally {
      setCarouselLoading(false);
    }
  };

  // 获取设备列表数据 - 使用原生fetch API
  // const fetchEquipments = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEzNiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJDUUxfSmVyZW15bWFvIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoieGluX21hb0AxNjMuY29tIiwiQXNwTmV0LklkZW50aXR5LlNlY3VyaXR5U3RhbXAiOiIzNDQ4ZWFiMS0zYWNkLTNiZDgtZDU0Yi0zOWZhMjUxYjYyMGMiLCJzdWIiOiIxMzYiLCJqdGkiOiI4OWVkOTliMy05Yzc1LTRiYWItYmIxOS04NmY1ZGQ0MTY2NzAiLCJpYXQiOjE3NjAzNDM1ODYsIlNlc3Npb24uTWFpbkRlYWxlckNvZGUiOiJZMTRBIiwibmJmIjoxNzYwMzQzNTg2LCJleHAiOjE3NjA0Mjk5ODYsImlzcyI6IkRDUCIsImF1ZCI6IkRDUCJ9.7VBQftmhBLlx6XOkSAlv9dkvsmPyRN0WHu__sXWv6ek';

  //     console.log('开始设备列表API请求...');

  //     const response = await fetch('https://dcpqa.semdcp.com/api/services/app/EquipmentService/Equipments', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: JSON.stringify({
  //         limit: 2,
  //         offset: 0
  //       })
  //     });

  //     console.log('API响应状态:', response.status, response.statusText);

  //     if (!response.ok) {
  //       throw new Error(`HTTP错误! 状态码: ${response.status}, 状态文本: ${response.statusText}`);
  //     }

  //     const data = await response.json();
  //     console.log('设备列表数据:', data);

  //     // 根据API响应结构处理数据
  //     if (data && data.result && Array.isArray(data.result.data)) {
  //       const equipmentList: Equipment[] = data.result.data.map((item: any, index: number) => ({
  //         id: item.serialNumber || Math.random().toString(),
  //         serialNumber: item.serialNumber || 'N/A',
  //         equipmentModel: item.equipmentModel || '未知型号',
  //         nameNote: item.nameNote,
  //         equipmentType: item.equipmentType || '未知类型',
  //         boundStatus: item.boundStatus || false,
  //         customer: item.customer,
  //         dealerCode: item.dealerCode || 'N/A',
  //         location: item.location || '未知位置',
  //         totalHours: item.totalHours || 0,
  //         locationTime: item.locationTime || '未知时间',
  //         status: item.status || '未知状态',
  //         connect: item.connect || 0,
  //         isFault: item.isFault || '0'
  //       }));
  //       setEquipments(equipmentList);
  //       console.log('成功设置设备列表:', equipmentList.length, '条记录');
  //     } else {
  //       setEquipments([]);
  //       console.log('API返回数据格式不正确或为空');
  //     }
  //   } catch (err: any) {
  //     const errorMessage = err.message || '获取设备列表失败';
  //     setError(errorMessage);
  //     console.error('设备列表API请求失败:', err);
  //     console.error('错误详情:', {
  //       message: err.message,
  //       name: err.name,
  //       stack: err.stack
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // 页面加载时获取数据
  useEffect(() => {
    fetchDashboardData();
    //fetchEquipments();
    fetchCarouselData();
    // 获取用户登录名
    const getUserName = async () => {
      try {
        const userName = await AsyncStorage.getItem('userLoginName');
        if (userName) {
          setUser(userName);
        } else {
          setUser('用户');
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUser('用户');
      }
    };
    getUserName();
  }, []);

  // 刷新设备列表
  const handleRefresh = () => {
    //fetchEquipments();
  };

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

  // 默认轮播图数据 - 当API没有数据时使用
  const defaultCarouselData = [
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

  // 获取实际显示的轮播图数据
  const displayCarouselData = carouselData.length > 0 ? carouselData : defaultCarouselData;

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
              title={user || '用户'}
              titleStyle={{
                color: currentTheme === 'dark' ? '#fff' : '#000'
              }}
            />
            <Appbar.Action icon="headset" style={styles.barIcon} onPress={() => { }} />
            <Appbar.Action icon="bell" style={styles.barIcon} onPress={() => { }} />
          </Appbar.Header>

          {/* 轮播图模块 */}
          <View style={[styles.carouselContainer, { backgroundColor: theme.colors.surface }]}>
            {carouselLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>加载轮播图中...</Text>
              </View>
            ) : (
              <>
                <ScrollView
                  ref={scrollViewRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  style={styles.carouselScrollView}
                >
                  {displayCarouselData.map((item, index) => (
                    <View key={index} style={[styles.carouselSlide, { width: screenWidth }]}>
                      <Image
                        source={'image' in item ? item.image : { uri: item.base64String }}
                        style={styles.carouselImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>

                {/* 指示器 */}
                <View style={styles.indicatorContainer}>
                  {displayCarouselData.map((_, index) => (
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
              </>
            )}
          </View>

          <LinearGradient
            colors={['#D2B48C', '#F5DEB3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.addDevice, { padding: 20, justifyContent: 'space-between' }]}
          >
            <View>
              <Text>设备总数</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{dashboardData.all}</Text>
                <Text style={{ marginLeft: 15 }}>台</Text>
                <Icon source="chevron-right" size={20} color="#999" />
              </View>
            </View>
            <View>
              <Button
                onPress={handleAddDeviceClick}
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
              width: '100%'
            }]}>
              <View style={[styles.centeredItem, {
                backgroundColor: theme.colors.surface,
                flex: 1,
                padding: 8
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
            <View style={{ alignItems: 'center' }}>
              <Avatar.Icon size={40} icon="folder" style={{ backgroundColor: currentTheme === 'dark' ? '#424242' : 'white' }} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 4 }}>电子图册</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Avatar.Icon size={40} icon="folder" style={{ backgroundColor: currentTheme === 'dark' ? '#424242' : 'white' }} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 4 }}>服务手册</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Avatar.Icon size={40} icon="folder" style={{ backgroundColor: currentTheme === 'dark' ? '#424242' : 'white' }} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 4 }}>服务工单</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Avatar.Icon size={40} icon="folder" style={{ backgroundColor: currentTheme === 'dark' ? '#424242' : 'white' }} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 4 }}>保修信息</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Avatar.Icon size={40} icon="folder" style={{ backgroundColor: currentTheme === 'dark' ? '#424242' : 'white' }} />
              <Text style={{ color: theme.colors.onSurface, marginTop: 4 }}>我的请求</Text>
            </View>
          </View>

          {/* 设备列表展示区域 */}
          <View style={[styles.allWorkOrders, { backgroundColor: theme.colors.surface, marginTop: 20 }]}>
            <View style={styles.workOrdersHeader}>
              <Text style={[styles.workOrdersHeaderText, { color: theme.colors.onSurface }]}>设备管理</Text>
              <TouchableOpacity onPress={handleRefresh}>
                <View style={styles.viewAll}>
                  <Text style={styles.viewAllText}>查看全部</Text>
                  <Icon source="chevron-right" size={16} color="#666" />
                </View>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>加载中...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Icon source="alert-circle" size={48} />
                <Text style={styles.errorText}>{error}</Text>
                <Button mode="contained" onPress={handleRefresh}>
                  重试
                </Button>
              </View>
            ) : equipments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon source="file-remove" size={48} />
                <Text style={styles.emptyText}>暂无设备数据</Text>
              </View>
            ) : (
              equipments.map((equipment) => (
                <Card key={equipment.id} style={[styles.workOrderCard,{backgroundColor: theme.colors.surface}]}>
                  <View style={styles.cardContent}>
                    <View style={[styles.workOrderHeader, { backgroundColor: theme.dark ? '#333333' : '#bcddffff', padding: 7 }]}>
                      <Text style={[styles.workOrderCode,{color:theme.colors.onSurface}]}>{equipment.equipmentModel}/{equipment.serialNumber}</Text>
                      <View style={[
                        styles.statusTag,
                        styles.barStatus
                      ]}>
                        <Text style={styles.statusTagText}>
                          请求服务
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.workOrderHeader, { backgroundColor: theme.dark ? '#3f3f3fff' : '#bcddffff', marginLeft: 15, marginRight: 15, padding: 7, flexDirection: 'row', alignItems: 'center', borderRadius: 8 }]}>
                      <Icon source="volume-high" size={20} />
                      <Text style={[styles.workOrderCode,{ color: theme.colors.onSurface}]}>
                        下次推荐设备保养时间为：{Math.ceil(equipment.totalHours / 500) * 500}小时
                      </Text>
                    </View>
                    {/* 第一行：图片和三列信息 */}
                    <View style={styles.firstRowContainer}>
                      {/* 左侧图片及状态 */}
                      <View style={styles.imageStatusColumn}>
                        {/* 设备图片 */}
                        <View style={styles.equipmentImageContainer}>
                          <Image
                            source={require('../../assets/images/03-1.jpg')} // 替换为实际图片路径
                            style={styles.equipmentImage}
                            resizeMode="contain"
                            alt="设备图片"
                          />
                        </View>
                        {/* 状态标签 */}
                        <View style={[
                          styles.statusTag,
                          styles.deviceStatus
                        ]}>
                          <Text style={styles.statusTagText}>
                            {equipment.status}
                          </Text>
                        </View>
                      </View>

                      {/* 标签和数据在同一行显示 */}
                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <Text style={[styles.infoLabel,{color: theme.colors.onSurface}]}>总工时：</Text>
                          <Text style={[styles.infoValue,{color: theme.colors.onSurface}]}>{equipment.totalHours.toFixed(2)} 小时</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={[styles.infoLabel,{color: theme.colors.onSurface}]}>位置：</Text>
                          <View style={styles.locationContainer}>
                            <Text style={[styles.infoValue, styles.wrapText,{color: theme.colors.onSurface}]} numberOfLines={2}>{equipment.location}</Text>
                          </View>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={[styles.infoLabel,{color: theme.colors.onSurface}]}>更新时间：</Text>
                          <Text style={[styles.infoValue,{color: theme.colors.onSurface}]}>{new Date(equipment.locationTime).toLocaleString()}</Text>
                        </View>
                      </View>
                    </View>

                    {/* 第二行：四个功能按钮 */}
                    <View style={styles.functionsRow}>
                      <TouchableOpacity style={styles.functionButton}>
                        <View style={[
                          styles.statusTag,
                          styles.footButton
                        ]}>
                          <Text style={styles.statusTagText}>
                            行车轨迹
                          </Text>
                        </View>

                      </TouchableOpacity>

                      <TouchableOpacity style={styles.functionButton}>
                        <View style={[
                          styles.statusTag,
                          styles.footButton
                        ]}>
                          <Text style={styles.statusTagText}>
                            故障报警
                          </Text>
                        </View>

                      </TouchableOpacity>

                      <TouchableOpacity style={styles.functionButton}>
                        <View style={[
                          styles.statusTag,
                          styles.footButton
                        ]}>
                          <Text style={styles.statusTagText}>
                            电子图册
                          </Text>
                        </View>

                      </TouchableOpacity>

                      <TouchableOpacity style={styles.functionButton}>
                        <View style={[
                          styles.statusTag,
                          styles.footButton
                        ]}>
                          <Text style={styles.statusTagText}>
                            服务手册
                          </Text>
                        </View>

                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))
            )}
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
            onAddDevice={handleAddDevice}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1,
  },
  barIcon: {
    backgroundColor: 'white',
  },
  addDevice: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centeredItem: {
    alignItems: 'center',
    flex: 1,
  },
  loginButton: {
    marginTop: 0,
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  },
  // 设备列表样式
  allWorkOrders: {
    padding: 16,
    borderRadius: 8,
  },
  workOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workOrdersHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#666',
    marginRight: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
    height: 160,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 16,
    color: '#c62828',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    color: '#666',
  },
  workOrderCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {

  },
  workOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workOrderCode: {
    fontSize: 16,

    marginLeft: 8,
    flex: 1,
  },
  workOrderStatusBtn: {
    padding: 0,
    backgroundColor: '#2b92ffff',
    // 减小按钮高度
  },

  workOrderInfo: {
    marginLeft: 28,
  },
  workOrderInfoItem: {
    marginBottom: 4,
    fontSize: 14,
    color: '#666',
  },
  // 第一行容器
  firstRowContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },

  // 图片和状态列
  imageStatusColumn: {
    flex: 1,
    alignItems: 'center',
  },

  equipmentImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  equipmentImage: {
    width: 60,
    height: 60,
  },

  // 状态标签样式
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  onlineStatus: {
    backgroundColor: '#e8f5e9',
  },

  offlineStatus: {
    backgroundColor: '#ffebee',
  },

  barStatus: {
    backgroundColor: '#008cffff',
  },

  deviceStatus: {
    backgroundColor: '#ffe0b2',
  },

  footButton: {
    backgroundColor: '#b5b5b5ff',
  },

  statusTagText: {
    fontSize: 12,
    fontWeight: '500',
  },



  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },

  infoValue: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },

  // 第二行功能按钮容器
  functionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 5,
  },

  // 功能按钮样式
  functionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 8,
  },

  buttonIcon: {
    marginBottom: 4,
  },

  buttonText: {
    fontSize: 12,
  },
  labelsColumn: {
    flex: 1,
    paddingLeft: 10,
  },
  dataColumn: {
    flex: 2,
  },
  // 增加行间距并允许内容换行
  labelItem: {
    minHeight: 40, // 增大高度增加间距
    paddingVertical: 5, // 增加垂直内边距
    justifyContent: 'center',
  },
  dataItem: {
    minHeight: 40, // 与标签项保持一致的高度
    paddingVertical: 5, // 增加垂直内边距
    justifyContent: 'flex-start', // 顶部对齐，方便多行显示
  },
  // 允许文本换行
  wrapText: {
    flexWrap: 'wrap',
    width: '100%', // 确保文本在容器内换行
  },

  // 信息行样式 - 标签和数据在同一行
  infoRow: {
    flex: 2,
    paddingLeft: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: 5,
  },
  // 位置容器样式 - 限制位置文本宽度
  locationContainer: {
    flex: 1,
    maxWidth: 150, // 限制最大宽度
  },


});
