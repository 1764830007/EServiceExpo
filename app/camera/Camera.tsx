import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface ImageItem {
  id: string;
  uri: string;
}

interface PermissionInfo {
  camera: boolean | null;
  mediaLibrary: boolean | null;
}

export default function CameraScreen() {
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [permissionInfo, setPermissionInfo] = useState<PermissionInfo>({ camera: null, mediaLibrary: null });

  // 请求相机和媒体库权限
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        setPermissionInfo({
          camera: cameraStatus.status === 'granted',
          mediaLibrary: mediaLibraryStatus.status === 'granted'
        });
      }
    })();
  }, []);

  // 显示选择器模态框
  const showMediaPicker = () => {
    setShowPicker(true);
  };

  // 隐藏选择器模态框
  const hideMediaPicker = () => {
    setShowPicker(false);
  };

  // 从相册选择多张图片
  const pickImagesFromGallery = async () => {
    hideMediaPicker();
    
    if (!permissionInfo.mediaLibrary) {
      Alert.alert('权限被拒绝', '需要相册权限才能选择图片。');
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // 多选时通常不需要编辑
        allowsMultipleSelection: true, // 启用多选
        aspect: [4, 3],
        quality: 0.8,
        selectionLimit: 10, // 最多选择10张图片
      });

      console.log('相册选择结果:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // 将新选择的图片添加到现有列表中
        const newImages = result.assets.map(asset => ({
          id: (Date.now() + Math.random()).toString(), // 生成唯一ID并转换为字符串
          uri: asset.uri,
        }));
        
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('选择图片错误:', error);
      Alert.alert('错误', '选择图片时发生错误: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 拍照（单张）
  const takePhoto = async () => {
    hideMediaPicker();
    
    if (!permissionInfo.camera) {
      Alert.alert('权限被拒绝', '需要相机权限才能拍照。');
      return;
    }

    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('拍照结果:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = {
          id: (Date.now() + Math.random()).toString(), // 转换为字符串
          uri: result.assets[0].uri,
        };
        
        setSelectedImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.error('拍照错误:', error);
      Alert.alert('错误', '拍照时发生错误: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 删除单张图片
  const deleteImage = (imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // 清空所有图片
  const clearAllImages = () => {
    setSelectedImages([]);
  };

  // 渲染单张图片预览
  const renderImageItem = ({ item, index }: { item: ImageItem; index: number }) => (
    <View style={styles.imageItem}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteImage(item.id)}
      >
        <Ionicons name="close-circle" size={24} color="#ff4444" />
      </TouchableOpacity>
      <Text style={styles.imageNumber}>{index + 1}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.container}>
        <Text style={styles.title}>多图选择器</Text>
        <Text style={styles.subtitle}>支持选择多张图片或拍照</Text>

        {/* 图片预览区域 */}
        <View style={styles.previewSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              已选择图片 ({selectedImages.length}张)
            </Text>
            {selectedImages.length > 0 && (
              <TouchableOpacity onPress={clearAllImages}>
                <Text style={styles.clearAllText}>清空全部</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedImages.length > 0 ? (
            <FlatList
              data={selectedImages}
              renderItem={renderImageItem}
              keyExtractor={(item) => item.id}
              horizontal={false}
              numColumns={3}
              contentContainerStyle={styles.imagesGrid}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <TouchableOpacity 
              style={styles.placeholderContainer} 
              onPress={showMediaPicker}
              activeOpacity={0.7}
            >
              <Ionicons name="images-outline" size={60} color="#ccc" />
              <Text style={styles.placeholderText}>点击选择图片</Text>
              <Text style={styles.placeholderSubtext}>支持多选和拍照</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 操作按钮 */}
        {selectedImages.length > 0 && (
          <TouchableOpacity 
            style={styles.addMoreButton} 
            onPress={showMediaPicker}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
            <Text style={styles.addMoreText}>添加更多图片</Text>
          </TouchableOpacity>
        )}

        {/* 媒体选择器模态框 */}
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={hideMediaPicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>选择图片</Text>
                <TouchableOpacity onPress={hideMediaPicker} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.pickerOptions}>
                <TouchableOpacity 
                  style={styles.optionButton} 
                  onPress={takePhoto}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIconContainer}>
                    <Ionicons name="camera" size={28} color="#007AFF" />
                  </View>
                  <Text style={styles.optionText}>拍照</Text>
                  <Text style={styles.optionSubtext}>添加单张图片</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.optionButton} 
                  onPress={pickImagesFromGallery}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionIconContainer}>
                    <Ionicons name="images" size={28} color="#007AFF" />
                  </View>
                  <Text style={styles.optionText}>从相册选择</Text>
                  <Text style={styles.optionSubtext}>最多选择10张</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={hideMediaPicker}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 调试信息 */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            已选择: {selectedImages.length}张图片 | 
            权限: 相机{permissionInfo.camera ? '✓' : '✗'} 相册{permissionInfo.mediaLibrary ? '✓' : '✗'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewSection: {
    flex: 1,
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearAllText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '500',
  },
  imagesGrid: {
    paddingBottom: 10,
  },
  imageItem: {
    position: 'relative',
    margin: 5,
    width: '30%',
    aspectRatio: 1,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#e9e9e9',
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  imageNumber: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#e9e9e9',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  placeholderText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
    fontWeight: '600',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginVertical: 10,
  },
  addMoreText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  pickerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  optionButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  optionSubtext: {
    fontSize: 12,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  debugInfo: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
